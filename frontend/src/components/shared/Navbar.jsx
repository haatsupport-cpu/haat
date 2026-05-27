import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";

import {
  ShoppingCart,
  LayoutDashboard,
  User,
  LogIn,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";
import logoImg from "../../assets/logobg.png";

const MotionLink = Motion.create(Link);

export default function Navbar() {
  const { isLoggedIn, isAdmin } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between">
          {/* LOGO */}

          <MotionLink
  to="/"
  whileHover={{ scale: 1.03 }}
  className="flex items-center"
>
  <img
    src={logoImg}
    alt="HaatOnline"
    className="h-12 md:h-14 w-auto object-contain"
  />
</MotionLink>

          {/* DESKTOP NAV */}

          <div className="hidden md:flex items-center gap-1 rounded-2xl border border-white/10 bg-black/60 p-1 backdrop-blur-xl">
            <NavItem to="/">Home</NavItem>

            <NavItem to="/products">Products</NavItem>

            <IconNavItem
              to="/cart"
              icon={<ShoppingCart className="h-4 w-4" />}
              label="Cart"
            />

            {isLoggedIn && (
              <>
                <IconNavItem
                  to="/profile"
                  icon={<User className="h-4 w-4" />}
                  label="Profile"
                />

                {isAdmin && (
                  <IconNavItem
                    to="/admin"
                    icon={<LayoutDashboard className="h-4 w-4" />}
                    label="Dashboard"
                  />
                )}
              </>
            )}

            {!isLoggedIn && (
              <IconNavItem
                to="/login"
                icon={<LogIn className="h-4 w-4" />}
                label="Login"
                isButton
              />
            )}
          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}

        <AnimatePresence>
          {menuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute left-4 right-4 top-[88px] rounded-3xl border border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-2">
                <MobileNavItem
                  to="/"
                  label="Home"
                  onClick={closeMenu}
                />

                <MobileNavItem
                  to="/products"
                  label="Products"
                  onClick={closeMenu}
                />

                <MobileNavItem
                  to="/cart"
                  label="Cart"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  onClick={closeMenu}
                />

                {isLoggedIn && (
                  <>
                    <MobileNavItem
                      to="/profile"
                      label="Profile"
                      icon={<User className="h-4 w-4" />}
                      onClick={closeMenu}
                    />

                    {isAdmin && (
                      <MobileNavItem
                        to="/admin"
                        label="Dashboard"
                        icon={
                          <LayoutDashboard className="h-4 w-4" />
                        }
                        onClick={closeMenu}
                      />
                    )}
                  </>
                )}

                {!isLoggedIn && (
                  <MobileNavItem
                    to="/login"
                    label="Login"
                    icon={<LogIn className="h-4 w-4" />}
                    onClick={closeMenu}
                    isButton
                  />
                )}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/* DESKTOP NAV ITEM */

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
          isActive
            ? "bg-[#2ab600] text-black shadow-[0_0_20px_rgba(42,182,0,0.35)]"
            : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

/* DESKTOP ICON ITEM */

function IconNavItem({
  to,
  icon,
  label,
  isButton = false,
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
          isButton
            ? "bg-[#2ab600] text-black hover:opacity-90"
            : isActive
            ? "bg-[#2ab600] text-black shadow-[0_0_20px_rgba(42,182,0,0.35)]"
            : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

/* MOBILE NAV ITEM */

function MobileNavItem({
  to,
  label,
  icon,
  onClick,
  isButton = false,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
          isButton
            ? "bg-[#2ab600] text-black"
            : isActive
            ? "bg-[#2ab600] text-black"
            : "text-slate-200 hover:bg-white/10"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
