const { Command, Argument } = require("commander");
const chalk = require("chalk");
const { getBlsRegisterClient, getPath, readKeypair } = require("../utils");
const { WALLET_PATH } = require("../../lib/constants");

const registerBackendSignerCommand = new Command("bsigner")
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
    "bsigner: set/show the backend signer of the registration, if is null, show backend signer",
  );
const bsigner = new Argument("bsigner", "the backend signer of registration");
bsigner.required = false;
registerBackendSignerCommand
  .addArgument(bsigner)
  .action(async (bsigner, options) => {
    options.cluster = options.cluster || "localnet";
    options.signer = options.signer || getPath("~/.config/solana/id.json");
    try {
      const keypair = readKeypair(options.signer);
      const client = getBlsRegisterClient(options.cluster, keypair);
      if (bsigner != null) {
        await client.nodeRegistrationClient.setBackendSigner(bsigner);
        console.log(chalk.green("registration set backend signer success."));
      } else {
        const r = await client.nodeRegistrationClient.getNodeRegistration();
        console.log(
          chalk.green("registration backend signer is :" + r.backendSigner),
        );
      }
      process.exit(0);
    } catch (e) {
      console.log(
        chalk.red("set the backend signer of registration fail: " + e),
      );
      process.exit(1);
    }
  });

module.exports = registerBackendSignerCommand;
