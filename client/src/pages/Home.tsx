import React from 'react';
import { Shield, Share2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold font-poppins bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-6">
            Secure Your Digital Assets with Blockchain
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience unparalleled security and transparency with our blockchain-powered storage solution.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="gradient-btn">
              Get Started Free
            </Link>
            <Link to="/features" className="px-6 py-3 text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 font-poppins">
            Why Choose SecureChain Locker?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Storage',
                description: 'Military-grade encryption combined with blockchain technology ensures your data remains private and tamper-proof.',
              },
              {
                icon: Share2,
                title: 'Easy Sharing',
                description: 'Share files securely with customizable access controls and detailed activity logging.',
              },
              {
                icon: Smartphone,
                title: 'Mobile Access',
                description: 'Access your files anywhere, anytime with our responsive mobile interface.',
              },
            ].map((feature, index) => (
              <div key={index} className="card hover:shadow-xl transition-shadow duration-300">
                <feature.icon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 font-poppins">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Digital Artist',
                content: 'SecureChain Locker has revolutionized how I store and share my digital artwork. The security features give me peace of mind.',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
              },
              {
                name: 'Michael Chen',
                role: 'Tech Entrepreneur',
                content: 'The blockchain integration is brilliant. It\'s exactly what we needed for our company\'s sensitive documents.',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Legal Consultant',
                content: 'The audit trail and access controls are fantastic. Perfect for maintaining client confidentiality.',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
              },
            ].map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}