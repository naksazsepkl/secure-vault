"use client";

import React from 'react';
import styles from './FhevmStatus.module.css';

interface FhevmStatusProps {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: Error;
}

export const FhevmStatus: React.FC<FhevmStatusProps> = ({ status, error }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'idle':
        return {
          icon: '⚪',
          text: 'FHEVM Not Initialized',
          description: 'Waiting for wallet connection',
          className: styles.idle,
        };
      case 'loading':
        return {
          icon: '🔄',
          text: 'Initializing FHEVM',
          description: 'Loading encryption libraries...',
          className: styles.loading,
        };
      case 'ready':
        return {
          icon: '✅',
          text: 'FHEVM Ready',
          description: 'Encryption system is ready',
          className: styles.ready,
        };
      case 'error':
        return {
          icon: '❌',
          text: 'FHEVM Error',
          description: error?.message || 'Failed to initialize FHEVM',
          className: styles.error,
        };
      default:
        return {
          icon: '⚪',
          text: 'Unknown Status',
          description: '',
          className: styles.idle,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`${styles.statusCard} ${statusInfo.className}`}>
      <div className={styles.statusHeader}>
        <div className={styles.statusIcon}>{statusInfo.icon}</div>
        <div className={styles.statusContent}>
          <div className={styles.statusText}>{statusInfo.text}</div>
          <div className={styles.statusDescription}>{statusInfo.description}</div>
        </div>
      </div>
      {status === 'error' && error && (
        <div className={styles.errorDetails}>
          <div className={styles.errorTitle}>Error Details:</div>
          <div className={styles.errorMessage}>{error.message}</div>
          {error.stack && (
            <details className={styles.errorStack}>
              <summary>Technical Details</summary>
              <pre>{error.stack}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

