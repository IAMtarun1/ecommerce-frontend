import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Card, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showLoadingToast, showError } from '../../utils/toast';
import ReviewList from '../reviews/ReviewList';
import ImageGallery from '../common/ImageGallery';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(false);
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
      
      await fetchProduct();
      
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchProduct();
    setRefreshReviews(!refreshReviews);
  };

  const getPlaceholderImage = () => {
    return `https://placehold.co/500x500/667eea/white?text=${encodeURIComponent(product?.name?.substring(0, 20) || 'Product')}`;
  };

  // Prepare images array
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.imageUrl ? [product.imageUrl] : []);

  if (loading) {
    return (
      <Container className={styles.loadingContainer}>
        <div className="spinner-custom mx-auto"></div>
        <p className={styles.loadingText}>Loading product details...</p>
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
    <Container className={styles.container}>
      <Card className={styles.card}>
        <Row className="g-0">
          {/* Product Image Column */}
          <Col md={6}>
            <ImageGallery 
              images={productImages}
              productName={product.name}
              defaultImage={getPlaceholderImage()}
            />
          </Col>
          
          {/* Product Details Column */}
          <Col md={6}>
            <Card.Body className={styles.content}>
              <h1 className={styles.title}>
                {product.name}
              </h1>
              
              <h2 className={styles.price}>
                ${product.price}
              </h2>
              
              <p className={styles.sku}>
                SKU: {product.sku}
              </p>
              
              <p className={styles.description}>
                {product.description}
              </p>
              
              <div>
                {product.stockQuantity > 0 ? (
                  <Badge bg="success" className={`${styles.stockBadge} ${styles.inStock}`}>
                    ✓ In Stock: {product.stockQuantity}
                  </Badge>
                ) : (
                  <Badge bg="danger" className={`${styles.stockBadge} ${styles.outOfStock}`}>
                    ✗ Out of Stock
                  </Badge>
                )}
              </div>
              
              <div className={styles.buttons}>
                <button 
                  className={styles.addToCartBtn}
                  onClick={addToCart}
                  disabled={product.stockQuantity === 0 || addingToCart}
                >
                  {product.stockQuantity === 0 ? 'Out of Stock' : (addingToCart ? 'Adding...' : 'Add to Cart')}
                </button>
                
                <button 
                  className={styles.continueBtn}
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </button>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
      
      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <ReviewList 
          productId={product.id} 
          key={refreshReviews ? 'refresh' : 'initial'}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>
    </Container>
  );
};

export default ProductDetail;
