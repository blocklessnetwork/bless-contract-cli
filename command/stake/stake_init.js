const { Command, Argument } = require("commander");
const { getBlsStakeContractClient, getPath, readKeypair } = require("../utils");
const { WALLET_PATH } = require("../../lib/constants");
const chalk = require("chalk");
const { PublicKey } = require("@solana/web3.js");
const stakeInitializeCommand = new Command("init")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "the signer is the admin of  the stake contract: " + WALLET_PATH,
  )
  .option(
    "--programId <programId>",
    "Program ID: Specify the program ID when working on devnet, testnet, or localnet; it will not work on mainnet.",
  )
  .description("init: initialize the stake state");
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
const apr = new Argument(
  "apr",
  "apr: the APR configuration, e.g.\
  [{periods: 0, apr: { numerator: 4, denominator: 100 }},\
  {periods: 1,apr: { numerator: 5, denominator: 100 }},\
  {periods: 4,apr: { numerator: 55, denominator: 1000 }},\
  {periods: 26,apr: { numerator: 6, denominator: 100 }},\
  {periods: 52,apr: { numerator: 7, denominator: 100 }}]",
);
apr.required = false;
mint.required = true;
stakeInitializeCommand
  .addArgument(mint)
  .addArgument(apr)
  .action(async (mint, apr, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsStakeContractClient(
        options.cluster,
        keypair,
        options.programId,
      );
      let mintPubkey = null;
      try {
        mintPubkey = new PublicKey(mint);
      } catch (e) {
        console.log(chalk.red("Invalid mint parameter: " + e));
        process.exit(1);
      }
      if (apr == null) apr = [];
      await client.blessStakeClient.initializeBlessStakeState(mintPubkey, apr);
      console.log(chalk.green("Stake state initialization complete."));
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("Stake state initialization failed: " + e));
      process.exit(1);
    }
  });

module.exports = stakeInitializeCommand;
