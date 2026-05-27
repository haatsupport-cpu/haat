import React from "react";
import { Helmet } from "react-helmet-async";
import { FileText, ShoppingBag, Truck, CreditCard, RefreshCw, Gift, ShieldCheck, Globe, AlertTriangle, Lock, Phone } from "lucide-react";
import { motion as Motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" },
  },
};

const TermsSection = ({ icon: Icon, title, content }) => (
  <Motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    whileHover={{ y: -2 }}
    className="relative flex gap-5 md:gap-8"
  >
    <div className="hidden md:flex flex-col items-center">
      <div className="p-3 bg-white/90 backdrop-blur border border-green-100 rounded-2xl shadow-sm z-10">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <div className="w-[2px] flex-1 bg-gradient-to-b from-green-200 via-lime-100 to-transparent mt-2"></div>
    </div>
    <div className="flex-1 bg-white/80 backdrop-blur-sm border border-white shadow-md rounded-3xl p-6 md:p-8 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 md:hidden">
        <div className="p-2 bg-green-100 rounded-xl">
          <Icon className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <h3 className="hidden md:block text-2xl font-bold text-gray-800 mb-5">{title}</h3>
      <div className="text-gray-600 leading-8 space-y-4 text-[15.5px]">{content}</div>
    </div>
  </Motion.div>
);

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 pt-24 pb-24 px-5 md:px-8 overflow-hidden">
      <Helmet>
        <title>Terms & Conditions | HaatOnline</title>
        <meta name="description" content="Read the Terms & Conditions for using HaatOnline. Learn about user responsibilities, orders, payments, delivery, refunds, and more." />
      </Helmet>
      <div className="max-w-5xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6 shadow-sm">
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-5 tracking-tight">Terms of Service</h1>
          <p className="text-gray-500 text-base md:text-lg">Last updated: May 2026 • HaatOnline Team</p>
        </Motion.div>
        <div className="space-y-8">
          <TermsSection icon={ShoppingBag} title="Acceptance of Terms" content={<><p>By using HaatOnline, you agree to these Terms & Conditions. Please read them carefully before registering or placing orders.</p></>} />
          <TermsSection icon={ShieldCheck} title="User Responsibilities" content={<><p>Users must provide accurate information and keep their account credentials secure. Any misuse or fraudulent activity may result in account suspension.</p></>} />
          <TermsSection icon={ShoppingBag} title="Orders & Payments" content={<><p>All orders are subject to product availability and confirmation. Payments must be made using supported methods. Orders may be cancelled or refunded as per our policy.</p></>} />
          <TermsSection icon={Truck} title="Delivery Policy" content={<><p>Delivery times are estimates and may vary. Ensure your address and contact details are correct to avoid delays.</p></>} />
          <TermsSection icon={RefreshCw} title="Refund Policy" content={<><p>Refunds are processed on a case-by-case basis. Approved refunds may take up to 72 hours depending on the payment provider.</p></>} />
          <TermsSection icon={AlertTriangle} title="Prohibited Activities" content={<><p>Any illegal, abusive, or fraudulent activities are strictly prohibited and may result in legal action.</p></>} />
          <TermsSection icon={Lock} title="Limitation of Liability" content={<><p>HaatOnline is not liable for indirect damages, delays, or losses beyond our control. Our liability is limited to the value of your order.</p></>} />
          <TermsSection icon={Phone} title="Contact Information" content={<><p>For questions, contact us at <a href="mailto:haatsupport@gmail.com" className="underline text-green-700 hover:text-green-800">haatsupport@gmail.com</a> or +977 9869301915.</p></>} />
        </div>
      </div>
    </div>
  );
}
