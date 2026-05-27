import { lazy } from "react";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Products = lazy(() => import("../pages/Products"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Contact = lazy(() => import("../pages/Contact"));
const FAQ = lazy(() => import("../pages/FAQs"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("../pages/TermsAndConditions"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicy"));
const TermsAndConditionsPage = lazy(() => import("../pages/TermsAndConditions"));
const Profile = lazy(() => import("../pages/Profile"));

export const publicRoutes = [
  { index: true, element: <Home /> },
  { path: "about", element: <About /> },
  { path: "products", element: <Products /> },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "contact", element: <Contact /> },
  { path: "faq", element: <FAQ /> },
  { path: "privacy", element: <PrivacyPolicy /> },
  { path: "terms", element: <TermsAndConditions /> },
  { path: "terms-and-conditions", element: <TermsAndConditionsPage /> },
  { path: "privacy-policy", element: <PrivacyPolicyPage /> },
];

export const protectedRoutes = [
  { path: "cart", element: <Cart /> },
  { path: "checkout", element: <Checkout /> },
  { path: "profile", element: <Profile /> },
  { path: "orders", element: <Profile /> },
];

export const adminRoutes = [{ path: "admin", element: <AdminDashboard /> }];

export const fallbackRoute = { path: "*", element: <Home /> };
