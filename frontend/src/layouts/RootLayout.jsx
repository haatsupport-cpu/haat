import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

const FOOTER_HIDDEN_PATHS = new Set(["/login", "/register", "/admin"]);

export default function RootLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar />
      <Outlet />
      {!FOOTER_HIDDEN_PATHS.has(pathname) && <Footer />}
    </>
  );
}
