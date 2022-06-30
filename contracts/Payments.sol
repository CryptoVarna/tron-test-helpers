// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Payments {
    uint256 private _balance;

    constructor() payable {
        _balance = msg.value;
    }

    function getBalance() public view returns (uint256) {
        return _balance;
    }

    receive() external payable {}

    fallback() external payable {}
}
