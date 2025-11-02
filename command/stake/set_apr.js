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

const setAprCommand = new Command("set-apr")
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
    "signer: the signer is the payer of the bless stake, default: " +
    WALLET_PATH,
  )
  .option(
    "--admin <admin>",
    "admin: the admin of the bless stake, default: " + WALLET_PATH,
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .description(
    "set-apr: set the APR configure of the bless stake",
  );
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;

const apr = new Argument("apr", "apr: the APR configure, e.g. [{periods: 0, apr: { numerator: 4, denominator: 100 }},\
  {periods: 1,apr: { numerator: 5, denominator: 100 }},\
  {periods: 4,apr: { numerator: 55, denominator: 1000 }},\
  {periods: 26,apr: { numerator: 6, denominator: 100 }},\
  {periods: 52,apr: { numerator: 7, denominator: 100 }}]");
mint.required = true;

setAprCommand
  .addArgument(mint)
  .addArgument(apr)
  .action(async (mint, apr, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);

    options.squads = options.squads || false;

    try {
      try {
        apr = JSON.parse(apr);
      } catch {
        console.log(
          chalk.red(
            "the APR configure must be json format. "
          ),
        );
        process.exit(1);
      }
      const keypair = readKeypair(options.signer);
      const client = getBlsStakeContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      let mintPubkey = new PublicKey(mint);
      const state =
        await client.blessStakeClient.getStakeState(mintPubkey);
      if (options.squads) {
        if (options.admin == null) {
          console.log(chalk.red("admin is required."));
          process.exit(1);
        }
        const adminPubkey = new PublicKey(options.admin);
        if (state.admin.toBase58() != adminPubkey.toBase58()) {
          console.log(
            chalk.red(
              "Set apr configure is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        const tx = await client.blessStakeClient.blessStakeSetAprRangeTx(
          mintPubkey,
          adminPubkey,
          apr,
          { signer: adminPubkey },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log(
          "Bless stake set apr configure transaction created: \n" + itx,
        );
      } else {
        options.admin = options.admin || getPath(WALLET_PATH);
        const adminKeypair = readKeypair(options.admin);
        if (state.admin.toBase58() != adminKeypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "Set APR configure is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessStakeClient.blessStakeSetAprRange(
          mintPubkey,
          adminKeypair.publicKey,
          apr,
          {
            signer: keypair.publicKey,
            signerKeypair: [keypair, adminKeypair],
          },
        );
      }
      console.log(chalk.green("Stake contract set APR configure success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("Stake contract set APR configure fail: " + e));
      process.exit(1);
    }
  });

module.exports = setAprCommand;
