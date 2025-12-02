"use client";

import { ReactNode, useMemo } from "react";
import { ethers } from "ethers";
import { MetaMaskProvider, useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { useFhevm } from "@/fhevm/useFhevm";

export function Providers({ children }: { children: ReactNode }) {
  return <MetaMaskProvider>{children}</MetaMaskProvider>;
}

export function FHEVMProvider({ children }: { children: ReactNode }) {
  const { provider, chainId } = useMetaMaskProvider();
  const { instance, status } = useFhevm({ provider: provider as ethers.Eip1193Provider | undefined, chainId });
  return <>{children}</>;
}
