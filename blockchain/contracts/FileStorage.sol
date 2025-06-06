// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct Credential {
        string fileHash;         // IPFS hash of the file
        uint256 timestamp;       // Issuance or upload timestamp
        address issuer;          // Who issued the VC or uploaded the file
        address receiver;        // Who received the VC or uploaded the file
        bool isDeleted;          // Marked as deleted
        mapping(string => bool) revokedFields; // Tracks revoked fields
        string[] revokedFieldKeys;             // Explicit list of revoked field keys
        bool isFullyRevoked;     // Full revocation status
        string metadata;         // JSON string for VC details
        string mandatoryFields;  // JSON string of mandatory field keys
    }

    struct SharedAccess {
        string fileHash;
        address recipient;
        uint256 expiration;
        string[] allowedFields;
    }

    mapping(string => Credential) private files;
    mapping(address => string[]) private userFiles;
    mapping(address => string[]) private issuedFiles;
    mapping(address => SharedAccess[]) private sharedWith;  // Tracks credentials shared with a user
    mapping(address => mapping(string => SharedAccess)) private sharedAccess;  // Owner -> FileHash -> SharedAccess
    mapping(address => bool) private issuers;
    mapping(address => SharedAccess[]) private sharedByOwner;
    address public owner;

    event FileUploaded(string fileHash, uint256 timestamp, address indexed owner);
    event FileDeleted(string fileHash, address indexed owner);
    event CredentialIssued(string fileHash, uint256 timestamp, address indexed issuer, address indexed receiver);
    event CredentialFieldRevoked(string oldFileHash, string newFileHash, string field, address indexed issuer);
    event CredentialFullyRevoked(string fileHash, address indexed issuer);
    event IssuerRegistered(address indexed issuer);
    event CredentialShared(string fileHash, address indexed owner, address indexed recipient, uint256 expiration);
    event SharedAccessRevoked(string fileHash, address indexed owner, address indexed recipient);

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

    function shareCredential(
        string memory _fileHash,
        address _recipient,
        string[] memory _fieldsToShare,
        uint256 _durationSeconds
    ) public {
        Credential storage cred = files[_fileHash];
        require(cred.receiver == msg.sender, "Only credential owner can share");
        require(!cred.isDeleted, "Credential deleted");
        require(!cred.isFullyRevoked, "Credential revoked");
        require(_recipient != address(0), "Invalid recipient");
        require(_durationSeconds > 0, "Invalid duration");

        // Validate shared fields
        for (uint i = 0; i < _fieldsToShare.length; i++) {
            require(!cred.revokedFields[_fieldsToShare[i]], "Cannot share revoked field");
        }

        SharedAccess memory newShare = SharedAccess({
            fileHash: _fileHash,
            recipient: _recipient,
            expiration: block.timestamp + _durationSeconds,
            allowedFields: _fieldsToShare
        });

        sharedWith[_recipient].push(newShare);
        sharedAccess[msg.sender][_fileHash] = newShare;
        sharedByOwner[msg.sender].push(newShare);
        emit CredentialShared(_fileHash, msg.sender, _recipient, newShare.expiration);
    }

    function getSharedByOwner() public view returns (SharedAccess[] memory) {
        return sharedByOwner[msg.sender];
    }

    function revokeSharedAccess(string memory _fileHash, address _recipient) public {
        // Only the credential owner (receiver) can revoke shared access
        Credential storage cred = files[_fileHash];
        require(cred.receiver == msg.sender, "Only credential owner can revoke shared access");

        SharedAccess[] storage shares = sharedWith[_recipient];
        bool found = false;
        for (uint i = 0; i < shares.length; i++) {
            if (keccak256(abi.encodePacked(shares[i].fileHash)) == keccak256(abi.encodePacked(_fileHash)) &&
                shares[i].expiration > block.timestamp) {
                // Remove this shared access entry
                shares[i] = shares[shares.length - 1];
                shares.pop();
                found = true;
                emit SharedAccessRevoked(_fileHash, msg.sender, _recipient);
                break;
            }
        }
        require(found, "Shared access not found");
    }


    // Modified: Allow multiple users to upload the same fileHash
    function uploadFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "Invalid file hash");

        // No restriction on existing fileHash; each upload is unique per user
        Credential storage newFile = files[_fileHash];
        newFile.fileHash = _fileHash;
        newFile.timestamp = block.timestamp;
        newFile.issuer = msg.sender;
        newFile.receiver = msg.sender;
        newFile.isDeleted = false;
        newFile.isFullyRevoked = false;
        newFile.metadata = "";
        newFile.mandatoryFields = "";

        userFiles[msg.sender].push(_fileHash);
        issuedFiles[msg.sender].push(_fileHash);
        emit FileUploaded(_fileHash, block.timestamp, msg.sender);
    }

    // Modified: Issue credential with mandatory fields
    function issueCredential(string memory _fileHash, address _receiver, string memory _metadata, string memory _mandatoryFields) public onlyIssuer {
        require(bytes(_fileHash).length > 0, "Invalid file hash");
        require(_receiver != address(0), "Invalid receiver address");
        require(bytes(_metadata).length > 0, "Metadata cannot be empty");
        require(bytes(_mandatoryFields).length > 0, "Mandatory fields cannot be empty");

        Credential storage newCred = files[_fileHash];
        newCred.fileHash = _fileHash;
        newCred.timestamp = block.timestamp;
        newCred.issuer = msg.sender;
        newCred.receiver = _receiver;
        newCred.isDeleted = false;
        newCred.isFullyRevoked = false;
        newCred.metadata = _metadata;
        newCred.mandatoryFields = _mandatoryFields;

        userFiles[_receiver].push(_fileHash);
        issuedFiles[msg.sender].push(_fileHash);
        emit CredentialIssued(_fileHash, block.timestamp, msg.sender, _receiver);
    }

    function deleteFile(string memory _fileHash) public {
        Credential storage credential = files[_fileHash];
        require(credential.receiver == msg.sender, "Only the receiver/owner can delete this file");
        require(!credential.isDeleted, "File already deleted");

        credential.isDeleted = true;

        // Clean up shared accesses
        SharedAccess[] storage shares = sharedWith[msg.sender];
        for (uint i = shares.length; i > 0; i--) {
            if (keccak256(abi.encodePacked(shares[i-1].fileHash)) == keccak256(abi.encodePacked(_fileHash))) {
                if (i-1 != shares.length - 1) {
                    shares[i-1] = shares[shares.length - 1];
                }
                shares.pop();
            }
        }

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

    // New function: Get shared credentials for current user
    function getSharedCredentials() public view returns (SharedAccess[] memory validShares) {
        SharedAccess[] storage allShares = sharedWith[msg.sender];
        uint validCount = 0;
        
        // First pass to count valid shares
        for (uint i = 0; i < allShares.length; i++) {
            if (allShares[i].expiration > block.timestamp && 
                !files[allShares[i].fileHash].isDeleted &&
                !files[allShares[i].fileHash].isFullyRevoked) {
                validCount++;
            }
        }

        // Second pass to collect valid shares
        validShares = new SharedAccess[](validCount);
        uint index = 0;
        for (uint i = 0; i < allShares.length; i++) {
            if (allShares[i].expiration > block.timestamp && 
                !files[allShares[i].fileHash].isDeleted &&
                !files[allShares[i].fileHash].isFullyRevoked) {
                validShares[index] = allShares[i];
                index++;
            }
        }
        return validShares;
    }


    // NEW: Revoke specific field in metadata
    function revokeCredentialField(string memory _oldFileHash, string memory _newFileHash, string memory _field, string memory _updatedMetadata) public onlyIssuer {
        Credential storage credential = files[_oldFileHash];
        require(credential.issuer == msg.sender, "Only the issuer can revoke this credential");
        require(!credential.isDeleted, "Credential already deleted");
        require(!credential.isFullyRevoked, "Credential already fully revoked");
        require(!credential.revokedFields[_field], "Field already revoked");
        require(bytes(_newFileHash).length > 0, "Invalid new file hash");
        require(bytes(_updatedMetadata).length > 0, "Updated metadata cannot be empty");

        // Update credential with new fileHash and metadata
        Credential storage newCred = files[_newFileHash];
        newCred.fileHash = _newFileHash;
        newCred.timestamp = block.timestamp; // Update timestamp
        newCred.issuer = credential.issuer;
        newCred.receiver = credential.receiver;
        newCred.isDeleted = false;
        newCred.isFullyRevoked = false;
        newCred.metadata = _updatedMetadata;
        newCred.mandatoryFields = credential.mandatoryFields;

        // Copy revoked fields
        for (uint256 i = 0; i < credential.revokedFieldKeys.length; i++) {
            newCred.revokedFields[credential.revokedFieldKeys[i]] = true;
            newCred.revokedFieldKeys.push(credential.revokedFieldKeys[i]);
        }
        newCred.revokedFields[_field] = true;
        newCred.revokedFieldKeys.push(_field);

        // Update mappings
        userFiles[credential.receiver].push(_newFileHash);
        issuedFiles[msg.sender].push(_newFileHash);

        // Clean up old credential
        delete files[_oldFileHash];
        removeFromArray(userFiles[credential.receiver], _oldFileHash);
        removeFromArray(issuedFiles[msg.sender], _oldFileHash);

        emit CredentialFieldRevoked(_oldFileHash, _newFileHash, _field, msg.sender);
    }

    function revokeCredential(string memory _fileHash) public onlyIssuer {
        Credential storage credential = files[_fileHash];
        require(credential.issuer == msg.sender, "Only the issuer can revoke this credential");
        require(!credential.isFullyRevoked, "Credential already revoked");
        require(!credential.isDeleted, "Credential already deleted");

        credential.isFullyRevoked = true;
        emit CredentialFullyRevoked(_fileHash, msg.sender);
    }

    // NEW: Helper function to remove from array
    function removeFromArray(string[] storage array, string memory value) private {
        for (uint256 i = 0; i < array.length; i++) {
            if (keccak256(abi.encodePacked(array[i])) == keccak256(abi.encodePacked(value))) {
                if (i != array.length - 1) {
                    array[i] = array[array.length - 1];
                }
                array.pop();
                return;
            }
        }
        // If not found, do nothing (optional: revert if critical)
    }

    function getMandatoryFields(string memory _fileHash) public view returns (string memory) {
        Credential storage credential = files[_fileHash];
        require(credential.issuer != address(0), "File/Credential does not exist");
        require(!credential.isDeleted, "File/Credential has been deleted");
        return credential.mandatoryFields;
    }

    function getRevokedFields(string memory _fileHash) public view returns (string[] memory) {
        Credential storage credential = files[_fileHash];
        require(credential.issuer != address(0), "File/Credential does not exist");
        require(!credential.isDeleted, "File/Credential has been deleted");
        return credential.revokedFieldKeys;
    }

    function verifyCredential(string memory _fileHash) public view returns (bool isValid, address issuer, address receiver, string memory metadata) {
        Credential storage credential = files[_fileHash];
        bool exists = credential.issuer != address(0);
        isValid = exists && !credential.isDeleted && !credential.isFullyRevoked;
        return (isValid, credential.issuer, credential.receiver, credential.metadata);
    }

    // Modified: Selective disclosure with mandatory fields
    function getCredentialDetails(string memory _fileHash, string[] memory _fieldsToShare) public view returns (
        string memory fileHash,
        address issuer,
        address receiver,
        uint256 timestamp,
        string memory sharedMetadata
    ) {
        Credential storage credential = files[_fileHash];
        require(credential.issuer != address(0), "Credential does not exist");
        require(!credential.isDeleted, "Credential deleted");
        require(!credential.isFullyRevoked, "Credential revoked");

        // Modified access control logic
        bool isAuthorized = msg.sender == credential.issuer || 
                        msg.sender == credential.receiver;
        
        if (!isAuthorized) {
            // Shared access check for third parties
            bool hasValidAccess = false;
            string[] memory allowedFields;
            SharedAccess[] storage shares = sharedWith[msg.sender];
            
            for (uint i = 0; i < shares.length; i++) {
                if (keccak256(abi.encodePacked(shares[i].fileHash)) == 
                keccak256(abi.encodePacked(_fileHash)) &&
                shares[i].expiration > block.timestamp) {
                    hasValidAccess = true;
                    allowedFields = shares[i].allowedFields;
                    break;
                }
            }
            require(hasValidAccess, "No valid access rights");
            _fieldsToShare = allowedFields;
        }

        // Rest of the function remains unchanged
        fileHash = credential.fileHash;
        issuer = credential.issuer;
        receiver = credential.receiver;
        timestamp = credential.timestamp;

        bytes memory result = bytes("{");
        bool first = true;
        for (uint256 i = 0; i < _fieldsToShare.length; i++) {
            if (!credential.revokedFields[_fieldsToShare[i]]) {
                if (!first) result = abi.encodePacked(result, ",");
                result = abi.encodePacked(result, '"', _fieldsToShare[i], '":"value"');
                first = false;
            }
        }
        result = abi.encodePacked(result, "}");
        sharedMetadata = string(result);
    }


    function getUserFiles(address _user) public view returns (string[] memory) {
        string[] memory allFiles = userFiles[_user];
        if (allFiles.length == 0) {
            return new string[](0);
        }

        uint256 activeCount = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            Credential storage cred = files[allFiles[i]];
            if (!cred.isDeleted && !cred.isFullyRevoked) {
                activeCount++;
            }
        }

        string[] memory activeFiles = new string[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            Credential storage cred = files[allFiles[i]];
            if (!cred.isDeleted && !cred.isFullyRevoked) {
                activeFiles[index] = allFiles[i];
                index++;
            }
        }
        return activeFiles;
    }

    function getIssuedCredentials(address _issuer) public view returns (string[] memory) {
        string[] memory allIssued = issuedFiles[_issuer];
        if (allIssued.length == 0) {
            return new string[](0);
        }

        uint256 activeCount = 0;
        for (uint256 i = 0; i < allIssued.length; i++) {
            Credential storage cred = files[allIssued[i]];
            if (!cred.isDeleted && !cred.isFullyRevoked) {
                activeCount++;
            }
        }

        string[] memory activeIssued = new string[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allIssued.length; i++) {
            Credential storage cred = files[allIssued[i]];
            if (!cred.isDeleted && !cred.isFullyRevoked) {
                activeIssued[index] = allIssued[i];
                index++;
            }
        }
        return activeIssued;
    }

    function getFileIssuer(string memory _fileHash) public view returns (address) {
        Credential storage credential = files[_fileHash];
        require(!credential.isDeleted, "File/Credential has been deleted");
        require(!credential.isFullyRevoked, "Credential has been revoked");
        return credential.issuer;
    }

    function getFileTimestamp(string memory _fileHash) public view returns (uint256) {
        Credential storage credential = files[_fileHash];
        require(!credential.isDeleted, "File/Credential has been deleted");
        require(!credential.isFullyRevoked, "Credential has been revoked");
        return credential.timestamp;
    }

    function getFileCount() public view returns (uint256) {
        string[] memory allFiles = userFiles[msg.sender];
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allFiles.length; i++) {
            Credential storage cred = files[allFiles[i]];
            if (!cred.isDeleted && !cred.isFullyRevoked) {
                activeCount++;
            }
        }
        return activeCount;
    }

    function fileExists(string memory _fileHash) public view returns (bool) {
        Credential storage credential = files[_fileHash];
        return credential.issuer != address(0) && !credential.isDeleted && !credential.isFullyRevoked;
    }
}