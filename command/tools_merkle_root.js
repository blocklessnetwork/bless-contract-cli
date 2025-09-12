const { Command, Argument } = require("commander");
const { Keypair, PublicKey } = require("@solana/web3.js");
const chalk = require("chalk");
const fs = require("fs");
const cliProgress = require("cli-progress");
const { streamArray } = require("stream-json/streamers/StreamArray");
const { chain } = require("stream-chain");
const { parser } = require("stream-json");
const { pick } = require("stream-json/filters/Pick");
const anchor = require("@coral-xyz/anchor");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const { formatTime } = require("./utils.js");
const assert = require("assert");

const genMerkleTreeCommand = new Command("gen_merkle_tree")
  .option("--num", "Number of users to parse (default: 5,000,000)")
  .description("gen_merkle_tree: Generate a Merkle tree from a user list file");
const file = new Argument(
  "file",
  "file: Path to the user list file (required)",
);
file.required = true;

function leafNode(address, amount, lockedTime) {
  const addrBuf = address.toBuffer();
  const amtBuf = Buffer.alloc(8);
  const timeBuf = Buffer.alloc(8);
  amount.toArrayLike(Buffer, "le", 8).copy(amtBuf);
  lockedTime.toArrayLike(Buffer, "le", 8).copy(timeBuf);
  return Buffer.from(keccak256(Buffer.concat([addrBuf, amtBuf, timeBuf])));
}

genMerkleTreeCommand.addArgument(file).action(async (file, options) => {
  if (!fs.existsSync(file)) {
    console.log(chalk.red("File does not exist."));
    process.exit(1);
  }

  let ws = null;
  try {
    if (options.num == null) options.num = 500_0000;
    try {
      options.num = parseInt(options.num);
    } catch {
      console.log(chalk.red("Failed to parse number: " + options.num));
      process.exit(1);
    }
    const now = new Date().getTime();
    ws = fs.createReadStream(file, { encoding: "utf8" });
    const pipeline = chain([ws, parser(), streamArray()]);
    const bar = new cliProgress.SingleBar(
      { fps: 10 },
      cliProgress.Presets.shades_classic,
    );
    const total = 100;
    bar.start(total, 0);
    const leaves = [];
    let last = null;
    pipeline.on("data", ({ key, value }) => {
      last = key;
      leaves.push(
        leafNode(
          new PublicKey(value.address),
          new anchor.BN(value.amount),
          new anchor.BN(value.lockedTime),
        ),
      );
      bar.update(parseInt((key / options.num) * 100));
    });
    pipeline.on("end", () => {
      const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      delete leaves;
      bar.update(100);
      console.log(
        chalk.green(
          "\nMerkle tree root:" +
            new PublicKey(tree.getRoot()).toBase58() +
            ", spent time: " +
            formatTime((new Date().getTime() - now) / 1000),
          " total: " + (last + 1),
        ),
      );
      process.exit(0);
    });
  } catch (e) {
    console.log(chalk.red("\nFailed to generate Merkle root: " + e));
  }
});

module.exports = genMerkleTreeCommand;
