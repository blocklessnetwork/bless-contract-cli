const { Command, Argument } = require("commander");
const { getBlsStakeContractClient, getPath, readKeypair, bs58Message } = require("../utils");
const { WALLET_PATH } = require("../../lib/constants");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { PublicKey } = require("@solana/web3.js");
const depositCommand = new Command("deposit")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "the signer is the admin of  the stake contract: " + WALLET_PATH,
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .description("init: initialize the stake state");
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
const amount = new Argument("amount", "deposit the token amount");
const periods = new Argument("periods", "stake periods for earns the rewards.");
amount.required = true;
periods.required = true;
mint.required = true;
depositCommand
  .addArgument(mint)
  .addArgument(amount)
  .addArgument(periods)
  .action(async (mint, amount, periods, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    const sequence = new anchor.BN(Date.now());
    try {
      amount = new anchor.BN(parseInt(amount));
    } catch {
      console.log(chalk.red("amount must be a number"));
      process.exit(1);
    }
    try {
      periods = parseInt(periods);
    } catch {
      console.log(chalk.red("periods must be a number"));
      process.exit(1);
    }
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsStakeContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      let mintPubkey = null;
      try {
        mintPubkey = new PublicKey(mint);
      } catch (e) {
        console.log(chalk.red("Invalid mint parameter: " + e));
        process.exit(1);
      }

      if (options.squads) {
        const tx = await client.blessStakeClient.blessUserStakeStateCreateTx(
          mintPubkey,
          sequence,
          amount,
          periods,
          {
            signer: keypair.publicKey,
            signerKeypair: [keypair],
          },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log("User stake transaction created: \n" + itx);
      } else {
        const keypair = readKeypair(options.signer);
        await client.blessStakeClient.blessUserStakeStateCreate(
          mintPubkey,
          sequence,
          amount,
          periods,
          {
            signer: keypair.publicKey,
            signerKeypair: [keypair],
          },
        );
        console.log(chalk.green("User stake success."));
        process.exit(0);
      }
    } catch (e) {
      console.log(chalk.red("User stake failed: " + e));
      process.exit(1);
    }
  });

module.exports = depositCommand;
