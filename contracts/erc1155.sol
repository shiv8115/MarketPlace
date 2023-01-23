// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT1155 is ERC1155, Ownable {
    constructor() ERC1155("ETH1155") {}
    uint private tokenId = 0;
    function mint(address account,uint256 amount)
        public
    {
        tokenId++;
        _mint(account, tokenId, amount, "");
    }

}
