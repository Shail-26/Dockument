// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string fileHash;
        uint256 timestamp;
        address owner;
        bool isDeleted;
    }

    mapping(string => File) private files;
    mapping(address => string[]) private userFiles; // Store only file hashes to save space
    // mapping(string => mapping(address => bool)) private fileAccess; // Stores access permissions

    event FileUploaded(string fileHash, uint256 timestamp, address indexed owner);
    event FileDeleted(string fileHash, address indexed owner);
    // event AccessGranted(string fileHash, address indexed grantedTo);
    // event AccessRevoked(string fileHash, address indexed revokedFrom);

    function uploadFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        if (files[_fileHash].owner != address(0)) {
            require(files[_fileHash].isDeleted, "File already uploaded");
        }

        files[_fileHash] = File({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            owner: msg.sender,
            isDeleted: false
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

    function deleteFile(string memory _fileHash) public {
        require(files[_fileHash].owner == msg.sender, "Only the owner can delete this file");
        require(!files[_fileHash].isDeleted, "File already deleted");

        // Mark file as deleted
        files[_fileHash].isDeleted = true;

        // Remove file hash from userFiles array
        string[] storage userFileList = userFiles[msg.sender];
        for (uint256 i = 0; i < userFileList.length; i++) {
            if (keccak256(abi.encodePacked(userFileList[i])) == keccak256(abi.encodePacked(_fileHash))) {
                // Swap with last element and pop
                userFileList[i] = userFileList[userFileList.length - 1];
                userFileList.pop();
                emit FileDeleted(_fileHash, msg.sender);
                return;
            }
        }
        revert("File not found in user files");
    }

    function getUserFiles(address _user) public view returns (string[] memory) {
        // require(msg.sender == _user, "Access denied"); // Users can only view their own files
        
        string[] memory allFiles = userFiles[_user];
        if (allFiles.length == 0) {
            return new string[](0); // Return empty array if no files
        }

        // Count non-deleted files
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            if (!files[allFiles[i]].isDeleted) {
                activeCount++;
            }
        }

        // Create filtered array
        string[] memory activeFiles = new string[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            if (!files[allFiles[i]].isDeleted) {
                activeFiles[index] = allFiles[i];
                index++;
            }
        }
        return activeFiles;
    }

    function getFileOwner(string memory _fileHash) public view returns (address) {
        // require(fileAccess[_fileHash][msg.sender], "Access denied"); // Only allowed users can view
        require(!files[_fileHash].isDeleted, "File has been deleted");
        return files[_fileHash].owner;
    }

    function getFileTimestamp(string memory _fileHash) public view returns (uint256) {
        // require(fileAccess[_fileHash][msg.sender], "Access denied"); // Only allowed users can view
        require(!files[_fileHash].isDeleted, "File has been deleted");
        return files[_fileHash].timestamp;
    }

    function getFileCount() public view returns (uint256) {
        string[] memory allFiles = userFiles[msg.sender];
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            if (!files[allFiles[i]].isDeleted) {
                activeCount++;
            }
        }
        return activeCount;
    }

    function fileExists(string memory _fileHash) public view returns (bool) {
        return files[_fileHash].owner != address(0) && !files[_fileHash].isDeleted;
    }
}
