/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Phone, 
  Globe, 
  User, 
  Lock, 
  Search, 
  Calendar, 
  Users, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Bell, 
  Star, 
  Clock, 
  ShieldCheck, 
  MessageCircle,
  Menu,
  X,
  Trash2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Tour {
  id: number;
  title: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  points: number;
  recommended?: boolean;
}

interface City {
  cityId: number;
  cityName: string;
}

interface RaynaTour {
  tourId: number;
  countryId: number;
  countryName: string;
  cityId: number;
  cityName: string;
  tourName: string;
  reviewCount: number;
  rating: number;
  duration: string;
  imagePath: string;
  imageCaptionName: string;
  cityTourTypeId: string;
  cityTourType: string;
  tourShortDescription: string;
  cancellationPolicyName: string;
  isSlot: boolean;
  isSeat: boolean;
  onlyChild: boolean;
  contractId: number;
  recommended: boolean;
  isPrivate: boolean;
  categoryImage: string;
}

interface TourImage {
  tourId: number;
  imagePath: string;
  imageCaptionName: string;
  isFrontImage: number;
  isBannerImage: number;
  isBannerRotateImage: number;
}

interface TourDetail extends RaynaTour {
  departurePoint: string;
  reportingTime: string;
  tourLanguage: string;
  tourDescription: string;
  tourInclusion: string;
  raynaToursAdvantage: string;
  whatsInThisTour: string;
  importantInformation: string;
  itenararyDescription: string;
  usefulInformation: string;
  faqDetails: string;
  termsAndConditions: string;
  cancellationPolicyDescription: string;
  childCancellationPolicyName: string;
  childCancellationPolicyDescription: string;
  childAge: string;
  infantAge: string;
  infantCount: number;
  latitude: string;
  longitude: string;
  startTime: string;
  meal: string | null;
  videoUrl: string;
  googleMapUrl: string;
  tourExclusion: string;
  howToRedeem: string;
  tourImages: TourImage[];
}

// --- Mock Data ---

const TOURS: Tour[] = [
  {
    id: 1,
    title: "Dubai Aquarium and Underwater Zoo",
    image: "https://picsum.photos/seed/aquarium/400/300",
    price: 130.00,
    rating: 5,
    reviews: 121,
    points: 500,
    recommended: false
  },
  {
    id: 2,
    title: "Yas Island Theme Park Tickets",
    image: "https://picsum.photos/seed/yasisland/400/300",
    price: 340.00,
    rating: 5,
    reviews: 1,
    points: 0,
    recommended: false
  },
  {
    id: 3,
    title: "Dubai Dolphinarium",
    image: "https://picsum.photos/seed/dolphin/400/300",
    price: 40.00,
    rating: 5,
    reviews: 91,
    points: 0,
    recommended: true
  },
  {
    id: 4,
    title: "Dhow Cruise Dinner - Marina",
    image: "https://picsum.photos/seed/dhow/400/300",
    price: 85.00,
    rating: 5,
    reviews: 375,
    points: 0,
    recommended: true
  },
  {
    id: 5,
    title: "Dubai Frame",
    image: "https://picsum.photos/seed/frame/400/300",
    price: 49.00,
    rating: 5,
    reviews: 286,
    points: 400,
    recommended: false
  },
  {
    id: 6,
    title: "IMG Worlds of Adventure",
    image: "https://picsum.photos/seed/img/400/300",
    price: 163.00,
    rating: 5,
    reviews: 228,
    points: 800,
    recommended: true
  }
];

// --- Components ---

const getImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `https://sandbox.raynatours.com/${path}`;
};

