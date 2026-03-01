import React from 'react';
import { Phone, Globe, Menu, ShoppingCart, Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex flex-col cursor-pointer">
              <span className="text-2xl font-display font-bold tracking-tight text-slate-900">
                RAYNA<span className="text-brand ml-0.5">B2B</span>
              </span>
              <div className="flex gap-1 mt-[-2px]">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-brand transition-colors">Destinations</a>
              <a href="#" className="hover:text-brand transition-colors">Offers</a>
              <a href="#" className="hover:text-brand transition-colors">Support</a>
            </div>
          </div>

          {/* Right Side Nav */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-4 mr-4 border-r border-slate-200 pr-4">
              <div className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-slate-600 hover:text-brand">
                <Phone size={14} />
                <span>Helpline</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-slate-600 hover:text-brand">
                <Globe size={14} />
                <span>EN</span>
              </div>
            </div>
            <button className="text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors">
              Sign In
            </button>
            <button className="bg-brand text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">
              Register Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const DashboardNavbar = () => {
  return (
    <div className="bg-white border-b border-slate-200 py-3">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-xs font-bold text-slate-500">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Phone size={14} className="text-brand" /> 24/7 Support</span>
          <span className="flex items-center gap-1.5"><Globe size={14} className="text-brand" /> English (AED)</span>
          <button className="bg-brand text-white px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-brand-dark transition-all">
            Quick Services <ChevronDown size={12} />
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-slate-200 pr-6">
            <span className="hover:text-brand cursor-pointer">R Points: <span className="text-slate-900">1,250</span></span>
            <span className="hover:text-brand cursor-pointer">Credit: <span className="text-slate-900">AED 50k</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-900">AGT-50660 <ChevronDown size={12} /></span>
            <div className="flex items-center gap-3">
              <div className="relative p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 bg-brand text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white">3</span>
              </div>
              <div className="relative p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <ShoppingCart size={18} />
                <span className="absolute top-1.5 right-1.5 bg-brand text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
