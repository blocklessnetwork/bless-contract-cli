const { Command, Argument } = require("commander");
const { getBlsTimeContractClient, getPath, readKeypair } = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const chalk = require("chalk");
const { PublicKey } = require("@solana/web3.js");
const timeInitCommand = new Command("init")
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
  .description("initial: initial the time state");
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
mint.required = true;
timeInitCommand.addArgument(mint).action(async (mint, options) => {
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
    await client.blessTimeClient.initializeBlessTimeState(mintPubkey);
    console.log(chalk.green("time state initial success."));
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("time state initial fail: " + e));
    process.exit(1);
  }
});

module.exports = timeInitCommand;
