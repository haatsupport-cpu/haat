import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, ShoppingBag, CreditCard, Truck, AlertCircle, HelpCircle } from 'lucide-react';

const FAQItem = ({ question, answer, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-green-50/30"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-50 rounded-lg">
            {React.createElement(Icon, { className: "w-5 h-5 text-green-600" })}
          </div>
          <span className="font-bold text-gray-800 md:text-lg">{question}</span>
        </div>
        <Motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </Motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">
              {answer}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQs() {
  const faqData = [
    {
      icon: ShoppingBag,
      question: "How do I place an order?",
      answer: "Simply browse our products, add your fresh groceries to the cart, and proceed to checkout. You'll need to create an account or log in to confirm your delivery address."
    },
    {
      icon: CreditCard,
      question: "What payment methods do you accept?",
      answer: "We support multiple payment options for your convenience: Cash on Delivery (COD), eSewa, and Khalti. You can select your preferred method during checkout."
    },
    {
      icon: Truck,
      question: "How long does delivery take?",
      answer: "Most orders are delivered within 2-4 hours depending on your location and the time of order. Orders placed late in the evening may be scheduled for the next morning at 7:00 AM."
    },
    {
      icon: AlertCircle,
      question: "What if I receive a damaged or wrong item?",
      answer: "Quality is our priority. If you receive a damaged or incorrect item, please notify our delivery rider immediately or call us within 1 hour of delivery for a free replacement or refund."
    },
    {
      icon: HelpCircle,
      question: "Can I cancel my order?",
      answer: "Yes, you can cancel your order within 15 minutes of placing it through the app. For later cancellations, please contact our support team immediately."
    },
    {
      icon: Truck,
      question: "Which areas do you deliver to?",
      answer: "Currently, we operate in major local residential hubs. You can check if we deliver to your specific location by entering your address at the top of the homepage."
    },
    {
      icon: HelpCircle,
      question: "How can I contact customer support?",
      answer: "You can reach us via WhatsApp at +977 986-9301915, email us at haatsupport@gmail.com, or message us on our Facebook page 'Online Haat'."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfb] pt-20 pb-20 px-6">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-600 font-bold mb-3 tracking-widest uppercase text-sm"
        >
          Help Center
        </Motion.div>
        <Motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
        >
          Questions? We've got <span className="text-green-600 text-shadow-sm">Answers.</span>
        </Motion.h1>
        
        {/* Modern Search Bar Visual */}
        <div className="relative max-w-xl mx-auto mt-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search for a question..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {faqData.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </Motion.div>

        {/* Still have questions? */}
        <Motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 bg-green-600 rounded-3xl text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-green-100 mb-6">Can't find the answer you're looking for? Please chat with our friendly team.</p>
          <a href="/contact-us" className="inline-block bg-white text-green-700 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg">
            Get in Touch
          </a>
        </Motion.div>
      </div>
    </div>
  );
}
