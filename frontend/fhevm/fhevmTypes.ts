import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";
import type { FhevmInstanceConfig } from "@zama-fhe/relayer-sdk/web";
import type { HandleContractPair } from "@zama-fhe/relayer-sdk/bundle";

declare global {
  interface Window {
    relayerSDK?: {
      createInstance: (config: any, provider: any) => Promise<FhevmInstance>;
      createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: number, durationDays: number) => any;
      generateKeypair: () => { publicKey: string; privateKey: string };
      initSDK: (params?: any) => Promise<any>;
      SepoliaConfig?: any;
      [key: string]: any;
    };
    RelayerSDKBundle?: {
      getZamaEthereumConfig: (chainId: number) => Promise<any>;
      getMetadata: (config: any) => Promise<any>;
      createInstance: (config: any, provider: any) => Promise<FhevmInstance>;
      UserDecryptResults: any;
    };
  }
}

export type UserDecryptResults = any;
export type DecryptedResults = UserDecryptResults;

export type { FhevmInstance, FhevmInstanceConfig, HandleContractPair };

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number; // Unix timestamp in seconds
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};
