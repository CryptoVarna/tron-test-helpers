// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Reverter {
    uint256[] private array;

    function dontRevert() public {}

    function revertFromRevert() public {
        // solhint-disable-next-line reason-string
        revert();
    }

    function revertFromRevertWithReason() public {
        revert("Call to revert");
    }

    function revertFromRequire() public {
        require(false);
    }

    function revertFromRequireWithReason() public {
        require(false, "Failed requirement");
    }

    function revertFromAssert() public {
        assert(false);
    }

    function revertFromOutOfEnergy() public {
        for (uint256 i = 0; i < 2**200; ++i) {
            array.push(i);
        }
    }
}
