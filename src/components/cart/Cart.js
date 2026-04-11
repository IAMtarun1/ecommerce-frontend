import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Row, Col } from 'react-bootstrap';
import { cartAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../../utils/toast';
import ShippingModal from './ShippingModal';
import toast from 'react-hot-toast';
import styles from './Cart.module.css';

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
      <Container className={styles.loadingContainer}>
        <div className="spinner-custom mx-auto"></div>
        <p className={styles.loadingText}>Loading cart...</p>
      </Container>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <h3 className={styles.emptyTitle}>Cart is Empty</h3>
          <p className={styles.emptyMessage}>
            Looks like you haven't added anything yet!
          </p>
          <button onClick={() => navigate('/products')} className={styles.continueBtn}>
            Continue Shopping
          </button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className={styles.container}>
        <h1 className={styles.title}>Shopping Cart</h1>
        <div className={styles.cartContent}>
          <div className="table-responsive">
            <Table hover responsive className={styles.table}>
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
                  <tr key={item.id} className={styles.cartItem}>
                    <td>
                      <div className={styles.productName}>{item.productName}</div>
                      <small className={styles.productId}>ID: {item.id}</small>
                    </td>
                    <td className={styles.price}>${item.price}</td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value), item.productName)}
                        min="1"
                        className={styles.quantityInput}
                        disabled={updatingItem === item.id}
                      />
                    </td>
                    <td className={styles.subtotal}>${item.subtotal}</td>
                    <td>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id, item.productName)}
                        disabled={updatingItem === item.id}
                      >
                        {updatingItem === item.id ? '...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          <Row className="mt-4">
            <Col md={{ span: 6, offset: 6 }}>
              <div className={styles.summary}>
                <h4 className={styles.summaryTitle}>Order Summary</h4>
                <hr />
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${cart.totalAmount}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping:</span>
                  <span className="text-success">Free</span>
                </div>
                <hr />
                <div className={styles.summaryTotal}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalAmount}>${cart.totalAmount}</span>
                </div>
                <button 
                  className={styles.checkoutBtn}
                  onClick={handleCheckoutClick}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
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
