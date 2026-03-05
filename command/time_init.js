const { Command, Argument } = require("commander");
const {
  getBlsTimeContractClient,
  getPath,
  readKeypair,
  bs58Message,
} = require("./utils");
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
  .option(
    "--squads <true/false>",
    "squads: if squads true, use squads to signature, default is false.",
  )
  .option(
    "--admin <admin>",
    "admin: if squads true, use admin to signature in squads",
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
    if (options.squads) {
      if (options.admin == null) {
        console.log(chalk.red("admin is required."));
        process.exit(1);
      }
      let admin = null;
      try {
        admin = new PublicKey(options.admin);
      } catch (e) {
        console.log(chalk.red("invaild admin parameter: " + e));
        process.exit(1);
      }
      const tx = await client.blessTimeClient.baseClient.program.methods
        .initializeBlessTimeState()
        .accountsPartial({
          payer: admin,
          blessMint: mintPubkey,
        })
        .transaction();
      const itx = await bs58Message(client.connection, tx.instructions, keypair);
      console.log("bless time init transaction created: \n" + itx);
    } else {
      await client.blessTimeClient.initializeBlessTimeState(mintPubkey);
      console.log(chalk.green("time state initial success."));
    }
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("time state initial fail: " + e));
    process.exit(1);
  }
});

module.exports = timeInitCommand;
