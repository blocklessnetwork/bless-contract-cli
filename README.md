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
npx  blesscontract init --help
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
