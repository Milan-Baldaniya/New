import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Handle form submission here
    console.log('Form submitted:', formData);
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl font-bold text-gray-900 mb-4 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Contact Us
          </h1>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Have questions about our farm marketplace? We're here to help! Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className={`transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} hover:shadow-lg`}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-farm-green-100 rounded-full flex items-center justify-center transform transition-transform duration-500 hover:scale-110 hover:bg-farm-green-200">
                        <MapPin className="h-5 w-5 text-farm-green-600 animate-bounce-subtle" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Address</h3>
                      <p className="text-gray-600">
                        Manki Complex<br />
                        Valetva<br />
                        Anand, Gujarat
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-farm-green-100 rounded-full flex items-center justify-center transform transition-transform duration-500 hover:scale-110 hover:bg-farm-green-200">
                        <Phone className="h-5 w-5 text-farm-green-600 animate-pulse-subtle" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Phone</h3>
                      <p className="text-gray-600">+91 90999 12592</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-farm-green-100 rounded-full flex items-center justify-center transform transition-transform duration-500 hover:scale-110 hover:bg-farm-green-200">
                        <Mail className="h-5 w-5 text-farm-green-600 animate-pulse-subtle" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">support@farmchain.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-farm-green-100 rounded-full flex items-center justify-center transform transition-transform duration-500 hover:scale-110 hover:bg-farm-green-200">
                        <Clock className="h-5 w-5 text-farm-green-600 animate-spin-slow" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 10:00 AM - 4:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`transition-all duration-700 delay-700 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} hover:shadow-lg`}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Farmers</h2>
                <p className="text-gray-600 mb-4">
                  Are you a farmer interested in joining our marketplace? We'd love to hear from you!
                </p>
                <Button 
                  variant="outline" 
                  className="w-full transition-all duration-300 hover:bg-farm-green-100 hover:border-farm-green-400 hover:text-farm-green-700 group"
                >
                  <span className="mr-2 transition-transform duration-300 group-hover:scale-110">🌱</span>
                  Become a Farmer Partner
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className={`transition-all duration-700 delay-900 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} hover:shadow-lg`}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="transition-all duration-300 transform hover:translate-x-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="transition-all duration-300 focus:border-farm-green-400 focus:ring-farm-green-300"
                  />
                </div>
                <div className="transition-all duration-300 transform hover:translate-x-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="transition-all duration-300 focus:border-farm-green-400 focus:ring-farm-green-300"
                  />
                </div>
                <div className="transition-all duration-300 transform hover:translate-x-1">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="transition-all duration-300 focus:border-farm-green-400 focus:ring-farm-green-300"
                  />
                </div>
                <div className="transition-all duration-300 transform hover:translate-x-1">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    required
                    className="min-h-[150px] transition-all duration-300 focus:border-farm-green-400 focus:ring-farm-green-300"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 hover:bg-farm-green-700 group relative overflow-hidden"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⟳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                      <span>Send Message</span>
                      <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12"></span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact; 