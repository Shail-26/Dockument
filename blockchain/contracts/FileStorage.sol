// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct Credential {
        string fileHash;         // IPFS hash of the file
        uint256 timestamp;       // Issuance or upload timestamp
        address issuer;          // Who issued the VC or uploaded the file
        address receiver;        // Who received the VC or uploaded the file
        bool isDeleted;          // Marked as deleted
        bool isRevoked;          // Marked as revoked (VC only)
        string metadata;         // JSON string for VC details (optional for normal files)
    }

    mapping(string => Credential) private files;         // Maps fileHash to Credential details
    mapping(address => string[]) private userFiles;     // Maps receiver address to their file hashes
    mapping(address => string[]) private issuedFiles;   // NEW: Maps issuer address to their issued file hashes
    mapping(address => bool) private issuers;           // Tracks authorized issuers
    address public owner;                               // Contract owner for issuer management

    event FileUploaded(string fileHash, uint256 timestamp, address indexed owner);
    event FileDeleted(string fileHash, address indexed owner);
    event CredentialIssued(string fileHash, uint256 timestamp, address indexed issuer, address indexed receiver);
    event CredentialRevoked(string fileHash, address indexed issuer);
    event IssuerRegistered(address indexed issuer);

    constructor() {
        owner = msg.sender;
        issuers[msg.sender] = true;
        emit IssuerRegistered(msg.sender);
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender], "Only authorized issuers can perform this action");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action");
        _;
    }

    function registerIssuer(address _issuer) public onlyOwner {
        require(_issuer != address(0), "Invalid issuer address");
        require(!issuers[_issuer], "Issuer already registered");
        issuers[_issuer] = true;
        emit IssuerRegistered(_issuer);
    }

    function uploadFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        if (files[_fileHash].issuer != address(0)) {
            require(files[_fileHash].isDeleted, "File already uploaded and active");
        }

        files[_fileHash] = Credential({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            receiver: msg.sender,
            isDeleted: false,
            isRevoked: false,
            metadata: ""
        });

        userFiles[msg.sender].push(_fileHash);
        issuedFiles[msg.sender].push(_fileHash); // NEW: Track for issuer
        emit FileUploaded(_fileHash, block.timestamp, msg.sender);
    }

    function issueCredential(string memory _fileHash, address _receiver, string memory _metadata) public onlyIssuer {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(_receiver != address(0), "Invalid receiver address");
        require(bytes(_metadata).length > 0, "Metadata cannot be empty");
        if (files[_fileHash].issuer != address(0)) {
            require(files[_fileHash].isDeleted, "Credential already issued and active");
        }

        files[_fileHash] = Credential({
            fileHash: _fileHash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            receiver: _receiver,
            isDeleted: false,
            isRevoked: false,
            metadata: _metadata
        });

        userFiles[_receiver].push(_fileHash);
        issuedFiles[msg.sender].push(_fileHash); // NEW: Track for issuer
        emit CredentialIssued(_fileHash, block.timestamp, msg.sender, _receiver);
    }

    function deleteFile(string memory _fileHash) public {
        Credential storage credential = files[_fileHash];
        require(credential.receiver == msg.sender, "Only the receiver/owner can delete this file");
        require(!credential.isDeleted, "File already deleted");

        credential.isDeleted = true;

        string[] storage userFileList = userFiles[msg.sender];
        for (uint256 i = 0; i < userFileList.length; i++) {
            if (keccak256(abi.encodePacked(userFileList[i])) == keccak256(abi.encodePacked(_fileHash))) {
                userFileList[i] = userFileList[userFileList.length - 1];
                userFileList.pop();
                emit FileDeleted(_fileHash, msg.sender);
                return;
            }
        }
        revert("File not found in user files");
    }

    function revokeCredential(string memory _fileHash) public onlyIssuer {
        Credential storage credential = files[_fileHash];
        require(credential.issuer == msg.sender, "Only the issuer can revoke this credential");
        require(!credential.isRevoked, "Credential already revoked");
        require(!credential.isDeleted, "Credential already deleted");

        credential.isRevoked = true;
        emit CredentialRevoked(_fileHash, msg.sender);
    }

    function verifyCredential(string memory _fileHash) public view returns (bool isValid, address issuer, address receiver, string memory metadata) {
        Credential memory credential = files[_fileHash];
        bool exists = credential.issuer != address(0);
        isValid = exists && !credential.isDeleted && !credential.isRevoked;
        return (isValid, credential.issuer, credential.receiver, credential.metadata);
    }

    function getCredentialDetails(string memory _fileHash, bool includeMetadata) public view returns (
        string memory fileHash,
        address issuer,
        address receiver,
        uint256 timestamp,
        string memory metadata
    ) {
        Credential memory credential = files[_fileHash];
        require(credential.issuer != address(0), "File/Credential does not exist");
        require(!credential.isDeleted, "File/Credential has been deleted");

        fileHash = credential.fileHash;
        issuer = credential.issuer;
        receiver = credential.receiver;
        timestamp = credential.timestamp;
        metadata = (msg.sender == credential.receiver || includeMetadata) ? credential.metadata : "";
    }

    function getUserFiles(address _user) public view returns (string[] memory) {
        string[] memory allFiles = userFiles[_user];
        if (allFiles.length == 0) {
            return new string[](0);
        }

        uint256 activeCount = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            Credential memory cred = files[allFiles[i]];
            if (!cred.isDeleted && !cred.isRevoked) {
                activeCount++;
            }
        }

        string[] memory activeFiles = new string[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            Credential memory cred = files[allFiles[i]];
            if (!cred.isDeleted && !cred.isRevoked) {
                activeFiles[index] = allFiles[i];
                index++;
            }
        }
        return activeFiles;
    }

    // NEW: Get all credentials issued by an issuer
    function getIssuedCredentials(address _issuer) public view returns (string[] memory) {
        string[] memory allIssued = issuedFiles[_issuer];
        if (allIssued.length == 0) {
            return new string[](0);
        }

        uint256 activeCount = 0;
        for (uint256 i = 0; i < allIssued.length; i++) {
            Credential memory cred = files[allIssued[i]];
            if (!cred.isDeleted && !cred.isRevoked) {
                activeCount++;
            }
        }

        string[] memory activeIssued = new string[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allIssued.length; i++) {
            Credential memory cred = files[allIssued[i]];
            if (!cred.isDeleted && !cred.isRevoked) {
                activeIssued[index] = allIssued[i];
                index++;
            }
        }
        return activeIssued;
    }

    function getFileIssuer(string memory _fileHash) public view returns (address) {
        Credential memory credential = files[_fileHash];
        require(!credential.isDeleted, "File/Credential has been deleted");
        require(!credential.isRevoked, "Credential has been revoked");
        return credential.issuer;
    }

    function getFileTimestamp(string memory _fileHash) public view returns (uint256) {
        Credential memory credential = files[_fileHash];
        require(!credential.isDeleted, "File/Credential has been deleted");
        require(!credential.isRevoked, "Credential has been revoked");
        return credential.timestamp;
    }

    function getFileCount() public view returns (uint256) {
        string[] memory allFiles = userFiles[msg.sender];
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            Credential memory cred = files[allFiles[i]];
            if (!cred.isDeleted && !cred.isRevoked) {
                activeCount++;
            }
        }
        return activeCount;
    }

    function fileExists(string memory _fileHash) public view returns (bool) {
        Credential memory credential = files[_fileHash];
        return credential.issuer != address(0) && !credential.isDeleted && !credential.isRevoked;
    }
<<<<<<< HEAD
}


=======
}
>>>>>>> f61bc096d630e67ae055d42d941a56747ebfa450
