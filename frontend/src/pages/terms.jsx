import React from "react";
import { motion as Motion } from "framer-motion";
import {
  FileText,
  ShoppingBag,
  Truck,
  CreditCard,
  RefreshCw,
  Gift,
  ShieldCheck,
  Globe,
  AlertTriangle,
  Lock,
  Phone,
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

const TermsSection = ({ icon: Icon, title, content }) => (
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
        {React.createElement(Icon, { className: "w-6 h-6 text-green-600" })}
      </div>

      <div className="w-[2px] flex-1 bg-gradient-to-b from-green-200 via-lime-100 to-transparent mt-2"></div>
    </div>

    {/* Card */}
    <div className="flex-1 bg-white/80 backdrop-blur-sm border border-white shadow-md rounded-3xl p-6 md:p-8 hover:shadow-lg transition-all duration-300">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 mb-4 md:hidden">
        <div className="p-2 bg-green-100 rounded-xl">
          {React.createElement(Icon, { className: "w-5 h-5 text-green-600" })}
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

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 pt-24 pb-24 px-5 md:px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-5 tracking-tight">
            Terms of Service
          </h1>

          <p className="text-gray-500 text-base md:text-lg">
            Last updated: May 2026 • HaatOnline Team
          </p>
        </Motion.div>

        {/* Sections */}
        <div className="space-y-8">
          <TermsSection
            icon={ShoppingBag}
            title="Order Acceptance"
            content={
              <>
                <p>
                  All orders placed through HaatOnline are subject to
                  product availability, delivery coverage, and order
                  confirmation.
                </p>

                <p>
                  HaatOnline reserves the right to cancel or reject any
                  order at its sole discretion.
                </p>
              </>
            }
          />

          <TermsSection
            icon={Truck}
            title="Delivery Terms"
            content={
              <>
                <p>
                  Delivery times shown on the platform are estimated and
                  may vary depending on traffic, weather conditions,
                  order volume, or unforeseen circumstances.
                </p>

                <p>
                  Customers are responsible for providing accurate
                  delivery information including address and contact
                  number.
                </p>

                <p>
                  Delivery charges may vary depending on location,
                  delivery type, and peak hours.
                </p>
              </>
            }
          />

          <TermsSection
            icon={CreditCard}
            title="Payments"
            content={
              <>
                <p>
                  We support multiple payment methods including Cash on
                  Delivery (COD), eSewa, Khalti, ConnectIPS, and debit
                  or credit cards.
                </p>

                <p>
                  Online orders are processed only after successful
                  payment confirmation.
                </p>

                <p>
                  Additional handling or service charges may apply based
                  on payment method or order type.
                </p>
              </>
            }
          />

          <TermsSection
            icon={RefreshCw}
            title="Refunds & Cancellations"
            content={
              <>
                <p>
                  Refund requests are reviewed on a case-by-case basis.
                </p>

                <p>
                  Approved refunds may take up to 24–72 hours depending
                  on the payment provider.
                </p>

                <p>
                  Orders may not be cancelled once preparation or
                  dispatch has started.
                </p>
              </>
            }
          />

          <TermsSection
            icon={Gift}
            title="Offers & Promotions"
            content={
              <>
                <p>
                  Discounts, promo codes, cashback offers, and special
                  campaigns may be available for limited periods only.
                </p>

                <p>
                  HaatOnline reserves the right to modify or discontinue
                  offers without prior notice.
                </p>
              </>
            }
          />

          <TermsSection
            icon={ShieldCheck}
            title="User Responsibilities"
            content={
              <>
                <p>
                  Users agree to provide accurate information and use
                  the platform only for lawful purposes.
                </p>

                <p>
                  Attempting to misuse, disrupt, hack, or manipulate the
                  platform is strictly prohibited.
                </p>
              </>
            }
          />

          <TermsSection
            icon={Globe}
            title="Third-Party Services"
            content={
              <>
                <p>
                  HaatOnline may integrate third-party services such as
                  payment gateways, maps, analytics, and messaging
                  platforms.
                </p>

                <p>
                  We are not responsible for issues or interruptions
                  caused by third-party providers.
                </p>
              </>
            }
          />

          <TermsSection
            icon={AlertTriangle}
            title="Limitation of Liability"
            content={
              <>
                <p>
                  HaatOnline does not guarantee uninterrupted or
                  error-free operation of the platform.
                </p>

                <p>
                  We are not liable for indirect, incidental, or
                  consequential damages resulting from the use of our
                  services.
                </p>
              </>
            }
          />

          <TermsSection
            icon={Lock}
            title="Privacy & Data"
            content={
              <>
                <p>
                  By using HaatOnline, you agree to our Privacy Policy
                  and consent to the collection and use of information
                  as outlined there.
                </p>
              </>
            }
          />

          <TermsSection
            icon={Phone}
            title="Contact & Updates"
            content={
              <>
                <p>
                  HaatOnline reserves the right to update these Terms &
                  Conditions at any time without prior notice.
                </p>

                <p>
                  Continued use of the platform after updates
                  constitutes acceptance of the revised terms.
                </p>
              </>
            }
          />
        </div>

        {/* Footer */}
        <Motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block bg-white/70 backdrop-blur border border-gray-100 px-6 py-4 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm md:text-base">
              By using HaatOnline, you acknowledge and agree to these
              Terms & Conditions.
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
