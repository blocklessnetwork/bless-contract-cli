const { Command, Argument } = require("commander");
const {
  getBlsTimeContractClient,
  getPath,
  readKeypair,
  bs58Message,
} = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const chalk = require("chalk");
const { PublicKey } = require("@solana/web3.js");
const timeSetPausedCommand = new Command("merkle-root")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "the signer is the admin of  the time contract: " + WALLET_PATH,
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option(
    "--admin <admin>",
    "pending: if squads true, use admin to signature in squads",
  )
  .description("merkle-root: set the merkle tree root.");
const paused = new Argument("paused", "paused: set the time state paused.");
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
mint.required = true;
timeSetPausedCommand
  .addArgument(mint)
  .addArgument(paused)
  .action(async (mint, paused, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    try {
      const keypair = readKeypair(options.signer);
      let mintPubkey = null;
      try {
        mintPubkey = new PublicKey(mint);
      } catch (e) {
        console.log(chalk.red("invaild mint parameter: " + e));
        process.exit(1);
      }
      const client = getBlsTimeContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      if (paused != "true" || paused != "false") {
        console.log(chalk.red("paused must be true or false."));
        process.exit(1);
      }
      paused = paused == "true" ? true : false;
      const state = await client.blessTimeClient.getTimeState(mintPubkey);
      if (options.squads) {
        if (options.admin == null) {
          console.log(chalk.red("admin is required."));
          process.exit(1);
        }
        const admin = new PublicKey(options.admin);
        if (state.adminAccount.toBase58() != admin.toBase58()) {
          console.log(
            chalk.red(
              "set paused is denied, admin is not matched, the state  admin is " +
                state.adminAccount.toBase58(),
            ),
          );
          process.exit(1);
        }

        const tx = await client.blessTimeClient.getSetPausedTx(paused, {
          signer: admin,
        });
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log("bless time set paused transaction created: \n" + itx);
      } else {
        const keypair = readKeypair(options.signer);
        if (state.adminAccount.toBase58() != keypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "set set paused is denied, admin is not matched, the state  admin is " +
                state.adminAccount.toBase58(),
            ),
          );
          process.exit(1);
        }

        await client.blessTimeClient.setPaused(mintPubkey, paused);
        console.log(chalk.green("set paused success."));
        process.exit(0);
      }
    } catch (e) {
      console.log(chalk.red("set paused fail: " + e));
      process.exit(1);
    }
  });

module.exports = timeSetPausedCommand;
