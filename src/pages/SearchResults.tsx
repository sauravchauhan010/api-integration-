import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Trash2, ShoppingCart, CheckCircle2, Calendar, Users, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tourService } from '../services/api';
import { RaynaTour, City } from '../types';
import { TourCard } from '../components/TourCard';

export const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cityId = searchParams.get('cityId');
  const date = searchParams.get('date');
  const adults = searchParams.get('adults') || '1';
  const children = searchParams.get('children') || '0';
  const infants = searchParams.get('infants') || '0';

  const [tours, setTours] = useState<RaynaTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Modify Search State
  const [isModifying, setIsModifying] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [modCityId, setModCityId] = useState(cityId || '');
  const [modDate, setModDate] = useState(date || '');
  const [modAdults, setModAdults] = useState(Number(adults));
  const [modChildren, setModChildren] = useState(Number(children));
  const [modInfants, setModInfants] = useState(Number(infants));
  const [showPaxDropdown, setShowPaxDropdown] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const result = await tourService.getCities(13063);
        setCities(result);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    const loadTours = async () => {
      if (!cityId) return;
      setLoading(true);
      try {
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

  const handleModifySearch = () => {
    setSearchParams({
      cityId: modCityId,
      date: modDate,
      adults: modAdults.toString(),
      children: modChildren.toString(),
      infants: modInfants.toString()
    });
    setIsModifying(false);
  };

  const totalPax = modAdults + modChildren + modInfants;

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
      
      {/* Secondary Nav / Breadcrumbs */}
      <div className="bg-white border-b border-slate-100 py-3 sticky top-20 z-[60]">
        <div className="max-w-full mx-auto px-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3 text-sm">
              <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-brand flex items-center gap-1 transition-colors">
                <ChevronLeft size={18} /> Dashboard
              </button>
              <span className="text-slate-200">/</span>
              <span className="font-bold text-slate-900">Tours & Sightseeing</span>
              {cityId && (
                <>
                  <span className="text-slate-200">/</span>
                  <span className="text-slate-500">{cities.find(c => c.cityId.toString() === cityId)?.cityName || 'Dubai'}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isModifying && (
                <button 
                  onClick={() => setIsModifying(true)}
                  className="bg-brand/10 text-brand px-5 py-2 rounded-xl text-sm font-bold border border-brand/20 hover:bg-brand/20 transition-all flex items-center gap-2"
                >
                  <Search size={16} /> Modify Search
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isModifying && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="py-4 border-t border-slate-50 flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px] space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</label>
                    <div className="relative">
                      <select 
                        value={modCityId}
                        onChange={(e) => setModCityId(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 appearance-none"
                      >
                        {cities.map((city, idx) => (
                          <option key={`${city.cityId}-${idx}`} value={city.cityId}>{city.cityName}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  <div className="w-48 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="date" 
                        value={modDate}
                        onChange={(e) => setModDate(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10"
                      />
                    </div>
                  </div>

                  <div className="w-64 space-y-1 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travelers</label>
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => setShowPaxDropdown(!showPaxDropdown)}
                    >
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <div className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700">
                        {modAdults}A, {modChildren}C, {modInfants}I
                      </div>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    </div>

                    {showPaxDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-[70] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Adults</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setModAdults(Math.max(1, modAdults - 1))} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-xs">-</button>
                            <span className="text-xs font-bold w-4 text-center">{modAdults}</span>
                            <button onClick={() => setModAdults(modAdults + 1)} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-xs">+</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Children</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setModChildren(Math.max(0, modChildren - 1))} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-xs">-</button>
                            <span className="text-xs font-bold w-4 text-center">{modChildren}</span>
                            <button onClick={() => setModChildren(modChildren + 1)} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-xs">+</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Infants</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setModInfants(Math.max(0, modInfants - 1))} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-xs">-</button>
                            <span className="text-xs font-bold w-4 text-center">{modInfants}</span>
                            <button onClick={() => setModInfants(modInfants + 1)} className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-xs">+</button>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowPaxDropdown(false)}
                          className="w-full py-2 bg-brand text-white text-xs font-bold rounded-lg"
                        >Done</button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={handleModifySearch}
                      className="bg-brand text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                    >
                      Search
                    </button>
                    <button 
                      onClick={() => setIsModifying(false)}
                      className="px-4 py-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-full mx-auto px-8 py-10 flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-8">
          <div className="sticky top-[136px] space-y-8">
            {/* Filters */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-slate-900 text-lg">Categories</h3>
                  {selectedCategories.length > 0 && (
                    <button 
                      onClick={() => setSelectedCategories([])}
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {categories.map((cat, i) => (
                    <label key={`${cat}-${i}`} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-all cursor-pointer" 
                          />
                          <CheckCircle2 className="absolute inset-0 m-auto w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className={`text-sm font-medium transition-colors ${
                          selectedCategories.includes(cat) ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'
                        }`}>
                          {cat}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md group-hover:bg-slate-100 transition-colors">
                        {tours.filter(t => t.cityTourType === cat).length}
                      </span>
                    </label>
                  ))}
                </div>
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
                  key={`${tour.tourId}-${idx}`} 
                  tour={tour} 
                  idx={idx} 
                  onClick={(t) => navigate(`/detail/${t.tourId}?cityId=${t.cityId}&contractId=${t.contractId}&date=${date}&adults=${adults}&children=${children}&infants=${infants}`)} 
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
