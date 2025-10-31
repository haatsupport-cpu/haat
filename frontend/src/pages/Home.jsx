import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-10 text-center transform transition duration-500 hover:scale-[1.02]">
        <h1 className="text-5xl font-extrabold text-green-800 mb-4 tracking-tight">
          🛍️ Welcome to HaatOnline!
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Haat Bazaar, Now Online!
        </p>

        <div className="mb-10"></div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-4 rounded-lg bg-green-50 shadow-md">
            <h3 className="font-semibold text-lg text-green-700">
              Fast Delivery 🚚
            </h3>
            <p className="text-sm text-gray-500">
              Get your order within hours.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 shadow-md">
            <h3 className="font-semibold text-lg text-green-700">
              Local & Fresh 🌱
            </h3>
            <p className="text-sm text-gray-500">
              Support local farmers and get the best quality.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 shadow-md">
            <h3 className="font-semibold text-lg text-green-700">
              Great Prices 💰
            </h3>
            <p className="text-sm text-gray-500">
              Quality produce that's easy on your wallet.
            </p>
          </div>
        </div>

        <Link
          to="/products"
          className="inline-block bg-green-600 text-white text-xl font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Shopping Fresh!
        </Link>
      </div>
    </div>
  )
}
