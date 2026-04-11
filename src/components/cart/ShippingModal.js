import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import styles from './ShippingModal.module.css';

const ShippingModal = ({ show, onHide, onConfirm }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (formData.phone && !/^[\d\s+-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const shippingAddress = `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
    onConfirm(shippingAddress, formData);
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      backdrop="static"
      contentClassName={styles.modalContent}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>
            📦 Shipping Information
          </h4>
          <button className={styles.closeBtn} onClick={onHide}>✕</button>
        </div>
        
        <div className={styles.modalBody}>
          {/* Full Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`${styles.formInput} ${errors.fullName ? styles.formInputError : ''}`}
            />
            {errors.fullName && <div className={styles.errorFeedback}>{errors.fullName}</div>}
          </div>

          {/* Street Address */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St"
              className={`${styles.formInput} ${errors.address ? styles.formInputError : ''}`}
            />
            {errors.address && <div className={styles.errorFeedback}>{errors.address}</div>}
          </div>

          {/* City, State, ZIP Row */}
          <div className={styles.row}>
            <div className={styles.colMd6}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                  className={`${styles.formInput} ${errors.city ? styles.formInputError : ''}`}
                />
                {errors.city && <div className={styles.errorFeedback}>{errors.city}</div>}
              </div>
            </div>
            <div className={styles.colMd3}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  className={`${styles.formInput} ${errors.state ? styles.formInputError : ''}`}
                />
                {errors.state && <div className={styles.errorFeedback}>{errors.state}</div>}
              </div>
            </div>
            <div className={styles.colMd3}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                  className={`${styles.formInput} ${errors.zipCode ? styles.formInputError : ''}`}
                />
                {errors.zipCode && <div className={styles.errorFeedback}>{errors.zipCode}</div>}
              </div>
            </div>
          </div>

          {/* Country and Phone Row */}
          <div className={styles.row}>
            <div className={styles.colMd8}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Other</option>
                </select>
                {errors.country && <div className={styles.errorFeedback}>{errors.country}</div>}
              </div>
            </div>
            <div className={styles.colMd4}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
                />
                {errors.phone && <div className={styles.errorFeedback}>{errors.phone}</div>}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <small className={styles.infoText}>
              ℹ️ We'll use this information for shipping and order confirmation.
            </small>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onHide}>
            Cancel
          </button>
          <button className={styles.confirmBtn} onClick={handleSubmit}>
            Confirm & Continue
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ShippingModal;
