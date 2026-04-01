import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
      console.log('Fetching products...');
      const response = await productAPI.getAll();
      console.log('Products response:', response.data);
      
      // Ensure products is always an array
      const productsArray = Array.isArray(response.data) ? response.data : [];
      setProducts(productsArray);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const addToCart = async (productId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking Add to Cart
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart({ ...addingToCart, [productId]: true });
    
    try {
      console.log('Adding product to cart:', productId);
      await cartAPI.addItem(productId, 1);
      alert('Product added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const getPlaceholderImage = (productName) => {
    const colors = ['4F46E5', '10B981', 'F59E0B', 'EF4444', '8B5CF6', 'EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://placehold.co/300x200/${color}/white?text=${encodeURIComponent(productName.substring(0, 20))}`;
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" />
      <p>Loading products...</p>
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
        <Alert variant="info">
          <h4>No products available yet</h4>
          <p>Check back later for new products!</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Our Products</h1>
      <Row>
        {products.map((product) => (
          <Col key={product.id} md={4} lg={3} className="mb-4">
            <Card 
              className="h-100 product-card"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => handleProductClick(product.id)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Card.Img 
                variant="top" 
                src={product.imageUrl || getPlaceholderImage(product.name)}
                style={{ height: '200px', objectFit: 'cover', backgroundColor: '#f0f0f0' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getPlaceholderImage(product.name);
                }}
              />
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
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
                    <span className="text-danger">Out of Stock</span>
                  )}
                </Card.Text>
                <Button 
                  variant="primary" 
                  onClick={(e) => addToCart(product.id, e)}
                  disabled={product.stockQuantity === 0 || addingToCart[product.id]}
                  className="w-100"
                >
                  {addingToCart[product.id] ? 'Adding...' : 'Add to Cart'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ProductList;
