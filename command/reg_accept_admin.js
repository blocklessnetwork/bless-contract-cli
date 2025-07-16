const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { WALLET_PATH } = require("../lib/constants");
const { getBlsRegisterClient, getPath, readKeypair } = require("./utils");
const { PublicKey } = require("@solana/web3.js");

const registerAcceptAdminCommand = new Command("accept-admin")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .description("accept-admin: accept the pending admin of the registration");

registerAcceptAdminCommand.action(async (options) => {
  options.cluster = options.cluster || "localnet";
  options.signer = options.signer || getPath(WALLET_PATH);
  try {
    const keypair = readKeypair(options.signer);
    const client = getBlsRegisterClient(options.cluster, keypair);
    await client.nodeRegistrationClient.acceptRegistrationPendingAdmin();
    console.log(chalk.green("registration accept admin success."));
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("accept admin of registration fail: " + e));
    process.exit(1);
  }
});

module.exports = registerAcceptAdminCommand;
