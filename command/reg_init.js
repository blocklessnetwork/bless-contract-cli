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
  const keypair = readKeypair(options.signer);
  const client = getBlsRegisterClient(options.cluster, keypair);
  if (deadline < 100) {
    deadline = new Date().getTime() / 1000 + 24 * 60 * 60 * deadline;
  }
  await client.nodeRegistrationClient.initialNodeRegistration(
    new anchor.BN(deadline),
    keypair.publicKey,
  );
  console.log(chalk.green("registration initial success."));
  process.exit(0);
});

module.exports = regInitCommand;
