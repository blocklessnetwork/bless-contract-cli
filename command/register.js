const { Command, Argument } = require("commander");
const regInitCommand = require("./reg_init");
const registerSetDeadlineCommand = require("./reg_set_deadline");

const registerCommand = new Command("register").description(
  "register: the operations for registration conract.",
);
registerCommand.addCommand(regInitCommand);
registerCommand.addCommand(registerSetDeadlineCommand);

module.exports = registerCommand;
