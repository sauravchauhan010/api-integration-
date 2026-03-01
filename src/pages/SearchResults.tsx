import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tourService } from '../services/api';
import { RaynaTour } from '../types';
import { TourCard } from '../components/TourCard';
import { DashboardNavbar } from '../components/Navbar';

export const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('cityId');
  const date = searchParams.get('date');

  const [tours, setTours] = useState<RaynaTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadTours = async () => {
      if (!cityId) return;
      setLoading(true);
      try {
        // UAE is 13063
        const result = await tourService.getTours(13063, Number(cityId));
        setTours(result);
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTours();
  }, [cityId]);

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.tourName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(tour.cityTourType);
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const categories = Array.from(new Set(tours.map(t => t.cityTourType)));

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <DashboardNavbar />
      {/* Secondary Nav / Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-brand flex items-center gap-1 transition-colors">
              <ChevronLeft size={18} /> Dashboard
            </button>
            <span className="text-slate-200">/</span>
            <span className="font-bold text-slate-900">Tours & Sightseeing</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
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
          {/* Cart Card (Static for demo) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart size={20} className="text-brand" /> My Cart
              </h3>
              <span className="bg-brand text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">0 Items</span>
            </div>
            <div className="p-5 text-center py-10">
              <p className="text-slate-400 text-sm">Your cart is empty</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-8">
            <div>
              <h3 className="font-display font-bold text-slate-900 mb-5">Categories</h3>
              <div className="space-y-3">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-all" 
                    />
                    <span className="group-hover:text-slate-900 transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Available Experiences</h2>
              <p className="text-sm text-slate-500">{loading ? 'Searching...' : `${filteredTours.length} activities found`}</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search activities..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTours.map((tour, idx) => (
                <TourCard 
                  key={tour.tourId} 
                  tour={tour} 
                  idx={idx} 
                  onClick={(t) => navigate(`/detail/${t.tourId}?cityId=${t.cityId}&contractId=${t.contractId}&date=${date}`)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-2">No activities found</h3>
              <p className="text-slate-500">Try adjusting your filters or search term.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
