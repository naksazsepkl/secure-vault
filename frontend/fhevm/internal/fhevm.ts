import { ethers } from "ethers";
import type { FhevmInstance } from "../fhevmTypes";
import { SDK_CDN_URL } from "./constants";
import { createFhevmInstanceMock } from "./mock/fhevmMock";

export type CreateFhevmInstanceParameters = {
  signal: AbortSignal;
  provider: string | ethers.Eip1193Provider;
  mockChains?: Record<number, string>;
  onStatusChange?: (status: string) => void;
};

export async function createFhevmInstance(
  parameters: CreateFhevmInstanceParameters
): Promise<FhevmInstance> {
  const { signal, provider, mockChains, onStatusChange } = parameters;

  if (signal.aborted) {
    throw new Error("Aborted");
  }

  const ethersProvider =
    typeof provider === "string"
      ? new ethers.JsonRpcProvider(provider)
      : new ethers.BrowserProvider(provider);

  const network = await ethersProvider.getNetwork();
  const chainId = Number(network.chainId);

  onStatusChange?.("Checking chain...");

  const isMockChain = chainId === 31337 || (mockChains && chainId in mockChains);

  if (isMockChain) {
    onStatusChange?.("Initializing mock FHEVM...");
    return await createFhevmInstanceMock({
      signal,
      provider: ethersProvider,
      chainId,
      mockChains,
      onStatusChange,
    });
  }

  onStatusChange?.("Loading Relayer SDK...");

  if (typeof window === "undefined") {
    throw new Error("FHEVM requires browser environment");
  }

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

  onStatusChange?.("Fetching configuration...");

  const { createInstance } = sdk;
  
  let config;
  if (sdk.getZamaEthereumConfig) {
    config = await sdk.getZamaEthereumConfig(chainId);
  } else if (sdk.SepoliaConfig && chainId === 11155111) {
    config = sdk.SepoliaConfig;
  } else {
    throw new Error(`Unsupported chain ID: ${chainId}. Please use Sepolia (11155111) or ensure SDK is properly initialized.`);
  }

  onStatusChange?.("Creating FHEVM instance...");

  try {
    const instance = await createInstance(config, ethersProvider);
    return instance;
  } catch (error: any) {
    if (error?.message?.includes("relayer url") || error?.message?.includes("public key")) {
      throw new Error(
        `Failed to initialize FHEVM: Relayer configuration error. ` +
        `Please ensure you are using the correct network (Sepolia for production, localhost for mock). ` +
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

