"use client";

import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  isConnected: boolean;
  account?: string;
  onConnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, account, onConnect }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🛡️</div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SecureVault</span>
            <span className={styles.logoSubtitle}>Encrypted Identity Management</span>
          </div>
        </div>

        <div className={styles.actions}>
          {isConnected && account && (
            <div className={styles.account}>
              <div className={styles.statusDot}></div>
              <span className={styles.accountText}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          )}
          
          {!isConnected && (
            <button className={styles.connectButton} onClick={onConnect}>
              <span className={styles.walletIcon}>🦊</span>
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
