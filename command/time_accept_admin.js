const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { WALLET_PATH } = require("../lib/constants");
const { getBlsTimeContractClient, getPath, readKeypair } = require("./utils");
const { PublicKey } = require("@solana/web3.js");

const timeAcceptAdminCommand = new Command("accept-admin")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the pending acount: " + WALLET_PATH,
  )
  .description("accept-admin: accept the pending admin of the time contract");

timeAcceptAdminCommand.action(async (options) => {
  options.cluster = options.cluster || "localnet";
  options.signer = options.signer || getPath(WALLET_PATH);
  try {
    const keypair = readKeypair(options.signer);
    const client = getBlsTimeContractClient(options.cluster, keypair);
    await client.blessTimeClient.acceptAdmin();
    console.log(chalk.green("time contract accept admin success."));
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("accept admin of time contract fail: " + e));
    process.exit(1);
  }
});

module.exports = timeAcceptAdminCommand;
