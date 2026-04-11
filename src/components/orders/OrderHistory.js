import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button } from 'react-bootstrap';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showLoadingToast } from '../../utils/toast';
import ConfirmationModal from '../common/ConfirmationModal';
import styles from './OrderHistory.module.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders();
      setOrders(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedOrder) return;
    
    setShowCancelModal(false);
    setCancelling(selectedOrder.id);
    
    await showLoadingToast(
      `Cancelling order ${selectedOrder.orderNumber}...`,
      `Order ${selectedOrder.orderNumber} cancelled`,
      'Failed to cancel order',
      () => orderAPI.cancelOrder(selectedOrder.id)
    );
    
    fetchOrders();
    setCancelling(null);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { bg: 'warning', text: 'Pending' },
      PROCESSING: { bg: 'info', text: 'Processing' },
      CONFIRMED: { bg: 'primary', text: 'Confirmed' },
      SHIPPED: { bg: 'info', text: 'Shipped' },
      DELIVERED: { bg: 'success', text: 'Delivered' },
      CANCELLED: { bg: 'danger', text: 'Cancelled' },
      REFUNDED: { bg: 'secondary', text: 'Refunded' }
    };
    const config = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg} className="badge-status px-3 py-2">{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className={styles.loadingContainer}>
        <div className="spinner-custom mx-auto"></div>
        <p className={styles.loadingText}>Loading orders...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
        </div>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <div className={styles.emptyContainer}>
          <h3 className={styles.emptyTitle}>No orders yet</h3>
          <p className={styles.emptyMessage}>Start shopping to place your first order!</p>
          <button onClick={() => navigate('/products')} className={styles.browseBtn}>
            Browse Products
          </button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className={styles.container}>
        <h1 className={styles.title}>My Orders</h1>
        <div className={styles.cardContainer}>
          <div className="table-responsive">
            <Table hover responsive className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={styles.tableRow}>
                    <td><code className={styles.orderNumber}>{order.orderNumber}</code></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td><strong className={styles.totalAmount}>${order.totalAmount}</strong></td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'} className="px-3 py-2">
                        {order.paymentStatus || 'PENDING'}
                      </Badge>
                    </td>
                    <td>
                      {order.status === 'PENDING' && (
                        <button 
                          className={styles.cancelBtn}
                          onClick={() => handleCancelClick(order)}
                          disabled={cancelling === order.id}
                        >
                          {cancelling === order.id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Container>

      <ConfirmationModal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${selectedOrder?.orderNumber}? This action cannot be undone.`}
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep It"
        type="danger"
      />
    </>
  );
};

export default OrderHistory;
