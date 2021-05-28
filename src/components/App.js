import React, { Component } from 'react';
import './App.css'
import Navbar from './Navbar'
import Web3 from 'web3';
import Token from '../abis/Token.json'
import { connect } from 'react-redux'
import {
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'
import { accountSelector, contractsLoadedSelector } from '../store/selectors'
import Content from './Content';
// import React, { Component }  from 'react';
//Notes:
/** When you restart Ganache you have to reset wallet cache on MetaMask 
 * 
 */


class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)//passes in Dispatch as argument for Redux
    console.log('Mounted')
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)// Calls interactions.js. Redux store updated and web3 returned
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)
    const token = await loadToken(web3, networkId, dispatch)
    if(!token) {//Alerts user if token contract could not be found
      window.alert('Token smart contract not detected on the current network. Please select another network with Metemask.')
      return
    }
    const exchange = await loadExchange(web3, networkId, dispatch)
    if(!exchange) {
      window.alert('Exchange smart contract not detected on the current network. Please select another network with Metemask.')
      return
    }
    
  
  }

  render() {
    // console.log(this.state.account)
    return (
      <div>
        <Navbar></Navbar>
        
        { this.props.contractsLoaded ? <Content/> : <div className='content'></div> }
      </div>
      // "?" used as a if statement.Checks if contractsLoaded = true ":" else statement https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
    );
  }
}

function mapStateToProps(state) {//Passes in props to app. Example: dispatcher
  return {
    contractsLoaded: contractsLoadedSelector(state)
    // account: 'Account goes here'
    // account: accountSelector(state)
    // TODO: Fill me in...
  }
}

//attaches state to component
export default connect(mapStateToProps)(App); //Connects app to redux