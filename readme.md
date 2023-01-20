# Pure NFT infrastructure

Run commands:
- docker-compose up -d
- build_deploy_local.sh

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

- $ docker build .

# solc abi compiler

- solc -o ./build/bin --bin --abi contracts/*.sol

# count contract bytes

$ wc -c < ./build/bin/PureNFT.bin
$ ls -l  ./build/bin/PureNFT.bin

