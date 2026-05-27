import React from "react";
import { Helmet } from "react-helmet-async";
import { motion as Motion } from "framer-motion";
import {
  ShieldCheck,
  Eye,
  Database,
  Lock,
  Share2,
  RefreshCw,
  FileText,
  CreditCard,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const PolicySection = ({ icon: Icon, title, content }) => (
  <Motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    whileHover={{ y: -2 }}
    className="relative flex gap-5 md:gap-8"
  >
    {/* Timeline */}
    <div className="hidden md:flex flex-col items-center">
      <div className="p-3 bg-white/90 backdrop-blur border border-green-100 rounded-2xl shadow-sm z-10">
        <Icon className="w-6 h-6 text-green-600" />
      </div>

      <div className="w-[2px] flex-1 bg-gradient-to-b from-green-200 via-lime-100 to-transparent mt-2"></div>
    </div>

    {/* Card */}
    <div className="flex-1 bg-white/80 backdrop-blur-sm border border-white shadow-md rounded-3xl p-6 md:p-8 hover:shadow-lg transition-all duration-300">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 mb-4 md:hidden">
        <div className="p-2 bg-green-100 rounded-xl">
          <Icon className="w-5 h-5 text-green-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-800">
          {title}
        </h3>
      </div>

      {/* Desktop Header */}
      <h3 className="hidden md:block text-2xl font-bold text-gray-800 mb-5">
        {title}
      </h3>

      <div className="text-gray-600 leading-8 space-y-4 text-[15.5px]">
        {content}
      </div>
    </div>
  </Motion.div>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 pt-24 pb-24 px-5 md:px-8 overflow-hidden">
      <Helmet>
        <title>Privacy Policy | HaatOnline</title>

        <meta
          name="description"
          content="Read the Privacy Policy for HaatOnline. Learn how we collect, use, and protect your data, payment security, user rights, and more."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <Motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            Your Data is Safe
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-5 tracking-tight">
            Privacy Policy
          </h1>

          <p className="text-gray-500 text-base md:text-lg">
            Last updated: May 2026 • HaatOnline Team
          </p>
        </Motion.div>

        {/* Sections */}
        <div className="space-y-8">
          <PolicySection
            icon={Database}
            title="Information Collected"
            content={
              <>
                <p>
                  We collect your name, phone number, and delivery
                  address to process orders and provide delivery
                  updates.
                </p>

                <p>
                  Order history and preferences may be stored to
                  improve your shopping experience.
                </p>
              </>
            }
          />

          <PolicySection
            icon={Eye}
            title="How Data is Used"
            content={
              <>
                <p>
                  Your data is used to process orders, manage your
                  account, improve services, and communicate important
                  updates.
                </p>

                <p>
                  Promotional offers may occasionally be sent with
                  clear opt-out options.
                </p>
              </>
            }
          />

          <PolicySection
            icon={FileText}
            title="Cookies & Tracking"
            content={
              <>
                <p>
                  We use essential cookies and analytics to maintain
                  login sessions, understand user activity, and improve
                  overall performance.
                </p>
              </>
            }
          />

          <PolicySection
            icon={CreditCard}
            title="Payment Security"
            content={
              <>
                <p>
                  Payments are securely handled by trusted providers
                  like eSewa and Khalti.
                </p>

                <p>
                  We never store your card details or payment
                  credentials on our servers.
                </p>
              </>
            }
          />

          <PolicySection
            icon={Share2}
            title="Third-party Services"
            content={
              <>
                <p>
                  We do not sell, trade, or rent your personal
                  information to third parties.
                </p>

                <p>
                  Trusted partners such as payment gateways or
                  analytics providers may process limited data required
                  for operations.
                </p>
              </>
            }
          />

          <PolicySection
            icon={Lock}
            title="User Rights"
            content={
              <>
                <p>
                  You may request access, correction, or deletion of
                  your personal information at any time by contacting
                  our support team.
                </p>
              </>
            }
          />

          <PolicySection
            icon={RefreshCw}
            title="Data Retention"
            content={
              <>
                <p>
                  We retain your data only for as long as necessary for
                  order fulfillment, legal compliance, and operational
                  requirements.
                </p>
              </>
            }
          />

          <PolicySection
            icon={ShieldCheck}
            title="Contact Information"
            content={
              <>
                <p>
                  For privacy-related questions or concerns, contact us
                  at{" "}
                  <a
                    href="mailto:haatsupport@gmail.com"
                    className="underline text-green-700 hover:text-green-800"
                  >
                    haatsupport@gmail.com
                  </a>
                </p>

                <p>Phone: +977 9869301915</p>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}