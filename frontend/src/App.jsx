import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom"
import { AuthProvider } from "./context/AuthProvider"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import About from "./pages/About"
import Products from "./pages/Products"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import AdminDashboard from "./pages/AdminDashboard"
import Contact from "./pages/Contact"
import FAQ from "./pages/FAQs"
import PrivacyPolicy from "./pages/PrivacyPolicy"
// import TermsAndConditions from "./pages/TermsAndConditions"

function AppLayout() {
  const { pathname } = useLocation()
  const hideFooter = ["/login", "/register", "/admin"].includes(pathname)

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        {/* <Route path="/terms" element={<TermsAndConditions />} /> */}
        <Route path="*" element={<Home />} />
      </Routes>

      {!hideFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  )
}

export default App
