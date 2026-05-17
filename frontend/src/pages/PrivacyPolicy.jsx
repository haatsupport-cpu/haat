import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Database, Lock, Share2, RefreshCw, FileText, CreditCard } from 'lucide-react';

const PolicySection = ({ icon: Icon, title, content }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-10 flex gap-6"
  >
    <div className="hidden md:flex flex-col items-center">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-green-100 mb-2">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <div className="w-px h-full bg-gradient-to-b from-green-100 to-transparent"></div>
    </div>
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 flex-1">
      <div className="flex items-center gap-3 mb-4 md:hidden">
         <Icon className="w-5 h-5 text-green-600" />
         <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <h3 className="hidden md:block text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="text-gray-600 leading-relaxed space-y-4">
        {content}
      </div>
    </div>
  </motion.div>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8faf7] pt-20 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6">
            <ShieldCheck className="w-4 h-4" />
            Your Data is Safe
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: May 2024 • HaatOnline Team</p>
        </div>

        <div className="space-y-4">
          <PolicySection 
            icon={Database}
            title="Information We Collect"
            content={
              <>
                <p>To provide a smooth delivery service, we collect basic information such as your <strong>name, phone number, and delivery address</strong>. This is strictly used to fulfill your orders and communicate delivery status.</p>
                <p>We also collect account-related data like order history to help you reorder your favorite groceries quickly.</p>
              </>
            }
          />

          <PolicySection 
            icon={Eye}
            title="How We Use Your Data"
            content={
              <p>Your data is primarily used to process orders, manage accounts, and improve our services. Occasionally, we may send you notifications regarding order updates or exclusive HaatOnline offers, which you can opt-out of at any time.</p>
            }
          />

          <PolicySection 
            icon={Lock}
            title="Data Protection & Security"
            content={
              <p>We implement modern security measures to protect your personal information. Your account is password-protected, and we use encrypted connections for data transmission to ensure no unauthorized access occurs.</p>
            }
          />

          <PolicySection 
            icon={CreditCard}
            title="Third-Party Payment Providers"
            content={
              <p>For online payments, we use trusted providers like <strong>eSewa</strong> and <strong>Khalti</strong>. HaatOnline does not store your credit card details or payment credentials on our own servers. Payment processing is handled securely by these specialized third-party platforms.</p>
            }
          />

          <PolicySection 
            icon={Share2}
            title="No Selling of Data"
            content={
              <p className="font-semibold text-gray-800 italic underline decoration-green-300 underline-offset-4">
                We have a strict policy: We never sell, trade, or rent your personal identification information to others. 
              </p>
            }
          />

          <PolicySection 
            icon={FileText}
            title="Cookies & Analytics"
            content={
              <p>We use essential cookies to keep you logged in and basic analytics to understand how our website is used. This helps us optimize the user experience and ensure the platform runs smoothly.</p>
            }
          />

          <PolicySection 
            icon={RefreshCw}
            title="Policy Updates"
            content={
              <p>HaatOnline may update this policy from time to time. When we do, we will revise the date at the top of this page. We encourage users to frequently check this page for any changes.</p>
            }
          />
        </div>

        <div className="mt-16 text-center text-gray-400 text-sm">
          By using HaatOnline, you signify your acceptance of this policy.
        </div>
      </div>
    </div>
  );
}