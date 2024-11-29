const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {expect} = require("chai");

// Describe cannot have an async callback function
// Describe is a Mocha function that allows you to organise your tests
// Organising tests makes debugging them easier
describe("Token contract 3", ()=> {
    async function deployTokenFixture(){
        const [owner, addr1, addr2] = await ethers.getSigners();
        const hardhatToken = await ethers.deployContract("Token");
        await hardhatToken.waitForDeployment();
        return { hardhatToken, owner, addr1, addr2 };
    }

describe("Deployment", ()=> {
    //"it" is another Mocha function. This allows you to define each test
    // It receives a test name and a callback function
    //If the "it" callback function is async, Mocha will 'await' it
    it("should be a valid address", async ()=>{
        // use load fixture to setup your environment
        const { owner } = await loadFixture(deployTokenFixture);

        //assertion
        //expect receives a value and wraps it in an assertion object
        // these objects have a lot of utility methods to assert values
        // can output value to console
        console.log(owner.address)
        expect(owner.address).to.properAddress;
    })

    it("should be the right owner", async ()=>{

        const {hardhatToken, owner } = await loadFixture(deployTokenFixture);
        //expects the owner variable to store the same value as the our Signer's owner
        // hardhatToken.owner() is different from data returned by loadfixture 
        expect(await hardhatToken.owner()).to.equal(owner.address);
    })

    it("owner should have totalSupply", async()=>{
        
        const {hardhatToken, owner } = await loadFixture(deployTokenFixture);
        const ownerBalance = await hardhatToken.balanceOf(owner.address);
        expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    })
})

describe("Transactions", ()=>{
    it("transfer from owner to addr1", async ()=>{

        const {hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);
        const amount = 500;
        expect( await hardhatToken.transfer(addr1.address, amount)).to.changeTokenBalance(hardhatToken, addr1, amount);
    })

    it("transfer from addr1 to addr2", async()=>{

        const {hardhatToken, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        const amount = 250;
        await expect(
            hardhatToken.connect(addr1).transfer(addr2.address, amount)
        ).to.be.revertedWith("Not enough tokens");
       //addr1 needs some tokens
        await hardhatToken.transfer(addr1.address, 2*amount);
        await expect(
            hardhatToken.connect(addr1).transfer(addr2.address, amount)
        ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-amount, amount]);
    });
});

describe("Events", ()=>{
    //in Tokens.sol an event is emitted after the transfer
    //let's test it
    it("transfer event emitted between owner and addr1", async()=>{
        const {hardhatToken, owner, addr1 } = await loadFixture(deployTokenFixture);
        const amount = 500;
        await expect( hardhatToken.transfer(addr1.address, amount))
            .to.emit(hardhatToken, 'Transfer')
            .withArgs(
                owner.address,
                addr1.address,
                amount
            )
    });
})
});
