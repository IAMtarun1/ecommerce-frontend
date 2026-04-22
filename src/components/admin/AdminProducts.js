import React, { useState, useEffect } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { productAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import ConfirmationModal from '../common/ConfirmationModal';
import styles from './AdminProducts.module.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    sku: '',
    imageUrl: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        imageUrl: product.imageUrl || '',
        status: product.status
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        sku: '',
        imageUrl: '',
        status: 'ACTIVE'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError('');
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity)
      };

      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData);
        showSuccess('Product updated successfully!');
      } else {
        await productAPI.create(productData);
        showSuccess('Product created successfully!');
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Unknown error';
      setError('Failed to save product: ' + errorMsg);
      showError('Failed to save product: ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await productAPI.delete(productToDelete.id);
      showSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      let errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete product';
      if (err.response?.status === 409) {
        errorMsg = 'Cannot delete product with existing orders. Mark as discontinued instead.';
      }
      showError(errorMsg);
    } finally {
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE': return styles.statusActive;
      case 'INACTIVE': return styles.statusInactive;
      case 'OUT_OF_STOCK': return styles.statusOutOfStock;
      case 'DISCONTINUED': return styles.statusDiscontinued;
      default: return styles.statusInactive;
    }
  };

  const getStockClass = (stock) => {
    if (stock === 0) return styles.outOfStock;
    if (stock < 10) return styles.lowStock;
    return '';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Products</h2>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          + Add New Product
        </button>
      </div>
      
      {error && <div className={styles.errorContainer}>{error}</div>}
      
      <div className="table-responsive">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={styles.tableRow}>
                <td className={styles.productId}>{product.id}</td>
                <td className={styles.productName}>{product.name}</td>
                <td className={styles.productSku}>{product.sku}</td>
                <td className={styles.productPrice}>${product.price}</td>
                <td className={`${styles.productStock} ${getStockClass(product.stockQuantity)}`}>
                  {product.stockQuantity}
                </td>
                <td>
                  <span className={`${styles.productStatus} ${getStatusClass(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} onClick={() => handleOpenModal(product)}>
                      Edit
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteClick(product)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered contentClassName={styles.modalContent}>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            {editingProduct ? '✏️ Edit Product' : '✨ Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body className={styles.modalBody}>
            {error && <div className={styles.modalError}>{error}</div>}
            
            <div className={styles.modalGrid}>
              {/* Left Column - Main Fields */}
              <div className={styles.modalLeft}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Wireless Headphones"
                    className={styles.formInput}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description *</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the product features, benefits, etc."
                    className={styles.formTextarea}
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className={styles.formInput}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                      placeholder="0"
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="Unique identifier"
                      className={styles.formInput}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className={styles.formSelect}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                      <option value="DISCONTINUED">Discontinued</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Image Preview & URL */}
              <div className={styles.modalRight}>
                <div className={styles.imagePreviewSection}>
                  <label className={styles.formLabel}>Product Image</label>
                  <div className={styles.imagePreviewContainer}>
                    {formData.imageUrl ? (
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className={styles.imagePreview}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/300x300/667eea/white?text=Invalid+URL';
                        }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span>🖼️</span>
                        <p>No image preview</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Image URL</label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className={styles.formInput}
                    />
                    <small className={styles.formHint}>
                      Enter a direct image URL (JPG, PNG, etc.)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className={styles.modalFooter}>
            <button type="button" className={styles.cancelModalBtn} onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className={styles.submitModalBtn} disabled={submitting}>
              {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AdminProducts;
