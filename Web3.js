const accounts = await web3.eth.getAccounts();
const instance = await MedicineSupplyChain.deployed();

// Create Medicine
await instance.createMedicine("Paracetamol", { from: accounts[0] });

// Supply Medicine
await instance.supplyMedicine(1, accounts[1], { from: accounts[0] });

// Distribute Medicine
await instance.distributeMedicine(1, accounts[2], { from: accounts[1] });

// Sell Medicine
await instance.sellMedicine(1, accounts[3], { from: accounts[2] });
