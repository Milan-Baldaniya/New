import React, { useState, useEffect } from 'react';
import { Leaf, Users, Truck, Shield } from 'lucide-react';
import milanBaladaniya from '@/assets/images/milanBaladaniya.jpg';
import meetVaghasiya from '@/assets/images/meetVaghasiya.jpeg';
import yashVaghasiya from '@/assets/images/yashVaghasiya.jpeg';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl font-bold text-gray-900 mb-4 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            About FarmChain Marketplace
          </h1>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            We're revolutionizing the way people connect with local farmers and access fresh, sustainable produce.
            Our platform bridges the gap between farmers and consumers, creating a transparent and efficient marketplace.
          </p>
        </div>

        {/* Mission Section */}
        <div className={`bg-white rounded-lg shadow-lg p-8 mb-12 transition-all duration-1000 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            To empower local farmers and provide consumers with access to fresh, sustainable produce while fostering
            a community that values transparency, quality, and environmental responsibility. We believe in creating
            a sustainable food ecosystem that benefits everyone.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 delay-300 transform hover:-translate-y-2 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="flex items-center mb-4">
              <div className="bg-farm-green-100 rounded-full p-2 mr-3">
                <Leaf className="h-6 w-6 text-farm-green-600 animate-pulse-subtle" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Sustainability</h3>
            </div>
            <p className="text-gray-600">
              We promote sustainable farming practices and help reduce food waste by connecting farmers directly with consumers.
            </p>
          </div>
          <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 delay-500 transform hover:-translate-y-2 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="flex items-center mb-4">
              <div className="bg-farm-green-100 rounded-full p-2 mr-3">
                <Users className="h-6 w-6 text-farm-green-600 animate-pulse-subtle" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Community</h3>
            </div>
            <p className="text-gray-600">
              We build strong relationships between farmers and consumers, fostering a supportive local food community.
            </p>
          </div>
          <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 delay-700 transform hover:-translate-y-2 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="flex items-center mb-4">
              <div className="bg-farm-green-100 rounded-full p-2 mr-3">
                <Truck className="h-6 w-6 text-farm-green-600 animate-pulse-subtle" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Freshness</h3>
            </div>
            <p className="text-gray-600">
              We ensure the shortest possible journey from farm to table, delivering the freshest produce to our customers.
            </p>
          </div>
          <div className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-700 delay-900 transform hover:-translate-y-2 hover:shadow-xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="flex items-center mb-4">
              <div className="bg-farm-green-100 rounded-full p-2 mr-3">
                <Shield className="h-6 w-6 text-farm-green-600 animate-pulse-subtle" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Trust</h3>
            </div>
            <p className="text-gray-600">
              We maintain the highest standards of quality and transparency in all our operations.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className={`bg-white rounded-lg shadow-lg p-8 transition-all duration-1000 delay-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center transition-transform duration-500 hover:-translate-y-2">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-farm-green-100 hover:border-farm-green-400 transition-all duration-300 transform hover:scale-105 animate-float" style={{ animationDelay: '0ms' }}>
                <img 
                  src={milanBaladaniya} 
                  alt="Milan Baladaniya" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Milan Baladaniya</h3>
              <p className="text-gray-600">CEO & Founder</p>
              <p className="text-sm text-gray-500">Project Lead</p>
            </div>
            <div className="text-center transition-transform duration-500 hover:-translate-y-2">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-farm-green-100 hover:border-farm-green-400 transition-all duration-300 transform hover:scale-105 animate-float" style={{ animationDelay: '500ms' }}>
                <img 
                  src={meetVaghasiya} 
                  alt="Meet Vaghasiya" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Meet Vaghasiya</h3>
              <p className="text-gray-600">CTO</p>
              <p className="text-sm text-gray-500">Tech Lead</p>
            </div>
            <div className="text-center transition-transform duration-500 hover:-translate-y-2">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-farm-green-100 hover:border-farm-green-400 transition-all duration-300 transform hover:scale-105 animate-float" style={{ animationDelay: '1000ms' }}>
                <img 
                  src={yashVaghasiya} 
                  alt="Yash Vaghasiya" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Yash Vaghasiya</h3>
              <p className="text-gray-600">Head of Operations</p>
              <p className="text-sm text-gray-500">Development Lead</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 