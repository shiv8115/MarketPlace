const hre = require("hardhat");

module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer1,deployer2,deployer3,deployer4} = await getNamedAccounts();
  
  //Deploy erc20.sol using deployer1
  const mytoken = await deploy('MyToken', {from: deployer1});

   //Deploy erc721.sol using deployer2
  const nft = await deploy('NFT', {from: deployer2});

  //Deploy nft1155.sol using deployer3
  const nft1155 = await deploy('NFT1155', {from: deployer3});
 
  // Deploy the marketUpgrade contract as an upgradable contract
  const market_Upgrade = await deploy('marketUpgrade', {
    from: deployer4,
    proxy: {
    owner: deployer4,
    proxyContract: 'OpenZeppelinTransparentProxy',
    execute: {
    methodName: 'init',
    args: [mytoken.address],
    },
    upgradeIndex: 0,
    }
  });
  // Log the implementation, admin, and proxy addresses of the deployed contract
  console.log(
    "implementation address",
    await upgrades.erc1967.getImplementationAddress(market_Upgrade.address)
  );
  console.log(
    "Admin address",
    await upgrades.erc1967.getAdminAddress(market_Upgrade.address)
  );
  console.log(
    "Proxy address",
    market_Upgrade.address
  );
};
module.exports.tags = ['marketUpgrade'];
