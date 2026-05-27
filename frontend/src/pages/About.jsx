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
    className="text-5xl font-black text-[#2ab600] mb-6"
  >
    About Haat<span className="text-black">Online</span> 
  </Motion.h1>


        <p className="text-lg text-gray-600 leading-relaxed">
          HaatOnline is a local online grocery platform proudly serving <strong>Hetauda</strong>. Our mission is to make daily grocery shopping easier, faster, and more reliable by connecting local farmers, vendors, and households through one trusted digital marketplace. From fresh vegetables and fruits to everyday essentials, we bring quality products directly to your doorstep while supporting local businesses and the growing community of Hetauda.
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
            Based in Hetauda, we created HaatOnline to make grocery shopping easier, faster, and more accessible for every household. By combining the trust of local markets with the convenience of technology, we empower local farmers and sellers while providing customers with a seamless online grocery experience delivered right to their doorstep.
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
      title: "Fresh From Local Farmers",
      desc: "Supporting local farmers and vendors by connecting them directly with customers in Hetauda.",
    },
    {
      icon: <Truck />,
      title: "Fast Home Delivery",
      desc: "Reliable and convenient grocery delivery that saves time for busy households.",
    },
    {
      icon: <HeartHandshake />,
      title: "Trusted Community Marketplace",
      desc: "Building a modern digital grocery platform rooted in local trust and community values.",
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
      Experience Hetauda’s Digital Grocery Marketplace
    </h2>

    <p className="mt-4 opacity-90 max-w-2xl mx-auto">
      Fresh groceries, trusted local sellers, and doorstep delivery —
      all designed to make everyday shopping easier for families in Hetauda.
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