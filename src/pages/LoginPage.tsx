import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, Globe } from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side: Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1920" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Dubai Skyline"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                <Globe className="text-white" size={24} />
              </div>
              <span className="text-4xl font-display font-bold tracking-tight">
                SMC Tours<span className="text-brand ml-0.5">B2B</span>
              </span>
            </div>
            <div className="flex gap-1.5 mt-1 ml-12">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <div>
            <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
              Scale Your Travel Business with Ease
            </h2>
            <p className="text-xl text-slate-300 max-w-lg leading-relaxed">
              Access thousands of tours, attractions, and transfers across the UAE and beyond. 
              Real-time bookings, competitive rates, and 24/7 support.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-brand rounded-full"></div>
              <span>10k+ Tours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-brand rounded-full"></div>
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-brand rounded-full"></div>
              <span>24/7 Expert Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-slate-50 lg:bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-3">Welcome Back</h1>
            <p className="text-slate-500 text-lg">Log in to your partner dashboard to manage your bookings.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all outline-none text-slate-900 font-medium"
                  placeholder="you@agency.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-brand hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand/5 focus:border-brand focus:bg-white transition-all outline-none text-slate-900 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-70 shadow-xl shadow-slate-900/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              New to SMC Tours?{' '}
              <Link to="/register" className="text-brand font-bold hover:underline ml-1">
                Apply for an Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
