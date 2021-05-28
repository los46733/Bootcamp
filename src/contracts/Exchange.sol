// SPDX-License-Identifier: MIT

//Every time Ganache is reset you have to:
//1. 'truggle migrate --reset
//2. truffle exec scrips/seed-exchange.js / UI Video

// Deposit and Withdraw funds
// Manage orders
// Make orders and Cancel them
// Handle Trades - Charge fees
pragma solidity >=0.4.22 <0.9.0;

import "./Token.sol"; // Loads our tokens for the Exchange contract to use 
/**
To Do:
- Set the fee DONE
- Deposit Ether
- Withdraw Ether
- Deposit Tokens 
- Withdraw Tokens
- Check Balances
- Make Order
- Fill Order 
- Charge fees
 */


contract Exchange {
    // VARIABLES
    address public feeAccount; // The account that recieves exchange fee's 
    uint256 public feePercent;// fee percentage 
    address constant ETHER = address(0);// store ether in tokens mapping with blank address
    // Tracks Token            Who owns those tokens         
    mapping(address => mapping(address => uint256)) public tokens; // Variables used for tracking what tokens and who owns them
    // Tracks Orders
    mapping(uint256 => _Order) public orders; //CounterCach?
    //Tracks canceledOrders
    mapping(uint256 => bool) public orderCancelled; //Whenever a order is created in orders mapping. It lives there forever. Create cancelled orders to keep track.
    //Load up orders mapping and subtract ordersCancelled to see live order count
    //Tracks Orders Filled 
    mapping(uint => bool) public orderFilled;//Feed it a ID and returns true/false if order has been filled 

    //EVENTS
    //Deposit Event; Token Address, MSG.SENDER, AMOUNT, Internal tokens Variable/ Balance of user
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    //Withdraw Event
    event Withdraw(address token, address user, uint amount, uint balance);
    //Order Event
    event Order (
        uint id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint timestamp
    );
    //Cancel Event 
    event Cancel(
        uint id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint timestamp
    );

    event Trade(
        uint id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        address userFill,
        uint timestamp
    );

    //Order storage used for token ID?
    uint256 public orderCount;

    //STRUCTS
    struct _Order {
        uint id; //ID of token
        address user;//
        address tokenGet;//Token address purchase
        uint amountGet;// Token amount being traded
        address tokenGive;// 
        uint amountGive;
        uint timestamp;

    }



    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;

    }

    //Fallback: Reverts if Ether is sent to this smart contract by mistake
    // THIS MIGHT NOT BE NECCESARY IN NEW VERSIONS https://docs.soliditylang.org/en/v0.8.3/contracts.html?highlight=fallback#receive-ether-function
    // function() external {
    //     revert();
    // }

    function depositEther() payable public { //payable allows you to use msg.value that can be passed through in test
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] + (msg.value); // Updates users account on exchange
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
        
    }

    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender] - (_amount);// Updates users account on exchange
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint _amount) public { // Which Token (Our Token) and amount to be deposited
        //Send tokens to the contract 
        // Manager deposit - update balance 
        // Emit event 

        //dont allow Ether deposits in token function
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        // Update Tokens Variable           UPDATE tokens to users account              
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + (_amount);
        //Emits Deposit Event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - (_amount);// Subracts users tokens from exchange and updates
        require(Token(_token).transfer(msg.sender, _amount)); // 
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];

    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount + (1); //Assigned ID
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now); //Creates Order for that ID
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);//Emits Order with info
    }

    function cancelOrder(uint256 _id) public {
        //Must be "my" order
        //Must be a valid order
        _Order storage _order = orders[_id];//Fetches Order from storage
        require(address(_order.user) == msg.sender);//Ensures that owner of order is requesting to cancel
        require(_order.id == _id);//Order must exist. if order doesnt exist. Struct will return with default 0 value

        orderCancelled[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
    }

    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount);//Order id must be greater than 0 and less than total orders in mapping.AKA must be a valid order
        require(!orderFilled[_id]);//Checks to see if id is found in ordeFilled mapping
        require(!orderCancelled[_id]);//Checks to see if id is found in orderCancelled mapping
        //Fetch the Order
        _Order storage _order = orders[_id];//Fetches order from storage
        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);//Calls trade function with order retrieved

        //Mark order as filled 
        orderFilled[_order.id] = true;


    }

    function _trade(uint _orderId, address _user, address _tokenGet, uint _amountGet, address _tokenGive, uint _amountGive) internal {
        //CHARGE FEES
        //Fee paid by the user that fills the order. aka msg.sender
        //Fee deducted from amountGet 
        uint _feeAmount = _amountGive * (feePercent) / (100);

        //Execute trade
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + (_feeAmount));//Subtracts tokeGet(Token) + Fee from person filling the order
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + (_amountGet);//Adds to person who submitted order
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + (_feeAmount);//Pays fee to feeAccount 
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - (_amountGive);//Subtracs tokenGive(ETH) from user who submitted order
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + (_amountGive);//Adds tokenGive(ETH) to fillers balance 
        //Emit trade event
        emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);

    }



}