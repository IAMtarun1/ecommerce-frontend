import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showLoadingToast } from '../../utils/toast';
import { motion } from 'framer-motion';
import { FaGoogle, FaApple, FaShoppingBag } from 'react-icons/fa';
import styles from './Login.module.css';

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
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Left Side - Brand Section */}
        <div className={styles.brandSide}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.brandContent}
          >
            <div className={styles.brandLogo}>
              <FaShoppingBag size={42} />
              <h1>ShopHub</h1>
            </div>
            <h2>Welcome back!</h2>
            <p>Login to access your account and continue shopping</p>
            <div className={styles.brandFeatures}>
              <div className={styles.feature}>
                <span>✓</span> Fast & Secure Checkout
              </div>
              <div className={styles.feature}>
                <span>✓</span> Order Tracking
              </div>
              <div className={styles.feature}>
                <span>✓</span> 24/7 Customer Support
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form Section */}
        <div className={styles.formSide}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styles.formContainer}
          >
            <div className={styles.formHeader}>
              <h2>Sign In</h2>
              <p>
                Don't have an account?{' '}
                <Link to="/register" className={styles.authLink}>
                  Create account
                </Link>
              </p>
            </div>

            {error && (
              <div className={`${styles.alert} ${styles.alertError}`}>
                {error}
              </div>
            )}

            <Form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </Form>

            <div className={styles.divider}>
              <span>Or sign in with</span>
            </div>

            <div className={styles.socialButtons}>
              <button className={styles.socialBtn}>
                <FaGoogle /> Google
              </button>
              <button className={styles.socialBtn}>
                <FaApple /> Apple
              </button>
            </div>

            <div className={styles.formFooter}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
