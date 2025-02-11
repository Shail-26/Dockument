 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string fileHash;
        uint256 timestamp;
        address owner;
    }

    mapping(string => File) private files;
    mapping(address => string[]) private userFiles; // Store only file hashes to save space

    event FileUploaded(string fileHash, uint256 timestamp, address indexed owner);

    function uploadFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(files[_fileHash].owner == address(0), "File already uploaded");

        files[_fileHash] = File({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        userFiles[msg.sender].push(_fileHash);

        emit FileUploaded(_fileHash, block.timestamp, msg.sender);
    }

    function getFileOwner(string memory _fileHash) public view returns (address) {
        require(bytes(files[_fileHash].fileHash).length > 0, "File does not exist");
        return files[_fileHash].owner;
    }

    function getUserFiles(address _user) public view returns (string[] memory) {
        return userFiles[_user];
    }

    function getFileTimestamp(string memory _fileHash) public view returns (uint256) {
        require(bytes(files[_fileHash].fileHash).length > 0, "File does not exist");
        return files[_fileHash].timestamp;
    }

    function fileExists(string memory _fileHash) public view returns (bool) {
        return files[_fileHash].owner != address(0);
    }
}
