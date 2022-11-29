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

- solc -o ./build/bin --bin --abi contracts/*.sol

# count contract bytes

$ wc -c < ./build/bin/PureNFT.bin
 42712
$ ls -l  ./build/bin/PureNFT.bin

# contract address:

PureNFT is deployed at: 

- goerli: 0xeE923c595254dCA7f38C804A2D765bbd53ABbe29 // deprecated  
- goerli: 0x90E2ff151F650972cda7f061198Af6abd463f542