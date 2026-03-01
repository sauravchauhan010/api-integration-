import React from 'react';
import { User, Lock, ShieldCheck, Star, Calendar, ChevronRight, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { Navbar } from '../components/Navbar';

export const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-white">
      <Navbar />
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
            className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-md:mx-auto max-w-md ml-auto"
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
                onClick={handleLogin}
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
      
      {/* Notifications Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-2">Latest Updates</h2>
            <p className="text-slate-500">Stay informed with the latest travel news and alerts</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-brand hover:border-brand transition-all">
              <ChevronRight className="rotate-180" size={24} />
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
              { icon: <Calendar className="text-brand" />, title: "24/7 Support", desc: "Our dedicated team is always here to help you." },
              { icon: <Globe className="text-brand" />, title: "Global Reach", desc: "Access thousands of products across the UAE." },
              { icon: <Star className="text-brand" />, title: "Best Rates", desc: "Exclusive B2B pricing you won't find anywhere else." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100">
                <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mb-6">
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
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
