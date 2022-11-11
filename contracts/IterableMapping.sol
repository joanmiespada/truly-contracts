// SPDX-License-Identifier: GPL-3.0
// pragma solidity ^0.8.8;
pragma solidity >=0.8.8 <0.9.0;

struct nNftOwner {
    //address owner;
    uint    percentatge;
    uint    amountToWithdraw;    
}


struct IndexValue { uint keyIndex; nNftOwner value; }
struct KeyFlag { address key; bool deleted; }

struct itmap {
    mapping(address => IndexValue) data;
    KeyFlag[] keys;
    uint size;
}

type Iterator is uint;

library IterableMapping {

    bytes32 constant NULL = "";

    function insert(itmap storage self, address key, uint percent, uint amount) internal returns (bool replaced) {
        uint keyIndex = self.data[key].keyIndex;
        self.data[key].value.percentatge = percent;
        self.data[key].value.amountToWithdraw = amount;
        if (keyIndex > 0)
            return true;
        else {
            keyIndex = self.keys.length;
            self.keys.push();
            self.data[key].keyIndex = keyIndex + 1;
            self.keys[keyIndex].key = key;
            self.size++;
            return false;
        }
    }

    function remove(itmap storage self, address key) internal returns (bool success) {
        uint keyIndex = self.data[key].keyIndex;
        if (keyIndex == 0)
            return false;
        delete self.data[key];
        self.keys[keyIndex - 1].deleted = true;
        self.size --;
    }

    function contains(itmap storage self, address key) internal view returns (bool) {
        return self.data[key].keyIndex > 0;
    }

    function iterateStart(itmap storage self) internal view returns (Iterator) {
        return iteratorSkipDeleted(self, 0);
    }

    function iterateValid(itmap storage self, Iterator iterator) internal view returns (bool) {
        return Iterator.unwrap(iterator) < self.keys.length;
    }

    function iterateNext(itmap storage self, Iterator iterator) internal view returns (Iterator) {
        return iteratorSkipDeleted(self, Iterator.unwrap(iterator) + 1);
    }

    function iterateGet(itmap storage self, Iterator iterator) internal view returns (address key, uint percent, uint amount) {
        uint keyIndex = Iterator.unwrap(iterator);
        key = self.keys[keyIndex].key;
        percent = self.data[key].value.percentatge;
        amount = self.data[key].value.amountToWithdraw;
    }
    
    function update(itmap storage self, Iterator iterator, uint percent, uint amount) internal {
        uint keyIndex = Iterator.unwrap(iterator);
        address key = self.keys[keyIndex].key;
        self.data[key].value.percentatge = percent;
        self.data[key].value.amountToWithdraw = amount;
    }

    function find(itmap storage self, address key) internal view returns (bool, Iterator) {
       uint foundKeyIndex=0;
       bool foundFlag = false;
       for(uint i=0; i< self.size && !foundFlag; i++) {
            address aux = self.keys[i].key;
            if(aux == key){
                foundKeyIndex=i;
                foundFlag= true;
            }
       }
       return (foundFlag, iteratorSkipDeleted(self,foundKeyIndex));
    }

    function iteratorSkipDeleted(itmap storage self, uint keyIndex) private view returns (Iterator) {
        while (keyIndex < self.keys.length && self.keys[keyIndex].deleted)
            keyIndex++;
        return Iterator.wrap(keyIndex);
    }

}
