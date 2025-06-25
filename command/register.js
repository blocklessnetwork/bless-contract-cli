const { Command, Argument } = require("commander");
const regInitCommand = require("./reg_init");

const registerCommand = new Command("register").description(
  "register: the operations for registration conract.",
);
registerCommand.addCommand(regInitCommand);

module.exports = registerCommand;
