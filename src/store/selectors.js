/** RESELECT
 * Is a library for building memoized selectors. We define selectors as the function that 
 * retrieve snippets of the Redux state for our React components. Using memoization, 
 * we can prevent unnecessary rerenders and recalculations of derfived data which in 
 * turn will speed up our applicatiion. https://www.google.com/search?q=how+to+use+redux+reselctor&rlz=1C5CHFA_enUS923US923&oq=how+to+use+redux+reselctor&aqs=chrome..69i57j33i10i160l2.7989j0j7&sourceid=chrome&ie=UTF-8
 * https://github.com/reduxjs/reselect
 */
//Lodash is used to prevent app from failing if data does not exist. Example: no wallet provider in accountSelector will return undefined 
// _get Gets the value at path of object. If the resolved value is undefined, the defaultValue is returned in its place. https://lodash.com/docs/4.17.15#get
//Reject. Used to rejects items that match our critea. In our exmple all cancelled and filled orders that returns open orders. https://lodash.com/docs/4.17.15#reject
//_groupBy https://lodash.com/docs/4.17.15#groupBy
//_maxBy
//_minBy https://lodash.com/docs/4.17.15#minBy
import { get, groupBy, reject, maxBy, minBy } from 'lodash'// 
import { createSelector } from 'reselect'
import moment from 'moment'
import { ETHER_ADDRESS, GREEN, RED, tokens, ether} from '../helpers'
// TODO: Move me to helpers file
export const formatBalance = (balance) => {
  const precision = 100 // 2 decimal places

  balance = ether(balance)
  balance = Math.round(balance * precision) / precision // Use 2 decimal places

  return balance
}

const account = state => get(state, 'web3.account')//Fetches the web3.account from state. State is passed through in navbar.js
export const accountSelector = createSelector(account, a => a)//accountSelector that returns currenct account a => a ananymouse function that returns Account

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const token = state => get(state, 'token.contract')
export const tokenSelector = createSelector(token, t => t)

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

export const contractsLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl, el) => (tl && el)
)

//All orders 
//Pass the state and returns value 
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)//Orders Loaded should equal true if not, return false
const allOrders = state => get(state, 'exchange.allOrders.data', [])//Load orders from state. If not, return empty array

//Cancelled orders
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)


//Filled Orders
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
  filledOrders,
  (orders) => {
    // Sort orders by date ascending for price comparison
    orders = orders.sort((a,b) => a.timestamp - b.timestamp)
    // Decorate the orders
    orders = decorateFilledOrders(orders)
    // Sort orders by date descending for display
    orders = orders.sort((a,b) => b.timestamp - a.timestamp)
    return orders
  }
)

//Decorated will add attributes to the order
//https://dappuniversity.teachable.com/courses/549171/lectures/10011992
const decorateFilledOrders = (orders) => {
    // Track previous order to compare history
    let previousOrder = orders[0]
    return(
      orders.map((order) => {
        order = decorateOrder(order)
        order = decorateFilledOrder(order, previousOrder)
        previousOrder = order // Update the previous order once it's decorated
        return order
      })
    )
  }

const decorateOrder = (order) => {
    let etherAmount
    let tokenAmount
  
    if(order.tokenGive == ETHER_ADDRESS) {//
      etherAmount = order.amountGive
      tokenAmount = order.amountGet
    } else {
      etherAmount = order.amountGet
      tokenAmount = order.amountGive
    }
  
    // Calculate token price to 5 decimal places
    const precision = 100000
    let tokenPrice = (etherAmount / tokenAmount)
    tokenPrice = Math.round(tokenPrice * precision) / precision
  
    return({
      ...order,
      etherAmount: ether(etherAmount),
      tokenAmount: tokens(tokenAmount),
      tokenPrice,
      formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
    })
  }
  
  const decorateFilledOrder = (order, previousOrder) => {
    return({
      ...order,
      tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
  }
  
  const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    // Show green price if only one order exists
    if(previousOrder.id === orderId) {
      return GREEN
    }
  
    // Show green price if order price higher than previous order
    // Show red price if order price lower than previous order
    if(previousOrder.tokenPrice <= tokenPrice) {
      return GREEN // success
    } else {
      return RED // danger
    }
  }



//Selector
//Loads All, Filled, and Cancelled orders
//Rejects Cancelled and Filled from All 
//Returns Open Orders
const openOrders = state => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)


  const openOrders = reject(all, (order) => {//_reject from loadash
    const orderFilled = filled.some((o) => o.id === order.id)//
    const orderCancelled = cancelled.some((o) => o.id === order.id)
    return(orderFilled || orderCancelled)//
  })

  return openOrders
}

//OrderBookLoaded
const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)//Should return true if all these have been loaded
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)


//Create selector for OpenOrders
//Formats Orders for frontend
//Add attributes and groups
//Returns orders
export const orderBookSelector = createSelector( //Returns {buyOrders: [data], sellOrders: [data ]}
  openOrders,
  (orders) => {
    // Decorate orders. Easily read by frontend 
    orders = decorateOrderBookOrders(orders)
    // Group orders by "orderType"
    orders = groupBy(orders, 'orderType')
    // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])
    // Sort buy orders by token price
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    // Fetch sell orders
    const sellOrders = get(orders, 'sell', [])
    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    return orders
  }
)

