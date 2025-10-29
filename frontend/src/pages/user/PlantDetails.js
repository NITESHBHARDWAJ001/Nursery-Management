import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Truck, ShieldCheck, Leaf, Sun, Droplets, ArrowLeft, Plus, Minus } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ReviewsSection from '../../components/ReviewsSection';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const PlantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchPlantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlantDetails = async () => {
    try {
      const response = await api.get(`/plants/${id}`);
      setPlant(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plant:', error);
      toast.error('Failed to load plant details');
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (plant.quantityAvailable < quantity) {
      toast.error('Insufficient stock available');
      return;
    }

    addToCart(plant, quantity);
    toast.success(`${plant.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const incrementQuantity = () => {
    if (quantity < plant.quantityAvailable) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!plant) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Plant not found</h2>
            <button onClick={() => navigate('/shop')} className="btn-primary">
              Back to Shop
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = plant.images && plant.images.length > 0 ? plant.images : [plant.imageUrl];
  const stockStatus = plant.quantityAvailable === 0 
    ? 'out-of-stock'
    : plant.quantityAvailable <= plant.lowStockThreshold 
    ? 'low-stock'
    : 'in-stock';

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={images[selectedImage] || '/images/plants/default-plant.jpg'}
                alt={plant.name}
                className="w-full h-96 md:h-[500px] object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-600 shadow-md'
                        : 'border-gray-200 hover:border-primary-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${plant.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category & Stock Status */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium uppercase">
                {plant.category}
              </span>
              {stockStatus === 'out-of-stock' ? (
                <span className="badge-danger">Out of Stock</span>
              ) : stockStatus === 'low-stock' ? (
                <span className="badge-warning">Only {plant.quantityAvailable} left</span>
              ) : (
                <span className="badge-success">In Stock</span>
              )}
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {plant.name}
              </h1>
              {plant.rating > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(plant.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {plant.rating.toFixed(1)} ({plant.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold text-primary-600">
                ₹{plant.price}
              </span>
              <span className="text-lg text-gray-500">per plant</span>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{plant.description}</p>
            </div>

            {/* Plant Details */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-200">
              {plant.sunlight && (
                <div className="flex items-center space-x-3">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Sunlight</p>
                    <p className="font-medium capitalize">{plant.sunlight.replace('-', ' ')}</p>
                  </div>
                </div>
              )}
              {plant.wateringFrequency && (
                <div className="flex items-center space-x-3">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Watering</p>
                    <p className="font-medium">{plant.wateringFrequency}</p>
                  </div>
                </div>
              )}
              {plant.careLevel && (
                <div className="flex items-center space-x-3">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Care Level</p>
                    <p className="font-medium capitalize">{plant.careLevel}</p>
                  </div>
                </div>
              )}
              {plant.height && (
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 flex items-center justify-center text-purple-500 font-bold">
                    ↕
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Height</p>
                    <p className="font-medium">{plant.height}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {plant.features && plant.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plant.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            {stockStatus !== 'out-of-stock' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg border border-gray-300 hover:border-primary-600 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= plant.quantityAvailable}
                      className="p-2 rounded-lg border border-gray-300 hover:border-primary-600 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({plant.quantityAvailable} available)
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <span>Buy Now</span>
                  </button>
                  <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors">
                    <Heart className="h-6 w-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-primary-50 rounded-xl p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary-600" />
                <span className="text-gray-700">Free delivery on orders above ₹999</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                <span className="text-gray-700">100% quality guarantee</span>
              </div>
              <div className="flex items-center space-x-3">
                <Leaf className="h-5 w-5 text-primary-600" />
                <span className="text-gray-700">Expert care guidance included</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection plantId={id} />
      </div>

      <Footer />
    </div>
  );
};

export default PlantDetails;
