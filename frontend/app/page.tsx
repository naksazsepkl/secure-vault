"use client";

// Main application page component
import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { MetaMaskProvider, useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { useFhevm } from "@/fhevm/useFhevm";
import { useSecureVault } from "@/hooks/useSecureVault";
import { Header } from "@/components/Header";
import { IdentityForm } from "@/components/IdentityForm";
import { AccessVerification } from "@/components/AccessVerification";
import { SystemDetails } from "@/components/SystemDetails";
import { Alert } from "@/components/Alert";
import { FhevmStatus } from "@/components/FhevmStatus";
import styles from "./page.module.css";

function Content() {
  const { provider, chainId, accounts, isConnected, connect } = useMetaMaskProvider();
  const { instance, status, error: fhevmError } = useFhevm({ provider: provider as ethers.Eip1193Provider | undefined, chainId });
  const signer = useMemo(() => {
    if (!provider || !chainId || !isConnected) return undefined;
    const p = new ethers.BrowserProvider(provider as any);
    return p.getSigner();
  }, [provider, chainId, isConnected]);

  const [signerState, setSignerState] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  signer?.then((s) => setSignerState(s as any));

  const readonly = useMemo(() => {
    if (!provider) return undefined;
    return new ethers.BrowserProvider(provider as any);
  }, [provider]);

  const { contractAddress, storeIdentityData, verifyAccess, dec, message, handles, refreshHandles } = useSecureVault({
    instance,
    eip1193Provider: provider as any,
    chainId,
    ethersSigner: signerState,
    ethersReadonlyProvider: readonly as any,
  });

  const isReady = !!(instance && signerState);
  const userAccount = accounts?.[0];

  const getMessageType = (): 'success' | 'info' | 'warning' | 'error' => {
    if (!message) return 'info';
    const msg = message.toLowerCase();
    if (msg.includes('success') || msg.includes('completed') || msg.includes('stored')) return 'success';
    if (msg.includes('unable') || msg.includes('need') || msg.includes('no data') || msg.includes('missing')) return 'warning';
    if (msg.includes('error') || msg.includes('failed')) return 'error';
    return 'info';
  };

  return (
    <>
      <Header 
        isConnected={isConnected} 
        account={userAccount}
        onConnect={connect}
      />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>SecureVault</h1>
            <p className={styles.heroSubtitle}>
              Encrypted Identity Verification on Blockchain
            </p>
            <p className={styles.heroDescription}>
              Store and verify your identity data using fully homomorphic encryption. 
              Your sensitive information remains private and secure on-chain.
            </p>
          </div>

          {!isConnected && (
            <div className={styles.connectPrompt}>
              <div className={styles.promptIcon}>🔐</div>
              <h2 className={styles.promptTitle}>Connect Your Wallet</h2>
              <p className={styles.promptText}>
                Connect your MetaMask wallet to begin. All your identity data will be encrypted 
                using Zama FHEVM technology before being stored on the blockchain.
              </p>
              <button className={styles.connectPromptButton} onClick={connect}>
                <span>🦊</span>
                <span>Connect MetaMask</span>
              </button>
            </div>
          )}

          {isConnected && (
            <>
              <div className={styles.statusContainer}>
                <FhevmStatus status={status} error={fhevmError} />
              </div>

              {message && (
                <div className={styles.alertContainer}>
                  <Alert message={message} type={getMessageType()} />
                </div>
              )}

              <div className={styles.grid}>
                <div className={styles.gridItem}>
                  <IdentityForm 
                    onSubmit={storeIdentityData}
                    disabled={!isReady}
                  />
                </div>

                <div className={styles.gridItem}>
                  <AccessVerification 
                    onVerify={verifyAccess}
                    disabled={!isReady}
                    results={dec}
                  />
                </div>

                <div className={styles.gridItemFull}>
                  <SystemDetails 
                    contractAddress={contractAddress}
                    handles={handles}
                    onRefresh={refreshHandles || (() => {})}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <MetaMaskProvider>
      <Content />
    </MetaMaskProvider>
  );
}
