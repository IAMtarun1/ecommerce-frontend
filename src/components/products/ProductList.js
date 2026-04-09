import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Pagination } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showLoadingToast, showError } from '../../utils/toast';
import ProductFilters from './ProductFilters';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sortBy: 'newest'
  });

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(Array.isArray(response.data) ? response.data : []);
      setFilteredProducts(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.sku?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category === filters.category
      );
    }

    // Price filter
    if (filters.minPrice) {
      filtered = filtered.filter(product => 
        product.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => 
        product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Rating filter (assuming you have ratings)
    if (filters.rating) {
      filtered = filtered.filter(product => 
        (product.averageRating || 0) >= parseInt(filters.rating)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
      default:
        // newest first
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const addToCart = async (productId, productName, e) => {
    e.stopPropagation();
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
        'Failed to add to cart',
        () => cartAPI.addItem(productId, 1)
      );
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart({ ...addingToCart, [productId]: false });
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleApplyFilters = (appliedFilters) => {
    // Filters are already applied via useEffect
  };

  const handleClearFilters = () => {
    // Filters are cleared in the component
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  return (
    <Container className="mt-4">
      <h1 className="mb-4 text-white fw-bold">Our Products</h1>
      
      {/* Filters */}
      <ProductFilters
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        categories={categories}
      />

      {/* Results Count */}
      <div className="results-count">
        Showing {currentProducts.length} of {filteredProducts.length} products
      </div>

      {/* Products Grid */}
      {currentProducts.length === 0 ? (
        <div className="no-results">
          <h3>No products found</h3>
          <p>Try adjusting your filters or search term</p>
          <Button variant="primary" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <Row>
            {currentProducts.map((product) => (
              <Col key={product.id} md={4} lg={3} className="mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="h-100 product-card"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <Card.Img 
                      src={product.imageUrl || `https://placehold.co/300x200/0f172a/00f2fe?text=${encodeURIComponent(product.name.substring(0, 20))}`}
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
                          <span className="text-danger">Out of Stock</span>
                        )}
                      </Card.Text>
                      <Button 
                        variant="gradient" 
                        className="btn-gradient w-100"
                        onClick={(e) => addToCart(product.id, product.name, e)}
                        disabled={product.stockQuantity === 0 || addingToCart[product.id]}
                      >
                        {addingToCart[product.id] ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                  return <Pagination.Ellipsis key={pageNumber} />;
                }
                return null;
              })}
              
              <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductList;
