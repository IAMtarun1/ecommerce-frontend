import React, { useState, useEffect } from 'react';
import { Table, Badge, Modal, Spinner, Alert } from 'react-bootstrap';
import { orderAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import styles from './AdminOrders.module.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  const statusOptions = ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAllOrders();
      setOrders(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      PROCESSING: 'info',
      CONFIRMED: 'primary',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
      REFUNDED: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      showSuccess(`Order status updated to ${newStatus}`);
      fetchOrders();
      setShowModal(false);
    } catch (err) {
      showError('Failed to update order status');
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getTotalItems = (order) => {
    return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
        <p className={styles.loadingText}>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className={styles.errorContainer}>{error}</Alert>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Order Management</h2>
        <button className={styles.refreshBtn} onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td>
                    <code className={styles.orderCode}>{order.orderNumber}</code>
                  </td>
                  <td>
                    <div className={styles.customerEmail}>{order.userEmail}</div>
                    <div className={styles.customerId}>ID: {order.userId}</div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{getTotalItems(order)} items</td>
                  <td className={styles.totalAmount}>${order.totalAmount?.toFixed(2)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {order.paymentStatus || 'PENDING'}
                    </Badge>
                  </td>
                  <td>
                    <button 
                      className={styles.viewBtn}
                      onClick={() => handleViewOrder(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" contentClassName={styles.modalContent}>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          {selectedOrder && (
            <div>
              <h5 className={styles.sectionTitle}>Order Information</h5>
              <table className={styles.infoTable}>
                <tbody>
                  <tr>
                    <th>Order Number:</th>
                    <td><code>{selectedOrder.orderNumber}</code></td>
                  </tr>
                  <tr>
                    <th>Customer:</th>
                    <td>{selectedOrder.userEmail}</td>
                  </tr>
                  <tr>
                    <th>Date:</th>
                    <td>{new Date(selectedOrder.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Status:</th>
                    <td>
                      <select 
                        className={styles.statusSelect}
                        value={selectedOrder.status} 
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {updatingStatus && <Spinner size="sm" className="ms-2" />}
                    </td>
                  </tr>
                  <tr>
                    <th>Payment Method:</th>
                    <td>{selectedOrder.paymentMethod || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Payment Status:</th>
                    <td>
                      <span className={`${styles.paymentBadge} ${selectedOrder.paymentStatus === 'PAID' ? styles.paidBadge : styles.pendingBadge}`}>
                        {selectedOrder.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping Address:</th>
                    <td className={styles.shippingAddress}>{selectedOrder.shippingAddress}</td>
                  </tr>
                  <tr>
                    <th>Total Amount:</th>
                    <td><h5 className={styles.totalAmountLarge}>${selectedOrder.totalAmount?.toFixed(2)}</h5></td>
                  </tr>
                </tbody>
              </table>

              <h5 className={styles.sectionTitle}>Order Items</h5>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price?.toFixed(2)}</td>
                      <td>${item.subtotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td><strong>${selectedOrder.totalAmount?.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOrders;
