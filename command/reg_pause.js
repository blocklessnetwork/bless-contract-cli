const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { WALLET_PATH } = require("../lib/constants");
const { getBlsRegisterClient, getPath, readKeypair } = require("./utils");

const registerSetPauseCommand = new Command("pause")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .description(
    "pause: set/show the pause status of the registration, the value is true/false, if is null, show status",
  );
const pause = new Argument("pause", "pause: the status of the registration");
pause.required = false;
registerSetPauseCommand.addArgument(pause).action(async (pause, options) => {
  options.cluster = options.cluster || "localnet";
  options.signer = options.signer || getPath(WALLET_PATH);
  try {
    const keypair = readKeypair(options.signer);
    const client = getBlsRegisterClient(options.cluster, keypair);
    if (pause != null) {
      pause = pause.toLowerCase().trim();
      if (pause != "true" && pause != "false") {
        console.log(chalk.red("pause value must true or false"));
        process.exit(1);
      }
      await client.nodeRegistrationClient.setRegistrationPausedState(
        pause == "true" ? true : false,
      );
      console.log(chalk.green("registration pause success."));
    } else {
      const r = await client.nodeRegistrationClient.getNodeRegistration();
      console.log(chalk.green("registration pause status is " + r.paused));
    }
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("set the pause status of registration fail: " + e));
    process.exit(1);
  }
});

module.exports = registerSetPauseCommand;
