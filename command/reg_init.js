const { Command, Argument } = require("commander");
const { getBlsRegisterClient, getPath, readKeypair } = require("./utils");
const anchor = require("@coral-xyz/anchor");
const chalk = require("chalk");
const regInitCommand = new Command("init")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option("--signer <signer>", "backend signer: ~/.config/solana/id.json")
  .description("initial: initial the registration");
const deadline = new Argument(
  "deadline",
  "the deadline of registration, deafult: now() + n * 24hours",
);
deadline.required = true;
regInitCommand.addArgument(deadline).action(async (deadline, options) => {
  options.cluster = options.cluster || "localnet";
  options.signer = options.signer || getPath("~/.config/solana/id.json");
  try {
    const keypair = readKeypair(options.signer);
    const client = getBlsRegisterClient(options.cluster, keypair);
    if (isNaN(deadline) || deadline < 0) {
      console.error(chalk.red("Error: Deadline must be a positive number"));
      process.exit(1);
    }
    if (deadline < 100) {
      deadline = new Date().getTime() / 1000 + 24 * 60 * 60 * deadline;
    }
    await client.nodeRegistrationClient.initialNodeRegistration(
      new anchor.BN(deadline),
      keypair.publicKey,
    );
    console.log(chalk.green("registration initial success."));
    process.exit(0);
  } catch (e) {
    console.log(chalk.red("registration initial fail: " + e));
    process.exit(1);
  }
});

module.exports = regInitCommand;
