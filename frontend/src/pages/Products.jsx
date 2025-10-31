import { useState } from "react"
// Note: In a real app, this data would come from an API or Firestore.

const productsData = [
  { id: 1, name: "Organic Carrots", price: 150.00, unit: "kg", icon: "🥕", imageUrl: "https://placehold.co/400x250/999999/ffffff?text=Vegetables" },
  { id: 2, name: "Farm Fresh Eggs", price: 85.00, unit: "dozen", icon: "🥚", imageUrl: "https://placehold.co/400x250/fde047/4b5563?text=Dairy" },
  { id: 3, name: "Whole Wheat Bread", price: 60.00, unit: "loaf", icon: "🍞", imageUrl: "https://placehold.co/400x250/be123c/f8fafc?text=Bakery" },
  { id: 4, name: "Basmati Rice", price: 450.00, unit: "5kg bag", icon: "🍚", imageUrl: "https://placehold.co/400x250/14532d/f0fdfa?text=Grains" },
  { id: 5, name: "Cooking Oil (Refined)", price: 280.00, unit: "Litre", icon: "🛢️", imageUrl: "https://placehold.co/400x250/0f766e/ecfdf5?text=Pantry" },
  { id: 6, name: "Mangoes (Seasonal)", price: 90.00, unit: "kg", icon: "🥭", imageUrl: "https://placehold.co/400x250/f97316/fff7ed?text=Fruit" },
  { id: 7, name: "Chicken Breast", price: 320.00, unit: "kg", icon: "🍗", imageUrl: "https://placehold.co/400x250/e11d48/fdf2f8?text=Meat" },
  { id: 8, name: "Yogurt (Plain)", price: 55.00, unit: "500g", icon: "🥛", imageUrl: "https://placehold.co/400x250/60a5fa/eff6ff?text=Dairy" },
]

// Component for a single product card, now managing its own quantity state
const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleUpdateQuantity = (change) => {
    // Ensures quantity doesn't drop below 1
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAction = () => {
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding to cart
  }

  return (
    <div 
      key={product.id}
      // Added border and hover border color for visual pop
      className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 hover:border-green-400 transition duration-300 transform hover:scale-[1.02] relative"
    >
      {/* Discount/Tag - Added appeal */}
      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg shadow-lg">
        FRESH
      </div>
      
      {/* Image Placeholder */}
      <div className="h-40 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/78716c/f5f5f4?text=Product+Image" }}
        />
      </div>

      {/* Product Details */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-blue-800 leading-tight">
            {product.icon} {product.name}
          </h2>
        </div>
        
        <p className="text-3xl font-extrabold text-green-600 mb-4">
          Rs. {product.price.toFixed(2)}
          <span className="text-sm font-medium text-gray-500 ml-1">
            /{product.unit}
          </span>
        </p>
        
        {/* Quantity Selector - Enhanced UX */}
        <div className="flex items-center justify-between mb-4 p-2 border border-gray-300 rounded-lg bg-gray-50">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => handleUpdateQuantity(-1)}
              className="text-gray-600 w-8 h-8 rounded-full hover:bg-gray-200 transition disabled:opacity-50"
              disabled={quantity === 1}
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
            <button
              onClick={() => handleUpdateQuantity(1)}
              className="text-gray-600 w-8 h-8 rounded-full hover:bg-gray-200 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAction}
          className="w-full bg-green-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-200 ease-in-out flex items-center justify-center space-x-2"
        >
          {/* Plus icon from Lucide-react equivalent SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
          {/* Dynamically update button text */}
          <span>Add {quantity} {product.unit.split(' ')[0]} to Cart</span>
        </button>
      </div>
    </div>
  )
}


export default function Products() {
  const [products] = useState(productsData);

  // Mock function for adding to cart
  const handleAddToCart = (product, quantity) => {
    // In a real application, this would dispatch an action or update global state
    console.log(`Added ${quantity} units of ${product.name} to cart.`);
    
    // Improved Toast Notification (feedback box)
    const message = `Added ${quantity} x ${product.name} (Rs. ${(product.price * quantity).toFixed(2)}) to your cart!`;
    const feedbackBox = document.createElement('div');
    // Using green for successful action and adding transition classes for smooth animation
    feedbackBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl z-50 transition duration-500 ease-in-out transform translate-x-full opacity-0';
    feedbackBox.textContent = message;
    document.body.appendChild(feedbackBox);
    
    // Animate in and out
    setTimeout(() => {
        feedbackBox.classList.remove('translate-x-full', 'opacity-0');
        feedbackBox.classList.add('translate-x-0', 'opacity-100');
    }, 10);
    
    setTimeout(() => {
        feedbackBox.classList.remove('translate-x-0', 'opacity-100');
        feedbackBox.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => feedbackBox.remove(), 500); // Remove after transition finishes
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-2">
          Naya Pasal Store
        </h1>
        <p className="text-xl text-gray-600">
          Freshness delivered to your door. Shop our selection!
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={handleAddToCart} 
          />
        ))}
      </div>
    </div>
  )
}
