import { Link } from "react-router-dom"
import { motion as Motion } from "framer-motion"
import { Leaf, Truck, HeartHandshake } from "lucide-react"

export default function About() {
  return (
    <div className="bg-gradient-to-br from-[#f8faf7] via-white to-lime-50 text-gray-900">

      {/* ================= HERO ================= */}
      <section className="container mx-auto px-6 py-20 text-center max-w-4xl">
        <Motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black text-green-700 mb-6"
        >
          About HaatOnline 🛒
        </Motion.h1>

        <p className="text-lg text-gray-600 leading-relaxed">
          HaatOnline brings Nepal’s traditional <strong>Haat Bazaar</strong>
          into the digital world. We connect local farmers, vendors,
          and households through a fast, reliable, and modern grocery
          platform designed for everyday Nepal.
        </p>
      </section>

      {/* ================= STORY ================= */}
      <section className="container mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-center">
        <Motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=1200"
          className="rounded-3xl shadow-xl"
        />

        <Motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold mb-4">
            Our Story
          </h2>

          <p className="text-gray-600 leading-relaxed mb-4">
            In Nepal, local haat bazaars have always been the heart of
            communities — fresh produce, local trust, and human
            connection.
          </p>

          <p className="text-gray-600 leading-relaxed">
            HaatOnline was created to preserve that culture while
            solving modern problems: traffic, time, and accessibility.
            We empower local sellers while giving customers a seamless
            online grocery experience.
          </p>
        </Motion.div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Mission
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Leaf />,
              title: "Support Local Farmers",
              desc: "Direct digital access to customers for local producers.",
            },
            {
              icon: <Truck />,
              title: "Fast & Reliable Delivery",
              desc: "Convenient grocery delivery designed for urban Nepal.",
            },
            {
              icon: <HeartHandshake />,
              title: "Community First",
              desc: "Building trust between buyers and sellers.",
            },
          ].map((item, i) => (
            <Motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl shadow-lg p-8 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-lime-400 text-white">
                {item.icon}
              </div>

              <h3 className="font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </Motion.div>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="container mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-green-600 to-lime-400 text-white rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold">
            Experience Nepal’s Digital Haat Bazaar
          </h2>

          <p className="mt-4 opacity-90">
            Fresh groceries, trusted sellers, and modern convenience —
            all in one platform.
          </p>

          <Link
            to="/products"
            className="inline-block mt-6 bg-white text-green-700 px-7 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Start Shopping
          </Link>
        </div>
      </section>

    </div>
  )
}