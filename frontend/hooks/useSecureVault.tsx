"use client";

// SecureVault hook for contract interactions
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringInMemoryStorage } from "@/fhevm/GenericStringStorage";
import { SecureVaultAddresses } from "@/abi/SecureVaultAddresses";
import { SecureVaultABI } from "@/abi/SecureVaultABI";

export type ClearBoolType = {
  handle: string;
  clear: boolean;
};

type SecureVaultInfoType = {
  abi: typeof SecureVaultABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getSecureVaultByChainId(chainId: number | undefined): SecureVaultInfoType {
  if (!chainId) {
    return { abi: SecureVaultABI.abi } as any;
  }
  const entry =
    (SecureVaultAddresses as any)[chainId.toString() as keyof typeof SecureVaultAddresses];
  // Guard against undefined or malformed mapping entries
  if (!entry || (entry as any).address === undefined || (entry as any).address === null || (entry as any).address === ethers.ZeroAddress) {
    return { abi: SecureVaultABI.abi, chainId } as any;
  }
  return {
    address: (entry as any).address as `0x${string}` | undefined,
    chainId: (entry as any).chainId ?? chainId,
    chainName: (entry as any).chainName,
    abi: SecureVaultABI.abi,
  } as any;
}

export const useSecureVault = (parameters: {
  instance: FhevmInstance | undefined;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
}) => {
  const { instance, chainId, ethersSigner, ethersReadonlyProvider } = parameters;

  const [identityDataHandles, setHandles] = useState<{
    age?: string;
    region?: string;
    kyc?: string;
  }>({});
  const [dec, setDec] = useState<{
    isAdult?: ClearBoolType;
    isKyc?: ClearBoolType;
    isRegion?: ClearBoolType;
  }>({});
  const [message, setMessage] = useState<string>("");
  const isRunningRef = useRef<boolean>(false);
  const storage = useMemo(() => new GenericStringInMemoryStorage(), []);

  const info = useMemo(() => getSecureVaultByChainId(chainId), [chainId]);

  const contractReadonly = useMemo(() => {
    if (!info.address || !ethersReadonlyProvider) return undefined;
    return new ethers.Contract(info.address, info.abi, ethersReadonlyProvider);
  }, [info.address, info.abi, ethersReadonlyProvider]);

  const contractWrite = useMemo(() => {
    if (!info.address || !ethersSigner) return undefined;
    return new ethers.Contract(info.address, info.abi, ethersSigner);
  }, [info.address, info.abi, ethersSigner]);

  const refreshMyIdentityData = useCallback(async () => {
    const c = contractWrite ?? contractReadonly;
    if (!c) return;
    const res = await c.getMyIdentityData();
    setHandles({ age: res[0], region: res[1], kyc: res[2] });
  }, [contractReadonly, contractWrite]);

  const verifyAccess = useCallback(
    async (allowedRegion: number) => {
      if (isRunningRef.current) return;
      const c = contractWrite ?? contractReadonly;
      if (!instance || !c || !ethersSigner) return;
      if (!contractWrite) {
        setMessage("Please connect your wallet to compute permissions");
        return;
      }
      if (!identityDataHandles.age || !identityDataHandles.region || !identityDataHandles.kyc) {
        setMessage("Please store your identity data first before verifying access");
        return;
      }
      isRunningRef.current = true;
      try {
        const userAddress = await ethersSigner.getAddress();
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [c.target.toString()],
          ethersSigner,
          storage
        );
        if (!sig) {
          setMessage("Unable to generate decryption signature. Please try again");
          return;
        }

        // Construct encrypted input and send transaction to compute and authorize on-chain
        const input = instance.createEncryptedInput(
          c.target.toString(),
          userAddress
        );
        input.add8(allowedRegion);
        const enc = await input.encrypt();

        const tx = await (contractWrite as any).calculateAccessPermissionsEnc(
          enc.handles[0],
          enc.inputProof
        );
        await tx.wait();

        // Read last computed encrypted results (for msg.sender)
        const [a, b] = await (contractWrite as any).getMyLastPermissionsEnc();

        const res = await instance.userDecrypt(
          [
            { handle: a, contractAddress: c.target.toString() },
            { handle: b, contractAddress: c.target.toString() },
          ],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const toBool = (v: unknown): boolean => {
          if (typeof v === "boolean") return v;
          if (typeof v === "bigint") return v !== 0n;
          if (typeof v === "number") return v !== 0;
          if (typeof v === "string") return v !== "0" && v !== "";
          return false;
        };

        setDec({
          isAdult: { handle: a, clear: toBool((res as any)[a]) },
          isRegion: { handle: b, clear: toBool((res as any)[b]) },
        });
        setMessage("Verification completed successfully");
      } finally {
        isRunningRef.current = false;
      }
    },
    [identityDataHandles, contractReadonly, contractWrite, ethersSigner, instance, storage]
  );

  const storeIdentityData = useCallback(
    async (age: number, region: number, kyc: boolean) => {
      if (isRunningRef.current) return;
      if (!instance || !contractWrite || !ethersSigner) return;

      isRunningRef.current = true;
      try {
        await new Promise((r) => setTimeout(r, 100));
        const input = instance.createEncryptedInput(
          contractWrite.target.toString(),
          ethersSigner.address
        );
        input.add8(age);
        input.add8(region);
        input.addBool(kyc);
        const enc = await input.encrypt();
        const tx = await contractWrite.storeIdentityData(
          enc.handles[0],
          enc.handles[1],
          enc.handles[2],
          enc.inputProof
        );
        await tx.wait();
        setMessage("Identity data stored successfully");
        await refreshMyIdentityData();
      } finally {
        isRunningRef.current = false;
      }
    },
    [contractWrite, ethersSigner, instance, refreshMyIdentityData]
  );

  useEffect(() => {
    refreshMyIdentityData();
  }, [refreshMyIdentityData]);

  return {
    contractAddress: info.address,
    handles: identityDataHandles,
    refreshHandles: refreshMyIdentityData,
    storeIdentityData,
    verifyAccess,
    dec,
    message,
  };
};
