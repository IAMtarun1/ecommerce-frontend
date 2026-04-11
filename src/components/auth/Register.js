import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { showLoadingToast } from '../../utils/toast';
import { motion } from 'framer-motion';
import { FaGoogle, FaApple, FaShoppingBag } from 'react-icons/fa';
import styles from './Register.module.css';

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
            <h2>Join our community</h2>
            <p>Create an account to enjoy exclusive deals and faster checkout</p>
            <div className={styles.brandFeatures}>
              <div className={styles.feature}>
                <span>✓</span> Exclusive member discounts
              </div>
              <div className={styles.feature}>
                <span>✓</span> Early access to sales
              </div>
              <div className={styles.feature}>
                <span>✓</span> Free shipping on orders over $50
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
              <h2>Create account</h2>
              <p>
                Already have an account?{' '}
                <Link to="/login" className={styles.authLink}>
                  Log in
                </Link>
              </p>
            </div>

            {error && (
              <div className={`${styles.alert} ${styles.alertError}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.col}>
                  <div className={styles.inputGroup}>
                    <label>First name</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>
                </div>
                <div className={styles.col}>
                  <div className={styles.inputGroup}>
                    <label>Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>I agree to the Terms & Conditions</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitBtn}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className={styles.divider}>
              <span>Or register with</span>
            </div>

            <div className={styles.socialButtons}>
              <button className={styles.socialBtn}>
                <FaGoogle /> Google
              </button>
              <button className={styles.socialBtn}>
                <FaApple /> Apple
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
