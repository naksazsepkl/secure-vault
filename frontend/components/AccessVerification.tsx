"use client";

import React, { useState } from 'react';
import styles from './AccessVerification.module.css';

interface AccessVerificationProps {
  onVerify: (region: number) => void;
  disabled: boolean;
  results?: {
    isAdult?: { clear: boolean };
    isRegion?: { clear: boolean };
  };
}

export const AccessVerification: React.FC<AccessVerificationProps> = ({ onVerify, disabled, results }) => {
  const [checkRegion, setCheckRegion] = useState(2);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(checkRegion);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>🔍</div>
        <div>
          <h2 className={styles.title}>Verify Access Permissions</h2>
          <p className={styles.subtitle}>Check eligibility based on encrypted identity data</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>Target Region Code</span>
            <span className={styles.labelHint}>Check if your region matches this code</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={checkRegion}
            onChange={(e) => setCheckRegion(parseInt(e.target.value) || 0)}
            placeholder="Enter region code to verify"
            min="0"
            max="255"
            disabled={disabled}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.verifyButton}
          disabled={disabled}
        >
          <span className={styles.buttonIcon}>⚡</span>
          <span>Verify Permissions</span>
        </button>

        {results && (results.isAdult !== undefined || results.isRegion !== undefined) && (
          <div className={styles.resultsContainer}>
            <h3 className={styles.resultsTitle}>Verification Results</h3>
            
            <div className={styles.resultsList}>
              {results.isAdult !== undefined && (
                <div className={`${styles.resultCard} ${results.isAdult.clear ? styles.success : styles.fail}`}>
                  <div className={styles.resultIcon}>
                    {results.isAdult.clear ? '✅' : '❌'}
                  </div>
                  <div className={styles.resultContent}>
                    <div className={styles.resultLabel}>Age Verification</div>
                    <div className={styles.resultValue}>
                      {results.isAdult.clear ? 'Adult (18+)' : 'Under 18'}
                    </div>
                  </div>
                </div>
              )}

              {results.isRegion !== undefined && (
                <div className={`${styles.resultCard} ${results.isRegion.clear ? styles.success : styles.fail}`}>
                  <div className={styles.resultIcon}>
                    {results.isRegion.clear ? '✅' : '❌'}
                  </div>
                  <div className={styles.resultContent}>
                    <div className={styles.resultLabel}>Region Verification</div>
                    <div className={styles.resultValue}>
                      {results.isRegion.clear ? 'Region Match' : 'Region Mismatch'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>💡</div>
          <div className={styles.infoContent}>
            <strong>How it works</strong>
            <p>Verification is performed on encrypted data. The smart contract computes access flags without revealing your actual age or region.</p>
          </div>
        </div>
      </form>
    </div>
  );
};
