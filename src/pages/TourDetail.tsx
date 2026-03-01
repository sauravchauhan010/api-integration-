import React, { useState, useEffect } from 'react';
import { ChevronLeft, Globe, Star, Clock, ShieldCheck, X, MessageCircle, Phone, Calendar, Users, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { tourService } from '../services/api';
import { TourDetail, TourOptionPrice } from '../types';
import { BookingModal } from '../components/BookingModal';
import { DashboardNavbar } from '../components/Navbar';

export const TourDetailView = () => {
  const navigate = useNavigate();
  const { tourId } = useParams();
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('cityId');
  const contractId = searchParams.get('contractId');
  const date = searchParams.get('date');

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [options, setOptions] = useState<TourOptionPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!tourId || !cityId || !contractId || !date) return;
      setLoading(true);
      try {
        const detail = await tourService.getTourDetails({
          CountryId: 13063,
          CityId: Number(cityId),
          TourId: Number(tourId),
          ContractId: Number(contractId),
          TravelDate: date.replace(/-/g, '/')
        });
        setTour(detail);
        setActiveImage(detail.imagePath);

        const opts = await tourService.getTourOptions({
          tourId: Number(tourId),
          contractId: Number(contractId),
          travelDate: date.replace(/-/g, '/'),
          noOfAdult: 1
        });
        setOptions(opts);
      } catch (error) {
        console.error('Error loading tour detail:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [tourId, cityId, contractId, date]);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `https://sandbox.raynatours.com/${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-4">Tour not found</h2>
        <button onClick={() => navigate(-1)} className="text-brand font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <DashboardNavbar />
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        tourName={tour.tourName} 
      />
      
      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-brand flex items-center gap-1 transition-colors text-sm font-medium">
            <ChevronLeft size={18} /> Back to Results
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsBookingModalOpen(true)}
              className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20"
            >
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
              <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200">
                <img 
                  src={getImageUrl(activeImage)} 
                  className="w-full h-full object-cover" 
                  alt={tour.tourName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tour.tourId}/800/600`;
                  }}
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-900 shadow-lg">
                    {tour.cityTourType}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {tour.tourImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img.imagePath)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImage === img.imagePath ? 'border-brand scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img.imagePath)} 
                      className="w-full h-full object-cover" 
                      alt="" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tour.tourId}-${idx}/200/200`;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
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
                      <p className="text-sm font-bold text-slate-900">{tour.tourLanguage || 'English'}</p>
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
                      <div className="text-slate-600 text-sm space-y-2" dangerouslySetInnerHTML={{ __html: tour.tourInclusion }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2 text-red-500">
                        <X size={24} /> Exclusions
                      </h3>
                      <div className="text-slate-600 text-sm space-y-2" dangerouslySetInnerHTML={{ __html: tour.tourExclusion }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-8">Select Option</h3>
              <div className="space-y-4">
                {options.map((opt) => (
                  <div 
                    key={opt.tourOptionId}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                      selectedOptionId === opt.tourOptionId ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-slate-200'
                    }`}
                    onClick={() => setSelectedOptionId(opt.tourOptionId)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">{opt.transferName}</h4>
                        <p className="text-xs text-slate-500">{opt.departureTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-brand">AED {opt.finalAmount}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">per person</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 sticky top-8">
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Travel Date</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Calendar size={18} className="text-brand" />
                  {date}
                </div>
              </div>

              <div className="space-y-4 mb-8">
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

              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 mb-4"
              >
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
