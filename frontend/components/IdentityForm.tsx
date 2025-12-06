"use client";

import React, { useState } from 'react';
import styles from './IdentityForm.module.css';

interface IdentityFormProps {
  onSubmit: (age: number, region: number, kyc: boolean) => void;
  disabled: boolean;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({ onSubmit, disabled }) => {
  const [age, setAge] = useState(25);
  const [region, setRegion] = useState(2);
  const [kyc, setKyc] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(age, region, kyc);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>🔐</div>
        <div>
          <h2 className={styles.title}>Store Identity Data</h2>
          <p className={styles.subtitle}>Encrypt and store your identity attributes on-chain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>Age</span>
            <span className={styles.labelHint}>Your age will be encrypted before submission</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
            placeholder="Enter your age"
            min="0"
            max="255"
            disabled={disabled}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>Region Code</span>
            <span className={styles.labelHint}>Numeric code representing your geographical region</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={region}
            onChange={(e) => setRegion(parseInt(e.target.value) || 0)}
            placeholder="Enter region code"
            min="0"
            max="255"
            disabled={disabled}
            required
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={kyc}
              onChange={(e) => setKyc(e.target.checked)}
              disabled={disabled}
            />
            <span className={styles.checkboxCustom}></span>
            <div className={styles.checkboxText}>
              <span className={styles.checkboxTitle}>KYC Verification</span>
              <span className={styles.checkboxHint}>I have completed KYC verification</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={disabled}
        >
          <span className={styles.buttonIcon}>✨</span>
          <span>Encrypt & Store</span>
        </button>

        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>🛡️</div>
          <div className={styles.infoContent}>
            <strong>Privacy Guarantee</strong>
            <p>All data is encrypted using Zama FHEVM before being sent to the blockchain. Your actual values remain private.</p>
          </div>
        </div>
      </form>
    </div>
  );
};
