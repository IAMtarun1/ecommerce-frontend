import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showLoadingToast } from '../../utils/toast';
import { motion } from 'framer-motion';
import { FaGoogle, FaApple, FaShoppingBag } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await showLoadingToast(
        'Logging in...',
        'Welcome back!',
        'Invalid email or password',
        async () => {
          const result = await login(email, password);
          if (!result.success) {
            throw new Error(result.message);
          }
          return result;
        }
      );
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Container fluid className="h-100">
        <Row className="h-100 g-0">
          {/* Left Side - Brand/Image Section */}
          <Col lg={6} className="auth-brand-section">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="brand-content"
            >
              <div className="brand-logo">
                <FaShoppingBag size={48} className="text-white" />
                <h1 className="brand-name">ShopHub</h1>
              </div>
              <h2 className="brand-tagline">Welcome back!</h2>
              <p className="brand-description">
                Login to access your account and continue shopping
              </p>
              <div className="brand-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Fast & Secure Checkout</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Order Tracking</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Right Side - Form Section */}
          <Col lg={6} className="auth-form-section">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="form-container"
            >
              <div className="form-header">
                <h2>Sign In</h2>
                <p className="text-muted">
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-link">
                    Create account
                  </Link>
                </p>
              </div>

              {error && (
                <div className="alert-custom alert-error">
                  {error}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="form-group">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              <div className="divider">
                <span>Or sign in with</span>
              </div>

              <div className="social-buttons">
                <Button variant="outline-secondary" className="social-btn">
                  <FaGoogle className="me-2" /> Google
                </Button>
                <Button variant="outline-secondary" className="social-btn">
                  <FaApple className="me-2" /> Apple
                </Button>
              </div>

              <div className="form-footer">
                <Link to="/forgot-password" className="text-muted">
                  Forgot password?
                </Link>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
