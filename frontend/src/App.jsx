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
import AdminDashboard from "./pages/AdminDashboard"

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
        <Route path="/admin" element={<AdminDashboard />} />
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
