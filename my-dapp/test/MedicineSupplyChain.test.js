const MedicineSupplyChain = artifacts.require("MedicineSupplyChain");

contract("MedicineSupplyChain", (accounts) => {
  it("should deploy the contract successfully", async () => {
    const instance = await MedicineSupplyChain.deployed();
    assert(instance.address !== "", "Contract deployment failed");
  });
});
