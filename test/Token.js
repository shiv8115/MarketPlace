const {expect}= require("chai");
describe("Token Contract" , function(){
    it("Deployment should assign the total supply of tokens to the owner", async function () {
        const [owner] = await ethers.getSigners();
    
        const Token = await ethers.getContractFactory("Token");
    
        const hardhatToken = await Token.deploy();
    
        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
      });

      it("Should transfer the fund", async function () {
        const [owner,address1, address2] = await ethers.getSigners();
    
        const Token = await ethers.getContractFactory("Token");// create instance
    
        const hardhatToken = await Token.deploy();// Token deploy
       // Transfer 10 token from owner to address1
       await hardhatToken.transfer(address1.address, 10);
       expect(await hardhatToken.balanceOf(address1.address)).to.equal(10);

       // transfer 5 tokens from address1 to address2
       await hardhatToken.connect(address1).transfer(address2.address,5);
       expect(await hardhatToken.balanceOf(address2.address)).to.equal(5);
      });
    
});
