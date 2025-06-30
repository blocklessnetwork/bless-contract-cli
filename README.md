
# bless-contract-cli

This project is for interacting with the bless contract. The admin uses the CLI to set the registration contract deadline time or pause the registration on chain.

## How to install

Execute the following command to install the script.

```bash
npx blesscontract
```

If the installation is successful, you will get the following message.

```bash
Usage: blesscontract [options] [command]

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
npx blesscontract register init --help
```

Following is the help message.

```bash
Usage: blesscontract register init [options] <deadline>

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
npx blesscontract register init 1
```

**Notice:** The parameter `1` means the deadline is now() + 1 * 24hours.

**Notice:** The devnet has already been initialized.

## How to register

Execute the following command to get the register help message.

```bash
npx blesscontract register register --help
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
npx blesscontract register register EpuL59hXSGDt6M8UAxw3k1smXwJgJYPon9DUWC7agUcT
```

## How to set deadline

Execute the following command to get the set deadline help message.

```bash
npx blesscontract register deadline --help
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
npx blesscontract register deadline 2
```

**Notice:** The parameter `2` means the deadline is now() + 2 * 24hours.

## How to pause registration

Execute the following command to get the pause help message.

```bash
npx blesscontract register pause --help
```

Following is the help message.

```bash
Usage: blesscontract register pause [options] [pause]

pause: set/show the pause status of the registration, the value is true/false, if is null, show status

Arguments:
  pause                pause: the status of the registration

Options:
  --cluster <cluster>  solana cluster: mainnet, testnet, devnet, localnet, <custom>
  -h, --help           display help for command
```

Execute the following command to pause the registration.

```bash
npx blesscontract register pause true
```

Execute the following command to resume the registration.

```bash
npx blesscontract register pause false
```

Execute the following command to check the current pause status.

```bash
npx blesscontract register pause
```
