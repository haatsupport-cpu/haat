import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import MarketingPopup from "../components/shared/MarketingPopup";

const FOOTER_HIDDEN_PATHS = new Set(["/login", "/register", "/admin"]);

export default function RootLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar />
      <Outlet />
      {pathname !== "/admin" && <MarketingPopup />}
      {!FOOTER_HIDDEN_PATHS.has(pathname) && <Footer />}
    </>
  );
}