const decorateOrderBookOrders = (orders) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateOrderBookOrder(order)
      return(order)
    })
  )
}

const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
  })
}

//MyTransactions video https://dappuniversity.teachable.com/courses/549171/lectures/10011991

//Where filledOrdersLoaded, true. Meaning our orders where loaded. will filter later
export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

//Filter my orders from filledOrders
export const myFilledOrdersSelector = createSelector(
  account,//Account selector
  filledOrders,//
  (account, orders) => {
    // Find our orders
    orders = orders.filter((o) => o.user === account || o.userFill === account)//filter through filledOrders and check if our Account is the user for order
    // Sort by date ascending
    orders = orders.sort((a,b) => a.timestamp - b.timestamp)//take filters orders and orginize
    // Decorate orders - add display attributes
    orders = decorateMyFilledOrders(orders, account)
    return orders
  }
)

const decorateMyFilledOrders = (orders, account) => {//Functions used by myFilledOrdersSelector
  return(
    orders.map((order) => {//iterate through orders
      order = decorateOrder(order)//format and add attributes to order. { order.tokenGive converts to ether}
      order = decorateMyFilledOrder(order, account)
      return(order)
    })
  )
}

const decorateMyFilledOrder = (order, account) => {
  const myOrder = order.user === account//Checks if our order first

  let orderType
  if(myOrder) {
    orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'//Sets order type based if it was a buy or sell order
  } else {
    orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'//
  }

  return({
    ...order,
    orderType,//Assigns 'buy' or 'sell' to order
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),//Adds attribute for Frontend. this will change the font color
    orderSign: (orderType === 'buy' ? '+' : '-')//If order is buy add "+" as orderSign attribute. Else "-"
  })
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)

export const myOpenOrdersSelector = createSelector(
  account,
  openOrders,
  (account, orders) => {
    // Filter orders created by current account
    orders = orders.filter((o) => o.user === account)
    // Decorate orders - add display attributes
    orders = decorateMyOpenOrders(orders)
    // Sort orders by date descending
    orders = orders.sort((a,b) => b.timestamp - a.timestamp)
    return orders
  }
)

const decorateMyOpenOrders = (orders, account) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateMyOpenOrder(order, account)
      return(order)
    })
  )
}

const decorateMyOpenOrder = (order, account) => {
  let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED)
  })
}

//
export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

//
export const priceChartSelector = createSelector(
  filledOrders,
  (orders) => {
    // Sort orders by date ascending to compare history
    orders = orders.sort((a,b) => a.timestamp - b.timestamp)
    // Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o))
    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length) //Takes the last two items out of array
    // get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0)//return zero if this does not work
    // get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return({
      lastPrice,//Used by frontend 
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),//compares variables and assigns attribute based on result
      series: [{
        data: buildGraphData(orders)//Used by ApexGraph to build graph
      }]
    })
  }
)

const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())//moment documentation for more on this
  // Get each hour where data exists
  const hours = Object.keys(orders)


  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all the orders from current hour
    const group = orders[hour]
    // Calculate price values - open, high, low, close
    const open = group[0] // first order
    const high = maxBy(group, 'tokenPrice') // high price
    const low = minBy(group, 'tokenPrice') // low price
    const close = group[group.length - 1] // last order

    return({
      x: new Date(hour),//Graph Data
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]//Graph data
    })
  })

  return graphData
}

//Order Cancelling selector used by Spinner
const orderCancelling = state => get(state, 'exchange.orderCancelling', false)
export const orderCancellingSelector = createSelector(orderCancelling, status => status)
//Order is in process of filling. Used by Spinner
const orderFilling = state => get(state, 'exchange.orderFilling', false)
export const orderFillingSelector = createSelector(orderFilling, status => status)


//Balance Selectors for Balance.js
const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, status => status)

const etherBalance = state => get(state, 'web3.balance', false)
export const etherBalanceSelector = createSelector(
  etherBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const tokenBalance = state => get(state, 'token.balance', 0)
export const tokenBalanceSelector = createSelector(
  tokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const exchangeEtherBalance = state => get(state, 'exchange.etherBalance', 0)
export const exchangeEtherBalanceSelector = createSelector(
  exchangeEtherBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
export const exchangeTokenBalanceSelector = createSelector(
  exchangeTokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const etherDepositAmount = state => get(state, 'exchange.etherDepositAmount', null)
export const etherDepositAmountSelector = createSelector(etherDepositAmount, amount => amount)

const etherWithdrawAmount = state => get(state, 'exchange.etherWithdrawAmount', null)
export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount, amount => amount)

const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null)
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, amount => amount)

const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null)
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, amount => amount)

//https://dappuniversity.teachable.com/courses/549171/lectures/10011988
//Explenation at 21.

const buyOrder = state => get(state, 'exchange.buyOrder', {})
export const buyOrderSelector = createSelector(buyOrder, order => order)

const sellOrder = state => get(state, 'exchange.sellOrder', {})
export const sellOrderSelector = createSelector(sellOrder, order => order)