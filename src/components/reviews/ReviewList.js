import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle, FaThumbsUp, FaFlag, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError } from '../../utils/toast';
import toast from 'react-hot-toast';
import styles from './ReviewList.module.css';

const ReviewList = ({ productId, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const { isAuthenticated, token, user } = useAuth();

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/product/${productId}`);
      const data = await response.json();
      setReviews(data);
      
      if (isAuthenticated && user) {
        const userExistingReview = data.find(review => review.userId === user.id);
        if (userExistingReview) {
          setHasUserReviewed(true);
          setUserReview(userExistingReview);
        } else {
          setHasUserReviewed(false);
          setUserReview(null);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, isAuthenticated, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showError('Please login to leave a review');
      return;
    }

    if (rating === 0) {
      showError('Please select a rating');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting your review...', { position: 'top-center' });

    try {
      const response = await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating,
          title,
          comment
        })
      });

      if (response.ok) {
        toast.dismiss(loadingToast);
        showSuccess('Thank you for your review!');
        setRating(0);
        setTitle('');
        setComment('');
        await fetchReviews();
        
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        if (response.status === 400 && error.message?.includes('already reviewed')) {
          showError('You have already reviewed this product. You can edit or delete your existing review.');
        } else {
          showError(error.message || 'Failed to submit review');
        }
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      showError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    
    setShowDeleteModal(false);
    const loadingToast = toast.loading('Deleting review...', { position: 'top-center' });
    
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${selectedReview.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.dismiss(loadingToast);
        showSuccess('Review deleted successfully');
        setHasUserReviewed(false);
        setUserReview(null);
        await fetchReviews();
        
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast.dismiss(loadingToast);
        showError('Failed to delete review');
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      showError('Failed to delete review');
    }
  };

  const renderStars = (ratingValue, size = 18, interactive = false) => {
    const stars = [];
    const displayRating = interactive ? hoverRating || rating : ratingValue;
    
    for (let i = 1; i <= 5; i++) {
      const starProps = {
        key: i,
        size: size,
        style: { cursor: interactive ? 'pointer' : 'default', marginRight: '4px' },
        onMouseEnter: interactive ? () => setHoverRating(i) : undefined,
        onMouseLeave: interactive ? () => setHoverRating(0) : undefined,
        onClick: interactive ? () => setRating(i) : undefined,
      };
      
      if (i <= displayRating) {
        stars.push(<FaStar key={i} {...starProps} className={styles.starFilled} />);
      } else if (i - 0.5 <= displayRating) {
        stars.push(<FaStarHalfAlt key={i} {...starProps} className={styles.starFilled} />);
      } else {
        stars.push(<FaRegStar key={i} {...starProps} className={styles.starEmpty} />);
      }
    }
    return stars;
  };

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;
    
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  if (loading) {
    return (
      <div className={styles.reviewsLoading}>
        <Spinner animation="border" variant="primary" />
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Customer Reviews
            <span className={styles.countBadge}>{reviews.length} reviews</span>
          </h3>
        </div>

        {/* Rating Summary Section */}
        {reviews.length > 0 && (
          <div className={styles.ratingSummary}>
            <div className={styles.ratingSummaryLeft}>
              <div className={styles.ratingAverage}>{averageRating.toFixed(1)}</div>
              <div className={styles.ratingStars}>{renderStars(Math.round(averageRating), 20)}</div>
              <div className={styles.ratingTotal}>Based on {reviews.length} reviews</div>
            </div>
            
            <div className={styles.ratingSummaryRight}>
              {ratingDistribution.map((item) => (
                <div key={item.star} className={styles.ratingBarItem}>
                  <div className={styles.ratingStarLabel}>{item.star} ★</div>
                  <div className={styles.ratingBarBg}>
                    <div className={styles.ratingBarFill} style={{ width: `${item.percentage}%` }} />
                  </div>
                  <div className={styles.ratingCount}>{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write Review Section */}
        {isAuthenticated && !hasUserReviewed && (
          <div className={styles.writeReview}>
            <h4 className={styles.writeReviewTitle}>Write a Review</h4>
            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-3">
                <Form.Label className={styles.ratingLabel}>Your Rating</Form.Label>
                <div className={styles.ratingStarsInput}>
                  {renderStars(rating, 28, true)}
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Review Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="What's the best thing about this product?"
                  className={styles.reviewInput}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className={styles.reviewInput}
                />
              </Form.Group>
              
              <Button 
                type="submit" 
                disabled={submitting || rating === 0}
                className={styles.submitReviewBtn}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Form>
          </div>
        )}

        {/* Already Reviewed Message */}
        {isAuthenticated && hasUserReviewed && (
          <div className={styles.alreadyReviewed}>
            <div className={styles.alreadyReviewedIcon}>⭐</div>
            <h4>You've already reviewed this product</h4>
            <p>Your review helps other customers make informed decisions.</p>
            <div className={styles.userReviewSummary}>
              <div className={styles.userReviewRating}>{renderStars(userReview?.rating, 16)}</div>
              <div className={styles.userReviewTitle}><strong>{userReview?.title}</strong></div>
              <div className={styles.userReviewComment}>{userReview?.comment}</div>
            </div>
          </div>
        )}

        {/* Login to Review */}
        {!isAuthenticated && (
          <div className={styles.loginToReview}>
            <FaUserCircle size={48} />
            <h4>Love this product?</h4>
            <p>Sign in to share your experience with others</p>
            <Button href="/login" variant="primary">Sign in to Review</Button>
          </div>
        )}

        {/* Sort Reviews */}
        {reviews.length > 0 && (
          <div className={styles.sortReviews}>
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className={styles.noReviews}>
            <div className={styles.noReviewsIcon}>📝</div>
            <h4>No reviews yet</h4>
            <p>Be the first to review this product and share your experience!</p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {getSortedReviews().map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewItemHeader}>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerAvatar}>
                      {review.userFirstName?.charAt(0)}{review.userLastName?.charAt(0)}
                    </div>
                    <div className={styles.reviewerDetails}>
                      <div className={styles.reviewerName}>
                        {review.userFirstName} {review.userLastName}
                        {review.userId === user?.id && <span className={styles.verifiedBadge}>You</span>}
                      </div>
                      <div className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  {(review.userId === user?.id || user?.role === 'ADMIN') && (
                    <button 
                      className={styles.deleteReviewBtn}
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <div className={styles.reviewItemRating}>
                  {renderStars(review.rating, 16)}
                </div>
                <h5 className={styles.reviewItemTitle}>{review.title}</h5>
                <p className={styles.reviewItemComment}>{review.comment}</p>
                <div className={styles.reviewItemFooter}>
                  <button className={styles.helpfulBtn}>
                    <FaThumbsUp /> Helpful
                  </button>
                  <button className={styles.reportBtn}>
                    <FaFlag /> Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your review? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteReview}>
            Delete Review
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReviewList;
