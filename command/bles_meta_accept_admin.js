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

const blessMetaAcceptAdminCommand = new Command("accept-admin")
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
  .option("--multisig <multisig>", "multisig:  the multisig of the bless meta")
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option(
    "--admin <admin>",
    "admin: for the bless meta admin, in Squads mode, the admin will be the payer; in local mode, the admin must be a keypair. ",
  )
  .description(
    "accept-admin: accept the pending admin of the bless meta, the value is base58",
  );
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;
const pending = new Argument(
  "pending-admin",
  "pending-admin: the pending admin of the bless meta",
);
pending.required = true;

blessMetaAcceptAdminCommand
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
      let mintPubkey = new PublicKey(mint);
      const state =
        await client.blessTokenClient.getBlessTokenMetaState(mintPubkey);

      if (options.squads) {
        if (options.multisig == null) {
          console.log(chalk.red("multisig is required."));
          process.exit(1);
        }
        const multisigPda = new PublicKey(options.multisig);
        const squads = Squads.default.endpoint(
          client.connection.rpcEndpoint,
          new anchor.Wallet(keypair),
        );
        const pendingAdmin = new PublicKey(pending);
        if (state.pendingAdmin.toBase58() != pendingAdmin.toBase58()) {
          console.log(
            chalk.red(
              "accept admin is denied, pending admin is not matched, the state pending admin is " +
                state.pendingAdmin.toBase58(),
            ),
          );
          process.exit(1);
        }
        const tx = await client.blessTokenClient.getAcceptAdminTx(
          mintPubkey,
          pendingAdmin,
          { signer: pendingAdmin },
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
        console.log("bless meta accept admin transaction created, " + itx);
      } else {
        const pendingAdmin = readKeypair(pending);
        if (
          state.pendingAdmin.toBase58() != pendingAdmin.publicKey.toBase58()
        ) {
          console.log(
            chalk.red(
              "accept admin is denied, pending admin is not matched, the state pending admin is " +
                state.pendingAdmin.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessTokenClient.acceptAdmin(mintPubkey, pendingAdmin, {
          signer: keypair.publicKey,
          signerKeypair: [keypair, pendingAdmin],
        });
      }
      console.log(chalk.green("bless meta accept admin success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("bless meta accept admin fail: " + e));
      process.exit(1);
    }
  });

module.exports = blessMetaAcceptAdminCommand;
