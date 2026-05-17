import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Facebook, Clock, MessageSquare, MapPin } from 'lucide-react';

const ContactCard = ({ icon: Icon, title, detail, subDetail, link }) => (
  <motion.a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -5 }}
    className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
  >
    <div className="p-4 bg-green-50 rounded-full mb-4">
      <Icon className="w-8 h-8 text-green-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-green-700 font-semibold text-center">{detail}</p>
    {subDetail && <p className="text-gray-500 text-sm mt-1 text-center">{subDetail}</p>}
  </motion.a>
);

export default function Contact() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 pt-20 pb-16 px-6">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wide text-green-700 uppercase bg-green-100 rounded-full"
        >
          Contact Support
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
        >
          We're here to help <span className="text-green-600">HaatOnline</span> users.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 leading-relaxed"
        >
          Have a question about your order or need assistance with our service? 
          Our team is available 7 days a week to ensure your grocery shopping is seamless.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <ContactCard 
          icon={Phone} 
          title="Call or WhatsApp" 
          detail="+977 986-9301915"
          subDetail="Direct line for urgent inquiries"
          link="tel:+9779869301915"
        />
        <ContactCard 
          icon={Mail} 
          title="Email Us" 
          detail="haatonline@gmail.com"
          subDetail="Response within 2-4 hours"
          link="mailto:haatonline@gmail.com"
        />
        <ContactCard 
          icon={Facebook} 
          title="Facebook" 
          detail="Online Haat - हाट"
          subDetail="Follow us for updates & deals"
          link="https://facebook.com" 
        />
        
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-3 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 mt-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Operating Hours</h3>
            </div>
            <p className="text-gray-600 text-lg mb-2">We deliver fresh groceries every day.</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-xl">
                <span className="font-bold text-green-700">Sunday – Saturday</span>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-xl">
                <span className="font-bold text-green-700">7:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full md:w-auto">
             <div className="bg-green-600 rounded-2xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2">Instant Support</h4>
                  <p className="text-green-50 opacity-90 mb-4">The fastest way to reach us is via WhatsApp or Phone call during operating hours.</p>
                  <button 
                    onClick={() => window.location.href = 'tel:+9779869301915'}
                    className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Start Chat
                  </button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500"></div>
             </div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}