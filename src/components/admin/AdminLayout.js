import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <Container fluid className="mt-3">
      <Row>
        <Col md={2} className="bg-light vh-100 p-3">
          <h5>Admin Dashboard</h5>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/products">Products</Nav.Link>
            <Nav.Link as={Link} to="/admin/orders">Orders</Nav.Link>
            <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
          </Nav>
          <hr />
          <div className="mt-auto">
            <small>Logged in as: {user?.email}</small>
            <br />
            <small className="text-muted">Role: {user?.role}</small>
          </div>
        </Col>
        <Col md={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
