import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Hammer, ShoppingBag, BarChart3, User, Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { auth } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";

const ADMIN_EMAIL = 'mandaras936@gmail.com';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const isAdminUser = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
    { name: "Sell & Recycle", path: "/sell", icon: Hammer },
    { name: "Impact", path: "/dashboard", icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f0]/80 backdrop-blur-md border-b border-[#5A5A40]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border border-[#1a1a1a]/10 rounded-full flex items-center justify-center transition-all duration-1000 group-hover:border-[#5A5A40] group-hover:rotate-[360deg]">
                <div className="w-9 h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-2xl shadow-black/20 group-hover:bg-[#3d3d29] transition-colors duration-500">
                  <Hammer className="text-[#f5f5f0] w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex flex-col -space-y-1.5">
              <span className="text-2xl font-display font-light text-[#1a1a1a] tracking-[0.05em] transition-colors group-hover:text-[#3d3d29]">
                RE<span className="font-bold">LEATHER</span>
              </span>
              <span className="text-[8px] font-display uppercase tracking-[0.5em] font-black text-gray-400 pl-0.5">
                Circular Atelier
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 text-sm font-medium tracking-wide transition-colors ${
                  isActive(item.path) ? "text-[#5A5A40]" : "text-gray-500 hover:text-[#5A5A40]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 h-0.5 bg-[#5A5A40] w-full left-0"
                    initial={false}
                  />
                )}
              </Link>
            ))}
            {isAdminUser && (
              <Link
                to="/admin"
                className={`flex items-center space-x-2 text-sm font-bold tracking-wide transition-colors ${
                  isActive('/admin') ? "text-[#5A5A40]" : "text-gray-400 hover:text-[#5A5A40]"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="uppercase italic">Admin</span>
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-[#5A5A40] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#4a4a35] transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="text-sm font-medium text-[#5A5A40] hover:underline underline-offset-4"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#1a1a1a] p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#f5f5f0] border-b border-[#5A5A40]/10 px-4 pt-2 pb-6 space-y-2"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-xl ${
                isActive(item.path) ? "bg-[#5A5A40]/10 text-[#5A5A40]" : "text-gray-600"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
          {isAdminUser && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 p-3 rounded-xl ${
                isActive('/admin') ? "bg-[#5A5A40]/10 text-[#5A5A40]" : "text-gray-600"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold uppercase italic">Admin Portal</span>
            </Link>
          )}
          {user ? (
            <button 
              onClick={handleLogout}
              className="w-full text-left p-3 text-red-500 font-medium flex items-center space-x-3 border-t border-[#5A5A40]/10 mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button 
              onClick={handleLoginRedirect}
              className="w-full text-left p-3 text-[#5A5A40] font-medium border-t border-[#5A5A40]/10 mt-2"
            >
              Sign In
            </button>
          )}
        </motion.div>
      )}
    </nav>
  );
}
