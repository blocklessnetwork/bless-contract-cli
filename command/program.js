const { Command, Argument } = require("commander");
const upgradeCommand = require("./prg_upgrade");

const programCommand = new Command("program").description(
  "program: the operations for program.",
);
programCommand.addCommand(upgradeCommand);

module.exports = programCommand;
