const { Keypair } = require("@solana/web3.js");
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

function getBlsContractClient(net, keypair) {
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

function getPath(s) {
  if (s == null) return null;
  const arr = s.split("/");
  let p = os.homedir();
  if (arr[0] == "~") {
    arr[0] = os.homedir();
  }
  return path.join(...arr);
}

module.exports = {
  readKeypair,
  getPath,
  getConnection,
  getBlsRegisterClient,
  getBlsContractClient,
  getProvider,
  getBlsTimeContractClient,
  BlessTokenAccounts,
};
