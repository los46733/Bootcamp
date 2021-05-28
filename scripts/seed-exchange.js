const Exchange = artifacts.require('./Exchange') // Loads EXCHANGE CONTRACT
const Token = artifacts.require('./Token') // Load Token Contarct 

//Utils
const tokens = (n) => {
    return web3.utils.toWei(n.toString(), 'ether')
} //Helper function
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' //Helper
const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = async function(callback) {
    try {

        // Fetch accounts from wallet - these are unlocked 
        const accounts = await web3.eth.getAccounts()
        console.log("these are my accounts", accounts)

        //Fetch the deployed Token
        const token = await Token.deployed()
        console.log('Step1: ','Token fetched ', token.address)

        //Fetch the deployed Exchange 
        const exchange = await Exchange.deployed()
        console.log('Step2: ', "Exchange Feteched ", exchange.address)

        //Give tokens to account[1]
        const sender = accounts[0]
        const receiver = accounts[1]
        let amount = web3.utils.toWei('10000', 'ether')// 10,000 tokens 

        await token.transfer(receiver, amount, { from: sender})
        console.log('Step3: ','Transferred ', amount, ' tokens from ', sender, ' to ', receiver)

        //Set up exchange users
        const user1 = accounts[0]
        const user2 = accounts[1]

        //User1 Deposits ether
        amount = 1
        await exchange.depositEther({ from: user1, value: tokens(amount)})
        console.log('Step4: ','Deposits ', amount, " ether from ", user1)

        //User2 Approves tokens
        amount = 10000
        await token.approve(exchange.address, tokens(amount), { from: user2 })
        console.log('Step5: ',"user2 approves ", amount, ' tokens from ', user2 )

        //user 2 deposits tokens 
        await exchange.depositToken(token.address, tokens(amount), { from: user2 })
        console.log('Step6: ',"Deposited ", amount, ' tokens from ', user2)


        /////////////////////////////////////////////////////////////////////////
        //Seed a Cancelled order


        //User1 makes order to get tokens 
        let result 
        let orderId
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, tokens(.1), { from: user1})
        console.log('Step:7 ',"Made order from ", user1)

        //User1 cancells order 
        orderId = result.logs[0].args.id 
        await exchange.cancelOrder(orderId, { from: user1})
        console.log('Step8: ','Cancelled order from ', user1)

        //Seed Filled Orders 

        //User 1 makes order
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, tokens(0.1), { from: user1 })
        console.log('Step9: ',"Made order from", user1)

        // User 2 Fills order
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })
        console.log('Step10: ','Filled order from ', user1, ' by ', user2)

        //Wait 1 second 
        await wait(1)

        // User 1 makes another order
        result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, tokens(0.01), { from: user1 })
        console.log('Step11: ','Made another order from ', user1)

        // User 2 fills another order 
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })
        console.log('Step12: ',"User 2 Filled another order from User 1", user1)

        //Wait 1 second 
        await wait(1)

        //User 1 makes final order
        result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, tokens(0.15), { from: user1 })
        console.log('Step13: ','Made final order from ', user1)

        //User 2 fills final order 
        orderId = result.logs[0].args.id
        await exchange.fillOrder(orderId, { from: user2 })
        console.log('Step14: ',"User2 filled final order ", user2)


        //Wait 1 second 
        await wait(1)

        /////////////////////////////////////////////////////////////////////

        //User 1 makes 10 orders 
        for(let i = 1; i <= 10; i++) {
            result = await exchange.makeOrder(token.address, tokens(10 * i), ETHER_ADDRESS, tokens(0.01), { from: user1 })
            console.log('Order count for user1', i, ' Address for user1 ', user1)
            //Wait 1 second 
            await wait(1)
        }

        for(let i = 1; i <= 10; i++) {
            result = await exchange.makeOrder(ETHER_ADDRESS, tokens(.01), token.address, tokens(10 * i), { from: user2 })
            console.log('Order count for user2', i, ' Address for user1 ', user2)
            //Wait 1 second 
            await wait(1)
        }
        

        

    } catch(err) {
        console.log('error')

    }



    callback()
}