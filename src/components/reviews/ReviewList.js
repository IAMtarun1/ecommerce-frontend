import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Rating, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ReviewList = ({ productId, reviews: initialReviews, onReviewAdded }) => {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, token } = useAuth();

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/product/${productId}`);
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to leave a review');
      return;
    }

    setSubmitting(true);
    setError('');

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
        setRating(0);
        setTitle('');
        setComment('');
        fetchReviews();
        if (onReviewAdded) onReviewAdded();
        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }
    return stars;
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <Container className="mt-4">
      <h4>Customer Reviews</h4>
      
      {/* Rating Summary */}
      <div className="mb-4 p-3 bg-light rounded">
        <div className="d-flex align-items-center">
          <div className="display-4 me-3">{averageRating.toFixed(1)}</div>
          <div>
            <div>{renderStars(Math.round(averageRating))}</div>
            <div className="text-muted">Based on {reviews.length} reviews</div>
          </div>
        </div>
      </div>

      {/* Write a Review Form */}
      {isAuthenticated && (
        <Card className="mb-4">
          <Card.Header>Write a Review</Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={24}
                      className="me-1 cursor-pointer"
                      color={star <= rating ? '#ffc107' : '#e4e5e9'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Review Title</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Summarize your experience"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                />
              </Form.Group>
              
              <Button type="submit" variant="primary" disabled={submitting || rating === 0}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first to review this product!</p>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  <h6>{review.title}</h6>
                  <p className="mb-1">{review.comment}</p>
                  <small className="text-muted">
                    By {review.userFirstName} {review.userLastName} • {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default ReviewList;
