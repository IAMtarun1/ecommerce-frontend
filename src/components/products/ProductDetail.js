import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showLoadingToast, showError } from '../../utils/toast';
import ReviewList from '../reviews/ReviewList';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      showError('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stockQuantity <= 0) {
      showError(`${product.name} is out of stock!`);
      return;
    }

    setAddingToCart(true);
    
    try {
      await showLoadingToast(
        `Adding ${product.name} to cart...`,
        `${product.name} added to cart`,
        (error) => {
          if (error.response?.status === 400) {
            return error.response?.data?.message || `Sorry, ${product.name} is out of stock!`;
          }
          return 'Failed to add to cart';
        },
        () => cartAPI.addItem(product.id, 1)
      );
      
      // Refresh product to update stock display
      await fetchProduct();
      
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const getPlaceholderImage = () => {
    return `https://placehold.co/500x500/667eea/white?text=${encodeURIComponent(product?.name?.substring(0, 20) || 'Product')}`;
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-custom mx-auto"></div>
        <p className="mt-3 text-white">Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <img 
            src={product.imageUrl || getPlaceholderImage()} 
            alt={product.name}
            className="img-fluid rounded-4 shadow-lg"
            style={{ width: '100%', height: 'auto' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getPlaceholderImage();
            }}
          />
        </Col>
        <Col md={6}>
          <div className="glass-card p-4">
            <h1 className="fw-bold">{product.name}</h1>
            <h3 className="text-primary mt-3">${product.price}</h3>
            <p className="text-muted mt-2">SKU: {product.sku}</p>
            <p className="mt-3">{product.description}</p>
            <p className="mt-3">
              {product.stockQuantity > 0 ? (
                <span className="text-success fw-bold">In Stock: {product.stockQuantity}</span>
              ) : (
                <span className="text-danger fw-bold">Out of Stock</span>
              )}
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={addToCart}
              disabled={product.stockQuantity === 0 || addingToCart}
              className={`btn-gradient mt-3 px-4 py-2 ${product.stockQuantity === 0 ? 'disabled-btn' : ''}`}
              style={{ opacity: product.stockQuantity === 0 ? 0.6 : 1 }}
            >
              {product.stockQuantity === 0 ? 'Out of Stock' : (addingToCart ? 'Adding to Cart...' : 'Add to Cart')}
            </Button>
            <Button 
              variant="outline-secondary" 
              size="lg"
              onClick={() => navigate('/products')}
              className="mt-3 ms-2 px-4 py-2"
            >
              Continue Shopping
            </Button>
          </div>
        </Col>
      </Row>
      
      {/* Reviews Section */}
      <div className="mt-5">
        <ReviewList productId={product.id} />
      </div>
    </Container>
  );
};

export default ProductDetail;
