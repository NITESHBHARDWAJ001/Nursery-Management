import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-secondary-600 shadow-lg sticky top-0 z-50">
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-secondary-600 rounded-lg overflow-hidden">
                <img src="/icon_n.jpeg" alt="Green Haven" className="h-12 w-12 object-cover opacity-90" />
            </div>
            <span className="text-2xl font-bold text-white">Green Haven</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-primary-300 transition-colors font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-white hover:text-primary-300 transition-colors font-medium">
              Shop
            </Link>
            
            {user && user.role === 'user' && (
              <>
                <Link to="/my-orders" className="text-white hover:text-primary-300 transition-colors font-medium">
                  My Orders
                </Link>
                <Link to="/request" className="text-white hover:text-primary-300 transition-colors font-medium">
                  Request
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-white hover:text-primary-300 transition-colors font-medium">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'user' && (
                  <Link to="/cart" className="relative">
                    <button className="p-2 text-white hover:text-primary-300 transition-colors">
                      <ShoppingCart className="h-6 w-6" />
                      {getCartCount() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getCartCount()}
                        </span>
                      )}
                    </button>
                  </Link>
                )}
                
                <Link to="/profile" className="p-2 text-white hover:text-primary-300 transition-colors">
                  <User className="h-6 w-6" />
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-white hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-6 w-6" />
                </button>
                
                <span className="text-sm text-white font-medium">
                  {user.name}
                </span>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-primary-300 transition-colors font-medium">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-secondary-500 border-t border-secondary-700">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block text-white hover:text-primary-300 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block text-white hover:text-primary-300 transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            
            {user && user.role === 'user' && (
              <>
                <Link
                  to="/my-orders"
                  className="block text-white hover:text-primary-300 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  to="/my-reviews"
                  className="block text-white hover:text-primary-300 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Reviews
                </Link>
                <Link
                  to="/cart"
                  className="block text-white hover:text-primary-300 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart ({getCartCount()})
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                className="block text-white hover:text-primary-300 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block text-white hover:text-primary-300 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-300 hover:text-red-400 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-white hover:text-primary-300 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-white hover:text-primary-300 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
