import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
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
    <div className="auth-container-modern">
      <div className="auth-grid">
        {/* Left Side - Brand Section */}
        <div className="auth-brand-side">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="brand-content-modern"
          >
            <div className="brand-logo-modern">
              <FaShoppingBag size={42} />
              <h1>ShopHub</h1>
            </div>
            <h2>Welcome back!</h2>
            <p>Login to access your account and continue shopping</p>
            <div className="brand-features-modern">
              <div className="feature">
                <span>✓</span> Fast & Secure Checkout
              </div>
              <div className="feature">
                <span>✓</span> Order Tracking
              </div>
              <div className="feature">
                <span>✓</span> 24/7 Customer Support
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form Section */}
        <div className="auth-form-side">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="form-container-modern"
          >
            <div className="form-header-modern">
              <h2>Sign In</h2>
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link-modern">
                  Create account
                </Link>
              </p>
            </div>

            {error && (
              <div className="alert-modern alert-error-modern">
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <div className="input-group-modern">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-modern"
                />
              </div>

              <div className="input-group-modern">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-modern"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="submit-btn-modern"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </Form>

            <div className="divider-modern">
              <span>Or sign in with</span>
            </div>

            <div className="social-buttons-modern">
              <button className="social-btn-modern">
                <FaGoogle /> Google
              </button>
              <button className="social-btn-modern">
                <FaApple /> Apple
              </button>
            </div>

            <div className="form-footer-modern">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
