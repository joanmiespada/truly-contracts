#!/bin/bash
npx truffle compile
npx truffle test
npx truffle migrate --reset --network development