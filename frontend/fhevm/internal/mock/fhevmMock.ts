import { ethers } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import type { FhevmInstance } from "../../fhevmTypes";
import { SDK_CDN_URL } from "../constants";

export type CreateFhevmInstanceMockParameters = {
  signal: AbortSignal;
  provider: ethers.Provider;
  chainId: number;
  mockChains?: Record<number, string>;
  onStatusChange?: (status: string) => void;
};

export async function createFhevmInstanceMock(
  parameters: CreateFhevmInstanceMockParameters
): Promise<FhevmInstance> {
  const { signal, provider, chainId, onStatusChange } = parameters;

  if (signal.aborted) {
    throw new Error("Aborted");
  }

  onStatusChange?.("Loading Relayer SDK for mock...");

  const sdk = await loadRelayerSDK(signal);
  if (signal.aborted) {
    throw new Error("Aborted");
  }

  onStatusChange?.("Initializing SDK...");

  if (sdk.initSDK) {
    try {
      await sdk.initSDK();
    } catch (e) {
      // initSDK might fail if already initialized, ignore the error
    }
  }

  onStatusChange?.("Fetching metadata...");

  let config;
  if (sdk.getZamaEthereumConfig) {
    config = await sdk.getZamaEthereumConfig(chainId);
  } else if (sdk.SepoliaConfig) {
    config = sdk.SepoliaConfig;
  } else {
    throw new Error(`Unable to get configuration for chain ID: ${chainId}. Please ensure SDK is properly loaded.`);
  }

  // Ensure config has all required fields for mock mode
  if (!config.aclContractAddress && !config.ACLAddress) {
    throw new Error("Configuration missing ACL contract address");
  }
  if (!config.inputVerifierContractAddress && !config.verifyingContractAddressInputVerification) {
    throw new Error("Configuration missing InputVerifier contract address");
  }
  if (!config.kmsContractAddress && !config.kmsVerifierContractAddress) {
    throw new Error("Configuration missing KMS contract address");
  }

  onStatusChange?.("Creating MockFhevmInstance...");

  try {
    const instance = await MockFhevmInstance.create(
      provider as any,
      provider as any,
      config,
      {
        inputVerifierProperties: {},
        kmsVerifierProperties: {},
      }
    );
    onStatusChange?.("Mock FHEVM ready");
    return instance as unknown as FhevmInstance;
  } catch (error: any) {
    // If getCoprocessorSigners fails, it might be because the contract doesn't have that method
    // or the contract address is incorrect. Provide a more helpful error message.
    if (error?.message?.includes("getCoprocessorSigners") || error?.message?.includes("could not decode")) {
      throw new Error(
        `Failed to initialize MockFhevmInstance: Contract query failed. ` +
        `Please ensure all FHEVM contracts (ACL, InputVerifier, KMS) are deployed on chain ${chainId}. ` +
        `Original error: ${error.message}`
      );
    }
    throw error;
  }

}

async function loadRelayerSDK(signal: AbortSignal): Promise<any> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("Aborted"));
      return;
    }

    const getSDK = () => {
      return (window as any).relayerSDK || (window as any).RelayerSDKBundle;
    };

    if (getSDK()) {
      resolve(getSDK());
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = SDK_CDN_URL;
    script.async = true;

    let checkAttempts = 0;
    const maxAttempts = 50;
    const checkInterval = 100;

    const checkForSDK = () => {
      if (signal.aborted) {
        reject(new Error("Aborted"));
        return;
      }

      const sdk = getSDK();
      if (sdk) {
        resolve(sdk);
        return;
      }

      checkAttempts++;
      if (checkAttempts >= maxAttempts) {
        reject(new Error(
          `Relayer SDK not found after script load. ` +
          `Expected window.relayerSDK or window.RelayerSDKBundle. ` +
          `Please check if the CDN URL is accessible: ${SDK_CDN_URL}`
        ));
        return;
      }

      setTimeout(checkForSDK, checkInterval);
    };

    script.onload = () => {
      setTimeout(checkForSDK, checkInterval);
    };

    script.onerror = () => {
      reject(new Error(
        `Failed to load Relayer SDK from ${SDK_CDN_URL}. ` +
        `Please check your network connection and CDN accessibility.`
      ));
    };

    const existingScript = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
    if (existingScript) {
      setTimeout(checkForSDK, checkInterval);
      return;
    }

    document.head.appendChild(script);
  });
}

