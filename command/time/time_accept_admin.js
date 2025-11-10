const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { WALLET_PATH } = require("../../lib/constants");
const {
  getBlsTimeContractClient,
  getPath,
  readKeypair,
  bs58Message,
} = require("../utils");
const { PublicKey } = require("@solana/web3.js");

const timeAcceptAdminCommand = new Command("accept-admin")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .option(
    "--squads <true/false>",
    "squads: if true, use Squads to sign the transaction; default: false.",
  )
  .option(
    "--pending <pending>",
    "pending: if squads true, use pending admin to signature in Squads",
  )
  .option(
    "--signer <signer>",
    "signer: path to the pending admin keypair file, Default: " + WALLET_PATH,
  )
  .description("accept-admin: accept the pending admin of the time contract");
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
timeAcceptAdminCommand.addArgument(mint).action(async (mint, options) => {
  options.cluster = options.cluster || "localnet";
  options.signer = options.signer || getPath(WALLET_PATH);

  try {
    const keypair = readKeypair(options.signer);
    const client = getBlsTimeContractClient(
      options.cluster,
      keypair,
      options.programId,
    );
    let mintPubkey = null;
    try {
      mintPubkey = new PublicKey(mint);
    } catch (e) {
      console.log(chalk.red("invalid mint parameter: " + e));
      process.exit(1);
    }
    const state = await client.blessTimeClient.getTimeState(mintPubkey);
    if (options.squads) {
      if (options.pending == null) {
        console.log(chalk.green("pending is required."));
        process.exit(1);
      }
      const pending = new PublicKey(options.pending);
      if (state.pendingAdmin.toBase58() != pending.toBase58()) {
        console.log(
          chalk.red(
            "accept admin is denied, pending admin is not matched, the state pending admin is " +
              state.pendingAdmin.toBase58(),
          ),
        );
        process.exit(1);
      }
      const tx = await client.blessTimeClient.getAcceptAdminTx(mintPubkey, {
        signer: pending,
      });
      const itx = await bs58Message(
        client.connection,
        tx.instructions,
        keypair,
      );
      console.log("bless time accept admin transaction created: \n" + itx);
    } else {
      const keypair = readKeypair(options.signer);
      if (state.pendingAdmin.toBase58() != keypair.publicKey.toBase58()) {
        console.log(
          chalk.red(
            "accept admin is denied, pending admin is not matched, the state pending admin is " +
              state.pendingAdmin.toBase58(),
          ),
        );
        process.exit(1);
      }
      await client.blessTimeClient.acceptAdmin(mintPubkey);
      console.log(chalk.green("time contract accept admin success."));
      process.exit(0);
    }
  } catch (e) {
    console.log(chalk.red("accept admin of time contract failed: " + e));
    process.exit(1);
  }
});

module.exports = timeAcceptAdminCommand;
