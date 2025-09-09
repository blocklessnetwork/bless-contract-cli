const { Command, Argument } = require("commander");
const chalk = require("chalk");
const Squads = require("@sqds/sdk");
const anchor = require("@coral-xyz/anchor");
const { WALLET_PATH } = require("../lib/constants");
const {
  getBlsContractClient,
  getPath,
  readKeypair,
  sendTransaction,
  createSquadTransactionInstructions,
} = require("./utils");
const { PublicKey } = require("@solana/web3.js");

const blessMetaSetPendingAdminCommand = new Command("pending-admin")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the payer of the bless meta, default: " +
      WALLET_PATH,
  )
  .option("--multisig <multisig>", "multisig:  the multisig of the bless meta")
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
      const client = getBlsContractClient(options.cluster, keypair);
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
        if (options.multisig == null) {
          console.log(chalk.red("multisig is required."));
          process.exit(1);
        }
        const multisigPda = new PublicKey(options.multisig);
        const squads = Squads.default.endpoint(
          client.connection.rpcEndpoint,
          new anchor.Wallet(keypair),
        );
        const tx = await client.blessTokenClient.getSetPendingAdminAccountTx(
          mintPubkey,
          adminPubkey,
          pendingAdmin,
          { signer: adminPubkey },
        );
        const ix = tx.instructions[0];
        const instructions = await createSquadTransactionInstructions({
          squads,
          multisigPda,
          ixs: [ix],
        });
        const itx = await sendTransaction(
          client.connection,
          instructions,
          keypair,
        );
        console.log(
          await client.blessTokenClient.getBlessTokenMetaState(mintPubkey),
        );
        console.log("bless meta set pending admin transaction created, " + itx);
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
