const Web3 = require('web3').default;
const web3 = new Web3("http://127.0.0.1:7545");


web3.eth.getChainId()
  .then(chainId => console.log("Connected to chain ID:", chainId))
  .catch(err => console.error("Error:", err));
