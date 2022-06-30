// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Acknowledger {
    event AcknowledgeFoo(uint256 a);
    event AcknowledgeBarSingle(uint256 a);
    event AcknowledgeBarDouble(uint256 a, uint256 b);
    event AcknowledgeFallback(bool success);

    function foo(uint256 a) public {
        emit AcknowledgeFoo(a);
    }

    function bar(uint256 a) public {
        emit AcknowledgeBarSingle(a);
    }

    function bar(uint256 a, uint256 b) public {
        emit AcknowledgeBarDouble(a, b);
    }
}
