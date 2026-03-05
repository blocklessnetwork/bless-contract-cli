const { Command, Argument } = require("commander");
const { getPath, readKeypair, getConnection, bs58Message } = require("./utils");
const { WALLET_PATH } = require("../lib/constants");
const Loader = require("./loader");
const chalk = require("chalk");
const { bs58 } = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const { PublicKey, Transaction, TransactionInstruction, SystemProgram } = require("@solana/web3.js");

const extendCommand = new Command("extend")
  .option(
    "--cluster <cluster>",
    "solana cluster: mainnet, testnet, devnet, localnet, <custom>",
  )
  .option("--payer <payer>", "the default payer: " + WALLET_PATH)
  .option(
    "--authority <authority>",
    "the authority keypair file (default: " + WALLET_PATH + ")",
  )
  .option(
    "--squads <true/false>",
    "squads: if squads true, create a tx message for squads signing, default is false.",
  )
  .option(
    "--admin <admin>",
    "admin: payer pubkey when using squads mode.",
  )
  .description("extend: extend an upgradeable program data account");

const programId = new Argument(
  "programId",
  "programId: the program id (base58 value)",
);
const additionalBytes = new Argument(
  "additionalBytes",
  "additionalBytes: extra bytes to add to the ProgramData account",
);

extendCommand
  .addArgument(programId)
  .addArgument(additionalBytes)
  .action(async (programId, additionalBytes, options) => {
    options.payer = options.payer || getPath(WALLET_PATH);
    options.authority = options.authority || getPath(WALLET_PATH);
    options.cluster = options.cluster || "localnet";
    try {
      const payerKeypair = readKeypair(options.payer);
      const authorityKeypair = readKeypair(options.authority);
      const programIdPK = new PublicKey(programId);
      const additionalBytesNum = Number(additionalBytes);
      if (
        !Number.isInteger(additionalBytesNum) ||
        additionalBytesNum <= 0 ||
        additionalBytesNum > 0xffffffff
      ) {
        throw new Error("additionalBytes must be an integer in [1, 4294967295]");
      }

      const connection = getConnection(options.cluster);
      const useSquads =
        options.squads === true ||
        options.squads === "true" ||
        options.squads === 1 ||
        options.squads === "1";
      if (useSquads) {
        const programAccount = await connection.getAccountInfo(programIdPK);
        if (!programAccount) {
          throw new Error(`Program account not found: ${programId}`);
        }
        const programDataAddress = new PublicKey(
          programAccount.data.subarray(4, 36),
        );
        const PROGRAMDATA_HEADER_SIZE = 45;
        const programDataAccount = await connection.getAccountInfo(
          programDataAddress,
        )
        if (!programDataAccount) {
          throw new Error(
            `ProgramData account not found: ${programDataAddress.toBase58()}`,
          );
        }

        const data = Buffer.alloc(8);
        data.writeUInt32LE(6, 0); // ExtendProgram discriminator
        data.writeUInt32LE(Math.floor(additionalBytes * 1.05), 4);
        const BPF_LOADER_UPGRADEABLE = new PublicKey(
          "BPFLoaderUpgradeab1e11111111111111111111111",
        );
        const admin = new PublicKey(options.admin);
        const ix = new TransactionInstruction({
          programId: BPF_LOADER_UPGRADEABLE,
          keys: [
            { pubkey: programDataAddress, isSigner: false, isWritable: true },
            {
              pubkey: new PublicKey(programId),
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: SystemProgram.programId,
              isSigner: false,
              isWritable: false,
            },
            { pubkey: admin, isSigner: true, isWritable: true },
          ],
          data,
        });
        const tx = new Transaction().add(ix);
        
        tx.feePayer = admin;
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        const serialized = tx.serialize({ verifySignatures: false });
        console.log("Transaction:", {
          b64: serialized.toString("base64"),
          b58: bs58.encode(serialized),
        });
        return
      }

      const extendIx = await Loader.extendProgramCheckedInstruction(
        programIdPK,
        authorityKeypair.publicKey,
        payerKeypair.publicKey,
        additionalBytesNum,
      );
      const transaction = new Transaction();
      transaction.instructions = [extendIx];

      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = payerKeypair.publicKey;
      if (
        payerKeypair.publicKey.toBase58() === authorityKeypair.publicKey.toBase58()
      ) {
        transaction.sign(payerKeypair);
      } else {
        transaction.sign(payerKeypair, authorityKeypair);
      }

      const tx = await connection.sendRawTransaction(transaction.serialize());
      console.log(chalk.green("program extend success: " + tx));
    } catch (e) {
      console.log(chalk.red("program extend fail: " + e));
    }
  });

module.exports = extendCommand;
