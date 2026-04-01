import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setOrders(response.data);
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

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p>Loading orders...</p>
    </Container>
  );

  if (error) return (
    <Container className="mt-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  if (orders.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <h3>No orders yet</h3>
        <p>Start shopping to place your first order!</p>
        <Button variant="primary" onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">My Orders</h1>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Date</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><code>{order.orderNumber}</code></td>
              <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              <td>{order.items?.length || 0} items</td>
              <td><strong>${order.totalAmount}</strong></td>
              <td>{getStatusBadge(order.status)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default OrderHistory;
