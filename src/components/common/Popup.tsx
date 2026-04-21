import React from "react";
import styles from "./Popup.module.css";

interface PopupProps {
  isOpen: boolean;
  message: string;
  type?: "alert" | "confirm";
  onConfirm: () => void;
  onCancel?: () => void;
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  message,
  type = "alert",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.icon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3fa8" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.btnRow}>
          {type === "confirm" && (
            <button className={styles.btnCancel} onClick={onCancel}>
              취소
            </button>
          )}
          <button className={styles.btnConfirm} onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
