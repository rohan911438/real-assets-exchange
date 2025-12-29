// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ComplianceRegistry
 * @dev Central registry for KYC/AML compliance verification
 */
contract ComplianceRegistry is AccessControl, Pausable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    enum VerificationLevel {
        None,
        Basic,
        Accredited,
        Institutional
    }
    
    struct ComplianceData {
        bool isVerified;
        VerificationLevel level;
        string jurisdiction;
        uint256 verificationTimestamp;
        uint256 expiryTimestamp;
    }
    
    // Mapping from address to compliance data
    mapping(address => ComplianceData) public complianceData;
    
    // ZK proof support: merkle root of verified addresses
    bytes32 public verifiedAddressesMerkleRoot;
    
    // Events
    event AddressVerified(
        address indexed user,
        VerificationLevel level,
        string jurisdiction
    );
    event VerificationRevoked(address indexed user);
    event MerkleRootUpdated(bytes32 newRoot);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Verify an address with KYC data
     */
    function verifyAddress(
        address user,
        VerificationLevel level,
        string memory jurisdiction,
        uint256 validityPeriod
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(user != address(0), "Invalid address");
        require(level != VerificationLevel.None, "Invalid level");
        
        complianceData[user] = ComplianceData({
            isVerified: true,
            level: level,
            jurisdiction: jurisdiction,
            verificationTimestamp: block.timestamp,
            expiryTimestamp: block.timestamp + validityPeriod
        });
        
        emit AddressVerified(user, level, jurisdiction);
    }
    
    /**
     * @dev Revoke verification for an address
     */
    function revokeVerification(address user) 
        external 
        onlyRole(VERIFIER_ROLE) 
    {
        delete complianceData[user];
        emit VerificationRevoked(user);
    }
    
    /**
     * @dev Check if address is verified and not expired
     */
    function isVerified(address user) public view returns (bool) {
        ComplianceData memory data = complianceData[user];
        return data.isVerified && block.timestamp < data.expiryTimestamp;
    }
    
    /**
     * @dev Check if address meets minimum verification level
     */
    function meetsRequirement(
        address user,
        VerificationLevel requiredLevel
    ) public view returns (bool) {
        if (!isVerified(user)) return false;
        return complianceData[user].level >= requiredLevel;
    }
    
    /**
     * @dev Check compliance for trading specific asset type
     */
    function checkCompliance(
        address user,
        string memory assetJurisdiction,
        bool requiresAccredited
    ) external view returns (bool) {
        if (!isVerified(user)) return false;
        
        ComplianceData memory data = complianceData[user];
        
        // Check jurisdiction match (simplified - could be more complex)
        bool jurisdictionMatch = keccak256(bytes(data.jurisdiction)) == 
                                keccak256(bytes(assetJurisdiction)) ||
                                keccak256(bytes(data.jurisdiction)) == 
                                keccak256(bytes("GLOBAL"));
        
        // Check accreditation requirement
        bool accreditationMet = !requiresAccredited || 
                               data.level >= VerificationLevel.Accredited;
        
        return jurisdictionMatch && accreditationMet;
    }
    
    /**
     * @dev Update merkle root for ZK proof verification
     */
    function updateMerkleRoot(bytes32 newRoot) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        verifiedAddressesMerkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }
    
    /**
     * @dev Verify ZK proof that user is in whitelist
     */
    function verifyZKProof(
        bytes32[] memory proof,
        bytes32 leaf
    ) external view returns (bool) {
        return verifyMerkleProof(proof, verifiedAddressesMerkleRoot, leaf);
    }
    
    /**
     * @dev Internal merkle proof verification
     */
    function verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash <= proofElement) {
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }
        }
        
        return computedHash == root;
    }
    
    // Admin functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}