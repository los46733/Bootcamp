import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'// used for bulding Chart https://apexcharts.com/
import Spinner from './Spinner'
import { chartOptions, dummyData } from './PriceChart.config'//Config and Dummy data. CandleStick format https://apexcharts.com/docs/chart-types/candlestick/
import {
  priceChartLoadedSelector,
  priceChartSelector
} from '../store/selectors'

//Used to show last price and Corresponding triangle https://www.w3schools.com/html/html_entities.asp
const priceSymbol = (lastPriceChange) => {
  let output
  if(lastPriceChange === '+') {//if price change was positve
    output = <span className="text-success">&#9650;</span> // Green up tiangle
  } else {
    output = <span className="text-danger">&#9660;</span> // Red down triangle
  }
  return(output)
}

const showPriceChart = (priceChart) => {
    //Feeds priceChartSelector data that has been formatted for an Apex Chart. use dummyData instead of .series to see full chart example
  return(
    <div className="price-chart">
      <div className="price">
        <h4>DAPP/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h4>
      </div>
      <Chart options={chartOptions} series={priceChart.series} type='candlestick' width='100%' height='100%' />
    </div>
  )
}

class PriceChart extends Component {
  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Price Chart
        </div>
        <div className="card-body">
          {this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner />}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {

  return {
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state),
  }
}

export default connect(mapStateToProps)(PriceChart)