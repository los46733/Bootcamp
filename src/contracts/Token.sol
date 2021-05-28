// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Token {

    //Variables
    string public name = "DApp Token";
    string public symbol = "DAPP";
    uint256 public decimals = 18; //Token 
    uint256 public totalSupply; //Variable that will chage

    //Track Balances
    mapping(address => uint256) public balanceOf;
    // Exchange Allownce 
    mapping(address => mapping(address => uint256)) public allowance;
    
    //Events
    event Transfer(address indexed from, address indexed _to, uint256 _value); // Transfer Event
    event Approval(address indexed _owner, address indexed _spender, uint256 _value); // Approval Event - Both are required to be emited

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    //Transfer function
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);// Rejects insufficient funds
        _transfer(msg.sender, _to, _value);//Transfer internal function
        return true;
    }

    // Internal Transfer fuction. Cant' be called from outside the contract
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0));// Rejects invalid address
        balanceOf[_from] = balanceOf[_from] - (_value);// Deducts amount from sender
        balanceOf[_to] = balanceOf[_to] + (_value);// Adds amount to receiver
        emit Transfer(_from, _to, _value);//Emits transfer function

    }

    //Approve tokens allowance  for exchange
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0));//Rejects invalid address
        allowance[msg.sender][_spender] = _value;//Sender approves allowance to sender/exchange for the amount given
        emit Approval(msg.sender, _spender, _value);//Emits Approval functions
        return true;

    }

    // Exchange Transfer fuction after approval
    function transferFrom(address _from, address _to, uint256  _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);//Checks if owner has enough funds
        require(_value <= allowance[_from][msg.sender]);//Checks if allowance has enough funds
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - (_value);//Resets allowance. May not need it**
        _transfer(_from, _to, _value);//Transfer function from internal
        return true;//Return if successful


    }


}