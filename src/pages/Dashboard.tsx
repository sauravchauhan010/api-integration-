import React, { useState, useEffect } from 'react';
import { Search, Calendar, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../services/api';
import { City } from '../types';
import { DashboardNavbar } from '../components/Navbar';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        // Using UAE (13063) as default country as per docs
        const result = await tourService.getCities(13063);
        setCities(result);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, []);

  const handleSearch = () => {
    if (!selectedCityId) {
      alert('Please select a destination first');
      return;
    }
    navigate(`/results?cityId=${selectedCityId}&date=${selectedDate}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <DashboardNavbar />

      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img 
          src="https://picsum.photos/seed/dubai-modern/1920/800" 
          className="w-full h-full object-cover"
          alt="Ain Dubai"
          referrerPolicy="no-referrer"
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
                onClick={handleSearch}
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
                className={`flex-1 px-6 py-3 text-sm font-bold rounded-2xl transition-all ${
                  tab === 'Activities' 
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
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
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
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
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
              onClick={handleSearch}
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
                referrerPolicy="no-referrer"
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
