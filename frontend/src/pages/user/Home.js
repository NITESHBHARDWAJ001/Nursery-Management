import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, TruckIcon, ShieldCheck, HeadphonesIcon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PlantCard from '../../components/PlantCard';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const Home = () => {
  const [featuredPlants, setFeaturedPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedPlants();
  }, []);

  const fetchFeaturedPlants = async () => {
    try {
      const response = await api.get('/plants?limit=8&sortBy=popular');
      setFeaturedPlants(response.data.data);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (plant) => {
    addToCart(plant, 1);
    toast.success(`${plant.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-bgLight">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-nature py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >

              <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-4">
                Bring Nature <br />
                <span className="text-primary-600">Home 🌿</span>
              </h1>

              <p className="text-lg text-gray-800 mb-6">
                Discover beautiful plants, expert care, and on-site plantation services.
                Transform your space into a green paradise.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2">
                  <span>Shop Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/request" className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium">
                  Request Service
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="/home3.jpg"
                alt="Beautiful plants"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-30 -z-10"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary-800 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600">Your trusted partner in creating green spaces</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-3">Quality Plants</h3>
              <p className="text-gray-600">Handpicked, healthy plants delivered to your doorstep</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <TruckIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">Quick and safe delivery to keep your plants fresh</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-3">Expert Care</h3>
              <p className="text-gray-600">Professional guidance and plantation services</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeadphonesIcon className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Always here to help with your plant care needs</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Plants */}
      <section className="py-16 bg-bgLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-secondary-800 mb-4">
              Featured Plants 🌱
            </h2>
            <p className="text-xl text-gray-700">
              Handpicked favorites from our collection
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredPlants.map((plant) => (
                <PlantCard
                  key={plant._id}
                  plant={plant}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/shop" className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium inline-flex items-center space-x-2">
              <span>View All Plants</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Need Custom Plantation Service?
            </h2>
            <p className="text-xl text-white mb-8">
              Our experts can help you create the perfect green space.
              Request a consultation today!
            </p>
            <Link to="/request" className="px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-bgLight transition-colors font-medium">
              Request Service
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
