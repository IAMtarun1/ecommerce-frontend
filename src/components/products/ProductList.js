import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showLoadingToast, showError, showSuccess } from '../../utils/toast';
import toast from 'react-hot-toast';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const addToCart = async (productId, productName, productStock, e) => {
    e.stopPropagation();
    
    // Check stock before adding
    if (productStock <= 0) {
      showError(`${productName} is out of stock!`);
      return;
    }
    
    if (!isAuthenticated) {
      showError('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart({ ...addingToCart, [productId]: true });
    
    try {
      await showLoadingToast(
        `Adding ${productName} to cart...`,
        `${productName} added to cart`,
        (error) => {
          if (error.response?.status === 400) {
            return error.response?.data?.message || `Sorry, ${productName} is out of stock!`;
          }
          return 'Failed to add to cart';
        },
        () => cartAPI.addItem(productId, 1)
      );
      
      // Refresh products to update stock display
      await fetchProducts();
      
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <div className="spinner-custom mx-auto"></div>
      <p className="mt-3 text-white">Loading products...</p>
    </Container>
  );

  if (error) return (
    <Container className="mt-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  if (!products || products.length === 0) {
    return (
      <Container className="mt-5 text-center">
        <div className="glass-card p-5">
          <h4>No products available yet</h4>
          <p className="text-muted mt-2">Check back later for new products!</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row>
          {products.map((product) => (
            <Col key={product.id} md={4} lg={3} className="mb-4">
              <motion.div variants={itemVariants}>
                <Card 
                  className="h-100 product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <Card.Img 
                    variant="top" 
                    src={product.imageUrl || `https://placehold.co/300x200/667eea/white?text=${encodeURIComponent(product.name.substring(0, 20))}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title className="fw-bold">{product.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {product.description?.substring(0, 80)}...
                    </Card.Text>
                    <Card.Text className="h4 text-primary">
                      ${product.price}
                    </Card.Text>
                    <Card.Text>
                      {product.stockQuantity > 0 ? (
                        <span className="text-success">In Stock: {product.stockQuantity}</span>
                      ) : (
                        <span className="text-danger fw-bold">Out of Stock</span>
                      )}
                    </Card.Text>
                    <Button 
                      variant="gradient" 
                      className={`btn-gradient w-100 ${product.stockQuantity === 0 ? 'disabled-btn' : ''}`}
                      onClick={(e) => addToCart(product.id, product.name, product.stockQuantity, e)}
                      disabled={product.stockQuantity === 0 || addingToCart[product.id]}
                      style={{ opacity: product.stockQuantity === 0 ? 0.6 : 1 }}
                    >
                      {product.stockQuantity === 0 ? 'Out of Stock' : (addingToCart[product.id] ? 'Adding...' : 'Add to Cart')}
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>
    </Container>
  );
};

export default ProductList;
