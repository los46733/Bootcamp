import { result } from 'lodash'
import { tokens } from './helpers'  // Converts amount to WEI - Helper Function
import {EVM_REVERT} from './helpers' // EVEM Error for rejected transactions - 'VM Exception while processing transaction: revert'
const { default: Web3 } = require('web3') // Loads Web3 from Node Modules

const Token = artifacts.require('./Token') // Loads TOKEN CONTRACT

require('chai').use(require('chai-as-promised')).should() // Testing resource



const test = 'Test funtion 10'



contract('Token', ([deployer, receiver, exchange]) => { //Loads Contract and Inputs - Not sure
    const name = 'DApp Token'
    const symbol = 'DAPP'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
    let token

    beforeEach(async () => {
        token = await Token.new() //Loads new Contract before each 
    })

    describe('deployment', () => {
        it('tracks the name', async () => {
            const result = await token.name() 
            result.should.equal(name)
        })

        it('tracks the symbol', async () => {
            const result = await token.symbol()
            result.should.equal(symbol)

        })

        it ('tracks the decimal', async () => {
            const result = await token.decimals()
            result.toString().should.equal(decimals)


        })

        it('tracks the total supply', async () => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply.toString())

        })

        it('assigns the total supply to the deployer', async () => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply).toString()
        })
    })

    describe('sending tokens', () => {
        let result
        let amount

        describe('success', async () => {
            beforeEach(async () => {
                amount = tokens(100)
                result = await token.transfer(receiver, amount , { from: deployer })
            })
    
            it('transfers token balances', async () => {
                let balanceOf
            
                //After transfer
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokens(100).toString())
            })
    
            it('emits a transfer event', async () => {
                
                // Checks from Transfer event in the Smart Contract
                const log = result.logs[0]
                log.event.should.eq('Transfer', 'Transfer event found')
                
                //Checking if FROM, TO, and Ammount are correct
                const event = log.args
                event.from.should.equal(deployer, 'deployer is the from address')
                event._to.should.equal(receiver, 'receiving address is correct')
                event._value.toString().should.equal(amount.toString(), 'ammount sent is correct')  
            })

        })

        describe('failure', async () => {

            it('rejects insufficient balances', async () => {

                //Checks from inufficient funds
                let invalidAmount
                invalidAmount = tokens(100000000)
                await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT);

                //Checks to see account has tokens to send. Receiver has not yet gotten tokens and is sending to deployer
                invalidAmount = tokens(10)
                await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recipients', async () => {
                await token.transfer(0x0, amount, { from: deployer}).should.be.rejectedWith('invalid address');
            })

            

        })
    })

    describe('approving tokens', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, { from: deployer })
        })

        describe('success', () => {
            it('allowcates an allowance for delegadeted token spending on exchange', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString())

            })

            it('emits an Approval event', async () => {
                
                // Checks from Transfer event in the Smart Contract
                const log = result.logs[0]
                log.event.should.eq('Approval')
                
                //Checking if FROM, TO, and Ammount are correct
                const event = log.args
                event._owner.should.equal(deployer, 'owner is correct')
                event._spender.should.equal(exchange, 'spender is correct')
                event._value.toString().should.equal(amount.toString(), 'ammount sent is correct')  
            })
        })



        describe('failure', () => {

            it('rejects invalid spenders', async () => {
                await token.approve(0x0, amount, { from: deployer}).should.be.rejected
            })




        })



    })

    describe('delegated token transfers', () => {
        let result
        let amount

        beforeEach(async () => {
            amount = tokens(100)
            await token.approve(exchange, amount, { from: deployer})
        })

        describe('success', async () => {
            beforeEach(async () => {
                amount = tokens(100)
                result = await token.transferFrom(deployer, receiver, amount , { from: exchange })
            })
    
            it('transfer from token balances', async () => {
                let balanceOf
            
                //After transfer
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokens(100).toString())
            })

            it('resets the allowance', async () => {
                it('resets exchange allowance', async () => {
                    const allowance = await token.allowance(deployer, exchange)
                    allowance.toString().should.equal(0)
    
                })

            })
    
            it('emits a transfer event', async () => {
                
                // Checks from Transfer event in the Smart Contract
                const log = result.logs[0]
                log.event.should.eq('Transfer', 'Transfer event found')
                
                //Checking if FROM, TO, and Ammount are correct
                const event = log.args
                event.from.should.equal(deployer, 'deployer is the from address')
                event._to.should.equal(receiver, 'receiving address is correct')
                event._value.toString().should.equal(amount.toString(), 'ammount sent is correct')  
            })

        })

        describe('failure', async () => {
            it('rejects insufficient amounts', async () => {
                const invalidAmount = tokens(100000000)
                result = await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects invalid recipients', async () => {
                await token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected
            })

            

        })
        

        
    })


})