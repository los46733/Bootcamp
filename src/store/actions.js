/**ACTIONS  
 * Actions are similar to events in that they let us know somthing happened 
 * https://redux.js.org/introduction/core-concepts
 * Example: Web3 Loaded
 */

//Web3
export function web3Loaded(connection) { //Returns variable loaded from interactions.js. Loads Metamask Connection
    return {
        type: 'WEB3_LOADED',
        connection// same as saying connection: connection
    }
}

export function web3AccountLoaded(account) {//Loads Metamask account. Variable comes from interactions.js
    return {
        type: 'WEB3_ACCOUNT_LOADED',
        account
    }
}

//TOKEN
export function tokenLoaded(contract) {//Loads Token
    return {
        type: 'TOKEN_LOADED',
        contract
    }
}

//Exchange
export function exchangeLoaded(contract) {
    return {
        type: 'EXCHANGE_LOADED',
        contract
    }
}

//Cancelled Orders
export function cancelledOrdersLoaded(cancelledOrders) {
    return {
        type: 'CANCELLED_ORDERS_LOADED',
        cancelledOrders
    }
}

//Filled Orders
export function filledOrdersLoaded(filledOrders) {
    return {
      type: 'FILLED_ORDERS_LOADED',
      filledOrders
    }
  }
  

  //All Orders
  export function allOrdersLoaded(allOrders) {
    return {
      type: 'ALL_ORDERS_LOADED',
      allOrders
    }
  }


// Cancel Order

//Order Cancelling in progress - Used by Spinner
export function orderCancelling() {
  return {
    type: 'ORDER_CANCELLING'
  }
}

//Pass in order data pulled from event
export function orderCancelled(order) {
  return {
    type: 'ORDER_CANCELLED',
    order
  }
}

// Fill Order
//Updates orderFilling to true when in progress
export function orderFilling() {
  return {
    type: 'ORDER_FILLING'
  }
}

//Updates state openOrder, filledOrders at reducer.js
export function orderFilled(order) {
  return {
    type: 'ORDER_FILLED',
    order
  }
}

//Balances 
export function etherBalanceLoaded(balance) {
  return {
    type: 'ETHER_BALANCE_LOADED',
    balance
  }
}

export function tokenBalanceLoaded(balance) {
  return {
    type: 'TOKEN_BALANCE_LOADED',
    balance
  }
}

export function exchangeEtherBalanceLoaded(balance) {
  return {
    type: 'EXCHANGE_ETHER_BALANCE_LOADED',
    balance
  }
}

export function exchangeTokenBalanceLoaded(balance) {
  return {
    type: 'EXCHANGE_TOKEN_BALANCE_LOADED',
    balance
  }
}

export function balancesLoaded() {
  return {
    type: 'BALANCES_LOADED'
  }
}

export function balancesLoading() {
  return {
    type: 'BALANCES_LOADING'
  }
}

export function etherDepositAmountChanged(amount) {
  return {
    type: 'ETHER_DEPOSIT_AMOUNT_CHANGED',
    amount
  }
}

export function etherWithdrawAmountChanged(amount) {
  return {
    type: 'ETHER_WITHDRAW_AMOUNT_CHANGED',
    amount
  }
}

export function tokenDepositAmountChanged(amount) {
  return {
    type: 'TOKEN_DEPOSIT_AMOUNT_CHANGED',
    amount
  }
}

export function tokenWithdrawAmountChanged(amount) {
  return {
    type: 'TOKEN_WITHDRAW_AMOUNT_CHANGED',
    amount
  }
}

// Buy Order
export function buyOrderAmountChanged(amount) {
  return {
    type: 'BUY_ORDER_AMOUNT_CHANGED',
    amount
  }
}

export function buyOrderPriceChanged(price) {
  return {
    type: 'BUY_ORDER_PRICE_CHANGED',
    price
  }
}

export function buyOrderMaking(price) {
  return {
    type: 'BUY_ORDER_MAKING'
  }
}

// Generic Order - Used by both the Buy/Sell functionality 
export function orderMade(order) {
  return {
    type: 'ORDER_MADE',
    order
  }
}

// Sell Order
export function sellOrderAmountChanged(amount) {
  return {
    type: 'SELL_ORDER_AMOUNT_CHANGED',
    amount
  }
}

export function sellOrderPriceChanged(price) {
  return {
    type: 'SELL_ORDER_PRICE_CHANGED',
    price
  }
}

export function sellOrderMaking(price) {
  return {
    type: 'SELL_ORDER_MAKING'
  }
}
