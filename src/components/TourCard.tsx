import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { RaynaTour } from '../types';

interface TourCardProps {
  tour: RaynaTour;
  idx: number;
  onClick: (tour: RaynaTour) => void;
}

const getImageUrl = (path: string) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `https://sandbox.raynatours.com/${path}`;
};

export const TourCard: React.FC<TourCardProps> = ({ tour, idx, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ y: -10 }}
      onClick={() => onClick(tour)}
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
  );
};
