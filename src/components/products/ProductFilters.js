import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ProductFilters.module.css';

const ProductFilters = ({ filters, setFilters, onApply, onClear, categories }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search') || '';
    
    if (searchQuery && !filters.search) {
      setLocalFilters({ ...localFilters, search: searchQuery });
      setFilters({ ...filters, search: searchQuery });
      onApply({ ...filters, search: searchQuery });
    }
  }, [location.search]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApply(localFilters);
    
    const params = new URLSearchParams(location.search);
    if (localFilters.search) {
      params.set('search', localFilters.search);
    } else {
      params.delete('search');
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sortBy: 'newest'
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    onClear();
    
    navigate({ search: '' }, { replace: true });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '4', label: '4★ & above' },
    { value: '3', label: '3★ & above' },
    { value: '2', label: '2★ & above' },
    { value: '1', label: '1★ & above' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' }
  ];

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchBarContainer}>
        <div className={styles.searchInputWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search products"
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {localFilters.search && (
            <button 
              className={styles.clearSearch}
              onClick={() => handleFilterChange('search', '')}
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button 
          className={`${styles.filterToggleBtn} ${showFilters ? styles.filterToggleBtnActive : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> Filters
        </button>
        <button 
          className={styles.applySearchBtn}
          onClick={handleApply}
        >
          Search
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className={styles.advancedFilters}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Row className="g-3">
              {/* Category Filter */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label className={styles.filterLabel}>Category</Form.Label>
                  <Form.Select
                    value={localFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Price Range */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label className={styles.filterLabel}>Price Range</Form.Label>
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={localFilters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className={styles.priceInput}
                    />
                    <span className={styles.priceSeparator}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localFilters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className={styles.priceInput}
                    />
                  </div>
                </Form.Group>
              </Col>

              {/* Rating Filter */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label className={styles.filterLabel}>Customer Rating</Form.Label>
                  <Form.Select
                    value={localFilters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className={styles.filterSelect}
                  >
                    {ratingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Sort By */}
              <Col md={3}>
                <Form.Group>
                  <Form.Label className={styles.filterLabel}>Sort By</Form.Label>
                  <Form.Select
                    value={localFilters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className={styles.filterSelect}
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className={styles.filterActions}>
              <Button variant="primary" onClick={handleApply} className={styles.applyFiltersBtn}>
                Apply Filters
              </Button>
              <Button variant="outline-secondary" onClick={handleClear} className={styles.clearFiltersBtn}>
                Clear All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {(localFilters.category || localFilters.minPrice || localFilters.maxPrice || localFilters.rating || localFilters.search) && (
        <div className={styles.activeFilters}>
          <span className={styles.activeFiltersLabel}>Active Filters:</span>
          {localFilters.search && (
            <span className={styles.filterTag}>
              Search: {localFilters.search}
              <FaTimes onClick={() => {
                handleFilterChange('search', '');
                handleApply();
              }} />
            </span>
          )}
          {localFilters.category && (
            <span className={styles.filterTag}>
              Category: {localFilters.category}
              <FaTimes onClick={() => {
                handleFilterChange('category', '');
                handleApply();
              }} />
            </span>
          )}
          {localFilters.minPrice && (
            <span className={styles.filterTag}>
              Min: ${localFilters.minPrice}
              <FaTimes onClick={() => {
                handleFilterChange('minPrice', '');
                handleApply();
              }} />
            </span>
          )}
          {localFilters.maxPrice && (
            <span className={styles.filterTag}>
              Max: ${localFilters.maxPrice}
              <FaTimes onClick={() => {
                handleFilterChange('maxPrice', '');
                handleApply();
              }} />
            </span>
          )}
          {localFilters.rating && (
            <span className={styles.filterTag}>
              Rating: {localFilters.rating}+ ★
              <FaTimes onClick={() => {
                handleFilterChange('rating', '');
                handleApply();
              }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
