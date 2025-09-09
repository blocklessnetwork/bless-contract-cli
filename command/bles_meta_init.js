const { Command, Argument } = require("commander");
const chalk = require("chalk");
const { WALLET_PATH } = require("../lib/constants");
const { getBlsContractClient, getPath, readKeypair } = require("./utils");

const blessMetaInitCommand = new Command("init")
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
  .description("init: init the meta state, the payer as the default admin.");
const mint = new Argument("mint", "mint: the public key of the mint token");
mint.required = true;

blessMetaInitCommand.addArgument(mint).action(async (mint, options) => {
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

    options.admin = options.admin || getPath(WALLET_PATH);
    await client.blessTokenClient.initialBlessTokenMetaState(mintPubkey);
    console.log(chalk.green("bless token metadata account initial success."));
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("bless token metadata account initial fail: " + e));
    process.exit(1);
  }
});

module.exports = blessMetaInitCommand;
