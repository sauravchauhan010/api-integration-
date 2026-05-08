import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, Loader2, AlertCircle, X, Search, Filter, User as UserIcon } from 'lucide-react';
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
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [travelDateFrom, setTravelDateFrom] = useState('');
  const [travelDateTo, setTravelDateTo] = useState('');
  const [bookingDateFrom, setBookingDateFrom] = useState('');
  const [bookingDateTo, setBookingDateTo] = useState('');

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('/api/my-bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) setBookings(await response.json());
      else setError('Failed to fetch bookings');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [token]);

  const handleDownloadTicket = async (booking: Booking) => {
    setDownloadingId(booking.id);
    try {
      const response = await fetch('/api/get-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uniqNO: Date.now(),
          referenceNo: booking.reference_no,
          bookedOption: [{ serviceUniqueId: '1', bookingId: Number(booking.rayna_booking_id) }]
        })
      });
      const data = await response.json();
      const url = data.ticketURL || data.url || data.result?.ticketURL;
      if (url) window.open(url, '_blank');
      else alert('Ticket not available yet. Please try again later.');
    } catch {
      alert('Failed to download ticket.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(booking.id);
    try {
      const response = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bookingId: Number(booking.rayna_booking_id), referenceNo: booking.reference_no, cancellationReason: 'Cancelled by user via B2B portal' })
      });
      const data = await response.json();
      if (Number(data?.result?.status) === 1) { alert('Booking cancelled successfully.'); fetchBookings(); }
      else alert(data?.result?.message || 'Failed to cancel booking.');
    } catch {
      alert('Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const hasActiveFilters = travelDateFrom || travelDateTo || bookingDateFrom || bookingDateTo || statusFilter !== 'All';

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.tour_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.rayna_booking_id.includes(searchTerm) ||
      (b.reference_no && b.reference_no.includes(searchTerm));
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

    const travelDate = new Date(b.travel_date);
    const bookingDate = new Date(b.booking_date);
    const matchesTravelFrom = !travelDateFrom || travelDate >= new Date(travelDateFrom);
    const matchesTravelTo = !travelDateTo || travelDate <= new Date(travelDateTo);
    const matchesBookingFrom = !bookingDateFrom || bookingDate >= new Date(bookingDateFrom);
    const matchesBookingTo = !bookingDateTo || bookingDate <= new Date(bookingDateTo);

    return matchesSearch && matchesStatus && matchesTravelFrom && matchesTravelTo && matchesBookingFrom && matchesBookingTo;
  });

  const clearFilters = () => {
    setStatusFilter('All');
    setTravelDateFrom('');
    setTravelDateTo('');
    setBookingDateFrom('');
    setBookingDateTo('');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-full mx-auto px-8 py-12">

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-1">My Bookings</h1>
            <p className="text-slate-400">{filteredBookings.length} of {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand w-48"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                hasActiveFilters
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Filter size={15} />
              Filters
              {hasActiveFilters && (
                <span className="bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {[travelDateFrom || travelDateTo, bookingDateFrom || bookingDateTo, statusFilter !== 'All'].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  {/* Status */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {/* Travel Date Range */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Travel Date</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={travelDateFrom}
                        onChange={(e) => setTravelDateFrom(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 cursor-pointer"
                      />
                      <span className="text-slate-300 text-xs font-bold">TO</span>
                      <input
                        type="date"
                        value={travelDateTo}
                        onChange={(e) => setTravelDateTo(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Booking Date Range */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Booking Date</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={bookingDateFrom}
                        onChange={(e) => setBookingDateFrom(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 cursor-pointer"
                      />
                      <span className="text-slate-300 text-xs font-bold">TO</span>
                      <input
                        type="date"
                        value={bookingDateTo}
                        onChange={(e) => setBookingDateTo(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex justify-end pt-1">
                    <button onClick={clearFilters} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
                      <X size={12} /> Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Ticket className="w-10 h-10 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No bookings found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {searchTerm || statusFilter !== 'All' ? 'Try adjusting your filters.' : "You haven't made any bookings yet."}
          </p>
          {!searchTerm && statusFilter === 'All' && (
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-all text-sm">
              Explore Tours
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-2xl border border-slate-100 px-6 py-4 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: count + ref + tour name */}
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-bold text-slate-300 font-mono flex-shrink-0">#{idx + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>{booking.status}</span>
                      {booking.reference_no && (
                        <span className="text-xs text-slate-400 font-mono">REF: {booking.reference_no}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 truncate">{booking.tour_name}</h3>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {booking.status === 'Confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      disabled={cancellingId === booking.id}
                      className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all flex items-center gap-1"
                    >
                      {cancellingId === booking.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    Details
                  </button>
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-xl font-bold text-slate-900 truncate">{selectedBooking.tour_name}</h2>
                  <p className="text-slate-400 text-sm mt-0.5 truncate">{selectedBooking.option_name || 'Standard Option'}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto">

                {/* Status + IDs */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedBooking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    selectedBooking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{selectedBooking.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-500">ID: {selectedBooking.rayna_booking_id}</span>
                  {selectedBooking.reference_no && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-100 text-slate-500">REF: {selectedBooking.reference_no}</span>
                  )}
                </div>

                {/* Tour Info */}
                <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tour Information</h4>
                  {[
                    { label: 'Option', value: selectedBooking.option_name || 'Standard' },
                    { label: 'Travel Date', value: (() => { try { return format(new Date(selectedBooking.travel_date), 'PPP'); } catch { return selectedBooking.travel_date; } })() },
                    { label: 'Booked On', value: (() => { try { return format(new Date(selectedBooking.booking_date), 'PPP'); } catch { return selectedBooking.booking_date; } })() },
                    { label: 'Amount Paid', value: `AED ${selectedBooking.total_amount.toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-semibold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Passenger Details */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Passengers</h4>
                  {(() => {
                    try {
                      const pax = JSON.parse(selectedBooking.pax_details);
                      const adults = pax.adults || 0;
                      const children = pax.children || 0;
                      const infants = pax.infants || 0;
                      const adultRate = pax.adultRate || 0;
                      const childRate = pax.childRate || 0;
                      const infantRate = pax.infantRate || 0;
                      const passengerName = pax.passengerName || '';
                      const email = pax.email || '';
                      const mobile = pax.mobile || '';
                      return (
                        <div className="space-y-3">
                          {/* Lead passenger info — only shown if name exists */}
                          {passengerName ? (
                            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-slate-400">Lead Passenger</span>
                                <span className="text-sm font-semibold text-slate-900">{passengerName}</span>
                              </div>
                              {email && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Email</span>
                                  <span className="text-xs text-slate-600">{email}</span>
                                </div>
                              )}
                              {mobile && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-400">Mobile</span>
                                  <span className="text-xs text-slate-600">{mobile}</span>
                                </div>
                              )}
                            </div>
                          ) : null}
                          {/* Pax counts + rates */}
                          {adults === 0 && children === 0 && infants === 0 ? (
                            <p className="text-sm text-slate-400 italic">No passenger details available.</p>
                          ) : (
                            <div className="flex gap-3">
                              {adults > 0 && (
                                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                  <p className="text-xl font-bold text-slate-900">{adults}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Adult{adults > 1 ? 's' : ''}</p>
                                  {adultRate > 0 && <p className="text-xs font-bold text-brand mt-1">AED {adultRate} each</p>}
                                </div>
                              )}
                              {children > 0 && (
                                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                  <p className="text-xl font-bold text-slate-900">{children}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Child{children > 1 ? 'ren' : ''}</p>
                                  {childRate > 0 && <p className="text-xs font-bold text-brand mt-1">AED {childRate} each</p>}
                                </div>
                              )}
                              {infants > 0 && (
                                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                  <p className="text-xl font-bold text-slate-900">{infants}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Infant{infants > 1 ? 's' : ''}</p>
                                  {infantRate > 0 && <p className="text-xs font-bold text-brand mt-1">AED {infantRate} each</p>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    } catch {
                      return <p className="text-sm text-slate-400 italic">No passenger details available.</p>;
                    }
                  })()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setSelectedBooking(null)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all text-sm">
                  Close
                </button>
                {selectedBooking.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleDownloadTicket(selectedBooking)}
                    disabled={downloadingId === selectedBooking.id}
                    className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all text-sm flex items-center gap-2"
                  >
                    {downloadingId === selectedBooking.id ? <Loader2 size={14} className="animate-spin" /> : null}
                    Download Ticket
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;
