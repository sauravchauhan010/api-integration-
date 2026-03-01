import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourName: string;
  bookingId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, tourName, bookingId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Booking Initiated!</h3>
              <p className="text-slate-500 mb-8">
                Your request for <span className="font-bold text-slate-900">"{tourName}"</span> has been sent to our reservation team. You will receive a confirmation shortly.
              </p>
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-slate-500">Booking ID</span>
                  <span className="text-sm font-bold text-slate-900">{bookingId || `#RT-${Math.floor(Math.random() * 90000) + 10000}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className="text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">Processing</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Close & Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
