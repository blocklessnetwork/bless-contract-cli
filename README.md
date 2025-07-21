
# bless-contract-cli

This project is for interacting with the bless contract. The admin uses the CLI to set the registration contract deadline time or pause the registration on chain.

## How to install

Execute the following command to install the script.

```bash
npx @blessnetwork/blesscontract
```

If the installation is successful, you will get the following message.

```bash
Usage: @blessnetwork/blesscontract [options] [command]

The CLI tool for interacting with bless contract.

Options:
  -V, --version                  output the version number
  -h, --help                     display help for command

Commands:
  register                       register: the operations for registration contract.
  analyze [options] [whitelist]  analyze: analyze the register user assets
  help [command]                 display help for command

visit https://docs.bless.network for more information.
```

## How to initialize the registration

Execute the following command to get the init help message.

```bash
npx @blessnetwork/blesscontract register init --help
```

Following is the help message.

```bash
Usage: @blessnetwork/blesscontract register init [options] <deadline>

initial: initial the registration

Arguments:
  deadline             the deadline of registration, default: now() + n * 24hours

Options:
  --cluster <cluster>  solana cluster: mainnet, testnet, devnet, localnet, <custom>
  --signer <signer>    backend signer: ~/.config/solana/id.json
  -h, --help           display help for command
```

Execute the following command to init the registration.

```bash
npx @blessnetwork/blesscontract register init 1
```

**Notice:** The parameter `1` means the deadline is now() + 1 * 24hours.

**Notice:** The devnet has already been initialized.

## How to register

Execute the following command to get the register help message.

```bash
npx @blessnetwork/blesscontract register register --help
```

Following is the help message.

```bash
Usage: blesscontract register register [options] <nodeid>

register: register node id on chain

Arguments:
  nodeid                 nodeid: the node id combined with page index as bless node id, nodeid must be base58 of 32 bytes

Options:
  --cluster <cluster>    solana cluster: mainnet, testnet, devnet, localnet, <custom>
  --pindex <page index>  page index: solana bless node page index, default: 0
  --wallet <wallet>      wallet: user wallet, default: ~/.config/solana/id.json
  --bnsigner <bnsigner>  bnsigner: backend signer, default: ~/.config/solana/id.json
  -h, --help             display help for command
```

### Prepare node id key for register

Follow the command to generate the node id.

```bash
solana-keygen new -o nodeid.json
```

Follow the command to get the public key of the node id.

```bash
solana-keygen pubkey nodeid.json
```

### Execute the following command to register node id

```bash
npx @blessnetwork/blesscontract register register EpuL59hXSGDt6M8UAxw3k1smXwJgJYPon9DUWC7agUcT
```

## How to set deadline

Execute the following command to get the set deadline help message.

```bash
npx @blessnetwork/blesscontract register deadline --help
```

Following is the help message.

```bash
Usage: blesscontract register deadline [options] [deadline]

deadline: set/show the deadline of the registration, if is null, show deadline

Arguments:
  deadline             the deadline of registration, default: now() + n * 24hours

Options:
  --cluster <cluster>  solana cluster: mainnet, testnet, devnet, localnet, <custom>
  --signer <signer>    signer: the signer is the backend signer who create the registration account on chain. default ~/.config/solana/id.json
  -h, --help           display help for command
```

Execute the following command to set the deadline of the registration.

```bash
npx @blessnetwork/blesscontract register deadline 2
```

**Notice:** The parameter `2` means the deadline is now() + 2 * 24hours.

## How to pause registration

Execute the following command to get the pause help message.

```bash
npx @blessnetwork/blesscontract register pause --help
```

Following is the help message.

```bash
Usage: @blessnetwork/blesscontract register pause [options] [pause]

pause: set/show the pause status of the registration, the value is true/false, if is null, show status

Arguments:
  pause                pause: the status of the registration

Options:
  --cluster <cluster>  solana cluster: mainnet, testnet, devnet, localnet, <custom>
  -h, --help           display help for command
```

