import React, { useState, useEffect } from 'react';
import { Modal, Form, Alert, Spinner } from 'react-bootstrap';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      {/* Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" contentClassName={styles.modalContent}>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Name</label>
              <input
                type="text"
                className={styles.formInput}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formInput}
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>SKU</label>
              <input
                type="text"
                className={styles.formInput}
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Price</label>
              <input
                type="number"
                step="0.01"
                className={styles.formInput}
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Stock Quantity</label>
              <input
                type="number"
                className={styles.formInput}
                value={formData.stockQuantity}
                onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Image URL</label>
              <input
                type="text"
                className={styles.formInput}
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formSelect}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              {editingProduct ? 'Update' : 'Create'} Product
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
