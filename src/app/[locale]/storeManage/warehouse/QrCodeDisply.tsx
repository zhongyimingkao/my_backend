import React from 'react';
import './QrCodeDisplay.css';
import styles from './index.module.less';


const QrCodeDisplay = ({ qrCodeUrl, visible, setVisible }) => {
  if (!qrCodeUrl || !visible) {
    return null;
  }

  const handleClickOverlay = (event) => {
    if (event.target === event.currentTarget) {
      setVisible(false);
    }
  };
  return (
    <div className={styles.qrCodeContainer}>
      <div
        className={styles.qrCodeOverlay}
        onClick={handleClickOverlay}
      ></div>
      <img
        src={qrCodeUrl}
        alt="QR Code"
        draggable={false}
        className={styles.qrCodeImage}
      />
    </div>
  );
};

export default QrCodeDisplay;
