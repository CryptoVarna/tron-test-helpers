// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Bytes {
    event EventWithBytes(uint256 n, bytes data);
    event EventWithArray(uint256 n, address[] data);

    function emitEventWithAddresses(address[] memory data) external {
        emit EventWithBytes(data.length, abi.encodePacked(data));
    }

    function emitEventWithArrayOfAddresses(address[] memory data) external {
        emit EventWithArray(data.length, data);
    }
}
