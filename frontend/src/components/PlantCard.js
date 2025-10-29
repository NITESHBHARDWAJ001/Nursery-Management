import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const PlantCard = ({ plant, onAddToCart, showAddToCart = true }) => {
  const stockStatus = plant.quantityAvailable === 0 
    ? 'out-of-stock'
    : plant.quantityAvailable <= plant.lowStockThreshold 
    ? 'low-stock'
    : 'in-stock';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card-product"
    >
      <Link to={`/plant/${plant._id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={plant.imageUrl || '/images/plants/default-plant.jpg'}
            alt={plant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 space-y-2">
            {stockStatus === 'out-of-stock' && (
              <span className="badge-danger">Out of Stock</span>
            )}
            {stockStatus === 'low-stock' && (
              <span className="badge-warning">Low Stock</span>
            )}
            {plant.soldCount > 50 && (
              <span className="badge-success">Popular</span>
            )}
          </div>

          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-primary-50 transition-colors">
            <Heart className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/plant/${plant._id}`}>
          <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">
            {plant.category}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2 hover:text-primary-600 transition-colors">
            {plant.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {plant.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ₹{plant.price}
            </span>
            {plant.rating > 0 && (
              <div className="flex items-center mt-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600 ml-1">
                  {plant.rating.toFixed(1)} ({plant.reviewCount})
                </span>
              </div>
            )}
          </div>

          {showAddToCart && stockStatus !== 'out-of-stock' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(plant);
              }}
              className="btn-primary py-2 px-4 flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlantCard;
