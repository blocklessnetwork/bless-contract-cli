const { Command, Argument } = require("commander");
const regInitCommand = require("./reg_init");
const registerSetDeadlineCommand = require("./reg_set_deadline");
const registerDoCommand = require("./reg_register");
const registerSetPauseCommand = require("./reg_pause");

const registerCommand = new Command("register").description(
  "register: the operations for registration conract.",
);
registerCommand.addCommand(regInitCommand);
registerCommand.addCommand(registerSetDeadlineCommand);
registerCommand.addCommand(registerDoCommand);
registerCommand.addCommand(registerSetPauseCommand);

module.exports = registerCommand;
