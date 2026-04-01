import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { cartAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartAPI.updateItem(itemId, quantity);
      fetchCart();
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      fetchCart();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const checkout = async () => {
    setCheckoutLoading(true);
    try {
      const shippingAddress = prompt('Enter shipping address:');
      if (!shippingAddress) {
        setCheckoutLoading(false);
        return;
      }
      
      const response = await orderAPI.checkout(shippingAddress, 'CREDIT_CARD');
      alert(`Order created successfully! Order #: ${response.data.orderNumber}`);
      navigate('/orders');
    } catch (err) {
      alert('Checkout failed: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
    </Container>
  );

  if (cart.items.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <h3>Your cart is empty</h3>
        <Button variant="primary" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Shopping Cart</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>${item.price}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  min="1"
                  style={{ width: '60px' }}
                />
              </td>
              <td>${item.subtotal}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => removeItem(item.id)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Row className="mt-4">
        <Col md={{ span: 6, offset: 6 }}>
          <h3>Total: ${cart.totalAmount}</h3>
          <Button 
            variant="success" 
            size="lg" 
            onClick={checkout}
            disabled={checkoutLoading}
            className="w-100 mt-3"
          >
            {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
