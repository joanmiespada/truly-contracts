// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./IterableMapping.sol";

contract PureNFT {
    using IterableMapping for itmap;

    address private constant ADDRESS_NULL = address(0x0);
    address private _contractOwner;

    enum nNftState { Trading, Inactive }
    
    

    struct nNft {
        //nNftOwners[] nftOwners;
        //mapping(address => uint256) owners;
        itmap owners; //mapping between address and %percentatge
        string hashFile;
        string uriFile;
        string hashMetaFile;
        string uriMetaFile;
        uint   price;
        string uriLicense;
        string copyright;
        nNftState state; 
    }

    mapping(string => nNft) private _UsersWithNfts;
    //itmap private _UsersWithNfts;

    uint256 private _counter;

    event Minted(address, string, uint256);
    event Transfered(address, string, address, uint256);
    event Sold(address, string, uint, string, string, address[]);
    event Withdrawn (address, uint);
    event WithdrawnWithError(address, uint);
    event WithdrawnRemainFail(address, uint);
    event FoundsReceived(address, uint);
    /// the funds send don't cover the price
    error NotEnoughMoney();
    /// The function cannot be called at the current state.
    error InvalidState();
    /// Not an owner of a token
    error NoOwner();
    /// No funds to be withdrawn
    error NoMoneyToWithdraw();

    constructor() {
        _contractOwner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        //emit OwnerSet(address(0), owner);
        _counter = 0;
    }

    modifier isOwner() {
        require(msg.sender == _contractOwner, "Caller is not owner");
        _;
    } 

    modifier inState(nNft storage nft, nNftState state_) {
        if (nft.state != state_)
            revert InvalidState();
        _;
    }
    

    function mint(
        address to,
        string memory token,
        string memory uriFile,
        string memory hashFile,
        string memory uriMetaInfo,
        string memory hashMetaInfo,
        uint price,
        string memory uriLicense,
        string memory copyright
    ) public isOwner {
        require(to != ADDRESS_NULL, "No null address is allowed");
        require(bytes(token).length != 0, "token is mandatory");
        require(bytes(uriFile).length != 0, "uriFile is mandatory");
        require(bytes(hashFile).length != 0, "hashFile is mandatory");
        require(bytes(uriMetaInfo).length != 0, "uriMetaInfo is mandatory");
        require(bytes(hashMetaInfo).length != 0, "hashMetaInfo is mandatory");
        require(bytes(uriLicense).length != 0, "uriLicense is mandatory");
        require(bytes(copyright).length != 0, "copyright is mandatory");
        require(price >=0 , "price must be positive"); //it allows having 0 price
        require(
            bytes(_UsersWithNfts[token].hashFile).length == 0,
            "token in use"
        );


        //_UsersWithNfts[token].nftOwners.push(nNftOwners(to, 70));
        //_UsersWithNfts[token].nftOwners.push(nNftOwners(contractOwner, 30));

        _UsersWithNfts[token].owners.insert(_contractOwner, 30,0);
        _UsersWithNfts[token].owners.insert(to, 70,0);

        //_UsersWithNfts[token].owners[_contractOwner].percentatge = 30;
        //_UsersWithNfts[token].owners[to].percentatge =  70;

        _UsersWithNfts[token].hashFile = hashFile;
        _UsersWithNfts[token].uriFile = uriFile;
        _UsersWithNfts[token].hashMetaFile = hashMetaInfo;
        _UsersWithNfts[token].uriMetaFile = uriMetaInfo;
        _UsersWithNfts[token].uriLicense = uriLicense;
        _UsersWithNfts[token].copyright = copyright;
        _UsersWithNfts[token].price = price;
        _UsersWithNfts[token].state = nNftState.Trading;

        // _UsersWithNfts[token].utcFile = utcFileCreation;

        _counter++;

        emit Minted(to, token, _counter);
    }

    // returns (nNft memory)
    function getContentByToken(string memory token)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        require(bytes(token).length != 0, "token is mandatory");
        require(
            bytes(_UsersWithNfts[token].hashFile).length != 0,
            "token doesn't exist"
        );

        //address[] memory owners = new address[]( _UsersWithNfts[token].nftOwners.length );
        /*_UsersWithNfts[token].nftOwners,
            _UsersWithNfts[token].uriFile,
            _UsersWithNfts[token].hashFile,
            _UsersWithNfts[token].uriMetaFile,
            _UsersWithNfts[token].hashMetaFile,
            _UsersWithNfts[token].utcFile*/

        // _UsersWithNfts[token]
        // _UsersWithNfts[token].nftOwners;
        return (
            _UsersWithNfts[token].uriFile,
            _UsersWithNfts[token].hashFile,
            _UsersWithNfts[token].uriMetaFile,
            _UsersWithNfts[token].hashMetaFile,
            _UsersWithNfts[token].uriLicense,
            _UsersWithNfts[token].copyright,
            _UsersWithNfts[token].price
        );
    }


    function getOnwersByToken(string memory token)
        public
        view
        returns (address[] memory , uint[] memory )
    {
        require(bytes(token).length != 0, "token is mandatory");
        require(
            bytes(_UsersWithNfts[token].hashFile).length != 0,
            "token doesn't exist"
        );
        uint total = _UsersWithNfts[token].owners.size;  
        address[] memory owners = new address[](total);
        uint[] memory percentatges = new uint[](total);

        itmap storage data = _UsersWithNfts[token].owners;
        uint counter = 0;
        for (
            Iterator i = data.iterateStart();
            data.iterateValid(i);
            i = data.iterateNext(i)
        ) {
            (address key,  uint percentatge, ) = data.iterateGet(i);
            owners[counter] = key;
            percentatges[counter] = percentatge;
            counter++;
        }

        return (owners, percentatges);
    }

    function getWithdrawsAvailableByToken(string memory token)
        public
        view
        returns (uint funds)
    {
        require(bytes(token).length != 0, "token is mandatory");
        require(
            bytes(_UsersWithNfts[token].hashFile).length != 0,
            "token doesn't exist"
        );
        funds=0;
        address owner = msg.sender; 

        nNftOwner memory aux = _UsersWithNfts[token].owners.data[owner].value;
        if( aux.amountToWithdraw != 0) {
            funds = aux.amountToWithdraw;
        }

        return funds;
    }
    

    function getTotalMinted() public view isOwner returns (uint256) {
        return _counter;
    }

    function transferOwnership(
        address from,
        string memory token,
        address to,
        uint256 percentatge
    ) public isOwner returns (bool) {
        require(to != address(0), "No null to address is allowed");
        require(from != address(0), "No null from address is allowed");
        require(bytes(token).length != 0, "token is mandatory");
        require(
            bytes(_UsersWithNfts[token].hashFile).length != 0,
            "token doesn't exist"
        );
        require(
            _UsersWithNfts[token].owners.data[from].value.percentatge >= percentatge,
            //_UsersWithNfts[token].owners[from].value >= percentatge,
            "from address has no enought ownership"
        );
         require(
            _UsersWithNfts[token].owners.data[to].value.percentatge + percentatge <= 100,
            //_UsersWithNfts[token].owners[to].value.percentatge + percentatge <= 100,
            "destination address would have more than 100% ownership"
        );
        require(
            _UsersWithNfts[token].state  == nNftState.Trading ,
            "token state doesn't allow it"
        );

        _UsersWithNfts[token].owners.data[from].value.percentatge -= percentatge;
        //_UsersWithNfts[token].owners[from].value -= percentatge;
        _UsersWithNfts[token].owners.data[to].value.percentatge += percentatge;
        //_UsersWithNfts[token].owners[to].value += percentatge;

        emit Transfered(from, token, to, percentatge);
        return true;
    }

    /*
     function transferOwnership(
        string memory token,
        address to,
        uint256 percentatge
    ) public  returns (bool) {
        return transferOwnership(msg.sender, token, to, percentatge);
    }*/

    receive() external payable {
            emit FoundsReceived (msg.sender, msg.value);
    }

    function getBallance() public view isOwner returns (uint) {
        return address(this).balance;
    }

    function buy(string memory token, string memory newLicence, string memory newCopyright) public payable returns (bool) {

        require(bytes(token).length != 0, "token is mandatory");
        require(
            bytes(_UsersWithNfts[token].hashFile).length != 0,
            "token doesn't exist"
        );
        require(bytes(newCopyright).length != 0, "new copyright is mandatory");
        require(
            _UsersWithNfts[token].state  == nNftState.Trading ,
            "token state doesn't allow it"
        );
        require(
            !_UsersWithNfts[token].owners.contains(msg.sender),
            "you're already an owner"
        );
        address buyer = payable(msg.sender);

        //buyer transfer money to contract
        uint deposit = msg.value;

        if(deposit < _UsersWithNfts[token].price ) {
            revert NotEnoughMoney();
        }
        uint totalPayed = 0;
        address[] memory owners; // = new address[](total);
        itmap storage data = _UsersWithNfts[token].owners;
        for (
            Iterator i = data.iterateStart();
            data.iterateValid(i);
            i = data.iterateNext(i)
        ) {
            (, uint percent, ) = data.iterateGet(i);
            if(percent >0){
                uint amountToWithdraw = (deposit /100) * percent;
                data.update(i, 0, amountToWithdraw );
                totalPayed += amountToWithdraw;
            }
        }

        // in case % has decimals and remains some budget, then send it to the contract
        uint remain = deposit - totalPayed;

        if(remain >0){
           (bool sent,) = payable(_contractOwner).call{value: remain}("");
           if(!sent){
                emit WithdrawnRemainFail(_contractOwner, remain);
           }
        }

        _UsersWithNfts[token].owners.insert( msg.sender , 100,0);
        _UsersWithNfts[token].uriLicense = newLicence;
        _UsersWithNfts[token].copyright = newCopyright;

        emit Sold (buyer, token, deposit, newLicence, newCopyright, owners );

        return true;

    }

    function withdraw(string memory token) public payable returns (bool) {

        require(bytes(token).length != 0, "token is mandatory");
        require(
            bytes(_UsersWithNfts[token].hashFile).length != 0,
            "token doesn't exist"
        );
        /*require(
            _UsersWithNfts[token].owners.contains(msg.sender),
            "you weren't the owner"
        );*/
        address owner = msg.sender;

        ( bool found , Iterator i) = _UsersWithNfts[token].owners.find(owner);

        if(!found){
            revert NoOwner();
        }

        ( , uint percent, uint amount) = _UsersWithNfts[token].owners.iterateGet(i);
        if(amount == 0){
            revert NoMoneyToWithdraw();
        }

        //payable(owner).transfer(amount);
        (bool sent, ) = payable(owner).call{value: amount}("");
        if(sent){
            _UsersWithNfts[token].owners.update(i, percent, 0);
            emit Withdrawn(owner, amount);
        }else{
            emit WithdrawnWithError(owner, amount);
        }

        return true;
         
    }
    
}
