const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { WALLET_PATH } = require("../lib/constants");
const { getBlsTimeContractClient, getPath, readKeypair } = require("./utils");
const { PublicKey } = require("@solana/web3.js");

const timeSetPendingAdminCommand = new Command("pending-admin")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the admin of the time contract, default: " +
      WALLET_PATH,
  )
  .description(
    "pending-admin: set/show the pending admin of the registration, the value is base58, if is empty, show the pending admin",
  );
const mint = new Argument(
  "mint",
  "mint: the mint is the mint token base58 value ",
);
mint.required = true;
const pending = new Argument(
  "pending-admin",
  "pending-admin: the pending admin of the registration",
);
pending.required = false;
timeSetPendingAdminCommand
  .addArgument(mint)
  .addArgument(pending)
  .action(async (mint, pending, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath(WALLET_PATH);
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsTimeContractClient(options.cluster, keypair);
      let mintPubkey = null;
      try {
        mintPubkey = new PublicKey(mint);
      } catch (e) {
        console.log(chalk.red("invaild mint parameter: " + e));
        process.exit(1);
      }
      if (pending != null) {
        let pendingAdmin;
        try {
          pendingAdmin = new PublicKey(pending);
        } catch (e) {
          console.log(chalk.red("invalid pending-admin parameter: " + e));
          process.exit(1);
        }
        await client.blessTimeClient.setPendingAdminAccount(
          mintPubkey,
          pendingAdmin,
        );
        console.log(chalk.green("time contract set pending admin success."));
      } else {
        const r = await client.blessTimeClient.getTimeState(mintPubkey);
        console.log(
          chalk.green("time contract pending admin is " + r.pendingAdmin),
        );
      }
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("set the pending admin fail: " + e));
      process.exit(1);
    }
  });

module.exports = timeSetPendingAdminCommand;
