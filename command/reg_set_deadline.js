const { Command, Argument } = require("commander");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const { getBlsRegisterClient, getPath, readKeypair } = require("./utils");
const { WALLET_PATH } = require("../lib/constants");

const registerSetDeadlineCommand = new Command("deadline")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option(
    "--signer <signer>",
    "signer: the signer is the backend signer who create the registraction account on chain. default " +
      WALLET_PATH,
  )
  .description(
    "deadline: set/show the deadline of the registration, if is null, show daedline",
  );
const deadline = new Argument(
  "deadline",
  "the deadline of registration, deafult: now() + n * 24hours",
);
deadline.required = false;
registerSetDeadlineCommand
  .addArgument(deadline)
  .action(async (deadline, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath("~/.config/solana/id.json");
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsRegisterClient(options.cluster, keypair);
      if (deadline != null) {
        const now = new Date().getTime() / 1000;
        if (isNaN(deadline)) {
          console.log(chalk.red("deadline must be number"));
          process.exit(1);
        }
        if (parseInt(deadline) < now) {
          deadline = now + 24 * 60 * 60 * deadline;
        }
        await client.nodeRegistrationClient.setRegistrationDeadline(
          new anchor.BN(deadline),
        );
        console.log(chalk.green("registration set deadline success."));
      } else {
        const r = await client.nodeRegistrationClient.getNodeRegistration();
        const deadline = new Date(r.registrationDeadline.toNumber() * 1000);
        console.log(
          chalk.green("registration deadline is :" + deadline.toISOString()),
        );
      }
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("set the deadline of registration fail: " + e));
      process.exit(1);
    }
  });

module.exports = registerSetDeadlineCommand;
