// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Energy {
    event Argumentless();
    event String(string value);

    struct TestStruct {
        address addr;
        uint256 value;
    }

    mapping(address => TestStruct) private _structMap;
    TestStruct[] private _structArray;

    function emitArgumentless() public {
        emit Argumentless();
    }

    function emitString(string memory value) public {
        emit String(value);
    }

    function writeToMap(TestStruct memory data)
        public
        returns (TestStruct memory)
    {
        //_structMap[msg.sender] = data;
        return data;
    }

    function writeToArray(TestStruct memory data) public {
        _structArray.push(data);
    }
}
