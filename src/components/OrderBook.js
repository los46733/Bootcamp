import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'//Used for hover https://react-bootstrap.github.io/components/overlays/
import Spinner from './Spinner'
import {
  orderBookSelector,
  orderBookLoadedSelector,
  exchangeSelector,
  accountSelector,
  orderFillingSelector
} from '../store/selectors'//import selectors
import { fillOrder } from '../store/interactions'//import

//refactor
const renderOrder = (order, props) => {
  const { dispatch, exchange, account } = props

  return(
    <OverlayTrigger// Overlay https://react-bootstrap.github.io/components/overlays/
      key={order.id}
      placement='auto'
      overlay={
        <Tooltip id={order.id}>
          {`Click here to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
      <tr
        key={order.id}
        className="order-book-order"
        onClick={(e) => fillOrder(dispatch, exchange, order, account)}//fills orders and updates reduxstore.
      >
        <td>{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
        <td>{order.etherAmount}</td>
      </tr>
    </OverlayTrigger>
  )
}

const showOrderBook = (props) => {
  const { orderBook } = props

  return(
    <tbody>
      {orderBook.sellOrders.map((order) => renderOrder(order, props))}
      <tr>
        <th>DAPP</th>
        <th>DAPP/ETH</th>
        <th>ETH</th>
      </tr>
      {orderBook.buyOrders.map((order) => renderOrder(order, props))}
    </tbody>
  )
}

class OrderBook extends Component {
  render() {
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body order-book">
            <table className="table table-dark table-sm small">
              { this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table' /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state)
  const orderFilling = orderFillingSelector(state)

  return {
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoaded && !orderFilling,//used by spinner
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(OrderBook);







// import React, { Component } from 'react'
// import { connect } from 'react-redux'
// import { OverlayTrigger, Tooltip } from 'react-bootstrap'//Used for hover https://react-bootstrap.github.io/components/overlays/
// import Spinner from './Spinner'
// import {
//   orderBookSelector,
//   orderBookLoadedSelector,
//   exchangeSelector,
//   accountSelector,
//   orderFillingSelector
// } from '../store/selectors'//import selectors
// import { fillOrder } from '../store/interactions'//import

// //Returns line item with order info
// const renderOrder = (order, props) => {
//   const { dispatch, exchange, account } = props

//   return(
//     <OverlayTrigger// Overlay https://react-bootstrap.github.io/components/overlays/
//       key={order.id}
//       placement='auto'
//       overlay={
//         <Tooltip id={order.id}>
//           {`Click here to ${order.orderFillAction}`}
//         </Tooltip>
//       }
//     >
//       <tr
//         key={order.id}
//         className="order-book-order"
//         onClick={(e) => fillOrder(dispatch, exchange, order, account)}//fills orders and updates reduxstore.
//       >
//         <td>{order.tokenAmount}</td>
//         <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
//         <td>{order.etherAmount}</td>
//       </tr>
//     </OverlayTrigger>
//   )
// }

// const showOrderBook = (props) => {
//   const { orderBook } = props

//   return(
//       // Fetechs sell orders and maps through array. Calling RenderOrder with order. 
//       //Adds info Dapp, Dapp/ETH
//       //Same thing for BuyOrders
//     <tbody>
//       {orderBook.sellOrders.map((order) => renderOrder(order))}
//       <tr>
//         <th>DAPP</th>
//         <th>DAPP/ETH</th>
//         <th>ETH</th>
//       </tr>
//       {orderBook.buyOrders.map((order) => renderOrder(order))}
//     </tbody>
//   )
// }

// class OrderBook extends Component {
//   render() {
//     return (
//       <div className="vertical">
//         <div className="card bg-dark text-white">
//           <div className="card-header">
//             Order Book
//           </div>
//           <div className="card-body order-book">
//             <table className="table table-dark table-sm small">
//               { this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table' /> }
//             </table>
//           </div>
//         </div>
//       </div>
//     )
//   }
// }

// function mapStateToProps(state) {
//   const orderBookLoaded = orderBookLoadedSelector(state)
//   const orderFilling = orderFillingSelector(state)

//   return {
//     orderBook: orderBookSelector(state), //Returns {buyOrders: [data], sellOrders: [data ]}
//     showOrderBook: orderBookLoaded && !orderFilling,//used by spinner
//     exchange: exchangeSelector(state),
//     account: accountSelector(state)
//   }
// }

// export default connect(mapStateToProps)(OrderBook);
