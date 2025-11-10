const { Command, Argument } = require("commander");
const upgradeCommand = require("./prg_upgrade");
const deployCommand = require("./prg_deploy_buffer");

const programCommand = new Command("program").description(
  "program: the operations for program.",
);
programCommand.addCommand(upgradeCommand);
programCommand.addCommand(deployCommand);

module.exports = programCommand;
