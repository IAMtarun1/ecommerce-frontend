import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { productAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import styles from './QuickAddProduct.module.css';

const QuickAddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    sku: '',
    imageUrl: '',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'imageUrl') {
      setPreviewUrl(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productAPI.create({
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity)
      });
      showSuccess('Product added successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        sku: '',
        imageUrl: '',
        status: 'ACTIVE'
      });
      setPreviewUrl('');
    } catch (err) {
      showError('Failed to add product: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const generateSampleImage = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1592899677977-ff1c2d7f3c9b?w=500',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    ];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setFormData({ ...formData, imageUrl: randomImage });
    setPreviewUrl(randomImage);
    showSuccess('Sample image URL added!');
  };

  return (
    <Container className={styles.container}>
      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader}>
          <h4 className={styles.title}>Quick Add Product</h4>
          <p className={styles.subtitle}>Add new products to your store quickly</p>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className={styles.formControl}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description *</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    className={styles.formTextarea}
                    required
                  />
                </div>

                <Row>
                  <Col md={6}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={styles.formControl}
                        required
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Stock Quantity *</label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        placeholder="0"
                        className={styles.formControl}
                        required
                      />
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>SKU *</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="PROD-001"
                        className={styles.formControl}
                        required
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={styles.formSelect}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DISCONTINUED">Discontinued</option>
                      </select>
                    </div>
                  </Col>
                </Row>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Image URL</label>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className={styles.formControl}
                    />
                    <button 
                      type="button" 
                      className={styles.sampleBtn}
                      onClick={generateSampleImage}
                    >
                      Sample Image
                    </button>
                  </div>
                  <small className="text-muted" style={{ display: 'block', marginTop: '0.25rem', color: 'var(--text-muted, #64748b)' }}>
                    Enter a URL for the product image or click "Sample Image" for a random product photo
                  </small>
                </div>
              </Col>

              <Col md={4}>
                <div className={styles.previewContainer}>
                  <h6 className={styles.previewTitle}>Image Preview</h6>
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className={styles.previewImage}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/300x300/667eea/white?text=Invalid+URL';
                      }}
                    />
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      <div className={styles.placeholderIcon}>🖼️</div>
                      <p>No image URL provided</p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
              <button 
                type="button" 
                className={styles.clearBtn}
                onClick={() => {
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    stockQuantity: '',
                    sku: '',
                    imageUrl: '',
                    status: 'ACTIVE'
                  });
                  setPreviewUrl('');
                }}
              >
                Clear Form
              </button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuickAddProduct;
