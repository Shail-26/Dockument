import React, { useState } from 'react';
import { Shield, Share2, Smartphone, Lock, Clock, Database } from 'lucide-react';

export function Features() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Military-grade encryption ensures your files are protected at all times.',
      details: [
        'AES-256 encryption for all stored files',
        'Blockchain verification for file integrity',
        'Zero-knowledge encryption architecture',
        'Regular security audits and updates',
      ],
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share files securely with customizable access controls.',
      details: [
        'Granular permission settings',
        'Time-limited access links',
        'Activity logging and tracking',
        'Revocable access rights',
      ],
    },
    {
      icon: Smartphone,
      title: 'Mobile Access',
      description: 'Access your files from any device, anywhere.',
      details: [
        'Responsive web interface',
        'Native mobile apps',
        'Offline file access',
        'Cross-device synchronization',
      ],
    },
    {
      icon: Lock,
      title: 'Privacy Control',
      description: 'You have complete control over your data privacy.',
      details: [
        'End-to-end encryption',
        'Custom privacy settings',
        'GDPR compliance',
        'Data residency options',
      ],
    },
    {
      icon: Clock,
      title: 'Version Control',
      description: 'Track and manage file versions effortlessly.',
      details: [
        'Automatic version tracking',
        'File history management',
        'Version comparison',
        'Restore previous versions',
      ],
    },
    {
      icon: Database,
      title: 'Backup & Recovery',
      description: 'Never lose your important files with automated backups.',
      details: [
        'Automated backup scheduling',
        'Quick file recovery',
        'Redundant storage',
        'Disaster recovery planning',
      ],
    },
  ];

  return (
    <div className="page-transition pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            Powerful Features for Secure Storage
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how SecureChain Locker can transform your digital storage experience with our comprehensive feature set.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <button
                key={index}
                className={`card text-left cursor-pointer transition-all duration-300 ${
                  activeTab === index
                    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                    : 'hover:shadow-xl'
                }`}
                onClick={() => setActiveTab(index)}
              >
                <feature.icon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </button>
            ))}
          </div>

          {/* Feature Details */}
          <div className="mt-16">
            <div className="card">
              <div className="flex items-center mb-6">
                {React.createElement(features[activeTab].icon, {
                  className: "w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-3"
                })}
                <h3 className="text-2xl font-bold">{features[activeTab].title}</h3>
              </div>
              <ul className="grid md:grid-cols-2 gap-4">
                {features[activeTab].details.map((detail, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}