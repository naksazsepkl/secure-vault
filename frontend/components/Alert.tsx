"use client";

import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export const Alert: React.FC<AlertProps> = ({ message, type = 'info' }) => {
  if (!message) return null;

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <div className={styles.icon}>
        {type === 'success' && '✅'}
        {type === 'info' && 'ℹ️'}
        {type === 'warning' && '⚠️'}
        {type === 'error' && '❌'}
      </div>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
};
