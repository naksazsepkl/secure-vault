
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const SecureVaultABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ZamaProtocolUnsupported",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint8",
          "name": "allowedRegionHandle",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "calculateAccessPermissionsEnc",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "externalEuint8",
          "name": "allowedRegionHandle",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "computeAccessPermissionsEnc",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "permissionA",
          "type": "bytes32"
        },
        {
          "internalType": "ebool",
          "name": "permissionB",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "confidentialProtocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyIdentityData",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyLastPermissionsEnc",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "permissionA",
          "type": "bytes32"
        },
        {
          "internalType": "ebool",
          "name": "permissionB",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasStoredData",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "isAdultEncrypted",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "externalEuint8",
          "name": "regionHandle",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "isInRegionEncrypted",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "isKycVerifiedEncrypted",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint8",
          "name": "ageHandle",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "regionHandle",
          "type": "bytes32"
        },
        {
          "internalType": "externalEbool",
          "name": "kycHandle",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "storeIdentityData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint8",
          "name": "ageHandle",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "regionHandle",
          "type": "bytes32"
        },
        {
          "internalType": "externalEbool",
          "name": "kycHandle",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "updateIdentityData",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

