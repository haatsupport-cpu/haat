import React from "react";
import { motion as Motion } from "framer-motion";
import {
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Music2,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const ContactCard = ({
  icon: Icon,
  title,
  detail,
  subDetail,
  link,
  iconBg = "bg-green-50",
  iconColor = "text-green-600",
}) => (
  <Motion.a
    variants={itemVariants}
    href={link}
    whileHover={{ y: -6, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
  >
    <div className={`p-4 ${iconBg} rounded-full mb-5`}>
      {React.createElement(Icon, { className: `w-7 h-7 ${iconColor}` })}
    </div>

    <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
      {title}
    </h3>

    <p className="text-green-700 font-semibold text-center break-all">
      {detail}
    </p>

    {subDetail && (
      <p className="text-gray-500 text-sm mt-2 text-center leading-relaxed">
        {subDetail}
      </p>
    )}
  </Motion.a>
);

export default function Contact() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 pt-24 pb-20 px-6">
      {/* HERO */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 mb-5 text-sm font-semibold tracking-wide text-green-700 uppercase bg-green-100 rounded-full"
        >
          Contact Support
        </Motion.div>

        <Motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight"
        >
          We’re here to help{" "}
          <span className="text-green-600">HaatOnline</span> users.
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
        >
          Have a question about your order or need assistance with our
          service? Our team is available 7 days a week to ensure your grocery
          shopping is seamless.
        </Motion.p>
      </div>

      {/* CONTACT CARDS */}
      <Motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <ContactCard
          icon={FaWhatsapp}
          title="WhatsApp"
          detail="+977 9869301915"
          subDetail="Fastest support available"
          link="https://wa.me/9779869301915"
        />

        <ContactCard
          icon={Phone}
          title="Call Us"
          detail="+977 9869301915"
          subDetail="Direct support during business hours"
          link="tel:+9779869301915"
        />

        <ContactCard
          icon={Mail}
          title="Email Us"
          detail="haatsupport@gmail.com"
          subDetail="Usually replies within 2-4 hours"
          link="mailto:haatsupport@gmail.com"
        />

        

        <ContactCard
          icon={FaInstagram}
          title="Instagram"
          detail="@haatonline"
          subDetail="Follow for updates & offers"
          link="https://instagram.com"
          iconBg="bg-pink-50"
          iconColor="text-pink-600"
        />

        <ContactCard
          icon={FaFacebookF}
          title="Facebook"
          detail="Online Haat - हाट"
          subDetail="Follow for updates & offers"
          link="https://facebook.com"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <ContactCard
          icon={Music2}
          title="TikTok"
          detail="Online Haat - हाट"
          subDetail="Follow for updates & offers"
          link="https://facebook.com"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        {/* OPERATING HOURS */}
        <Motion.div
          variants={itemVariants}
          className="lg:col-span-3 bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-10 mt-2"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                Operating Hours
              </h3>
            </div>

            <p className="text-gray-600 text-lg mb-5">
              We deliver fresh groceries every single day.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-gray-50 px-5 py-3 rounded-2xl">
                <span className="font-bold text-green-700">
                  Sunday – Saturday
                </span>
              </div>

              <div className="bg-gray-50 px-5 py-3 rounded-2xl">
                <span className="font-bold text-green-700">
                  7:00 AM – 8:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* SUPPORT BOX */}
          <div className="flex-1 w-full">
            <div className="bg-green-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-lg">
              <div className="relative z-10">
                <h4 className="text-2xl font-bold mb-3">
                  Instant Support
                </h4>

                <p className="text-green-50/90 mb-6 leading-relaxed">
                  Need quick help? Reach out via WhatsApp for the fastest
                  response from our support team.
                </p>

                <a
                  href="https://wa.me/9779869301915"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Chat
                </a>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-green-400 rounded-full opacity-20 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
            </div>
          </div>
        </Motion.div>
      </Motion.div>
    </div>
  );
}