const Navbar = ({ onSearchClick }: { onSearchClick: () => void }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col cursor-pointer" onClick={() => window.location.reload()}>
              <span className="text-2xl font-display font-bold tracking-tight text-slate-900">
                RAYNA<span className="text-brand ml-0.5">B2B</span>
              </span>
              <div className="flex gap-1 mt-[-2px]">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
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

const HeroLogin = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-slate-900">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://picsum.photos/seed/dubai-hero/1920/1080" 
          className="w-full h-full object-cover opacity-50 scale-105"
          alt="Dubai Skyline"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-12 items-center py-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
            The World of <br />
            <span className="text-brand">B2B Travel</span> <br />
            Simplified.
          </h1>
          <p className="text-lg text-slate-300 max-w-lg mb-8 leading-relaxed">
            Access exclusive rates for attractions, hotels, and tours across the UAE. 
            Join thousands of agents growing their business with Rayna B2B.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <ShieldCheck className="text-brand" size={20} />
              <span className="text-white text-sm font-medium">Verified Partners</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Star className="text-brand" size={20} />
              <span className="text-white text-sm font-medium">Best Price Guarantee</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md ml-auto"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to your agent portal</p>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Code</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter your code" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand transition-all" />
                <span className="group-hover:text-slate-900">Remember Me</span>
              </label>
              <a href="#" className="text-brand font-semibold hover:text-brand-dark transition-colors">Forgot?</a>
            </div>

            <button 
              onClick={onLogin}
              className="w-full bg-brand text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-dark transition-all transform active:scale-[0.98] shadow-xl shadow-brand/20"
            >
              Sign In to Portal
            </button>
            
            <p className="text-center text-sm text-slate-500">
              Don't have an account? <a href="#" className="text-brand font-bold hover:underline">Register</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SearchResults = ({ 
  onBack, 
  tours, 
  loading,
  cityName,
  onTourClick
}: { 
  onBack: () => void;
  tours: RaynaTour[];
  loading: boolean;
  cityName: string;
  onTourClick: (tour: RaynaTour) => void;
}) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Secondary Nav / Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm">
            <button onClick={onBack} className="text-slate-400 hover:text-brand flex items-center gap-1 transition-colors">
              <ChevronLeft size={18} /> Dashboard
            </button>
            <span className="text-slate-200">/</span>
            <span className="font-bold text-slate-900">Tours & Sightseeing</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium hidden md:block">
              {loading ? 'Searching...' : `Showing ${tours.length} results for "${cityName || 'Selected City'}"`}
            </span>
            <button 
              onClick={onBack}
              className="bg-brand/10 text-brand px-5 py-2 rounded-xl text-sm font-bold border border-brand/20 hover:bg-brand/20 transition-all"
            >
              Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-8">
          {/* Cart Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-brand" /> My Cart
              </h3>
              <span className="bg-brand text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">1 Item</span>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <img src="https://picsum.photos/seed/yacht/200/200" className="w-full h-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate mb-1">Lotus Mega Yacht Dinner</h4>
                  <p className="text-[10px] text-slate-400 font-medium mb-2">VIP Ticket • No Transfers</p>
                  <p className="text-sm font-bold text-brand">AED 400.00</p>
                </div>
                <button className="text-slate-300 hover:text-red-500 transition-colors self-start">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="pt-5 border-t border-slate-50">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-medium text-slate-500">Total Amount</span>
                  <span className="text-lg font-display font-bold text-slate-900">AED 400.00</span>
                </div>
                <button className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-8"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-slate-900">Price Range</h3>
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider cursor-pointer">Reset</span>
              </div>
              <div className="space-y-4">
                <input type="range" className="w-full accent-brand h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between items-center">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600">AED 0</div>
                  <div className="w-4 h-[1px] bg-slate-200"></div>
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600">AED 6,800</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-slate-900 mb-5">Categories</h3>
              <div className="space-y-3">
                {['Adventure', 'Culture', 'Sightseeing', 'Luxury'].map(cat => (
                  <label key={cat} className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-all" />
                      <X className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" size={12} />
                    </div>
                    <span className="group-hover:text-slate-900 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-brand">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900">{cityName || 'Selected City'} Experiences</h2>
                <p className="text-sm text-slate-500">{loading ? 'Searching for activities...' : `${tours.length} activities found in your area`}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search activities..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                />
              </div>
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand hover:border-brand transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {tours.map((tour, idx) => (
                <motion.div 
                  key={tour.tourId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -10 }}
                  onClick={() => onTourClick(tour)}
                  className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img 
                      src={getImageUrl(tour.imagePath)} 
                      alt={tour.tourName} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tour.tourId}/400/300`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {tour.recommended && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star size={12} fill="#f27d26" className="text-brand" /> Recommended
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                      <button className="bg-brand text-white p-3 rounded-2xl shadow-xl shadow-brand/20">
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-display font-bold text-slate-900 text-lg leading-tight group-hover:text-brand transition-colors line-clamp-2">{tour.tourName}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-6">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(tour.rating) ? "#f27d26" : "none"} className={i < Math.floor(tour.rating) ? "text-brand" : "text-slate-200"} />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 ml-1">{tour.reviewCount} Reviews</span>
                    </div>
                    
                    <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-sm font-bold text-slate-700">{tour.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                        <p className="text-[10px] font-bold text-brand bg-brand/5 px-2 py-1 rounded-lg">{tour.cityTourType}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No activities found</h3>
              <p className="text-slate-500">Try selecting a different city or destination.</p>
              <button 
                onClick={onBack}
                className="mt-8 text-brand font-bold hover:underline"
              >
                Go back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const TourDetailView = ({ 
  tour, 
  onBack 
}: { 
  tour: TourDetail; 
  onBack: () => void;
}) => {
  const [activeImage, setActiveImage] = useState(tour.imagePath);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <button onClick={onBack} className="text-slate-400 hover:text-brand flex items-center gap-1 transition-colors text-sm font-medium">
            <ChevronLeft size={18} /> Back to Results
          </button>
          <div className="flex gap-3">
            <button className="p-2 text-slate-400 hover:text-brand transition-colors">
              <Globe size={20} />
            </button>
            <button className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20">
              Book Now
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Gallery & Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src={getImageUrl(activeImage)} 
                  className="w-full h-full object-cover" 
                  alt={tour.tourName}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-900 shadow-lg">
                    {tour.cityTourType}
                  </span>
                  {tour.recommended && (
                    <span className="bg-brand text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                      <Star size={10} fill="white" /> Recommended
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {tour.tourImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img.imagePath)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === img.imagePath ? 'border-brand scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img.imagePath)} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-10">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-6">{tour.tourName}</h1>
                
                <div className="flex flex-wrap gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                      <p className="text-sm font-bold text-slate-900">{tour.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Language</p>
                      <p className="text-sm font-bold text-slate-900">{tour.tourLanguage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Star size={20} className="text-brand" fill="#f27d26" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                      <p className="text-sm font-bold text-slate-900">{tour.rating} ({tour.reviewCount} Reviews)</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Description</h3>
                  <div className="text-slate-600 leading-relaxed mb-10" dangerouslySetInnerHTML={{ __html: tour.tourDescription }} />
                  
                  <div className="grid md:grid-cols-2 gap-10">
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-green-500" size={24} /> Inclusions
                      </h3>
                      <div className="text-slate-600 text-sm space-y-2 inclusion-list" dangerouslySetInnerHTML={{ __html: tour.tourInclusion }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2 text-red-500">
                        <X size={24} /> Exclusions
                      </h3>
                      <div className="text-slate-600 text-sm space-y-2 exclusion-list" dangerouslySetInnerHTML={{ __html: tour.tourExclusion }} />
                    </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-slate-100">
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Important Information</h3>
                    <div className="text-slate-600 text-sm space-y-2 important-info" dangerouslySetInnerHTML={{ __html: tour.importantInformation }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 sticky top-32">
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-bold text-slate-900">AED 130</span>
                  <span className="text-slate-400 text-sm">/ person</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travel Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="date" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 appearance-none">
                      <option>1 Adult, 0 Child</option>
                      <option>2 Adults, 1 Child</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
              </div>

              <button className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 mb-4">
                Check Availability
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" /> Secure Booking
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
              <h4 className="font-display font-bold text-xl mb-4">Need Help?</h4>
              <p className="text-slate-400 text-sm mb-6">Our travel experts are available 24/7 to assist you with your booking.</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Phone size={18} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Call Us</p>
                    <p className="text-sm font-bold">+971 4 208 7444</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <MessageCircle size={18} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp</p>
                    <p className="text-sm font-bold">+971 50 123 4567</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeView = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="bg-white">
      <HeroLogin onLogin={onLogin} />
      
      {/* Notifications Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-2">Latest Updates</h2>
            <p className="text-slate-500">Stay informed with the latest travel news and alerts</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand hover:border-brand transition-all">
              <ChevronLeft size={24} />
            </button>
            <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand hover:border-brand transition-all">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -8 }}
              className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/notif${i}/600/400`} 
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt="Notification"
                />
                <div className="absolute top-4 left-4 bg-brand text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Update
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                  <Calendar size={14} />
                  <span>Oct 24, 2025</span>
                </div>
                <h4 className="font-display font-bold text-slate-900 text-xl mb-3 group-hover:text-brand transition-colors">
                  Dubai Frame: Revised Ramadan Hours
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  Please note that the Dubai Frame will operate on revised hours during the holy month of Ramadan. Plan your visits accordingly...
                </p>
                <button className="flex items-center gap-2 text-brand font-bold text-sm hover:gap-3 transition-all">
                  Read Full Article <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">Why Partner With Us?</h2>
            <p className="text-slate-500">We provide the tools and rates you need to scale your travel business successfully.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <ShieldCheck className="text-brand" />, title: "Secure Payments", desc: "Industry-leading security for all your transactions." },
              { icon: <Clock className="text-brand" />, title: "24/7 Support", desc: "Our dedicated team is always here to help you." },
              { icon: <Globe className="text-brand" />, title: "Global Reach", desc: "Access thousands of products across the UAE." },
              { icon: <Star className="text-brand" />, title: "Best Rates", desc: "Exclusive B2B pricing you won't find anywhere else." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100">
                <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mb-6">
                  {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Main App ---

const DashboardView = ({ 
  onSearch, 
  cities, 
  loadingCities,
  selectedCity,
  onCityChange
}: { 
  onSearch: () => void;
  cities: City[];
  loadingCities: boolean;
  selectedCity: string;
  onCityChange: (cityId: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState('Activities');

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Secondary Navbar for Dashboard */}
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

      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img 
          src="https://picsum.photos/seed/aindubai-modern/1920/800" 
          className="w-full h-full object-cover"
          alt="Ain Dubai"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white max-w-xl"
            >
              <div className="inline-block bg-brand px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                New Attraction
              </div>
              <h1 className="text-6xl font-display font-bold mb-4 leading-tight">Ain Dubai Experience</h1>
              <p className="text-xl opacity-90 mb-8 leading-relaxed">
                Take your clients to the world's tallest observation wheel. Exclusive B2B rates starting from AED 130.
              </p>
              <button 
                onClick={onSearch}
                className="bg-brand text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand/30 flex items-center gap-3"
              >
                Book Now <ChevronRight size={20} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modern Search Interface */}
      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Tabs */}
          <div className="flex bg-slate-50 p-2 gap-1">
            {['Activities', 'Hotels', 'Packages', 'Transfers', 'Visa'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 text-sm font-bold rounded-2xl transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-brand shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Form Content */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={18} />
                <select 
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all appearance-none"
                  disabled={loadingCities}
                >
                  <option value="">{loadingCities ? 'Loading cities...' : 'Select Destination'}</option>
                  {cities.map((city) => (
                    <option key={city.cityId} value={city.cityId}>
                      {city.cityName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travel Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Select Date" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travelers</label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={18} />
                <select className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all appearance-none">
                  <option>1 Adult, 0 Child</option>
                  <option>2 Adults, 1 Child</option>
                  <option>Family Group</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            <button 
              onClick={onSearch}
              className="bg-brand text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
            >
              Search Results
            </button>
          </div>
        </div>
      </div>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-2">Popular Experiences</h2>
            <p className="text-slate-500">Handpicked attractions with the best margins for you.</p>
          </div>
          <button className="text-brand font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View All <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: 'Burj Khalifa', img: 'burj', price: '145' },
            { name: 'Desert Safari', img: 'desert', price: '95' },
            { name: 'Museum of Future', img: 'future', price: '145' },
            { name: 'Ferrari World', img: 'ferrari', price: '295' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer"
            >
              <img 
                src={`https://picsum.photos/seed/${item.img}/400/600`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={item.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-xl font-display font-bold text-white mb-1">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">From AED {item.price}</span>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-brand transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'login' | 'dashboard' | 'results' | 'detail'>('login');
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [tours, setTours] = useState<RaynaTour[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedTour, setSelectedTour] = useState<TourDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleSearch = async () => {
    if (!selectedCityId) {
      alert('Please select a destination first');
      return;
    }

    setView('results');
    setLoadingTours(true);
    try {
      const response = await axios.post('/api/tours', {
        countryId: 13063,
        cityId: selectedCityId
      });
      const data = response.data;
      if (data.statuscode === 200 && data.result) {
        setTours(data.result);
      } else {
        setTours([]);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
    } finally {
      setLoadingTours(false);
    }
  };

  const handleTourClick = async (tour: RaynaTour) => {
    setLoadingDetail(true);
    // We don't change view immediately to show a loading state if needed, 
    // but for now let's just go to detail view and handle loading there or here.
    try {
      const response = await axios.post('/api/tour-details', {
        countryId: tour.countryId,
        cityId: tour.cityId,
        tourId: tour.tourId,
        contractId: tour.contractId,
        travelDate: new Date().toISOString().split('T')[0].replace(/-/g, '/') // Today's date as default
      });
      const data = response.data;
      if (data.statuscode === 200 && data.result && data.result.length > 0) {
        setSelectedTour(data.result[0]);
        setView('detail');
      } else {
        alert('Failed to load tour details');
      }
    } catch (error) {
      console.error('Error fetching tour details:', error);
      alert('Error loading tour details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const getSelectedCityName = () => {
    const city = cities.find(c => String(c.cityId) === selectedCityId);
    return city ? city.cityName : '';
  };

  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await axios.post('/api/cities', {
          CountryId: 13063
        });
        const data = response.data;
        if (data.statuscode === 200 && data.result) {
          setCities(data.result);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  return (
    <div className="font-sans text-gray-900 selection:bg-[#f27d26]/30 bg-white min-h-screen">
      <Navbar onSearchClick={() => setView('results')} />
      
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeView onLogin={() => setView('dashboard')} />
          </motion.div>
        )}
        
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DashboardView 
              onSearch={handleSearch} 
              cities={cities}
              loadingCities={loadingCities}
              selectedCity={selectedCityId}
              onCityChange={setSelectedCityId}
            />
          </motion.div>
        )}

        {view === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchResults 
              onBack={() => setView('dashboard')} 
              tours={tours}
              loading={loadingTours}
              cityName={getSelectedCityName()}
              onTourClick={handleTourClick}
            />
          </motion.div>
        )}

        {view === 'detail' && selectedTour && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TourDetailView 
              tour={selectedTour} 
              onBack={() => setView('results')} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-8 z-40">
        <button className="bg-[#4CAF50] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-transform">
          <MessageCircle size={20} />
          Message Us
        </button>
      </div>

      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-yellow-400 text-black px-2 py-6 rounded-r-lg font-bold text-xs [writing-mode:vertical-rl] rotate-180 cursor-pointer shadow-lg">
          Feedback
        </div>
      </div>
    </div>
  );
}
