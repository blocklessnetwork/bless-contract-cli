const {
  Keypair,
  VersionedTransaction,
  PublicKey,
  TransactionMessage,
  TransactionInstruction,
} = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");
const { SOLANA_CLUSTERS } = require("../lib/constants");
const Squads = require("@sqds/sdk");
const path = require("node:path");
const os = require("os");
const fs = require("node:fs");

const {
  BlsClient: RegisterClient,
} = require("@blessnetwork/node-verification-ledger");

const {
  BlsClient: BlsContractClient,
  BlessTokenAccounts,
  setDevProgramId,
} = require("@blessnetwork/bless-contract");

const {
  BlsClient: BlsTimeContractClient,
} = require("@blessnetwork/bless-time-contract");
const getProvider = (input) => {
  let url = input;
  let cluster = "custom";
  SOLANA_CLUSTERS.forEach((item) => {
    if (item.name === input) {
      url = item.url;
      cluster = item.cluster;
    }
  });
  return {
    cluster,
    endpoint: url,
  };
};

function readKeypair(keypairPath) {
  const walletData = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(walletData));
  return keypair;
}

function getBlsRegisterClient(net, keypair) {
  const connection = getConnection(net);

  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const client = new RegisterClient({ provider });
  return client;
}

function getBlsContractClient(net, keypair, programId) {
  if (programId != null) setDevProgramId(new PublicKey(programId));
  const connection = getConnection(net);

  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const client = new BlsContractClient({ provider });
  return client;
}

function getConnection(net) {
  const connection = new anchor.web3.Connection(
    getProvider(net).endpoint,
    "confirmed",
  );
  return connection;
}

function getBlsTimeContractClient(net, keypair) {
  const connection = getConnection(net);

  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const client = new BlsTimeContractClient({ provider });
  return client;
}

const getMetadata = async (uri) => {
  const resp = await fetch(uri);
  const metaJson = await resp.json();
  if (
    metaJson.name == null ||
    typeof metaJson.name != "string" ||
    metaJson.name == ""
  ) {
    throw Error("name is invalid.");
  }

  if (
    metaJson.symbol == null ||
    typeof metaJson.symbol != "string" ||
    metaJson.symbol == ""
  ) {
    throw Error("symbol is invalid.");
  }

  if (
    metaJson.image == null ||
    typeof metaJson.image != "string" ||
    metaJson.image == ""
  ) {
    throw Error("image is invalid.");
  }
  return metaJson;
};

// display the spent time
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 360);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (h != 0) {
    return `${m}m:${s.toString().padStart(2, "0")}sec`;
  } else if (m != 0) {
    return `${m}m:${s.toString().padStart(2, "0")}sec`;
  } else {
    return `${s.toString().padStart(2, "0")}sec`;
  }
};

function addInstruction(squads, txPDA, ix) {
  const txIx = new anchor.web3.TransactionInstruction({
    keys: ix.keys,
    programId: ix.programId,
    data: ix.data,
  });
  return squads.addInstruction(txPDA, txIx);
}

function getPath(s) {
  if (s == null) return null;
  const arr = s.split("/");
  let p = os.homedir();
  if (arr[0] == "~") {
    arr[0] = os.homedir();
  }
  return path.join(...arr);
}

const sendTransaction = async (connection, instructions, payer) => {
  const blockhash = (await connection.getLatestBlockhash()).blockhash;

  const wrappedMessage = new TransactionMessage({
    instructions,
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(wrappedMessage);
  transaction.sign([payer]);
  return await connection.sendTransaction(transaction);
};

const createSquadTransactionInstructions = async ({
  squads,
  multisigPda,
  ixs,
}) => {
  const instructions = [];

  const nextTxIndex = await squads.getNextTransactionIndex(multisigPda);
  const [txPDA] = Squads.getTxPDA(
    multisigPda,
    new anchor.BN(nextTxIndex),
    Squads.DEFAULT_MULTISIG_PROGRAM_ID,
  );
  instructions.push(
    await squads.buildCreateTransaction(multisigPda, 1, nextTxIndex),
  );

  for (const ix of ixs) {
    // hack the Struct,let ce to public encode.
    const keys = ix.keys.map((key) => {
      const pubkey = new PublicKey(key.pubkey.toBase58());
      key.pubkey = pubkey;
      return key;
    });
    const newIx = new TransactionInstruction({
      keys,
      programId: new PublicKey(ix.programId.toBase58()),
      data: Buffer.from(ix.data),
    });
    const i = ixs.indexOf(ix);
    instructions.push(
      await squads.buildAddInstruction(multisigPda, txPDA, newIx, i + 1),
    );
  }
  instructions.push(await squads.buildActivateTransaction(multisigPda, txPDA));
  instructions.push(await squads.buildApproveTransaction(multisigPda, txPDA));
  return instructions;
};

module.exports = {
  readKeypair,
  formatTime,
  getPath,
  getConnection,
  sendTransaction,
  getMetadata,
  createSquadTransactionInstructions,
  getBlsRegisterClient,
  getBlsContractClient,
  addInstruction,
  getProvider,
  getBlsTimeContractClient,
  BlessTokenAccounts,
};
