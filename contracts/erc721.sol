// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract NFT is ERC721{
    constructor() ERC721("NFT721", "NFT") { }
    uint256 id=0;
    function Safemint() external returns(uint256){
        id++;
        _mint(msg.sender,id);
        return id;
    }
}