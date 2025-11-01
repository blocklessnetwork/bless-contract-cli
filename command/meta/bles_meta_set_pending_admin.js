const { Command, Argument } = require("commander");
const chalk = require("chalk");
const { WALLET_PATH } = require("../../lib/constants");
const {
  getBlsContractClient,
  getPath,
  readKeypair,
  bs58Message,
} = require("../utils");
const { PublicKey } = require("@solana/web3.js");

const blessMetaSetPendingAdminCommand = new Command("pending-admin")
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
    "signer: the signer is the payer of the bless meta, default: " +
    WALLET_PATH,
  )
  .option(
    "--admin <admin>",
    "admin: the admin of the bless meta, default: " + WALLET_PATH,
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .description(
    "pending-admin: set the pending admin of the bless meta, the value is base58",
  );
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;
const pending = new Argument(
  "pending-admin",
  "pending-admin: the pending admin of the bless meta",
);
pending.required = true;

blessMetaSetPendingAdminCommand
  .addArgument(mint)
  .addArgument(pending)
  .action(async (mint, pending, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);

    options.squads = options.squads || false;
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      let pendingAdmin = new PublicKey(pending);
      let mintPubkey = new PublicKey(mint);
      const state =
        await client.blessTokenClient.getBlessTokenMetaState(mintPubkey);
      if (options.squads) {
        if (options.admin == null) {
          console.log(chalk.red("admin is required."));
          process.exit(1);
        }
        const adminPubkey = new PublicKey(options.admin);
        if (state.admin.toBase58() != adminPubkey.toBase58()) {
          console.log(
            chalk.red(
              "set pending admin is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        const tx = await client.blessTokenClient.getSetPendingAdminAccountTx(
          mintPubkey,
          adminPubkey,
          pendingAdmin,
          { signer: adminPubkey },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log(
          "bless meta set pending admin transaction created: \n" + itx,
        );
      } else {
        options.admin = options.admin || getPath(WALLET_PATH);
        const adminKeypair = readKeypair(options.admin);
        if (state.admin.toBase58() != adminKeypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "set pending admin is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessTokenClient.setPendingAdminAccount(
          mintPubkey,
          adminKeypair.publicKey,
          pendingAdmin,
          {
            signer: keypair.publicKey,
            signerKeypair: [keypair, adminKeypair],
          },
        );
      }
      console.log(chalk.green("bless meta set pending admin success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("bless meta set the pending admin fail: " + e));
      process.exit(1);
    }
  });

module.exports = blessMetaSetPendingAdminCommand;
