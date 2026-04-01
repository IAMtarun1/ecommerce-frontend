import React from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h4">My Profile</Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">Name:</Col>
                <Col md={8}>{user?.firstName} {user?.lastName}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">Email:</Col>
                <Col md={8}>{user?.email}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">Role:</Col>
                <Col md={8}>
                  <span className="badge bg-primary">{user?.role || 'CUSTOMER'}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4} className="fw-bold">Member Since:</Col>
                <Col md={8}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Col>
              </Row>
              <hr />
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => navigate('/orders')}>
                  My Orders
                </Button>
                <Button variant="outline-danger" onClick={() => {
                  logout();
                  navigate('/');
                }}>
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
