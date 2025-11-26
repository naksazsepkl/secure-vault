// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint32, ebool, eaddress, externalEuint8, externalEuint32, externalEbool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SecureVault — FHE-encrypted on-chain identity attributes and checks
/// @notice Stores encrypted identity attributes per user and evaluates permissions fully homomorphically
contract SecureVault is ZamaEthereumConfig {
    struct IdentityData {
        euint8 age;        // encrypted age (0-255)
        euint8 region;     // encrypted region code (e.g., 1:AS, 2:EU, ...)
        ebool kycPassed;   // encrypted KYC boolean
    }

    struct Permissions {
        ebool permissionA; // isAdult && kycPassed
        ebool permissionB; // isInRegion
    }

    mapping(address => IdentityData) private _userData;
    mapping(address => bool) public hasStoredData;
    mapping(address => Permissions) private _lastPermissions;

    /// @notice Store encrypted attributes. Values come from Relayer handles.
    /// @dev Uses FHE.fromExternal to import ciphertexts and sets ACL for caller and contract.
    function storeIdentityData(
        externalEuint8 ageHandle,
        externalEuint8 regionHandle,
        externalEbool kycHandle,
        bytes calldata inputProof
    ) public {
        euint8 _age = FHE.fromExternal(ageHandle, inputProof);
        euint8 _region = FHE.fromExternal(regionHandle, inputProof);
        ebool _kyc = FHE.fromExternal(kycHandle, inputProof);

        _userData[msg.sender] = IdentityData({age: _age, region: _region, kycPassed: _kyc});
        hasStoredData[msg.sender] = true;

        // Allow both this contract and the user to decrypt their own fields later.
        FHE.allowThis(_userData[msg.sender].age);
        FHE.allowThis(_userData[msg.sender].region);
        FHE.allowThis(_userData[msg.sender].kycPassed);
        FHE.allow(_userData[msg.sender].age, msg.sender);
        FHE.allow(_userData[msg.sender].region, msg.sender);
        FHE.allow(_userData[msg.sender].kycPassed, msg.sender);
    }

    /// @notice Update encrypted attributes. Same as store but overwrites.
    function updateIdentityData(
        externalEuint8 ageHandle,
        externalEuint8 regionHandle,
        externalEbool kycHandle,
        bytes calldata inputProof
    ) external {
        storeIdentityData(ageHandle, regionHandle, kycHandle, inputProof);
    }

    /// @notice Returns encrypted handles for user's attributes so frontends can decrypt client-side
    function getMyIdentityData() external view returns (euint8, euint8, ebool) {
        IdentityData storage d = _userData[msg.sender];
        return (d.age, d.region, d.kycPassed);
    }

    /// @notice Public view: get encrypted boolean for "is adult (>=18)"
    function isAdultEncrypted(address user) external returns (ebool) {
        IdentityData storage d = _userData[user];
        euint8 eighteen = FHE.asEuint8(18);
        // d.age >= 18
        return FHE.ge(d.age, eighteen);
    }

    /// @notice Public view: get encrypted boolean for region equality
    function isInRegionEncrypted(address user, externalEuint8 regionHandle, bytes calldata proof) external returns (ebool) {
        euint8 region = FHE.fromExternal(regionHandle, proof);
        IdentityData storage d = _userData[user];
        return FHE.eq(d.region, region);
    }

    /// @notice Public view: get encrypted boolean for KYC status
    function isKycVerifiedEncrypted(address user) external view returns (ebool) {
        return _userData[user].kycPassed;
    }

    /// @notice Compute encrypted access permissions according to requirement:
    /// - Permission_A: isAdult && kycPassed
    /// - Permission_B: isInRegion(ALLOWED_REGION)
    function computeAccessPermissionsEnc(address user, externalEuint8 allowedRegionHandle, bytes calldata proof)
        public
        returns (ebool permissionA, ebool permissionB)
    {
        IdentityData storage d = _userData[user];
        ebool isAdult = FHE.ge(d.age, FHE.asEuint8(18));
        ebool isVerified = d.kycPassed;
        euint8 allowedRegion = FHE.fromExternal(allowedRegionHandle, proof);
        ebool isInRegion = FHE.eq(d.region, allowedRegion);

        permissionA = FHE.and(isAdult, isVerified);
        permissionB = isInRegion;

        // Grant decrypt rights of the computed permissions to the requesting user
        FHE.allow(permissionA, user);
        FHE.allow(permissionB, user);
    }

    /// @notice State-changing: compute and persist encrypted permissions for msg.sender, and grant decrypt rights to msg.sender
    function calculateAccessPermissionsEnc(externalEuint8 allowedRegionHandle, bytes calldata proof) external {
        IdentityData storage d = _userData[msg.sender];
        require(hasStoredData[msg.sender], "NO_DATA");

        ebool isAdult = FHE.ge(d.age, FHE.asEuint8(18));
        ebool isVerified = d.kycPassed;
        euint8 allowedRegion = FHE.fromExternal(allowedRegionHandle, proof);
        ebool isInRegion = FHE.eq(d.region, allowedRegion);

        _lastPermissions[msg.sender].permissionA = FHE.and(isAdult, isVerified);
        _lastPermissions[msg.sender].permissionB = isInRegion;

        // allow contract and user for stored permissions
        FHE.allowThis(_lastPermissions[msg.sender].permissionA);
        FHE.allowThis(_lastPermissions[msg.sender].permissionB);
        FHE.allow(_lastPermissions[msg.sender].permissionA, msg.sender);
        FHE.allow(_lastPermissions[msg.sender].permissionB, msg.sender);
    }

    /// @notice Read last computed encrypted permissions for msg.sender
    function getMyLastPermissionsEnc() external view returns (ebool permissionA, ebool permissionB) {
        Permissions storage p = _lastPermissions[msg.sender];
        return (p.permissionA, p.permissionB);
    }

    // Note: On-chain decryption is not available. Frontends should decrypt client-side
    // using the re-encryption flow with FHEVM. Use `computeAccessPermissionsEnc` instead.
}
