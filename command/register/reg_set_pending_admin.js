const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { WALLET_PATH } = require("../../lib/constants");
const { getBlsRegisterClient, getPath, readKeypair } = require("../utils");
const { PublicKey } = require("@solana/web3.js");

const registerSetPendingAdminCommand = new Command("pending-admin")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the admin of the registration, default: " +
    WALLET_PATH,
  )
  .description(
    "pending-admin: set/show the pending admin of the registration, the value is base58, if is empty, show the pending admin",
  );
const pending = new Argument(
  "pending-admin",
  "pending-admin: the pending admin of the registration",
);
pending.required = false;
registerSetPendingAdminCommand
  .addArgument(pending)
  .action(async (pending, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsRegisterClient(options.cluster, keypair);
      if (pending != null) {
        let pendingAdmin = new PublicKey(pending);
        await client.nodeRegistrationClient.setRegistrationPendingAdminAccount(
          pendingAdmin,
        );
        console.log(chalk.green("Registration set pending admin success."));
      } else {
        const r = await client.nodeRegistrationClient.getNodeRegistration();
        console.log(
          chalk.green("Registration pending admin is " + r.pendingAdminAccount),
        );
      }
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("Set the pending admin fail: " + e));
      process.exit(1);
    }
  });

module.exports = registerSetPendingAdminCommand;
