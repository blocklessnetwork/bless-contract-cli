const { Command, Argument } = require("commander");
const chalk = require("chalk");
const { WALLET_PATH } = require("../../lib/constants");
const {
  getBlsStakeContractClient,
  getPath,
  readKeypair,
  bs58Message,
} = require("../utils");
const { PublicKey } = require("@solana/web3.js");

const setPauseCommand = new Command("pause")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the payer of the transaction, default: " +
    WALLET_PATH,
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option(
    "--admin <admin>",
    "admin: the the bless stake admin, in Squads mode, the admin will be the payer; in local mode, the admin must be a keypair. ",
  )
  .description(
    "pause: pause the stake activity",
  );
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;
const status = new Argument("status", "status: the status of the stake activity");
status.required = true;

setPauseCommand
  .addArgument(mint)
  .addArgument(status)
  .action(async (mint, status, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    options.squads = options.squads || false;
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsStakeContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      let mintPubkey = new PublicKey(mint);
      const state =
        await client.blessStakeClient.getStakeState(mintPubkey);
      status = status === "true" ? true : false;
      if (options.squads) {
        if (options.admin == null) {
          console.log(chalk.red("admin is required."));
          process.exit(1);
        }
        const adminPubkey = new PublicKey(options.admin);
        if (state.admin.toBase58() != adminPubkey.toBase58()) {
          console.log(
            chalk.red(
              "set pause status is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        const tx = await client.blessStakeClient.blessStakeSetPauseTx(
          mintPubkey,
          adminPubkey,
          status,
          { signer: adminPubkey },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );

        console.log("Bless stake set the pause transaction created: \n" + itx);
      } else {
        options.admin = options.admin || getPath(WALLET_PATH);
        const adminKeypair = readKeypair(options.admin);
        if (state.admin.toBase58() != adminKeypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "set pause status is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessStakeClient.blessStakeSetPause(mintPubkey, adminKeypair.publicKey, status, {
          signer: keypair.publicKey,
          signerKeypair: [keypair, adminKeypair],
        });
      }
      console.log(chalk.green("Bless stake set pause status success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("Bless stake set pause status fail: " + e));
      process.exit(1);
    }
  });

module.exports = setPauseCommand;
