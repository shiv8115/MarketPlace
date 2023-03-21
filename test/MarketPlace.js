const { ethers } = require("hardhat");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
describe("MarketPlace Contract Deploy and List Function", function () {

    let Market;
    let Erc721;
    let Erc1155;
    let Erc20;
    let ListedNFTInfo;
    let Buyer;
    let Seller;
    let Price;
    let Owner;
    let nftSeller;
    const TOKEN_ID=1;
    
//deploys an ERC20 token contract called "MyToken" and returns it.
    async function deployERC20() {
        const ERC20 = await ethers.getContractFactory("MyToken");
        const Erc20 = await ERC20.deploy();
        await Erc20.deployed();
        return Erc20;
    }
// deploys an ERC721 token contract called "NFT" and returns it. 
    async function deployERC721() {
        const [NFTSeller]= await ethers.getSigners();
        nftSeller= NFTSeller;
        const ERC721 = await ethers.getContractFactory("NFT");
        const Erc721 = await ERC721.deploy();
        await Erc721.deployed();
        return Erc721;
    }   
//
    async function deployERC1155() {
        const ERC1155 = await ethers.getContractFactory("NFT1155");
        const Erc1155 = await ERC1155.deploy();
        await Erc1155.deployed();
        return Erc1155;
    }
//deploys the MarketPlace contract, sets the ERC20 token contract address
    async function deployMarket() {
        const [owner, buyer, seller] = await ethers.getSigners();
        Buyer = buyer;
        Seller= seller;
        Erc20 = await loadFixture(deployERC20);
        Erc721 = await loadFixture(deployERC721);
        Erc1155 = await loadFixture(deployERC1155);
        const MarketPlace = await ethers.getContractFactory("market");
        Market = await MarketPlace.deploy(Erc20.address);
        Owner= owner;
    }
    it("Deploying market place", async function () {
        await loadFixture(deployMarket);
    })

    it("should be reverted Invalid tokenID", async function () {
        await expect(Market.listItem(Erc721.address, TOKEN_ID, 50, 1, 1)).to.be.revertedWith("ERC721: invalid token ID");
    })


    it("should be reverted if market not approve", async function () {
        await Erc721.Safemint();
        await expect(Market.listItem(Erc721.address, TOKEN_ID, 50, 1, 1)).to.be.revertedWith("Not approve for market place");
    })

    it("Market approved by NFT",async function(){
       // await Erc721.Safemint();
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

    it("Should emit ItemListed event", async function(){
        await Erc721.Safemint();
        await Erc721.approve(Market.address, 2);
        await expect(Market.listItem(Erc721.address,2, 50, 1, 1))
        .to.emit(Market, "ItemListed")
        .withArgs(Owner.address, Erc721.address,2,50);
    })


    it("Items should reverted if already listed", async function(){
        await Erc721.approve(Market.address, TOKEN_ID);
        const owner= loadFixture()
        await expect(Market.listItem(Erc721.address, TOKEN_ID, 50, 1, 1)).to.be.revertedWith("This is already listed");
    })

    it("Should emit ItemListed event for ERC1155", async function(){
        Erc1155.mint(Owner.address,3);
        await expect(Market.listItem(Erc1155.address,1, 50, 3, 2))
        .to.emit(Market, "ItemListed")
        .withArgs(Owner.address, Erc1155.address,1,50);
    })

    it("Should able to get list of items", async function(){
        const listing = await Market.getListing(Erc721.address, TOKEN_ID);
        expect(listing.nftAddress).to.equal(Erc721.address);
        expect(listing.seller).to.equal(nftSeller.address);
        expect(listing.price).to.equal(50);
        expect(listing.quantity).to.equal(1);

    })
    
})
