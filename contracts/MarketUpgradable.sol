// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract marketUpgrade is Initializable, ReentrancyGuard{   
    struct Listing{
        address nftAddress;
        address seller;
        uint256 tokenId;
        uint256 price;
        uint256 quantity;
        uint256 nftType;
    }
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
   address payable private Owner;
   address NFT20;
   mapping(address => mapping(uint256 => Listing)) private s_listings;
   mapping(address => uint256) private s_proceeds;

   function init(address _NFT20) external initializer {
        Owner = payable(msg.sender);
        NFT20 = _NFT20;
    }

   modifier notListed(address nftAddress,uint256 tokenId,address owner) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert("This is already listed");
        }
        _;
    }
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert("Not listed");
        }
        _;
    }
 // List item in market
    function listItem(address nftAddress,uint256 tokenId,uint256 price, uint256 quantity,uint256 nftType) external
    notListed(nftAddress, tokenId, msg.sender) 
    {  
        //for NFT721
        if(nftType==1){
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId)==msg.sender, "You are not owner of token");
       
        if (nft.getApproved(tokenId) != address(this)) {
            revert("Not approve for market place");
        }
        s_listings[nftAddress][tokenId] = Listing(nftAddress,msg.sender,tokenId, price, quantity, nftType);
        emit ItemListed(msg.sender, nftAddress, tokenId, price); 
        }
        //for NFT1155
        if(nftType==2){
            s_listings[nftAddress][tokenId] = Listing(nftAddress,msg.sender,tokenId, price, quantity, nftType);
            emit ItemListed(msg.sender, nftAddress, tokenId, price); 
        }       
    }
    function buyItem(address nftAddress, uint256 tokenId, uint256 _amount)
        external
        payable
        isListed(nftAddress, tokenId)
        nonReentrant
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert("Insufficient balance");
        }
        require(listedItem.quantity >= _amount, "Required quantity not available");
        
        s_proceeds[listedItem.seller] += (listedItem.price);

        if(listedItem.nftType == 1) {
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
    }
         else if(listedItem.nftType == 2) {
        ERC1155(nftAddress).safeTransferFrom(listedItem.seller ,msg.sender, tokenId,_amount,"");
    }

    
    console.log("Details before sell",listedItem.quantity);
    // Remove listing and take fees
    delete (s_listings[nftAddress][tokenId]);
    Owner.transfer((listedItem.price * 55)/10000);

    //Debugging
    Listing memory listedItem_ = s_listings[nftAddress][tokenId];
    console.log("Details after sell", listedItem_.quantity);



    }
    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
     function MarketBalance() external view returns(uint){
        return Owner.balance;
    }
     function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }
}