require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("@nomicfoundation/hardhat-chai-matchers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  namedAccounts: {
    deployer1: 0,
    deployer2: 1,
    deployer3: 2,
    deployer4: 3
  }
};