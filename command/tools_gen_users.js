const { Command, Argument } = require("commander");
const { Keypair } = require("@solana/web3.js");
const chalk = require("chalk");
const fs = require("fs");
const cliProgress = require("cli-progress");
const { formatTime } = require("./utils.js");

const genUsersDoCommand = new Command("gen_users")
  .option("--file", "Output file path (default: ./users.json)")
  .description("gen_users: Generate the user list and save it to a file");
const num = new Argument("num", "How many user to generate");
num.required = true;

genUsersDoCommand.addArgument(num).action(async (num, options) => {
  if (options.file == null) options.file = "./users.json";
  if (num == null) num = 500_0000;
  if (fs.existsSync(options.file)) {
    console.log(
      chalk.red("File exists, please remove the file " + options.file),
    );
    process.exit(1);
  }
  try {
    num = parseInt(num);
  } catch {
    console.log(chalk.red("Failed to parse number: " + num));
    process.exit(1);
  }
  let ws = null;
  try {
    const now = new Date().getTime();
    ws = fs.createWriteStream(options.file);
    const bar = new cliProgress.SingleBar(
      { fps: 10 },
      cliProgress.Presets.shades_classic,
    );
    const total = 100;
    bar.start(total, 0);
    ws.write("[");
    for (let i = 0; i < num; i++) {
      const public = Keypair.generate().publicKey;
      const amount = parseInt(Math.random() * (1 + i * 10)).toString();
      const lockedTime = parseInt(Math.random() * (100 + 1));
      const obj = { address: public.toBase58(), amount, lockedTime };
      ws.write(JSON.stringify(obj));
      bar.updateETA();
      if (i != num - 1) ws.write(",");
      bar.update(parseInt((i / num) * 100));
    }
    bar.update(100);

    // end the write stream and ouput success message.
    ws.end("]", () => {
      console.log(
        chalk.green(
          "\nSuccessfully generated users, time spent: " +
            formatTime((new Date().getTime() - now) / 1000),
        ),
      );
      process.exit(0);
    });
  } catch (e) {
    console.log(chalk.red("\nFailed to generate users: " + e));
  } finally {
    if (ws != null) ws.close();
  }
});

module.exports = genUsersDoCommand;
