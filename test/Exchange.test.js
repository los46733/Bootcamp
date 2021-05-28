// Test For Exchange Contract
import { iteratee } from 'lodash'
import { tokens, ETHER_ADDRESS } from './helpers'  // Converts amount to WEI - Helper Function
import {EVM_REVERT} from './helpers' // EVEM Error for rejected transactions - 'VM Exception while processing transaction: revert'
const { default: Web3 } = require('web3') // Loads Web3 from Node Modules
require('chai').use(require('chai-as-promised')).should() // Testing resource

const Exchange = artifacts.require('./Exchange') // Loads EXCHANGE CONTRACT
const Token = artifacts.require('./Token') // Load Token Contarct 





//_______________________________________________________________________________________________________________
contract('Exchange', ([deployer, feeAccount, user1, user2]) => { //Loads Contract and uses accounts in ganache as ([ deployer, feeAccount ])
    let exchange
    let token
    const feePercent = 10

    beforeEach(async () => {
        //Deploy Token 
        token = await Token.new()
        //Transfer tokens to user one
        token.transfer(user1, tokens(100), { from: deployer })
        //Deploy Exchange contract and set feeAccount with feePercentage
        exchange = await Exchange.new(feeAccount, feePercent)

    })

    describe('deployment', () => {
        it('tracks the feeAccount', async () => {
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        })
        
        it('tracks the feePercent', async () => {
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })
    })

    describe('fallback', () => {
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('depositing ether', async () => {
        let result 
        let amount 

        beforeEach(async () => {
            amount = tokens(1) //stores amount of ether in wei
            //deposits using metadata enabled by payable modifier on function
            result = await exchange.depositEther({ from: user1, value: amount }) 
        })

        it('tracks the ether deposit', async () => {
            const balance = await exchange.tokens(ETHER_ADDRESS, user1)
            balance.toString().should.equal(amount.toString())
        })

        it('emits a Deposit event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Deposit')
            const event = log.args
            event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
            event.user.should.equal(user1, 'user address is correct')
            event.amount.toString().should.equal(amount.toString(), 'amount is correct')
            event.balance.toString().should.equal(amount.toString(), 'balance is correct')

        })
    })

    describe('withdrawing Ether', async () => {
        let result
        
        beforeEach(async () => { 
            //Deposit Ether First
            await exchange.depositEther({ from: user1, value: tokens(1)})
        })

        describe('success', async () => {

            beforeEach(async () => {
                //Withdraw Ether
                result = await exchange.withdrawEther(tokens(1), { from: user1 })
            })

            it('withdraws Ether funds from exchange', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')

            })

            it('emits a Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Withdraw')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(tokens(1).toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')

            })
        })

        describe('failure', async () => {
            it('rejects withdraws for insufficient balances', async () => {
                await exchange.withdrawEther(tokens(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })

    describe('depositing tokens', async () => {
        let result // Variable to store result
        let amount = tokens(10) // Variable we can use to input tokens - with Token Helper


        describe('success', async => {

            beforeEach( async () => {
                amount = tokens(10)
                // Approve the exchange to deposit 10 tokens
                await token.approve(exchange.address, amount, { from: user1 })  
                // Deposit token (Token Address, Amount of Tokens, From User who approved the exvhange to se tokens
                result = await exchange.depositToken(token.address, amount, { from: user1 }) 
    
    
            })

            it('tracks the token deposit', async () => {
                // Check exchange token balance 
                let balance 

                // Checks if deposit was successful
                balance = await token.balanceOf(exchange.address)
                // Checks if variable equal exchange balance
                balance.toString().should.equal(amount.toString())
                //Checks Tokens on exchange
                balance = await exchange.tokens(token.address, user1)
                //Confirms user has 10 tokens on exchange 
                balance.toString().should.equal(amount.toString())
            })

            it('emits a Deposit event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Deposit')
                const event = log.args
                event.token.should.equal(token.address, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(tokens(10).toString(), 'amount is correct')
                event.balance.toString().should.equal(tokens(10).toString(), 'balance is correct')

            })
            

        })

        describe('failure', async => {
            it('rejects Ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('fails when no tokens are approved', async () => {
                await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

        })
    })

    describe('withdrawing tokens', async () => {
        let result
        let amount

        describe('success', async () => {
            beforeEach(async () => {
                //Deposit tokens first
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1})
                await exchange.depositToken(token.address, amount, { from: user1})


                //Withdraw Tokens 
                result = await exchange.withdrawToken(token.address, amount, { from: user1})
            })

            it('withdraws token funds', async () => {
                const balance = await exchange.tokens(token.address, user1) //Loads Balance on exchange = "0"
                balance.toString().should.equal('0')
            })

            it('emits a Withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.eq('Withdraw')
                const event = log.args
                event.token.should.equal(token.address, 'token address is correct')
                event.user.should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')

            })
        })

        describe('failure', async () => {

            it('rejects ether address', async () =>{
                await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT) 
            })

            it('fails for insufficient balances', async () => {
                await exchange.withdrawToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

        })

        

       

    })

    describe('returns user balance', async () => {
        beforeEach(async () => {
            exchange.depositEther({ from: user1, value: tokens(1)})
        })

        it('returns user balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(tokens(1).toString())
        })

    })

    describe('making order', async () => {
        let result

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, tokens(1), { from: user1 })
        })

        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount()//Fetches Order Count
            orderCount.toString().should.equal('1')
            const order = await exchange.orders('1')//Fetches Corresponding Data with OrderCount as ID and confirms info for order is correct
            order.id.toString().should.equal('1', 'id is correct')
            order.user.toString().should.equal(user1, 'user is correct')
            order.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
            order.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            order.amountGive.toString().should.equal(tokens(1).toString(), 'amountGive is correct')
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })

        it('emits a Orders event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Order')
            const event = log.args
            event.id.toString().should.equal('1', 'id is correct')
            event.user.should.equal(user1, 'user is correct')
            event.tokenGet.should.equal(token.address, 'tokenGet is correct')
            event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
            event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
            event.amountGive.toString().should.equal(tokens(1).toString(), 'amountGive is correct')
            event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
        })

    })

    describe('order actions', async () => {

        beforeEach(async () => {
            //user1 deposits ether
            await exchange.depositEther({ from: user1, value: tokens(1)})
            //give tokens to user2
            await token.transfer(user2, tokens(100), { from: deployer })
            //user2 deposits tokens
            await token.approve(exchange.address, tokens(2), { from: user2 })
            await exchange.depositToken(token.address, tokens(2), { from: user2})
            //User makes order to buy tokens with Ether
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, tokens(1), { from: user1})
        })



        describe('Cancelling order', async () => {
            let result

            describe('success', async () => {

                beforeEach(async () => {
                    result = await exchange.cancelOrder('1', { from: user1})//Cancels users order
                })
                
                it('updates cancelled order', async () => {
                    const orderCancelled = await exchange.orderCancelled(1)
                    orderCancelled.should.equal(true)//Confirms order cancel was saved in orderCancelled variable in the Contract
                })

                it('emits a Cancel event', async () => {
                    const log = result.logs[0]
                    log.event.should.eq('Cancel')
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(user1, 'user is correct')
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct')
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(tokens(1).toString(), 'amountGive is correct')
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
                })

            })

            describe('failure', async () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 99999
                    await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects unathorized cancellations', async () => {
                    await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })

            })
        })


        describe('filling orders', async () => {
            let result 
            
            describe('success', async () => {

                beforeEach (async () => {
                    // user2 fills order
                    result = await exchange.fillOrder('1', { from: user2})
                })

                it('executes the trade & charges fees', async () => {
                    let balance

                    balance = await exchange.balanceOf(token.address, user1)
                    balance.toString().should.equal(tokens(1).toString(), 'User1 received tokens')
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
                    balance.toString().should.equal(tokens(1).toString(), 'user2 received Ether')
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                    balance.toString().should.equal('0', 'user1 Ether deducted')
                    balance = await exchange.balanceOf(token.address, user2)
                    balance.toString().should.equal(tokens(.9).toString(), ' User2 tokens deducted with fee applied')
                    const feeAccount = await exchange.feeAccount()
                    balance = await exchange.balanceOf(token.address, feeAccount)
                    balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount recieved fee')
                })

                it('updates filled orders', async () => {
                    const orderFilled = await exchange.orderFilled(1)
                    orderFilled.should.equal(true)
                })

                it('emits a Trade event', async () => {
                    const log = result.logs[0]
                    log.event.should.eq('Trade')
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(user1, 'user is correct')
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct')
                    event.amountGet.toString().should.equal(tokens(1).toString(), 'amountGet is correct')
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(tokens(1).toString(), 'amountGive is correct')
                    event.userFill.should.equal(user2, 'userFill is correct')
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
                })

            })

            describe('failure', async () => {

                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 99999
                    await exchange.fillOrder(invalidOrderId, { from: user2}).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects already filled orders', async () => {
                    //fill the order 
                    await exchange.fillOrder('1', { from: user2}).should.be.fulfilled
                    //Try to fill it again 
                    await exchange.fillOrder('1', { from: user2}).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects canceled order', async () => {
                    // Cancel the order
                    await exchange.cancelOrder('1', { from: user1 }).should.be.fulfilled
                    // Try to fill the order
                    await exchange.fillOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT)
                })


            })

        })


    })

})