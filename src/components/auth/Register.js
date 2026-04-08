import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showLoadingToast } from '../../utils/toast';
import { motion } from 'framer-motion';
import { FaGoogle, FaApple, FaShoppingBag } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await showLoadingToast(
        'Creating your account...',
        'Account created successfully! Welcome aboard!',
        'Registration failed',
        async () => {
          const result = await register(formData);
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
          {/* Left Side - Brand Section */}
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
              <h2 className="brand-tagline">Join our community</h2>
              <p className="brand-description">
                Create an account to enjoy exclusive deals and faster checkout
              </p>
              <div className="brand-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Exclusive member discounts</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Early access to sales</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Free shipping on orders over $50</span>
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
                <h2>Create an account</h2>
                <p className="text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Log in
                  </Link>
                </p>
              </div>

              {error && (
                <div className="alert-custom alert-error">
                  {error}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="form-group">
                      <Form.Label>First name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="form-group">
                      <Form.Label>Last name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="form-group">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>

                <Form.Group className="form-group">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>

                <Form.Group className="form-group-checkbox">
                  <Form.Check
                    type="checkbox"
                    id="agreeTerms"
                    label="I agree to the Terms & Conditions"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="checkbox-custom"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </Form>

              <div className="divider">
                <span>Or register with</span>
              </div>

              <div className="social-buttons">
                <Button variant="outline-secondary" className="social-btn">
                  <FaGoogle className="me-2" /> Google
                </Button>
                <Button variant="outline-secondary" className="social-btn">
                  <FaApple className="me-2" /> Apple
                </Button>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
