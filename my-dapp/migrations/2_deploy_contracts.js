const MedicineSupplyChain = artifacts.require("MedicineSupplyChain");

module.exports = function(deployer) {
  deployer.deploy(MedicineSupplyChain, { gas: 6000000 });
};
