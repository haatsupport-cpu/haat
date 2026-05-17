import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Truck,
  Handshake,
  Facebook,
  Instagram,
  Music2,
  ChevronUp,
  Phone,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

const featureItems = [
  {
    icon: MapPin,
    label: "HQ Location",
    value: "Hetauda, Nepal",
  },
  {
    icon: Mail,
    label: "Email",
    value: "haatonline@gmail.com",
    href: "mailto:haatonline@gmail.com",
  },
  {
    icon: Truck,
    label: "Delivery Support",
    value: "Fast Same-Day Delivery",
  },
  {
    icon: Handshake,
    label: "Partner With Us",
    value: "Become a Seller",
    href: "/admin",
  },
];

const quickLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "FAQs", to: "/FAQ" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];

const paymentMethods = [
  { label: "eSewa", accent: "#10b981" },
  { label: "Khalti", accent: "#8b5cf6" },
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
      className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-green-400 hover:bg-green-400 hover:text-black hover:shadow-[0_0_20px_rgba(74,222,128,0.45)]"
    >
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
};

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-all duration-300 hover:text-white"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-green-400 transition-all duration-300 group-hover:bg-green-400 group-hover:text-black">
        <Sparkles className="h-3 w-3" />
      </span>

      <span className="group-hover:translate-x-1 transition-transform duration-300">
        {children}
      </span>
    </Link>
  </li>
);

const PaymentCard = ({ label, accent }) => (
  <div className="group rounded-xl border border-white/5 bg-black/20 p-3 transition-all duration-300 hover:border-green-400/30 hover:bg-green-500/10">
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-slate-200">{label}</span>

      <div
        className="h-2.5 w-2.5 rounded-full shadow-lg"
        style={{
          backgroundColor: accent,
          boxShadow: `0 0 14px ${accent}`,
        }}
      />
    </div>
  </div>
);

export default function Footer() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden bg-[#020617] text-white">
      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-14">
        {/* FEATURE STRIP */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-6 grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4"
        >
          {featureItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-300">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>

                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block text-sm font-medium text-white hover:text-green-300"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-white">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </MotionDiv>

        {/* MAIN GRID */}
        <div className="grid gap-4 lg:grid-cols-[1.2fr_.7fr_.8fr_.9fr]">
          {/* BRAND */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-[0_0_20px_rgba(74,222,128,0.35)]">
                <span className="text-xl font-black">H</span>
              </div>

              <div>
                <h2 className="text-lg font-bold">HaatOnline</h2>

                <p className="text-[10px] uppercase tracking-[0.22em] text-green-300/80">
                  Grocery Delivery
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Fresh groceries and essentials delivered across Nepal with fast,
              reliable same-day service.
            </p>

            {/* STATUS */}
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-500/10 bg-green-500/5 px-3 py-2 text-xs text-green-300 w-fit">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Delivering across Nepal
            </div>

            {/* SOCIALS */}
            <div className="mt-5 flex items-center gap-2">
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

          {/* LINKS */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            viewport={{ once: true }}
            className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-green-300">
              Quick Links
            </p>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </MotionDiv>

          {/* CONTACT */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-green-300">
              Contact
            </p>

            <div className="space-y-3">
              <div className="rounded-xl bg-black/20 p-4">
                <p className="text-sm font-medium text-white">
                  Hetauda Branch
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Station Road, Hetauda
                </p>
              </div>

              <div className="rounded-xl bg-black/20 p-4">
                <div className="flex items-center gap-2 text-green-300">
                  <Phone className="h-4 w-4" />

                  <span className="text-sm">
                    +977 9869301915
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-black/20 p-4">
                <div className="flex items-center gap-2 text-green-300">
                  <Clock className="h-4 w-4" />

                  <span className="text-sm">
                    8am – 10pm
                  </span>
                </div>
              </div>
            </div>
          </MotionDiv>

          {/* PAYMENTS */}
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            viewport={{ once: true }}
            className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-300">
                Payments
              </p>

              <Shield className="h-4 w-4 text-slate-400" />
            </div>

            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <PaymentCard
                  key={method.label}
                  label={method.label}
                  accent={method.accent}
                />
              ))}
            </div>
          </MotionDiv>
        </div>

        {/* BOTTOM */}
        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} HaatOnline. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>Fresh groceries</span>

              <span className="h-1 w-1 rounded-full bg-slate-700" />

              <span>Fast delivery</span>

              <span className="h-1 w-1 rounded-full bg-slate-700" />

              <span>Trusted local sellers</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-[0_0_20px_rgba(74,222,128,0.35)] transition-all duration-300 hover:-translate-y-1"
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