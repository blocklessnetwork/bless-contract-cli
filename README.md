# bless-contract-cli

This project is for interacting with the bless contract,  the admin use the cli to set the registration contract deadline time or pause the register on chain


## How to intsall

Execute follow command to install script.

```bash
npx  blesscontract
```

if install success, you will get follow message

```bash
Usage: blesscontract [options] [command]

The CLI tool for interacting with bless contract.

Options:
  -V, --version                  output the version number
  -h, --help                     display help for command

Commands:
  register                       register: the operations for registration conract.
  analyze [options] [whitelist]  analyze: analyze the register user assests
  help [command]                 display help for command

visit https://docs.bless.network for more information.
```

## How to initial the registration

Execute follow command to get init help message.

```bash
npx  blesscontract register init --help
```

Follow is the help message.

```bash
Usage: blesscontract register init [options] <deadline>

initial: initial the registration

Arguments:
  deadline             the deadline of registration, deafult: now() + n * 24hours

Options:
  --cluster <cluster>  solana cluster: mainnet, testnet, devnet, localnet, <custom>
  --signer <signer>    backend signer: ~/.config/solana/id.json
  -h, --help           display help for command
```


Execute follow command to get init the registration.

```bash
npx  blesscontract register init 1
```

**Notice:** The parameter `1` is mean the deadline is now() + 1 * 24hours.

**Notice:** The devnet has already been initialized.


## How to register

Execute follow command to get regisetr help message.

```bash
npx  blesscontract register register --help
```


Follow is the help message.

```bash
Usage: blesscontract register register [options] <nodeid>

register: register node id on chain

Arguments:
  nodeid                 nodeid: the node id combime with page index as bless node id, nodeid must be base58 of 32 bytes

Options:
  --cluster <cluster>    solana cluster: mainnet, testnet, devnet, localnet, <custom>
  --pindex <page index>  page index: solana bless node page index, default: 0
  --wallet <wallet>      wallet: user wallet, default: ~/.config/solana/id.json
  --bnsigner <bnsigner>  bnsigner: backend signer, default: ~/.config/solana/id.json
  -h, --help             display help for command
```
