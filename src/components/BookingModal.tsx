import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Loader2, CheckCircle2, AlertCircle, Clock, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { bookingService } from '../services/api';
import { BookingResponse } from '../types';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourName: string;
  optionName: string;
  tourId: number;
  optionId: number;
  transferId: number;
  adults: number;
  childrenCount: number;
  infants: number;
  tourDate: string;
  adultRate: number;
  childRate: number;
  infantRate: number;
  startTime: string;
  timeSlotId: string;
  contractId?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  tourName,
  optionName,
  tourId,
  optionId,
  transferId,
  adults,
  childrenCount,
  infants,
  tourDate,
  adultRate,
  childRate,
  infantRate,
  startTime,
  timeSlotId,
  contractId
}) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [policy, setPolicy] = useState<any[]>([]);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [formData, setFormData] = useState({
    prefix: 'Mr',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    mobile: '',
    nationality: 'IN',
    message: ''
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || prev.firstName,
        lastName: user.name?.split(' ')[1] || prev.lastName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Fetch cancellation policy when modal opens
  useEffect(() => {
    if (isOpen && tourId && optionId && tourDate && startTime) {
      setPolicyLoading(true);
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
      const formattedDate = tourDate.replace(/-/g, '/');
      fetch('/api/tour-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          travelDate: formattedDate,
          startTime,
          currentDate: today,
          contractId: 300,
          tourOptionId: optionId
        })
      })
        .then(r => r.json())
        .then(data => setPolicy(data.result || []))
        .catch(() => setPolicy([]))
        .finally(() => setPolicyLoading(false));
    }
  }, [isOpen, tourId, optionId, tourDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Step 1: Check availability before booking
    try {
      const availResponse = await fetch('/api/tour-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          tourOptionId: optionId,
          transferId,
          travelDate: tourDate.replace(/-/g, '/'),
          adult: adults,
          child: childrenCount,
          infant: infants,
          contractId,
        })
      });
      const availData = await availResponse.json();
      if (availData?.result?.status !== 1) {
        setError(availData?.result?.message || 'This tour is not available for the selected date. Please choose a different date or option.');
        setLoading(false);
        return;
      }
    } catch {
      setError('Failed to check availability. Please try again.');
      setLoading(false);
      return;
    }

    // Step 2: Proceed with booking

    const serviceTotal = ((adults * adultRate) + (childrenCount * childRate) + (infants * infantRate)).toFixed(2);
    const uniqueNo = "B2B" + Date.now() + Math.floor(Math.random() * 1000);
    const serviceUniqueId = Math.floor(100000 + Math.random() * 900000);

    const bookingData: any = {
      uniqueNo,
      TourDetails: [{
        serviceUniqueId,
        tourId,
        optionId,
        adult: adults,
        child: childrenCount,
        infant: infants,
        tourDate: tourDate,
        timeSlotId,
        startTime,
        transferId,
        pickup: 'TBA',
        adultRate,
        childRate,
        infantRate,
        serviceTotal
      }],
      passengers: [{
        serviceType: 'Tour',
        prefix: formData.prefix,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
        nationality: formData.nationality,
        message: formData.message || '',
        leadPassenger: 1,
        paxType: 'Adult',
        clientReferenceNo: "REF" + Date.now()
      }],
      localDetails: {
        tourName,
        optionName,
        tourId,
        travelDate: tourDate,
        totalAmount: Number(serviceTotal),
        paxDetails: {
          adults, children: childrenCount, infants,
          adultRate, childRate, infantRate,
          passengerName: `${formData.prefix} ${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          mobile: formData.mobile,
        }
      }
    };

    console.log("Initiating booking with data:", bookingData);

    try {
      const response = await bookingService.createBooking(bookingData, token || undefined);
      console.log("Booking response from server:", response);
      if (response.statuscode === 200) {
        setBookingResult(response);
      } else {
        setError(response.error || 'Booking failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while processing your booking.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setBookingResult(null);
    setError(null);
    setPolicy([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-display font-bold text-slate-900">
                {bookingResult ? 'Booking Confirmation' : 'Complete Your Booking'}
              </h3>
              <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-8">
              {!user ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Login Required</h4>
                  <p className="text-slate-500 mb-8">You need to be logged in to complete your booking.</p>
                  <a 
                    href="/login" 
                    className="inline-block bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-all"
                  >
                    Go to Login
                  </a>
                </div>
              ) : !bookingResult ? (
                <form onSubmit={handleBooking} className="space-y-6">
                  {/* Tour Summary + Cancellation Policy */}
                  <div className="bg-brand/5 p-6 rounded-3xl border border-brand/10 mb-8">
                    <h4 className="font-bold text-slate-900 mb-2">{tourName}</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-brand" /> {tourDate}</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="text-brand" /> {startTime}</span>
                      <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-brand" /> {adults} Adult(s), {childrenCount} Child(ren), {infants} Infant(s)</span>
                      <span className="flex items-center gap-1 font-bold text-brand">Total: AED {(adults * adultRate) + (childrenCount * childRate) + (infants * infantRate)}</span>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="mt-4 pt-4 border-t border-brand/10">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert size={14} className="text-amber-500" />
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Cancellation Policy</span>
                      </div>
                      {policyLoading ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Loader2 size={12} className="animate-spin" /> Loading policy...
                        </div>
                      ) : policy.length > 0 ? (
                        policy.map((p: any, i: number) => (
                          <div key={i} className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-1">
                            {p.percentage === 100
                              ? `⚠️ 100% cancellation charge from ${new Date(p.fromDate).toDateString()} to ${new Date(p.toDate).toDateString()}`
                              : `${p.percentage}% cancellation charge from ${new Date(p.fromDate).toDateString()} to ${new Date(p.toDate).toDateString()}`
                            }
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">No cancellation policy found for this tour.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prefix</label>
                      <select 
                        name="prefix"
                        value={formData.prefix}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10"
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nationality</label>
                      <input 
                        type="text" 
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        placeholder="e.g. IN"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                      <input 
                        type="tel" 
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="+971..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Special Message (Optional)</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Booking'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Booking Successful!</h3>
                  <p className="text-slate-500 mb-8">
                    Your booking for <span className="font-bold text-slate-900">"{tourName}"</span> has been confirmed.
                  </p>
                  
                  <div className="bg-slate-50 rounded-3xl p-8 text-left space-y-4 mb-8">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                      <span className="text-sm text-slate-500">Reference Number</span>
                      <span className="text-sm font-bold text-slate-900">{bookingResult.result.referenceNo}</span>
                    </div>
                    {bookingResult.result.details.map((detail, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Booking ID</span>
                          <span className="text-sm font-bold text-slate-900">{detail.bookingId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Status</span>
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">{detail.status}</span>
                        </div>
                        {(detail.ticketURL || (bookingResult.result as any).ticketURL) && (
                          <div className="pt-2">
                            <a 
                              href={detail.ticketURL || (bookingResult.result as any).ticketURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full bg-brand/10 text-brand py-2 rounded-xl text-sm font-bold hover:bg-brand/20 transition-all"
                            >
                              <ExternalLink size={16} />
                              View Ticket
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={resetAndClose}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Close & Continue
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