Execute the following command to pause the registration.

```bash
npx @blessnetwork/blesscontract register pause true
```

Execute the following command to resume the registration.

```bash
npx @blessnetwork/blesscontract register pause false
```

Execute the following command to check the current pause status.

```bash
npx @blessnetwork/blesscontract register pause
```


## How to execute blesstoken command

Execute the following command to get the blesstoken help message.

``` bash
npx @blessnetwork/blesscontract blesstoken --help
```

Following is the help message.

```bash
Usage: @blessnetwork/blesscontract blesstoken [options] <wallets> <mint> <mintAuthority>

blesstoken: initial blesstoken registration

Arguments:
  wallets              wallets: wallets is the wallet 1-5 that distrubuted the bless token by the contract, value should be base58 sperate by `,`.
                       Wallet1 is Investor, Wallet2 is (Team + advisor), Wallet3 is Foundation, Wallet4 is (Ecosystem + Liquidity Provision + TGE
                       Marketing), Wallet5 is (Community Rewards)
  mint                 mint: the mint token public key(base58)
  mintAuthority        mintAuthority: the mint authority, the value is file path of mintAuthority

Options:
  --cluster <cluster>  solana cluster: mainnet, testnet, devnet, localnet, <custom>
  -h, --help           display help for command
```

1. Prepare the Mint Authory Keypair.

```bash
# Prepare the mint Authority keypair
solana-keygen new -o authority.json
```

2. Create the mint token

```bash
spl-token create-token --mint-authority authority.json
```

The command output Ep9fFc5oKgbtkd1kVSKTFy7mariTdavtU6jJrT2SBcff

3. Create the 5 major wallets

```bash
solana-keygen new -o w1.json
solana-keygen new -o w2.json
solana-keygen new -o w3.json
solana-keygen new -o w4.json
solana-keygen new -o w5.json
```

4. Guarantee the 5 major wallets account exist on the chain (for devnet or localnet use the airdrop )

```bash
solana airdrop 1 $(solana-keygen pubkey w1.json)
solana airdrop 1 $(solana-keygen pubkey w2.json)
solana airdrop 1 $(solana-keygen pubkey w3.json)
solana airdrop 1 $(solana-keygen pubkey w4.json)
solana airdrop 1 $(solana-keygen pubkey w5.json)
```

5. create the associate accounts of 5 major wallets

```bash
spl-token create-account --owner w1.json Ep9fFc5oKgbtkd1kVSKTFy7mariTdavtU6jJrT2SBcff
spl-token create-account --owner w2.json Ep9fFc5oKgbtkd1kVSKTFy7mariTdavtU6jJrT2SBcff
spl-token create-account --owner w3.json Ep9fFc5oKgbtkd1kVSKTFy7mariTdavtU6jJrT2SBcff
spl-token create-account --owner w4.json Ep9fFc5oKgbtkd1kVSKTFy7mariTdavtU6jJrT2SBcff
spl-token create-account --owner w5.json Ep9fFc5oKgbtkd1kVSKTFy7mariTdavtU6jJrT2SBcff
```

6. Use the bless contract cli to invoke the contract logic.

```bash
npx @blessnetwork/blesscontract blesstoken FrMxAhmD3QzF5qhN8bLqKzb7m8sTiXAZmMMh6ZpvVZTM,4EDnpHM7m3UnpqmaEFomZa9YPYsXshkWL9NLKMoGNewr,FAxc73vzyLpsbsch7cKT8JNVfhFt7YSisp8xD6CF7GsT,HKuXKEyhhzyRt5WeFQtELPng5Q6gXua4UzRAcaoGj4Fi,4i9d69rJRHEf3jwigajzX1QYc2wBcndkBna5JqEh8qTJ 9LCLCwANHQqCj2R4rWcvkka1tTMsfByVqa5gzuDCjYeg  authority.json
```
