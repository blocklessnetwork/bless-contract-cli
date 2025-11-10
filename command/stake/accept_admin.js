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

const acceptAdminCommand = new Command("accept-admin")
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
    "squads: if true, use Squads to sign the transaction; default: false.",
  )
  .option(
    "--admin <admin>",
    "admin: the bless stake admin, in Squads mode, the admin will be the payer; in local mode, the admin must be a keypair. ",
  )
  .description(
    "accept-admin: accept the pending admin of the bless stake, the value is base58",
  );
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;
const pending = new Argument(
  "pending-admin",
  "pending-admin: The pending admin of the bless stake",
);
pending.required = true;

acceptAdminCommand
  .addArgument(mint)
  .addArgument(pending)
  .action(async (mint, pending, options) => {
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
      const state = await client.blessStakeClient.getStakeState(mintPubkey);
      if (options.squads) {
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
        const tx = await client.blessStakeClient.blessStakeAcceptPendingAdminTx(
          mintPubkey,
          pendingAdmin,
          { signer: pendingAdmin },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );

        console.log("Bless stake accept admin transaction created: \n" + itx);
      } else {
        const pendingAdmin = readKeypair(pending);
        if (
          state.pendingAdmin.toBase58() != pendingAdmin.publicKey.toBase58()
        ) {
          console.log(
            chalk.red(
              "Accept admin is denied, pending admin is not matched, the state pending admin is " +
                state.pendingAdmin.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessStakeClient.blessStakeAcceptPendingAdmin(
          mintPubkey,
          pendingAdmin.publicKey,
          {
            signer: keypair.publicKey,
            signerKeypair: [keypair, pendingAdmin],
          },
        );
      }
      console.log(chalk.green("Bless stake accept pending admin success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("Bless stake accept pending admin failed: " + e));
      process.exit(1);
    }
  });

module.exports = acceptAdminCommand;
