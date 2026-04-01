import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { productAPI, orderAPI } from '../../services/api';

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
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Dashboard</h2>
      <Row>
        <Col md={3} className="mb-3">
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <h3>{stats.totalProducts}</h3>
              <p>Total Products</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <h3>${stats.totalRevenue.toFixed(2)}</h3>
              <p>Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="text-center bg-warning text-white">
            <Card.Body>
              <h3>{stats.lowStock}</h3>
              <p>Low Stock Items</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
