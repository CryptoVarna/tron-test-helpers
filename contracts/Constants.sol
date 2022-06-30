// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Constants {
    event EmitZeroAddress(address zero);

    function isZeroBytes32(bytes32 value) public pure returns (bool) {
        return value == bytes32(0x00);
    }

    function isBytesLength32(bytes memory value) public pure returns (bool) {
        return value.length == 32;
    }

    function returnZeroBytes32() public pure returns (bytes32) {
        return bytes32(0x00);
    }

    function emitEventWithZeroAddress() public {
        emit EmitZeroAddress(address(0));
    }

    function isZeroAddress(address value) public pure returns (bool) {
        return value == address(0);
    }

    function returnZeroAddress() public pure returns (address) {
        return address(0);
    }

    function returnBigNumber() public pure returns (uint256) {
        return 2**256 - 1;
    }

    function encodeFunction1(
        address a,
        uint256 b,
        string calldata c
    )
        public
        pure
        returns (
            address,
            uint256,
            string calldata
        )
    {
        return (a, b, c);
    }

    function encodeFunction2() public pure {}
}
