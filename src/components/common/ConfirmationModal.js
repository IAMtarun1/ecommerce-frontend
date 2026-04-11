import React from 'react';
import { Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ show, onHide, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  const getIconClass = () => {
    switch(type) {
      case 'danger':
        return styles.iconDanger;
      case 'success':
        return styles.iconSuccess;
      default:
        return styles.iconWarning;
    }
  };

  const getConfirmBtnClass = () => {
    switch(type) {
      case 'danger':
        return styles.confirmBtnDanger;
      case 'success':
        return styles.confirmBtnSuccess;
      default:
        return styles.confirmBtnWarning;
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'danger':
        return <FaExclamationTriangle className={getIconClass()} />;
      case 'success':
        return <FaCheck className={getIconClass()} />;
      default:
        return <FaExclamationTriangle className={getIconClass()} />;
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      backdrop="static"
      contentClassName={styles.modalContent}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className={styles.modalBody}>
          <div className={styles.iconContainer}>
            {getIcon()}
          </div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
          <div className={styles.buttonContainer}>
            <button 
              className={styles.cancelBtn}
              onClick={onHide}
            >
              <FaTimes /> {cancelText}
            </button>
            <button 
              className={`${styles.confirmBtn} ${getConfirmBtnClass()}`}
              onClick={onConfirm}
            >
              <FaCheck /> {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ConfirmationModal;
