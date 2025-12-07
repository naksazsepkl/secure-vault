"use client";

import React from 'react';
import styles from './SystemDetails.module.css';

interface SystemDetailsProps {
  contractAddress?: string;
  handles: {
    age?: string;
    region?: string;
    kyc?: string;
  };
  onRefresh: () => void;
}

export const SystemDetails: React.FC<SystemDetailsProps> = ({ contractAddress, handles, onRefresh }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>📊</div>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>System Information</h2>
          <p className={styles.subtitle}>Blockchain and contract details</p>
        </div>
        <button onClick={onRefresh} className={styles.refreshButton}>
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      <div className={styles.content}>
        {contractAddress && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📜</span>
              <span className={styles.sectionTitle}>Smart Contract Address</span>
            </div>
            <div className={styles.addressContainer}>
              <code className={styles.address}>{contractAddress}</code>
              <button
                onClick={() => copyToClipboard(contractAddress)}
                className={styles.copyButton}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔑</span>
            <span className={styles.sectionTitle}>Encrypted Data Handles</span>
          </div>
          
          <div className={styles.handlesList}>
            <div className={styles.handleItem}>
              <div className={styles.handleIcon}>👤</div>
              <div className={styles.handleContent}>
                <div className={styles.handleLabel}>Age Handle</div>
                <div className={styles.handleValue}>
                  {handles.age ? `${handles.age.slice(0, 20)}...` : 'Not available'}
                </div>
              </div>
            </div>

            <div className={styles.handleItem}>
              <div className={styles.handleIcon}>🌍</div>
              <div className={styles.handleContent}>
                <div className={styles.handleLabel}>Region Handle</div>
                <div className={styles.handleValue}>
                  {handles.region ? `${handles.region.slice(0, 20)}...` : 'Not available'}
                </div>
              </div>
            </div>

            <div className={styles.handleItem}>
              <div className={styles.handleIcon}>✓</div>
              <div className={styles.handleContent}>
                <div className={styles.handleLabel}>KYC Handle</div>
                <div className={styles.handleValue}>
                  {handles.kyc ? `${handles.kyc.slice(0, 20)}...` : 'Not available'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>💡</div>
          <div className={styles.infoContent}>
            <strong>What are handles?</strong>
            <p>Handles are encrypted references to your data on the blockchain. They allow operations on encrypted values without revealing the actual data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
