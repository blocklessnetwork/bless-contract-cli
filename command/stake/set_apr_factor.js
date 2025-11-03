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

const setAprFactorCommand = new Command("set-factor")
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
    "set-factor: set the APR factor of the bless stake",
  );
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;

const secondsPerPeriods = new Argument("secondsPerPeriods", "secondsPerPeriods: the seconds per periods");
const periodsPerYear = new Argument("periodsPerYear", "periodsPerYear: periods per year");
mint.required = true;
secondsPerPeriods.required = true;
periodsPerYear.required = true;

const parseIntWithError = function (n, err) {
  let num = null;
  try {
    num = parseInt(n);
  } catch {
    console.log(chalk.red(err));
    process.exit(1);
  }
  return num;
}
setAprFactorCommand
  .addArgument(mint)
  .addArgument(secondsPerPeriods)
  .addArgument(periodsPerYear)
  .action(async (mint, secondsPerPeriods, periodsPerYear, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);

    options.squads = options.squads || false;
    try {

      secondsPerPeriods = parseIntWithError(secondsPerPeriods, "the secondsPerPeriods must be number format. ");
      periodsPerYear = parseIntWithError(periodsPerYear, "the periodsPerYear must be number format. ");

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
              "Set APR factor is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        const tx = await client.blessStakeClient.blessStakeSetAprFactorTx(
          mintPubkey,
          adminPubkey,
          secondsPerPeriods,
          periodsPerYear,
          { signer: adminPubkey },
        );
        const itx = await bs58Message(
          client.connection,
          tx.instructions,
          keypair,
        );
        console.log(
          "Bless stake set APR factor transaction created: \n" + itx,
        );
      } else {
        options.admin = options.admin || getPath(WALLET_PATH);
        const adminKeypair = readKeypair(options.admin);
        if (state.admin.toBase58() != adminKeypair.publicKey.toBase58()) {
          console.log(
            chalk.red(
              "Set APR factor is denied, admin is not matched, the state admin is " +
              state.admin.toBase58(),
            ),
          );
          process.exit(1);
        }
        await client.blessStakeClient.blessStakeSetAprFactor(
          mintPubkey,
          adminKeypair.publicKey,
          secondsPerPeriods,
          periodsPerYear,
          {
            signer: keypair.publicKey,
            signerKeypair: [keypair, adminKeypair],
          },
        );
      }
      console.log(chalk.green("Stake contract set APR factor success."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("Stake contract set APR factor fail: " + e));
      process.exit(1);
    }
  });

module.exports = setAprFactorCommand;
