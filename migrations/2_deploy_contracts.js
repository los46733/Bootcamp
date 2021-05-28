const { default: Web3 } = require("web3");

const Token = artifacts.require("Token");//Loads the smart contract for deployer
const Exchange = artifacts.require("Exchange");

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts();//Uses web3 to load accounts from ganache into an Array

  await deployer.deploy(Token);//Deploys Token Contract

  const feeAccount = accounts[0];
  const feePercent = 10;
  await deployer.deploy(Exchange, feeAccount, feePercent);//Deploys Exchange contract with constructor arguments 
};

//In the console: Use 'truffle migrate --reset' to deploye a new version of the contract if one has already been migrated 