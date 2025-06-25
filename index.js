const packageJson = require("./package.json");
const Box = require("cli-box");
const chalk = require("chalk");
const { Command } = require("commander");
const registerCommand = require("./command/register.js");
const program = new Command();

async function main() {
  const b2 = new Box(
    {
      w: process.stdout.columns,
      h: 12,
      stretch: true,
      stringify: false,
    },
    `
    ${chalk.yellow(":")}
  npx bless-contract-cli  help }`,
  );
  program.addHelpText(
    "after",
    `\nvisit ${chalk.blue("https://docs.bless.network")} for more information.`,
  );
  program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version);

  program
    .command("version")
    .description("Show the current version")
    .action(() => {
      console.log(`Current version: ${packageJson.version} `);
    });
  program.addCommand(registerCommand);
  await program.parseAsync(process.argv);
}

main();
