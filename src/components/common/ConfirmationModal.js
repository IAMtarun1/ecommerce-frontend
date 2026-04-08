import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaCheck } from 'react-icons/fa';

const ConfirmationModal = ({ show, onHide, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
  const getIcon = () => {
    switch(type) {
      case 'danger':
        return <FaExclamationTriangle className="text-danger" size={48} />;
      case 'success':
        return <FaCheck className="text-success" size={48} />;
      default:
        return <FaExclamationTriangle className="text-warning" size={48} />;
    }
  };

  const getGradient = () => {
    switch(type) {
      case 'danger':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      default:
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      backdrop="static"
      className="confirmation-modal"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            {getIcon()}
          </div>
          <h3 className="mb-3 fw-bold">{title}</h3>
          <p className="text-muted mb-4">{message}</p>
          <div className="d-flex gap-3 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={onHide}
              className="rounded-pill px-4 py-2"
            >
              <FaTimes className="me-2" /> {cancelText}
            </Button>
            <Button 
              onClick={onConfirm}
              className="rounded-pill px-4 py-2"
              style={{ background: getGradient(), border: 'none' }}
            >
              <FaCheck className="me-2" /> {confirmText}
            </Button>
          </div>
        </Modal.Body>
      </motion.div>
    </Modal>
  );
};

export default ConfirmationModal;
