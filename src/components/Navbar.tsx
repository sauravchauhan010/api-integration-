import React, { useState } from 'react';
import { Phone, Globe, Menu, X, ChevronDown, Ticket, LogOut, User as UserIcon, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { items, openCart } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-full mx-auto px-4 md:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-12">
            <Link to="/dashboard" className="flex items-center cursor-pointer group" onClick={() => setMobileOpen(false)}>
              <img 
                src="https://res.cloudinary.com/dvavzjzmp/image/upload/v1778063706/q_1_ovyg8j.png" 
                alt="Rayna B2B" 
                className="h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </Link>
            
            <div className="hidden xl:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <Link 
                to={`/results?cityId=1&date=${new Date().toISOString().split('T')[0]}&adults=1&children=0&infants=0`} 
                className="hover:text-brand transition-colors flex items-center gap-2"
              >
                Tours & Sightseeing
              </Link>
              <Link to="/my-bookings" className="hover:text-brand transition-colors flex items-center gap-2">
                <Ticket size={16} /> My Bookings
              </Link>
            </div>
          </div>

          {/* Right Side Nav - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-6 mr-6 border-r border-slate-200 pr-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">24/7 Support</span>
                <span className="text-sm font-bold text-slate-900">+971 4 208 7444</span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <div className="relative group/lang">
                  <div className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    <Globe size={14} className="text-brand" />
                    <span className="text-xs font-bold text-slate-600">EN</span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </div>
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all z-50">
                    <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand">English</button>
                    <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand">Hindi (हिंदी)</button>
                    <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand">Spanish (Español)</button>
                  </div>
                </div>

                {/* Currency Switcher */}
                <div className="relative group/curr">
                  <div className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-bold text-brand">AED</span>
                    <ChevronDown size={12} className="text-slate-400" />
                  </div>
                  <div className="absolute top-full right-0 mt-2 w-24 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover/curr:opacity-100 group-hover/curr:visible transition-all z-50">
                    <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand">AED</button>
                    <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-brand">INR</button>
                  </div>
                </div>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center gap-6">
                <button
                  onClick={openCart}
                  className="relative p-2.5 text-slate-600 hover:text-brand transition-colors hover:bg-brand/5 rounded-xl"
                  title="Cart"
                >
                  <ShoppingCart size={20} />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </button>
                <Link to="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <div className="relative cursor-pointer group">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors overflow-hidden">
                      {user.logoUrl ? (
                        <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon size={20} />
                      )}
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{user.companyName || user.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Partner Account</span>
                  </div>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-brand text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-brand-dark transition-all shadow-xl shadow-brand/20">
                  Register Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="px-4 py-6 space-y-2">

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center overflow-hidden">
                  {user.logoUrl ? (
                    <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={22} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{user.companyName || user.name}</p>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Partner Account</p>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <Link
              to={`/results?cityId=1&date=${new Date().toISOString().split('T')[0]}&adults=1&children=0&infants=0`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              🌍 Tours & Sightseeing
            </Link>

            <Link
              to="/my-bookings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              🎫 My Bookings
            </Link>

            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                👤 My Profile
              </Link>
            )}

            {/* Support */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 text-sm">
              📞 24/7 Support: +971 4 208 7444
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-semibold hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-dark transition-colors"
                  >
                    Register Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
