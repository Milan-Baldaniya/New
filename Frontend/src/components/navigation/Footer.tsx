import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <span className="h-8 w-8 rounded-full bg-gray-800 transition-transform duration-300 group-hover:scale-110"></span>
              <span className="font-display text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-gray-600">FarmChain</span>
            </Link>
            <p className="text-gray-600 mb-4">
              Connecting farmers and consumers through blockchain technology for transparent, 
              efficient, and sustainable agriculture.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-transform duration-300 hover:scale-125"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-transform duration-300 hover:scale-125"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-transform duration-300 hover:scale-125"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-800 relative inline-block group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-600 hover:text-gray-800 relative inline-block group">
                  Marketplace
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-800 relative inline-block group">
                  About Us
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-800 relative inline-block group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-gray-800 relative inline-block group">
                  Blog
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-800 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-800">FAQ</Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-gray-800">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-600 hover:text-gray-800">Returns & Refunds</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-800">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 transition-transform duration-300 group-hover:text-gray-700 group-hover:scale-110" />
                <span className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Manki Complex<br />
                  Valetva<br />
                  Anand, Gujarat
                </span>
              </div>
              <div className="flex items-center space-x-3 group">
                <Phone className="h-5 w-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 group-hover:scale-110" />
                <span className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">+91 90999 12592</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <Mail className="h-5 w-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 group-hover:scale-110" />
                <span className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">support@farmchain.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>© 2023 FarmChain Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
