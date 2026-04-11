import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI, cartAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { showLoadingToast, showError } from '../../utils/toast';
import styles from './ProductList.module.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    
    if (searchQuery) {
      filterProductsBySearch(searchQuery);
    } else {
      setFilteredProducts(products);
    }
    setCurrentPage(1);
  }, [products, location.search]);

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

  const filterProductsBySearch = (query) => {
    if (!query) {
      setFilteredProducts(products);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.sku?.toLowerCase().includes(lowerQuery)
    );
    setFilteredProducts(filtered);
  };

  const addToCart = async (productId, productName, productStock, e) => {
    e.stopPropagation();
    
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

  // Helper function to get the best image URL
  const getProductImage = (product) => {
    // Check for multiple images first
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Fallback to single image URL
    if (product.imageUrl) {
      return product.imageUrl;
    }
    // Default placeholder
    return `https://placehold.co/300x200/667eea/white?text=${encodeURIComponent(product.name.substring(0, 20))}`;
  };

  // Handle image error
  const handleImageError = (e, productName) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/300x200/ef4444/white?text=${encodeURIComponent(productName.substring(0, 20))}`;
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const searchQuery = new URLSearchParams(location.search).get('search');
  const pageTitle = searchQuery ? `Search Results for "${searchQuery}"` : 'Our Products';

  if (loading) {
    return (
      <Container className={styles.loadingContainer}>
        <div className="spinner-custom mx-auto"></div>
        <p className={styles.loadingText}>Loading products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <div className={styles.errorContainer}>{error}</div>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <h1 className={styles.title}>{pageTitle}</h1>
      
      {filteredProducts.length === 0 ? (
        <div className={styles.emptyContainer}>
          <h4 className={styles.emptyTitle}>No products found</h4>
          <p className={styles.emptyMessage}>Try searching with different keywords</p>
          <button className={styles.browseBtn} onClick={() => navigate('/products')}>
            Browse All Products
          </button>
        </div>
      ) : (
        <>
          <div className={styles.resultsCount}>
            Showing {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className={styles.grid}>
              {currentProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <div 
                    className={styles.card}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className={styles.imageContainer}>
                      <img 
                        src={getProductImage(product)}
                        alt={product.name}
                        className={styles.image}
                        onError={(e) => handleImageError(e, product.name)}
                        loading="lazy"
                      />
                      {/* Image count badge for multiple images */}
                      {product.images && product.images.length > 1 && (
                        <span className={styles.imageCount}>
                          +{product.images.length}
                        </span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.productTitle}>
                        {product.name}
                      </div>
                      <div className={styles.description}>
                        {product.description?.substring(0, 80)}...
                      </div>
                      <div className={styles.price}>
                        ${product.price}
                      </div>
                      <div className={styles.stock}>
                        {product.stockQuantity > 0 ? (
                          <span className={styles.inStock}>✓ In Stock: {product.stockQuantity}</span>
                        ) : (
                          <span className={styles.outOfStock}>✗ Out of Stock</span>
                        )}
                      </div>
                      <button 
                        className={styles.addToCartBtn}
                        onClick={(e) => addToCart(product.id, product.name, product.stockQuantity, e)}
                        disabled={product.stockQuantity === 0 || addingToCart[product.id]}
                      >
                        {addingToCart[product.id] ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      className={`${styles.pageBtn} ${currentPage === pageNumber ? styles.active : ''}`}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                  return <span key={pageNumber} className={styles.pageEllipsis}>...</span>;
                }
                return null;
              })}
              
              <button 
                className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ProductList;
