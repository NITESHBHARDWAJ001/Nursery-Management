import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaEdit, FaTrash, FaLeaf } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const { data } = await axios.get(
        'http://localhost:5000/api/reviews/my-reviews',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReviews(data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load your reviews');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Review deleted successfully');
      fetchMyReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleUpdate = async (reviewId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Review updated successfully');
      setEditingReview(null);
      fetchMyReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            My Reviews
          </h1>
          <p className="text-gray-600">
            Manage all your plant reviews in one place
          </p>
        </motion.div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <FaLeaf className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't written any reviews yet. Start sharing your plant experiences!
            </p>
            <button
              onClick={() => navigate('/plants')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Plants
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  {/* Plant Info */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                    <img
                      src={review.plant?.imageUrl || '/placeholder.jpg'}
                      alt={review.plant?.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {review.plant?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ₹{review.plant?.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReview(review)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Review"
                      >
                        <FaEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <FaTrash size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  {editingReview?._id === review._id ? (
                    <EditReviewForm
                      review={review}
                      onSave={(data) => handleUpdate(review._id, data)}
                      onCancel={() => setEditingReview(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-800 mb-2">
                        {review.title}
                      </h4>
                      <p className="text-gray-600 mb-4">{review.comment}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full ${
                            review.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : review.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {review.status.charAt(0).toUpperCase() +
                            review.status.slice(1)}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="text-green-600">✓ Verified Purchase</span>
                        )}
                      </div>

                      {review.adminResponse && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm font-semibold text-blue-800 mb-1">
                            Response from Green Haven Nursery
                          </p>
                          <p className="text-sm text-gray-700">
                            {review.adminResponse.comment}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Edit Review Form Component
const EditReviewForm = ({ review, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: review.rating,
    title: review.title,
    comment: review.comment
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="text-2xl"
            >
              <FaStar
                className={
                  star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          maxLength={100}
          required
        />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
          rows={4}
          minLength={10}
          maxLength={1000}
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default MyReviews;
