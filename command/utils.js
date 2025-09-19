const { Keypair, PublicKey, TransactionMessage } = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");
const { SOLANA_CLUSTERS } = require("../lib/constants");
const path = require("node:path");
const os = require("os");
const fs = require("node:fs");

const {
  BlsClient: RegisterClient,
} = require("@blessnetwork/node-verification-ledger");

const {
  BlsClient: BlsContractClient,
  BlessTokenAccounts,
  setDevProgramId: setBlsContractDevProgramId,
} = require("@blessnetwork/bless-contract");

const {
  BlsClient: BlsTimeContractClient,
  setDevProgramId: setBlsTimeContractDevProgramId,
} = require("@blessnetwork/bless-time-contract");
const { bs58 } = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
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
  if (programId != null) setBlsContractDevProgramId(new PublicKey(programId));
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

function getBlsTimeContractClient(net, keypair, programId) {
  if (programId != null)
    setBlsTimeContractDevProgramId(new PublicKey(programId));
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

function getPath(s) {
  if (s == null) return null;
  const arr = s.split("/");
  let p = os.homedir();
  if (arr[0] == "~") {
    arr[0] = os.homedir();
  }
  return path.join(...arr);
}

const bs58Message = async (connection, instructions, payer) => {
  const blockhash = (await connection.getLatestBlockhash()).blockhash;

  const wrappedMessage = new TransactionMessage({
    instructions,
    payerKey: payer.publicKey ? payer.publicKey : payer,
    recentBlockhash: blockhash,
  }).compileToLegacyMessage();
  return bs58.encode(wrappedMessage.serialize());
};

module.exports = {
  readKeypair,
  formatTime,
  getPath,
  getConnection,
  bs58Message,
  getMetadata,
  getBlsRegisterClient,
  getBlsContractClient,
  getProvider,
  getBlsTimeContractClient,
  BlessTokenAccounts,
};
