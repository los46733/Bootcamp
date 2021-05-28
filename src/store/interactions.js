/**INTERACTIONS
 * File used to handle all of our blockchain interactions in App.ja
 * This file will load all of our data and submit to redux store
 * Calls "action". Action will tell reducer to update state with variables passed through
 * 'Dispatch' is a function that triggers action and adds to reducer that handles the interaction and updates the stae?
 */

import Web3 from 'web3'
import {web3} from 'web3'
import {
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled,
    etherBalanceLoaded,
    tokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    exchangeTokenBalanceLoaded,
    balancesLoaded,
    balancesLoading,
    buyOrderMaking,
    sellOrderMaking,
    orderMade

} from './actions'
import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'
import { ETHER_ADDRESS, } from '../helpers'//New

export const loadWeb3 = async (dispatch) => {
    if(typeof window.ethereum!=='undefined'){//Confirms Metamask or provider is installed
        //Loads current provider
        const web3 = new Web3(window.ethereum)
        dispatch(web3Loaded(web3))//Dispatchers creates action. Action calls reducer to udpate state in redux store
        return web3 //returns web3. Can be used by other function. Example: loadAccount
    }else {
        window.alert('Please install Metamask')
        window.location.assign('https://metemask.io/')
    }
}

export const loadAccount = async (web3, dispatch) => {
    const accounts = await web3.eth.getAccounts()// Loads accounts in Metamask
    const account = await accounts[0]//Selects current account
    if(typeof account !== 'undefined') {
        dispatch(web3AccountLoaded(account))//Dispatchs information using actions.js
        return account//Returns account variable
    } else {
        window.alert('Please login with MeteMask')
        return null//Returns null so our frontend knows to tell the user something is wrong 
    }
}

export const loadToken = async (web3, networkId, dispatch) => {
    try {// 'try' if function is succesfully excecuted return token. Else a.k.a catch error: returns null
        //Loads Token Contract on current network
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    } catch (error) {
        console.log('Contract not deployed to the current network. Please select another network with Metamask')
        return null
    }
}

export const loadExchange = async (web3, networkId, dispatch) => {
    try {
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    } catch (error) {
        console.log('Contract not deployed to the current network.Please select another network with Metamask.')
    }
}

//Trades Video https://dappuniversity.teachable.com/courses/549171/lectures/10011992
// .getPastEvents https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#getpastevents
export const loadAllOrders = async (exchange, dispatch) => {
    // Fetch canceled order with the "Cancel" event stream 
    const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest' })
    //Format cancelled orders 
    const cancelledOrders = cancelStream.map((event) => event.returnValues)
    //Add cancelled orders to the redux store 
    dispatch(cancelledOrdersLoaded(cancelledOrders))

    // Fetch filled orders with the "Trade" event stream
    const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest' })
    // Format filled orders
    const filledOrders = tradeStream.map((event) => event.returnValues)
    // Add cancelled orders to the redux store
    dispatch(filledOrdersLoaded(filledOrders))

    // Load order stream
    const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0,  toBlock: 'latest' })
    // Format order stream
    const allOrders = orderStream.map((event) => event.returnValues)
    // Add open orders to the redux store
    dispatch(allOrdersLoaded(allOrders))
}


//Used by MyTransactions.js
//.Methods.send is a web3 used to call smart contract functions https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#methods-mymethod-send
export const cancelOrder = (dispatch, exchange, order, account) => {
    exchange.methods.cancelOrder(order.id).send({ from: account })//Cancel order.Id from applications user aka account
    .on('transactionHash', (hash) => {//waits for transaction hash before telling redux something has been updated. event emitter in docshttps://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#methods-mymethod-send
       dispatch(orderCancelling())//upate redux store
    })
    .on('error', (error) => {//error catch 
      console.log(error)
      window.alert('There was an error!')
    })
}
  
  //Listens for events to happen. In example. if cancellations is succesful a Cancellation event will emitt. Update redux store when cancellation is complete
  //More on this is the web3 docs https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html#contract-events
export const subscribeToEvents = async (exchange, dispatch) => {
    //Listens for cancelled orders
    exchange.events.Cancel({}, (error, event) => {
      dispatch(orderCancelled(event.returnValues))
    })
    //Listens for Trade orders
    exchange.events.Trade({}, (error, event) => {
      dispatch(orderFilled(event.returnValues))
    })

    exchange.events.Deposit({}, (error, event) => {
        dispatch(balancesLoaded())
    })

    exchange.events.Withdraw({}, (error, event) => {
        dispatch(balancesLoaded())
    })

    exchange.events.Order({}, (error, event) => {
        dispatch(orderMade(event.returnValues))
    })

      
}

//used by OrderBook.js to fill order using metamask user account. 
//Updates redux store that a orderFill is in progress
export const fillOrder = (dispatch, exchange, order, account) => {
    exchange.methods.fillOrder(order.id).send({ from: account })//Calls fillOrder on smart contract
    .on('transactionHash', (hash) => {
       dispatch(orderFilling())//Tells redux store to update orderFilling to true
    })
    .on('error', (error) => {
      console.log(error)
      window.alert('There was an error!')
    })
  }

//Used by Balance.js 
//Loads all balances for both user and exchange 
export const loadBalances = async (dispatch, web3, exchange, token, account) => {
    if(typeof account !== 'undefined') {
        // Ether balance in wallet
        const etherBalance = await web3.eth.getBalance(account)
        dispatch(etherBalanceLoaded(etherBalance))
  
        // Token balance in wallet
        const tokenBalance = await token.methods.balanceOf(account).call()
        dispatch(tokenBalanceLoaded(tokenBalance))
  
        // Ether balance in exchange
        const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
        dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))
  
        // Token balance in exchange
        const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
        dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))
  
        // Trigger all balances loaded
        dispatch(balancesLoaded())
      } else {
        window.alert('Please login with MetaMask')
      }
}

export const depositEther = (dispatch, exchange, web3, amount, account) => {
  exchange.methods.depositEther().send({ from: account,  value: ether(amount) })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const withdrawEther = (dispatch, exchange, amount, account) => {
    amount = ether(amount)
    exchange.methods.withdrawEther(amount).send({ from: account })
    .on('transactionHash', (hash) => {
        console.log(hash)
      dispatch(balancesLoading())
    })
    .on('error',(error) => {
        console.log("there was an error")
      console.error(error)
      window.alert(`There was an error!`)
    })
  }

export const depositToken = (dispatch, exchange, token, amount, account) => {
    amount = ether(amount)
    console.log(amount)
  
    token.methods.approve(exchange.options.address, amount).send({ from: account })
    .on('transactionHash', (hash) => {
      exchange.methods.depositToken(token.options.address, amount).send({ from: account })
      .on('transactionHash', (hash) => {
        dispatch(balancesLoading())
      })
      .on('error',(error) => {
        console.error(error)
        window.alert(`There was an error!`)
      })
    })
  }

export const withdrawToken = (dispatch, exchange, token, amount, account) => {
    amount = ether(amount)
  exchange.methods.withdrawToken(token.options.address, amount).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const ether = (amount) => {
    amount = Web3.utils.toWei(amount, 'ether')
    console.log(amount)

    return amount
}

export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = token.options.address
  const amountGet = web3.utils.toWei(order.amount, 'ether')
  const tokenGive = ETHER_ADDRESS
  const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

  exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(buyOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = ETHER_ADDRESS
  const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
  const tokenGive = token.options.address
  const amountGive = web3.utils.toWei(order.amount, 'ether')

  exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(sellOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}