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

const timeSetPendingAdminCommand = new Command("pending-admin")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the admin of the time contract, default: " +
    WALLET_PATH,
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
  .description(
    "pending-admin: set the pending admin of the registration, the value is base58, if is empty",
  );
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
mint.required = true;
const pending = new Argument(
  "pending-admin",
  "pending-admin: the pending admin of the registration",
);
pending.required = true;
timeSetPendingAdminCommand
  .addArgument(mint)
  .addArgument(pending)
  .action(async (mint, pending, options) => {
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
        console.log(chalk.red("invaild mint parameter: " + e));
        process.exit(1);
      }

      const state = await client.blessTimeClient.getTimeState(mintPubkey);
      let pendingAdmin;
      try {
        pendingAdmin = new PublicKey(pending);
      } catch (e) {
        console.log(chalk.red("invalid pending-admin parameter: " + e));
        process.exit(1);
      }
      if (options.squads) {
        const admin = new PublicKey(options.admin);
        if (state.adminAccount.toBase58() != admin.toBase58()) {
          console.log(
            chalk.red(
              "set pending admin is denied, admin is not matched, the state  admin is " +
              state.adminAccount.toBase58(),
            ),
          );
          process.exit(1);
        }
        const tx = await client.blessTimeClient.getSetPendingAdminAccountTx(
          mintPubkey,
          pendingAdmin,
          {
            signer: admin,
          },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log(
          "bless time set pending admin transaction created: \n" + itx,
        );
      } else {
        if (state.adminAccount.toBase58() != keypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "set pending admin is denied, admin is not matched, the state  admin is " +
              state.adminAccount.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessTimeClient.setPendingAdminAccount(
          mintPubkey,
          pendingAdmin,
        );
        console.log(chalk.green("time contract set pending admin success."));
      }
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("set the pending admin fail: " + e));
      process.exit(1);
    }
  });

module.exports = timeSetPendingAdminCommand;
