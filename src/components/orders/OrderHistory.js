import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button } from 'react-bootstrap';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showLoadingToast } from '../../utils/toast';
import ConfirmationModal from '../common/ConfirmationModal';

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
    
    // Single toast that transforms from loading to success
    await showLoadingToast(
      `Cancelling order ${selectedOrder.orderNumber}...`,
      `Order ${selectedOrder.orderNumber} cancelled`,
      'Failed to cancel order',
      () => orderAPI.cancelOrder(selectedOrder.id)
    );
    
    fetchOrders(); // Refresh orders
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

  if (loading) return (
    <Container className="text-center mt-5">
      <div className="spinner-custom mx-auto"></div>
      <p className="mt-3 text-white">Loading orders...</p>
    </Container>
  );

  if (error) return (
    <Container className="mt-5">
      <div className="glass-card p-4 text-center">
        <p className="text-danger">{error}</p>
      </div>
    </Container>
  );

  if (orders.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <div className="glass-card p-5">
          <h3>No orders yet</h3>
          <p className="text-muted mt-2">Start shopping to place your first order!</p>
          <Button onClick={() => navigate('/products')} className="btn-gradient mt-3 px-4 py-2">
            Browse Products
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="mt-4">
        <h1 className="mb-4 text-white fw-bold">My Orders</h1>
        <div className="glass-card p-4">
          <div className="table-responsive">
            <Table hover responsive className="align-middle mb-0">
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
                  <tr key={order.id} className="cart-item">
                    <td><code className="fw-bold">{order.orderNumber}</code></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td><strong className="text-primary">${order.totalAmount}</strong></td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'} className="px-3 py-2">
                        {order.paymentStatus || 'PENDING'}
                      </Badge>
                    </td>
                    <td>
                      {order.status === 'PENDING' && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleCancelClick(order)}
                          disabled={cancelling === order.id}
                          className="rounded-pill px-3"
                        >
                          {cancelling === order.id ? '...' : 'Cancel'}
                        </Button>
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
