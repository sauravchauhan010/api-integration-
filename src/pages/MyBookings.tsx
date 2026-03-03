import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Ticket, Clock, ChevronRight, Loader2, AlertCircle, X, Search, Filter, Trash2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Booking {
  id: number;
  rayna_booking_id: string;
  reference_no: string;
  tour_name: string;
  option_name: string;
  tour_id: number;
  booking_date: string;
  travel_date: string;
  total_amount: number;
  status: string;
  pax_details: string;
}

const MyBookings: React.FC = () => {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleDownloadTicket = async (booking: Booking) => {
    setDownloadingId(booking.id);
    try {
      const response = await fetch('/api/get-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uniqNO: Date.now(), // Random unique number as required by Rayna
          referenceNo: booking.reference_no,
          bookedOption: [
            {
              serviceUniqueId: "1", // This is usually 1 for single service bookings
              bookingId: Number(booking.rayna_booking_id)
            }
          ]
        })
      });

      const data = await response.json();
      if (data.ticketURL || data.url) {
        window.open(data.ticketURL || data.url, '_blank');
      } else if (data.result?.ticketURL) {
        window.open(data.result.ticketURL, '_blank');
      } else {
        alert('Ticket not available yet. Please try again later.');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download ticket.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    
    setCancellingId(booking.id);
    try {
      const response = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
       body: JSON.stringify({
  bookingId: String(booking.rayna_booking_id),
  referenceNo: booking.reference_no,
  cancellationReason: "testing"
})
      });

      const data = await response.json();
      if (response.ok && (data.status === 'Success' || data.result?.status === 'Success' || data.isSuccess)) {
        alert('Booking cancelled successfully.');
        fetchBookings(); // Refresh list
      } else {
        alert(data.message || data.error || 'Failed to cancel booking. It might be too close to the travel date.');
      }
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.tour_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          booking.rayna_booking_id.includes(searchTerm) ||
                          (booking.reference_no && booking.reference_no.includes(searchTerm));
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-8 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-500 text-lg">Manage your upcoming and past experiences.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand transition-colors" />
            <input 
              type="text"
              placeholder="Search by tour or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand/5 focus:border-brand outline-none text-sm w-full sm:w-64 transition-all"
            />
          </div>
          
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand transition-colors" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand/5 focus:border-brand outline-none text-sm appearance-none cursor-pointer transition-all"
            >
              <option value="All">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'All' ? "Try adjusting your filters to find what you're looking for." : "You haven't made any bookings yet. Start exploring amazing experiences now!"}
          </p>
          {!searchTerm && statusFilter === 'All' && (
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
            >
              Explore Tours
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-slate-400 font-mono">#{idx + 1}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-sm text-slate-400 font-mono">ID: {booking.rayna_booking_id}</span>
                    {booking.reference_no && (
                      <span className="text-sm text-slate-400 font-mono">Ref: {booking.reference_no}</span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {booking.tour_name}
                  </h3>
                  <p className="text-emerald-600 font-semibold mb-4 text-sm">{booking.option_name || 'Standard Option'}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Travel Date</p>
                        <p className="font-semibold">
                          {(() => {
                            try {
                              return format(new Date(booking.travel_date), 'PPP');
                            } catch (e) {
                              return booking.travel_date;
                            }
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <Clock className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Booked On</p>
                        <p className="font-semibold">
                          {(() => {
                            try {
                              return format(new Date(booking.booking_date), 'PPP');
                            } catch (e) {
                              return booking.booking_date;
                            }
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</p>
                        <p className="font-semibold">Dubai, UAE</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-slate-900">AED {booking.total_amount.toFixed(2)}</p>
                  </div>

                  <div className="flex gap-3 w-full lg:w-auto mt-6 lg:mt-0">
                    <button 
                      onClick={() => handleDownloadTicket(booking)}
                      disabled={downloadingId === booking.id || booking.status === 'Cancelled'}
                      className="flex-1 lg:flex-none px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {downloadingId === booking.id ? <Loader2 size={14} className="animate-spin" /> : 'View Ticket'}
                    </button>
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="flex-1 lg:flex-none px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
                    >
                      Details
                    </button>
                    {booking.status === 'Confirmed' && (
                      <button 
                        onClick={() => handleCancelBooking(booking)}
                        disabled={cancellingId === booking.id}
                        className="p-2.5 text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl flex items-center gap-2"
                        title="Cancel Booking"
                      >
                        {cancellingId === booking.id ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                        <span className="text-xs font-bold uppercase">Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900">Booking Details</h2>
                  <p className="text-slate-500 text-sm">ID: {selectedBooking.rayna_booking_id}</p>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Tour Information</h3>
                  <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tour Name</span>
                      <span className="font-semibold text-slate-900">{selectedBooking.tour_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Option</span>
                      <span className="font-semibold text-emerald-600">{selectedBooking.option_name || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Travel Date</span>
                      <span className="font-semibold text-slate-900">{selectedBooking.travel_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid</span>
                      <span className="font-bold text-slate-900">AED {selectedBooking.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Passenger Details</h3>
                  {(() => {
                    try {
                      const pax = JSON.parse(selectedBooking.pax_details);
                      return (
                        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                          <UserIcon size={16} />
                          <span>Total Passengers: {pax.length}</span>
                        </div>
                      );
                    } catch (e) { return null; }
                  })()}
                  <div className="space-y-4">
                    {(() => {
                      try {
                        const pax = JSON.parse(selectedBooking.pax_details);
                        return pax.map((p: any, i: number) => (
                          <div key={i} className="border border-slate-100 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg">
                                {p.firstName?.[0]}{p.lastName?.[0]}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900 text-lg">{p.prefix} {p.firstName} {p.lastName}</p>
                                  {p.leadPassenger === 1 && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase">Lead Passenger</span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">{p.paxType} • {p.nationality}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Email Address</p>
                                <p className="text-sm font-medium text-slate-700">{p.email || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Mobile Number</p>
                                <p className="text-sm font-medium text-slate-700">{p.mobile || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ));
                      } catch (e) {
                        return <p className="text-slate-400 italic">No passenger details available.</p>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDownloadTicket(selectedBooking)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
                >
                  Download Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;
