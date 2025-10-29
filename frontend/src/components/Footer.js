import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Green Haven</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your one-stop destination for beautiful plants and exceptional gardening services.
              Bringing nature closer to your home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="text-gray-300 hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/request" className="text-gray-300 hover:text-white transition-colors">
                  Request Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop?category=indoor" className="text-gray-300 hover:text-white transition-colors">
                  Indoor Plants
                </Link>
              </li>
              <li>
                <Link to="/shop?category=outdoor" className="text-gray-300 hover:text-white transition-colors">
                  Outdoor Plants
                </Link>
              </li>
              <li>
                <Link to="/shop?category=succulent" className="text-gray-300 hover:text-white transition-colors">
                  Succulents
                </Link>
              </li>
              <li>
                <Link to="/shop?category=flowering" className="text-gray-300 hover:text-white transition-colors">
                  Flowering Plants
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-gray-300">+91 12345 67890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-gray-300">info@greenhaven.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span className="text-gray-300">
                  123 Garden Street,<br />
                  Green Valley, GV 12345
                </span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-800 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Green Haven Nursery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
