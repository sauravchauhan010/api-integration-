import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Ticket, Download, Calendar, Clock, Hash, ExternalLink, Loader2, AlertCircle, ChevronRight, X, Trash2, CheckCircle2 } from 'lucide-react';
import { bookingService } from '../services/api';
import { DashboardNavbar } from '../components/Navbar';
import { BookingResponse } from '../types';
import { AnimatePresence } from 'motion/react';

interface SavedBooking extends BookingResponse {
  tourName: string;
  tourDate: string;
  startTime: string;
  uniqueNo: string;
  bookingDate: string;
}

export const MyBookings = () => {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelData, setCancelData] = useState<{
    bookingId: number;
    referenceNo: string;
    tourName: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer request');

  useEffect(() => {
    const saved = localStorage.getItem('rayna_bookings');
    if (saved) {
      setBookings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleDownloadTicket = async (booking: SavedBooking, detail: any) => {
    // Check all possible locations for ticketURL
    const directTicketUrl = detail.ticketURL || booking.result.ticketURL;
    
    if (directTicketUrl) {
      const link = document.createElement('a');
      link.href = directTicketUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setDownloading(detail.bookingId);
    setError(null);
    setSuccess(null);

    try {
      const response = await bookingService.getBookedTickets({
        uniqNO: Number(booking.uniqueNo) || 123456,
        referenceNo: booking.result.referenceNo,
        bookedOption: [{
          serviceUniqueId: detail.serviceUniqueId,
          bookingId: detail.bookingId
        }]
      });

      const ticketUrl = response.url || 
                        response.ticketURL || 
                        (Array.isArray(response.result) ? response.result[0]?.ticketURL : response.result?.ticketURL);

      if (response.statuscode === 200 && ticketUrl) {
        // Create a temporary link and click it to trigger download/open
        const link = document.createElement('a');
        link.href = ticketUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setSuccess('Ticket link opened in a new tab.');
      } else {
        setError(response.error || 'Failed to generate ticket. Please try again later.');
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('An error occurred while trying to download your ticket.');
    } finally {
      setDownloading(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelData) return;
    
    setCancelling(cancelData.bookingId);
    setError(null);
    setSuccess(null);

    try {
      const response = await bookingService.cancelBooking({
        bookingId: cancelData.bookingId.toString(),
        referenceNo: cancelData.referenceNo,
        cancellationReason: cancelReason
      });

      if (response.status === 1) {
        setSuccess(response.message || 'Booking cancelled successfully.');
        
        // Update local state and storage
        const updatedBookings = bookings.map(b => {
          if (b.result.referenceNo === cancelData.referenceNo) {
            return {
              ...b,
              result: {
                ...b.result,
                details: b.result.details.map(d => 
                  d.bookingId === cancelData.bookingId ? { ...d, status: 'Cancelled' } : d
                )
              }
            };
          }
          return b;
        });
        
        setBookings(updatedBookings);
        localStorage.setItem('rayna_bookings', JSON.stringify(updatedBookings));
        setShowCancelModal(false);
      } else {
        setError(response.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setError('An error occurred while trying to cancel your booking.');
    } finally {
      setCancelling(null);
    }
  };

  const openCancelModal = (booking: SavedBooking, detail: any) => {
    setCancelData({
      bookingId: detail.bookingId,
      referenceNo: booking.result.referenceNo,
      tourName: booking.tourName
    });
    setShowCancelModal(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <DashboardNavbar />
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">My Bookings</h1>
            <p className="text-slate-500">Manage your upcoming tours and download your tickets.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
              <Ticket size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bookings</p>
              <p className="text-lg font-bold text-slate-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between text-red-600 text-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between text-green-600 text-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} />
              {success}
            </div>
            <button onClick={() => setSuccess(null)} className="p-1 hover:bg-green-100 rounded-full transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Ticket size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500 mb-8">You haven't made any bookings yet. Start exploring tours!</p>
            <a href="/" className="inline-flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-all">
              Explore Tours <ChevronRight size={18} />
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-brand/10 text-brand text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Confirmed
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Hash size={10} /> Ref: {booking.result.referenceNo}
                        </span>
                      </div>
                      <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">{booking.tourName}</h3>
                      
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={16} className="text-brand" />
                          <span className="font-medium">{booking.tourDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock size={16} className="text-brand" />
                          <span className="font-medium">{booking.startTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Booked On</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tickets & Options</h4>
                    <div className="space-y-4">
                      {booking.result.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                              <Ticket size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">Booking ID: {detail.bookingId}</p>
                              <p className="text-[10px] text-slate-500">Conf No: {detail.confirmationNo}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                              detail.status === 'Cancelled' 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-green-50 text-green-600'
                            }`}>
                              {detail.status}
                            </span>
                            
                                {detail.status !== 'Cancelled' && (
                                  <div className="flex items-center gap-2">
                                    {(detail.ticketURL || booking.result.ticketURL || detail.downloadRequired) && (
                                      <button 
                                        onClick={() => handleDownloadTicket(booking, detail)}
                                        disabled={downloading === detail.bookingId}
                                        className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-dark transition-all disabled:opacity-50 shadow-sm shadow-brand/20"
                                      >
                                        {downloading === detail.bookingId ? (
                                          <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                          <Download size={14} />
                                        )}
                                        {(detail.ticketURL || booking.result.ticketURL) ? 'View Ticket' : 'Download Ticket'}
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => openCancelModal(booking, detail)}
                                      className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                    >
                                      <Trash2 size={14} />
                                      Cancel
                                    </button>
                                  </div>
                                )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Cancel Booking</h3>
                <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-4">
                  Are you sure you want to cancel your booking for <span className="font-bold text-slate-900">"{cancelData?.tourName}"</span>?
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking ID:</span>
                    <span className="font-bold text-slate-900">{cancelData?.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reference No:</span>
                    <span className="font-bold text-slate-900">{cancelData?.referenceNo}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason for Cancellation</label>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Keep Booking
                </button>
                <button 
                  onClick={handleCancelBooking}
                  disabled={cancelling !== null}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  {cancelling ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
