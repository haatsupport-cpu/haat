import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo1 from "../../assets/logobg.png";

import {
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Music2,
  ChevronUp,
  Phone,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

const quickLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "FAQs", to: "/FAQ" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-and-conditions" },
];

const paymentMethods = [
  { label: "eSewa", accent: "#2ab600" },
  { label: "Khalti", accent: "#ee3232" },
  { label: "Cash on Delivery", accent: "#f97316" },
  { label: "NepalPay", accent: "#0ea5e9" },
];

const MotionDiv = motion.div;

const SocialButton = ({ href, icon, label }) => {
  const Icon = icon;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#2ab600] hover:bg-[#2ab600] hover:text-black hover:shadow-[0_0_20px_rgba(42,182,0,0.45)]"
    >
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
};

export default function Footer() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050505] text-white">
  {/* BACKGROUND GLOW */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,182,0,0.12),transparent_30%)]" />

  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(42,182,0,0.08),transparent_35%)]" />

  <div className="relative mx-auto max-w-7xl px-5 py-14">
    {/* TOP SECTION */}
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr_.8fr_.9fr]">
      
      {/* BRAND */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#2ab600]/30 hover:bg-white/[0.05]"
      >
        <img
          src={logo1}
          alt="HaatOnline Logo"
          className="h-14 w-auto object-contain"
        />

        <p className="mt-4 text-sm leading-6 text-slate-400">
          Fresh groceries and essentials delivered quickly across Nepal with
          reliable same-day service.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#2ab600]/20 bg-[#2ab600]/10 px-3 py-2 text-xs text-[#9dff7c] w-fit">
          <span className="h-2 w-2 rounded-full bg-[#2ab600] animate-pulse" />
          Delivering across Nepal
        </div>

        <div className="mt-5 flex items-center gap-3">
          <SocialButton
            href="https://facebook.com"
            icon={Facebook}
            label="Facebook"
          />

          <SocialButton
            href="https://instagram.com"
            icon={Instagram}
            label="Instagram"
          />

          <SocialButton
            href="https://tiktok.com"
            icon={Music2}
            label="TikTok"
          />
        </div>
      </MotionDiv>

      {/* QUICK LINKS */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#2ab600]/20"
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#2ab600]">
          Quick Links
        </p>

        <ul className="space-y-4">
          {quickLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className="text-sm text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </MotionDiv>

      {/* CONTACT */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#2ab600]/20"
      >
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#2ab600]">
          Contact
        </p>

        <div className="space-y-4 text-sm text-slate-400">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-[#2ab600]" />
            <span>Station Road, Hetauda</span>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-[#2ab600]" />
            <span>+977 9869301915</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-[#2ab600]" />
            <span>8am – 10pm</span>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-[#2ab600]" />
            <span>haatsupport@gmail.com</span>
          </div>
        </div>
      </MotionDiv>

      {/* PAYMENTS */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#2ab600]/20"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2ab600]">
            Payments
          </p>

          <Shield className="h-4 w-4 text-[#2ab600]" />
        </div>

        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <div
              key={method.label}
              className="rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm text-slate-300 transition-all duration-300 hover:border-[#2ab600]/30 hover:bg-[#2ab600]/10 hover:text-white"
            >
              {method.label}
            </div>
          ))}
        </div>
      </MotionDiv>
    </div>

    {/* BOTTOM */}
    <div className="mt-10 border-t border-white/10 pt-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} HaatOnline. All rights reserved.
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Fresh groceries</span>

          <span className="h-1 w-1 rounded-full bg-[#2ab600]/50" />

          <span>Fast delivery</span>

          <span className="h-1 w-1 rounded-full bg-[#2ab600]/50" />

          <span>Trusted local sellers</span>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2ab600] transition-all duration-300 hover:-translate-y-1 hover:border-[#2ab600]/40 hover:bg-[#2ab600] hover:text-black"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      </div>
    </div>
  </div>
</footer>
  );
}
