const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Marketplace Buy Function", function () {
  let Market;
  let Erc721;
  let Erc20;
  let Buyer;
  let Seller;
  let Owner;
  const TOKEN_ID = 1;

  async function deployERC20() {
    const ERC20 = await ethers.getContractFactory("MyToken");
    const Erc20 = await ERC20.deploy();
    await Erc20.deployed();
    return Erc20;
  }

  async function deployERC721() {
    const ERC721 = await ethers.getContractFactory("NFT");
    const Erc721 = await ERC721.deploy();
    await Erc721.deployed();
    return Erc721;
  }

  async function deployMarket() {
    const [owner, buyer, seller] = await ethers.getSigners();
    Buyer = buyer;
    Seller = seller;
    Erc20 = await loadFixture(deployERC20);
    Erc721 = await loadFixture(deployERC721);
    const MarketPlace = await ethers.getContractFactory("market");
    Market = await MarketPlace.deploy(Erc20.address);
    Owner= owner;
  }

  before(async function () {
    await loadFixture(deployMarket);
  });

  it("Buy item", async function () {
    // List item for sale
    await Erc721.Safemint();
    await Erc721.approve(Market.address, TOKEN_ID);
    await Market.listItem(Erc721.address, TOKEN_ID, 50, 1, 1);

    // Buy item
    const listing = await Market.getListing(Erc721.address, TOKEN_ID);
    const price = listing.price.toString();
    const tx = await Market.buyItem(Erc721.address, TOKEN_ID,1,{ value: price })
    await tx.wait(1)
    console.log("NFT Bought!")
    expect(await Erc721.ownerOf(TOKEN_ID)).to.equal(Owner.address);

    // Check that listing was removed
    const listing_ = await Market.getListing(Erc721.address, TOKEN_ID);
    expect(listing_.quantity).to.equal(0);
    expect(listing_.price).to.equal(0);
  });
});
