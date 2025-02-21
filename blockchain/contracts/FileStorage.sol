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
    // mapping(string => mapping(address => bool)) private fileAccess; // Stores access permissions

    event FileUploaded(string fileHash, uint256 timestamp, address indexed owner);
    // event AccessGranted(string fileHash, address indexed grantedTo);
    // event AccessRevoked(string fileHash, address indexed revokedFrom);

    function uploadFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(files[_fileHash].owner == address(0), "File already uploaded");

        files[_fileHash] = File({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        userFiles[msg.sender].push(_fileHash);
        // fileAccess[_fileHash][msg.sender] = true; // Owner has access by default

        emit FileUploaded(_fileHash, block.timestamp, msg.sender);
    }

    // function grantAccess(string memory _fileHash, address _user) public {
    //     // require(files[_fileHash].owner == msg.sender, "Only owner can grant access");
    //     // fileAccess[_fileHash][_user] = true;
    //     emit AccessGranted(_fileHash, _user);
    // }

    // function revokeAccess(string memory _fileHash, address _user) public {
    //     // require(files[_fileHash].owner == msg.sender, "Only owner can revoke access");
    //     // fileAccess[_fileHash][_user] = false;
    //     emit AccessRevoked(_fileHash, _user);
    // }

    function getUserFiles(address _user) public view returns (string[] memory) {
        // require(msg.sender == _user, "Access denied"); // Users can only view their own files
        return userFiles[_user];
    }

    function getFileOwner(string memory _fileHash) public view returns (address) {
        // require(fileAccess[_fileHash][msg.sender], "Access denied"); // Only allowed users can view
        return files[_fileHash].owner;
    }

    function getFileTimestamp(string memory _fileHash) public view returns (uint256) {
        // require(fileAccess[_fileHash][msg.sender], "Access denied"); // Only allowed users can view
        return files[_fileHash].timestamp;
    }

    function getFileCount() public view returns (uint256) {
        return userFiles[msg.sender].length;
    }

    function fileExists(string memory _fileHash) public view returns (bool) {
        return files[_fileHash].owner != address(0);
    }
}
