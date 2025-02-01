// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string fileHash;
        uint256 timestamp;
        address owner;
    }

    mapping(string => File) public files;

    event FileUploaded(string fileHash, uint256 timestamp, address owner);

    function uploadFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "Invalid file hash");

        files[_fileHash] = File(_fileHash, block.timestamp, msg.sender);

        emit FileUploaded(_fileHash, block.timestamp, msg.sender);
    }

    function getFileOwner(string memory _fileHash) public view returns (address) {
        require(bytes(files[_fileHash].fileHash).length > 0, "File does not exist");
        return files[_fileHash].owner;
    }


    function getFileTimestamp(string memory _fileHash) public view returns (uint256) {
        require(bytes(files[_fileHash].fileHash).length > 0, "File does not exist");
        return files[_fileHash].timestamp;
    }



}
