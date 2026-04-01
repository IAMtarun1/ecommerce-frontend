import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.addItem(product.id, 1);
      alert('Product added to cart successfully!');
    } catch (err) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading product details...</p>
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

  const getPlaceholderImage = () => {
    const colors = ['4F46E5', '10B981', 'F59E0B', 'EF4444', '8B5CF6', 'EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://placehold.co/500x500/${color}/white?text=${encodeURIComponent(product.name.substring(0, 20))}`;
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6}>
          <img 
            src={product.imageUrl || getPlaceholderImage()} 
            alt={product.name}
            className="img-fluid rounded"
            style={{ width: '100%', height: 'auto' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getPlaceholderImage();
            }}
          />
        </Col>
        <Col md={6}>
          <h1>{product.name}</h1>
          <h3 className="text-primary">${product.price}</h3>
          <p className="text-muted">SKU: {product.sku}</p>
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
            className="mt-3"
          >
            {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
          </Button>
          <Button 
            variant="outline-secondary" 
            size="lg"
            onClick={() => navigate('/products')}
            className="mt-3 ms-2"
          >
            Continue Shopping
          </Button>
        </Col>
      </Row>
      
      {/* Reviews Section */}
      <ReviewList productId={product.id} />
    </Container>
  );
};

export default ProductDetail;
