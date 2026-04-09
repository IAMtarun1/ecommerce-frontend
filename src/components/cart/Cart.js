import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Row, Col } from 'react-bootstrap';
import { cartAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError, showLoading } from '../../utils/toast';
import ShippingModal from './ShippingModal';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      console.log('Fetching cart...');
      const response = await cartAPI.getCart();
      console.log('Cart response:', response.data);
      setCart(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCart({ items: [], totalAmount: 0 });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  const updateQuantity = async (itemId, quantity, productName) => {
    if (quantity < 1) return;
    
    setUpdatingItem(itemId);
    const loadingToast = toast.loading(`Updating ${productName}...`, { position: 'top-center' });
    
    try {
      await cartAPI.updateItem(itemId, quantity);
      toast.dismiss(loadingToast);
      showSuccess(`${productName} quantity updated to ${quantity}`);
      await fetchCart();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Update error:', err);
      showError('Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId, productName) => {
    console.log(`Removing item with ID: ${itemId}, Product: ${productName}`);
    
    setUpdatingItem(itemId);
    const loadingToast = toast.loading(`Removing ${productName}...`, { position: 'top-center' });
    
    try {
      await cartAPI.removeItem(itemId);
      toast.dismiss(loadingToast);
      showSuccess(`${productName} removed from cart`);
      await fetchCart();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Remove error:', err);
      if (err.response?.status === 403) {
        showError('Cannot remove item. Please try again.');
      } else {
        showError('Failed to remove item');
      }
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleCheckoutClick = () => {
    setShowShippingModal(true);
  };

  const handleShippingConfirm = async (shippingAddress, addressData) => {
    setCheckoutLoading(true);
    const loadingToast = toast.loading('Processing your order...', { position: 'top-center' });
    
    try {
      const response = await orderAPI.checkout(shippingAddress, 'CREDIT_CARD');
      toast.dismiss(loadingToast);
      showSuccess(`Order ${response.data.orderNumber} placed successfully`);
      navigate('/orders');
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Checkout error:', err);
      showError('Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-custom mx-auto"></div>
        <p className="mt-3 text-white">Loading cart...</p>
      </Container>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '48px 32px',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px' }}>
            Your cart is empty
          </h3>
          <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '24px' }}>
            Looks like you haven't added anything yet!
          </p>
          <Button onClick={() => navigate('/products')} className="btn-gradient mt-3 px-4 py-2">
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="mt-4">
        <h1 className="mb-4 text-white fw-bold">Shopping Cart</h1>
        <div className="glass-card p-4">
          <div className="table-responsive">
            <Table hover responsive className="align-middle mb-0">
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
                  <tr key={item.id} className="cart-item">
                    <td>
                      <div className="fw-bold">{item.productName}</div>
                      <small className="text-muted">Cart Item ID: {item.id}</small>
                    </td>
                    <td>${item.price}</td>
                    <td style={{ width: '120px' }}>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.productName)}
                        min="1"
                        className="form-control form-control-sm"
                        disabled={updatingItem === item.id}
                      />
                    </td>
                    <td className="fw-bold text-primary">${item.subtotal}</td>
                    <td>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeItem(item.id, item.productName)}
                        disabled={updatingItem === item.id}
                        className="rounded-pill"
                      >
                        {updatingItem === item.id ? '...' : 'Remove'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          <Row className="mt-4">
            <Col md={{ span: 6, offset: 6 }}>
              <div className="order-summary p-4">
                <h4 className="mb-3 fw-bold">Order Summary</h4>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal:</span>
                  <span className="fw-bold">${cart.totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Shipping:</span>
                  <span className="text-success">Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong className="fs-5">Total:</strong>
                  <strong className="text-primary fs-3">${cart.totalAmount}</strong>
                </div>
                <Button 
                  variant="success" 
                  size="lg" 
                  onClick={handleCheckoutClick}
                  disabled={checkoutLoading}
                  className="w-100 btn-gradient"
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      <ShippingModal 
        show={showShippingModal}
        onHide={() => setShowShippingModal(false)}
        onConfirm={handleShippingConfirm}
      />
    </>
  );
};

export default Cart;
