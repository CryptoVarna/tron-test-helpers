// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";

contract OwnableTest is Ownable {
    function test() public onlyOwner {
        renounceOwnership();
    }
}
