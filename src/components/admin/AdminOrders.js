import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { orderAPI } from '../../services/api';

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
      alert(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh orders
      setShowModal(false);
    } catch (err) {
      alert('Failed to update order status');
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
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-4">
        <h2>Order Management</h2>
        <Button variant="outline-primary" onClick={fetchOrders}>
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Alert variant="info">No orders found</Alert>
      ) : (
        <Table striped bordered hover responsive>
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
              <tr key={order.id}>
                <td>
                  <code>{order.orderNumber}</code>
                </td>
                <td>
                  <div>{order.userEmail}</div>
                  <small className="text-muted">ID: {order.userId}</small>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{getTotalItems(order)} items</td>
                <td><strong>${order.totalAmount?.toFixed(2)}</strong></td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <Badge bg={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {order.paymentStatus || 'PENDING'}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="info" 
                    size="sm" 
                    onClick={() => handleViewOrder(order)}
                    className="me-2"
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <h5>Order Information</h5>
              <table className="table table-sm">
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
                      <Form.Select 
                        value={selectedOrder.status} 
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus}
                        style={{ width: 'auto', display: 'inline-block' }}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Form.Select>
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
                      <Badge bg={selectedOrder.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                        {selectedOrder.paymentStatus || 'PENDING'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <th>Shipping Address:</th>
                    <td>{selectedOrder.shippingAddress}</td>
                  </tr>
                  <tr>
                    <th>Total Amount:</th>
                    <td><h5 className="text-primary">${selectedOrder.totalAmount?.toFixed(2)}</h5></td>
                  </tr>
                </tbody>
              </table>

              <h5 className="mt-4">Order Items</h5>
              <Table striped bordered size="sm">
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
                  <tr className="table-active">
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td><strong>${selectedOrder.totalAmount?.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOrders;
