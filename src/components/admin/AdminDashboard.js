import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { productAPI, orderAPI } from '../../services/api';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAllOrders()
      ]);
      
      const products = productsRes.data;
      const orders = ordersRes.data || [];
      
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lowStock = products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length;
      
      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        lowStock: lowStock
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <h2 className={styles.title}>Dashboard</h2>
      <Row>
        <Col md={3} className="mb-3">
          <div className={`${styles.statCard} ${styles.cardPrimary}`}>
            <div className={styles.cardBody}>
              <div className={styles.statValue}>{stats.totalProducts}</div>
              <p className={styles.statLabel}>Total Products</p>
            </div>
          </div>
        </Col>
        <Col md={3} className="mb-3">
          <div className={`${styles.statCard} ${styles.cardSuccess}`}>
            <div className={styles.cardBody}>
              <div className={styles.statValue}>{stats.totalOrders}</div>
              <p className={styles.statLabel}>Total Orders</p>
            </div>
          </div>
        </Col>
        <Col md={3} className="mb-3">
          <div className={`${styles.statCard} ${styles.cardInfo}`}>
            <div className={styles.cardBody}>
              <div className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</div>
              <p className={styles.statLabel}>Total Revenue</p>
            </div>
          </div>
        </Col>
        <Col md={3} className="mb-3">
          <div className={`${styles.statCard} ${styles.cardWarning}`}>
            <div className={styles.cardBody}>
              <div className={styles.statValue}>{stats.lowStock}</div>
              <p className={styles.statLabel}>Low Stock Items</p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
