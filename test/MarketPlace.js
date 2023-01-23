const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
describe("MarketPlace Contract Deploy and List Function", function () {

    let Market;
    let Erc721;
    let Erc20;
    let ListedNFTInfo;
    let Buyer;
    let Seller;
    let Price;
    let nftSeller;
    const TOKEN_ID=1;

    async function deployERC20() {
        const ERC20 = await ethers.getContractFactory("MyToken");
        const Erc20 = await ERC20.deploy();
        await Erc20.deployed();
        return Erc20;
    }

    async function deployERC721() {
        const [NFTSeller]= await ethers.getSigners();
        nftSeller= NFTSeller;
        const ERC721 = await ethers.getContractFactory("NFT");
        const Erc721 = await ERC721.deploy();
        await Erc721.deployed();
        return Erc721;
    }
    
    async function deployERC1155() {
        const ERC1155 = await ethers.getContractFactory("NFT1155");
        const Erc1155 = await ERC1155.deploy();
        await Erc1155.deployed();
        return Erc1155;
    }

    async function deployMarket() {
        const [owner, buyer, seller] = await ethers.getSigners();
        Buyer = buyer;
        Seller= seller;
        Erc20 = await loadFixture(deployERC20);
        Erc721 = await loadFixture(deployERC721);
        const MarketPlace = await ethers.getContractFactory("market");
        Market = await MarketPlace.deploy(Erc20.address);
    }

    it("Deploying market place", async function () {
        await loadFixture(deployMarket);
    })

    it("Market approved by NFT",async function(){
        await Erc721.Safemint();
        expect(await Erc721.name()).to.equal("NFT721");
        expect(await Erc721.symbol()).to.equal("NFT");
        await Erc20.approve(Market.address, 1000);
        await Erc721.approve(Market.address, 1);
        expect(await Erc721.getApproved(1)).to.equal(Market.address);
    })

    it("Listing Items", async function () {
        
        await Erc721.approve(Market.address, TOKEN_ID);
      
        await Market.listItem(Erc721.address, TOKEN_ID, 50, 1, 1);
      
        // Use the getListing function to retrieve the listing from the marketplace
        const listing = await Market.getListing(Erc721.address, TOKEN_ID);
      
        // Assert that the listing was created correctly
        expect(listing.nftAddress).to.equal(Erc721.address);
        expect(listing.seller).to.equal(nftSeller.address);
        expect(listing.price).to.equal(50);
        expect(listing.quantity).to.equal(1);
    })
})
