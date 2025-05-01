import React from 'react';
import { Shield, Users, Globe } from 'lucide-react';

export function About() {
  const teamMembers = [
    {
      name: 'Triparna Kar',
      role: '',
      bio: '22CS29',
      image: '',
    },
    {
      name: 'Shail Macwan',
      role: '',
      bio: '22CS035',
      image: '',
    },
    {
      name: 'Ayush Mistri',
      role: '',
      bio: '22CS041',
      image: '',
    },
  ];

  return (
    <div className="page-transition pt-16 ">
      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            Securing the Future of Digital Storage
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            At Dockument, we're revolutionizing digital storage by combining blockchain technology
            with state-of-the-art encryption to provide the most secure and transparent storage solution.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: Shield,
                title: 'Security First',
                description: 'Military-grade encryption and blockchain verification for unparalleled security.',
              },
              {
                icon: Users,
                title: 'User Focused',
                description: 'Intuitive interface designed for both technical and non-technical users.',
              },
              {
                icon: Globe,
                title: 'Global Access',
                description: 'Access your files securely from anywhere in the world, anytime.',
              },
            ].map((item, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  <item.icon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 hover:shadow-xl transition-all duration-300">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-center mb-1">{member.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-center mb-3">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-300 text-center">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}