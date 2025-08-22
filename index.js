#!/usr/bin/env node

const packageJson = require("./package.json");
const Box = require("cli-box");
const chalk = require("chalk");
const { Command } = require("commander");
const registerCommand = require("./command/register.js");
const blesstokenCommand = require("./command/bless_token.js");
const timeCommand = require("./command/time.js");
const analyzeCommand = require("./command/analyze.js");
const programCommand = require("./command/program.js");
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
    ${chalk.yellow("Welcome to BlessContract CLI!")}
    Run: npx bless-contract-cli help
    `,
  );
  program.addHelpText(
    "after",
    `\nvisit ${chalk.blue("https://docs.bless.network")} for more information.`,
  );
  program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version);

  program.addCommand(registerCommand);
  program.addCommand(blesstokenCommand);
  program.addCommand(analyzeCommand);
  program.addCommand(timeCommand);
  program.addCommand(programCommand);
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
