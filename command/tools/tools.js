const { Command } = require("commander");
const genUsersDoCommand = require("./tools_gen_users");
const genMerkleTreeCommand = require("./tools_merkle_root");
const toolsCommand = new Command("tools").description(
  "tools: tools command acts as the utility module.",
);
toolsCommand.addCommand(genUsersDoCommand);
toolsCommand.addCommand(genMerkleTreeCommand);

module.exports = toolsCommand;
