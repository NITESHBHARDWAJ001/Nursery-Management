import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaThumbsUp, FaUserCircle, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const ReviewsSection = ({ plantId }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantId, page, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:5000/api/reviews/plant/${plantId}?page=${page}&sort=${sortBy}`
      );
      setReviews(data.data);
      setRatingDistribution(data.ratingDistribution);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to mark reviews as helpful');
        return;
      }

      const { data } = await axios.post(
        `http://localhost:5000/api/reviews/${reviewId}/helpful`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(data.message);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as helpful');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const calculateAverageRating = () => {
    const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const sum = Object.entries(ratingDistribution).reduce(
      (acc, [rating, count]) => acc + rating * count,
      0
    );
    return (sum / total).toFixed(1);
  };

  const getTotalReviews = () => {
    return Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
        <button
          onClick={() => setShowReviewForm(true)}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Write a Review
        </button>
      </div>

      {/* Rating Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary-600 mb-2">
            {calculateAverageRating()}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(calculateAverageRating()))}
          </div>
          <p className="text-gray-600">
            Based on {getTotalReviews()} reviews
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0;
            const percentage = getTotalReviews()
              ? (count / getTotalReviews()) * 100
              : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-12">
                  {rating} star
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSortBy('-createdAt')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            sortBy === '-createdAt'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Most Recent
        </button>
        <button
          onClick={() => setSortBy('-helpfulCount')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            sortBy === '-helpfulCount'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Most Helpful
        </button>
        <button
          onClick={() => setSortBy('-rating')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            sortBy === '-rating'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Highest Rating
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No reviews yet. Be the first to review this plant!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <FaUserCircle className="text-4xl text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">
                        {review.user?.name || 'Anonymous'}
                      </h4>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <FaCheckCircle />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="font-semibold text-gray-800 mb-2">
                {review.title}
              </h5>
              <p className="text-gray-600 mb-3">{review.comment}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <FaThumbsUp />
                  Helpful ({review.helpfulCount})
                </button>
              </div>

              {review.adminResponse && (
                <div className="mt-4 ml-12 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Response from Green Haven Nursery
                  </p>
                  <p className="text-sm text-gray-700">
                    {review.adminResponse.comment}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.adminResponse.respondedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            plantId={plantId}
            onClose={() => setShowReviewForm(false)}
            onSuccess={() => {
              setShowReviewForm(false);
              fetchReviews();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Review Form Component
const ReviewForm = ({ plantId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to write a review');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/reviews',
        {
          plantId,
          ...formData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Write a Review
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="text-3xl transition-colors"
                >
                  <FaStar
                    className={
                      star <= formData.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Sum up your experience in a few words"
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              placeholder="Share your experience with this plant..."
              rows={6}
              minLength={10}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.comment.length}/1000 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewsSection;
