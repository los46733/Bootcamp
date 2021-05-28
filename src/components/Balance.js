import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import {
    loadBalances,
    depositEther,
    depositToken,
    withdrawEther,
    withdrawToken
} from '../store/interactions'
import {
    exchangeSelector,
    tokenSelector,//Needs to be createds
    accountSelector,
    web3Selector,
    etherBalanceSelector,
    tokenBalanceSelector,
    exchangeEtherBalanceSelector,
    exchangeTokenBalanceSelector,
    balancesLoadingSelector,
    etherDepositAmountSelector,
    etherWithdrawAmountSelector,
    tokenDepositAmountSelector,
    tokenWithdrawAmountSelector,
  } from '../store/selectors'

import {
    etherDepositAmountChanged,
    etherWithdrawAmountChanged, 
    tokenDepositAmountChanged, 
    tokenWithdrawAmountChanged
} from '../store/actions'

const showForm = (props) => {
    const {
        dispatch,
        account,
        exchange,
        token,
        web3,
        etherBalance,
        tokenBalance,
        exchangeEtherBalance, 
        exchangeTokenBalance,
        tokenDepositAmount,
        etherDepositAmount,
        etherWithdrawAmount,
        tokenWithdrawAmount
    } = props

    console.log("My etherr balance ", etherBalance, tokenBalance, exchangeEtherBalance, exchangeTokenBalance)

    return(
        
        <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
            
            <Tab eventKey="deposit" title="Deposit" className="bg-dark">
                <table className="table table-dark table-sm small">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ETH</td>
                            <td>{etherBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                            
                        </tr>
                    </tbody>
                </table>

                <form className="row" onSubmit={(event) => {
                    event.preventDefault()
                    console.log(etherDepositAmount)
                    // const test = ether(etherDepositAmount)
                    depositEther(dispatch, exchange, web3, etherDepositAmount, account, token)
                    // loadBalances(dispatch, web3, exchange, token, account)
                }}>
                    <div className="col-12 col-sm pr-sm-2">
                        <input 
                        type='text'
                        placeholder='ETH Amount'
                        onChange={(e) => dispatch( etherDepositAmountChanged(e.target.value) ) }
                        className='form-control form-control-sm bg-dark text-white'
                        required />
                    </div>
                    <div className='col-12 col-sm-auto pl-sm-0'>
                        <button type='submit' className='btn btn-primary btn-block btn-sm'>Deposit</button>
                    </div>
                </form>


                <table className="table table-dark table-sm small">
                    <tbody>
                        <tr>
                            <td>DAPP</td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                    </tbody>
                </table>

                <form className="row" onSubmit={(event) => {
                    event.preventDefault()
                    // console.log(tokenDepositAmount)
                    depositToken(dispatch, exchange, token, tokenDepositAmount, account)
                    

                }}>
                    <div className='col-12 col-sm pr-sm-2'>
                        <input
                        type="text"
                        placeholder="DAPP Amount"
                        onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value))}
                        className="form-control form-control-sm bg-dark text-white"
                        required
                        />
                    </div>
                    <div className="col-12 col-sm-auto pl-sm-0">
                        <button type="submit" className="btn btn-primary btn-block btn-sm">Deposit</button>

                    </div>

                </form>
            </Tab>

            <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">

                <table className="table table-dark table-sm small">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ETH</td>
                            <td>{etherBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                        </tr>
                    </tbody>
                </table>

                <form className="row" onSubmit={(event) => {
                    event.preventDefault()
                    console.log("Withdraw Token")
                    withdrawEther(dispatch, exchange, etherWithdrawAmount, account)
                }}>
                    <div className="col-12 col-sm pr-sm-2">
                        <input 
                        type="text"
                        placeholder="ETH Amount"
                        onChange={(e) => dispatch( etherWithdrawAmountChanged(e.target.value) )}
                        className="form-control form-control-sm bg-dark text-white"
                        required
                        />
                    </div>
                    <div className="col-12 col-sm-auto pl-sm-0">
                        <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>

                    </div>
                </form>

                <table className="table table-dark table-sm small">
                    <tbody>
                        <tr>
                            <td>Dapp</td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                    </tbody>
                </table>

                <form className="row" onSubmit={(event) => {
                    event.preventDefault()
                    withdrawToken(dispatch, exchange, token, tokenWithdrawAmount, account)
                }}>
                    <div className="col-12 col-sm pr-sm-2">
                        <input 
                        type="text"
                        placeholder="DAPP Amount"
                        onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value) )}
                        className="form-control form-control-sm bg-dark text-white"
                        required
                        />
                    </div>
                    <div className="col-12 col-sm-auto ok-sn-0">
                        <button type="submit" className="btn btn-primary btn-block btn-sm">Withdraw</button>

                    </div>

                </form>

            </Tab>
        </Tabs>
    )
}



class Balance extends Component {
    componentDidMount() {
        this.loadBlockchainData()
    }
    async loadBlockchainData() {
        const { dispatch, web3, exchange, token, account } = this.props
        await loadBalances(dispatch, web3, exchange, token, account)
    }

    render() {
        return (
            <div className='card bg-dark text-white'>
                <div className="card-header">
                    Balance
                </div>
                <div className="card-body">
                    {this.props.showForm ? showForm(this.props) : <Spinner />}

                </div>
            </div>


        )
    }
}

function mapStateToProps(state) {
    const balancesLoading = balancesLoadingSelector(state)


    return {
        account: accountSelector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEtherBalance: exchangeEtherBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
        balancesLoading, 
        showForm: !balancesLoading,
        etherDepositAmount: etherDepositAmountSelector(state),
        tokenDepositAmount: tokenDepositAmountSelector(state),
        etherWithdrawAmount: etherWithdrawAmountSelector(state),
        tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
    }
}

export default connect(mapStateToProps)(Balance)