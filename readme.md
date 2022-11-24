## docker command

Open tron local: http://127.0.0.1:9090

```
docker run -it \
  -p 9090:9090 \
  --rm \
  --name tron \
  trontools/quickstart
```

## tron solidity contracts

https://github.com/tronprotocol/tronbox

- tronbox compile
- tronbox test
- tronbox migrate --reset
- tronbox migrate --network development

## test bugs

- https://github.com/crytic/slither

## local commands

- npx ganache-cli --deterministic
- npx truffle compile
- npx truffle test
- npx truffle migrate --reset --network development
- rm -r build/contracts && npx truffle migrate --reset  --network development

- truffle migrate --network <networkname>
- truffle run verify <smartContractXYZ> --network <networkname>


## ganache docker image

- $ docker run --detach --publish 8545:8545 trufflesuite/ganache:latest

# solc abi compiler

- solc -o build --bin --abi contracts/*.sol


# contract address:

PureNFT is deployed at: 

- goerli: 0xeE923c595254dCA7f38C804A2D765bbd53ABbe29 