import {combineReducers } from 'redux';//Uses combineReducers to connect Root.
import { balancesLoading } from './actions';
//Whenever data is loaded reducers will update state
function web3(state = {}, action) {
    switch (action.type) {
        case 'WEB3_LOADED':
            return {...state, connection: action.connection }// Takes old state and extends it
        case 'WEB3_ACCOUNT_LOADED'://Event trigged
            return {...state, account: action.account }//State updated
        case 'ETHER_BALANCE_LOADED':
            return { ...state, balance: action.balance}
        default:
            return state
    }
}

function token(state = {}, action) {
    switch (action.type) {
        case 'TOKEN_LOADED':
            return { ...state, loaded: true, contract: action.contract } //loaded: - Checks if contract was loaded. In future it can be updated to be dynamic
        case 'TOKEN_BALANCE_LOADED':
            return { ...state, balance: action.balance}
        
        default:
            return state
    }
}

function exchange(state = {}, action) {
    let index, data

    switch (action.type) {
        case 'EXCHANGE_LOADED':
            return { ...state, loaded: true, contract: action.contract }
        case 'CANCELLED_ORDERS_LOADED':
            return { ...state, cancelledOrders: { loaded: true, data: action.cancelledOrders }}
        case 'FILLED_ORDERS_LOADED':
            return { ...state, filledOrders: { loaded: true, data: action.filledOrders } }
        case 'ALL_ORDERS_LOADED':
            return { ...state, allOrders: { loaded: true, data: action.allOrders } }

        case 'ORDER_CANCELLING'://Updates true if order is progress of cancelling
            return { ...state, orderCancelling: true }
    //
        case 'ORDER_CANCELLED':
            return {
                ...state,
                orderCancelling: false,//updates state above^ order is no longer cancelling
                cancelledOrders: {
                    ...state.cancelledOrders,
                    data: [
                        ...state.cancelledOrders.data,
                        action.order
                    ]
            }
         }

         case 'ORDER_FILLED'://Import
         // Prevent duplicate orders
         index = state.filledOrders.data.findIndex(order => order.id === action.order.id);
   
         if(index === -1) {
           data = [...state.filledOrders.data, action.order]
         } else {
           data = state.filledOrders.data
         }
   
         return {
           ...state,
           orderFilling: false,
           filledOrders: {
             ...state.filledOrders,
             data
           }
         }
   
       case 'ORDER_FILLING':
         return { ...state, orderFilling: true }

         case 'EXCHANGE_ETHER_BALANCE_LOADED':
             return {...state, etherBalance: action.balance}

        case 'EXCHANGE_TOKEN_BALANCE_LOADED':
            return { ...state, tokenBalance: action.balance}
        
        case 'BALANCES_LOADING':
            return { ...state, balancesLoading: true}
        case 'BALANCES_LOADED':
            return { ...state, balancesLoading: false}
        case 'ETHER_DEPOSIT_AMOUNT_CHANGED':
            return { ...state, etherDepositAmount: action.amount}
        case 'ETHER_WITHDRAW_AMOUNT_CHANGED':
            return { ...state, etherWithdrawAmount: action.amount}
        case 'TOKEN_DEPOSIT_AMOUNT_CHANGED':
            return { ...state, tokenDepositAmount: action.amount }
        case 'TOKEN_WITHDRAW_AMOUNT_CHANGED':
            return { ...state, tokenWithdrawAmount: action.amount}
        case 'BUY_ORDER_AMOUNT_CHANGED':
            return { ...state, buyOrder: { ...state.buyOrder, amount: action.amount } }
        case 'BUY_ORDER_PRICE_CHANGED':
            return { ...state, buyOrder: { ...state.buyOrder, price: action.price } }
        case 'BUY_ORDER_MAKING':
            return { ...state, buyOrder: { ...state.buyOrder, amount: null, price: null, making: true } }

         case 'ORDER_MADE':
         //Prevent dupicated orders
         index = state.allOrders.data.findIndex(order => order.id === action.order.id);//Checks if all orders contains order attempting to be created

         if(index === -1) {
             data = [...state.allOrders.data, action.order] 
         } else {
             data = state.allOrders.data
         }

         return {
             ...state,
             allOders: {
                 ...state.allOrders,
                 data
             },
             buyOrder: {
                 ...state.allOrders,
                 data
             },
             sellOrder: {
                 ...state.sellOrder,
                 making: false
             }
         }

        case 'SELL_ORDER_AMOUNT_CHANGED':
            return { ...state, sellOrder: { ...state.sellOrder, amount: action.amount } }
        case 'SELL_ORDER_PRICE_CHANGED':
            return { ...state, sellOrder: { ...state.sellOrder, price: action.price } }
        case 'SELL_ORDER_MAKING':
            return { ...state, sellOrder: { ...state.sellOrder, amount: null, price: null, making: true } }
         


        default:
            return state
    }
}


const rootReducer = combineReducers({
    web3,//same as saying web3: web3
    token,
    exchange
})

export default rootReducer