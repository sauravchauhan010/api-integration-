import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, ChevronDown, Loader2, Calendar, Users } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface PassengerForm {
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  nationality: string;
}

export const CartDrawer = () => {
  const { items, removeItem, clearCart, totalAmount, isOpen, closeCart } = useCart();
  const { user, token } = useAuth();
  const [step, setStep] = useState<'cart' | 'passenger' | 'booking'>('cart');
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<PassengerForm>({
    prefix: 'Mr',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    mobile: '',
    nationality: 'IN',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookAll = async () => {
    setLoading(true);
    setError('');
    try {
      const uniqueNo = `B2B${Date.now()}`;
      const TourDetails = items.map((item, idx) => ({
        serviceUniqueId: Date.now() + idx,
        tourId: item.tourId,
        optionId: item.optionId,
        adult: item.adults,
        child: item.children,
        infant: item.infants,
        tourDate: item.tourDate,
        timeSlotId: item.timeSlotId || '0',
        startTime: item.startTime || '00:00:00',
        transferId: item.transferId,
        pickup: 'TBA',
        adultRate: item.adultRate,
        childRate: item.childRate,
        infantRate: item.infantRate,
        serviceTotal: item.total.toFixed(2),
      }));

      const passengers = [{
        serviceType: 'Tour',
        prefix: form.prefix,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        nationality: form.nationality,
        message: '',
        leadPassenger: 1,
        paxType: 'Adult',
        clientReferenceNo: `REF${Date.now()}`,
      }];

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uniqueNo,
          TourDetails,
          passengers,
          localDetails: {
            tourName: items.map(i => i.tourName).join(', '),
            optionName: items.map(i => i.optionName).join(', '),
            tourId: items[0]?.tourId,
            travelDate: items[0]?.tourDate,
            totalAmount,
            paxDetails: { adults: items[0]?.adults, children: items[0]?.children, infants: items[0]?.infants }
          }
        })
      });

      const data = await response.json();
      if (data?.result?.bookingStatus === 'Confirmed' || data?.result?.details?.length > 0) {
        setBookingResult(data.result);
        setStep('booking');
        clearCart();
      } else {
        setError(data?.result?.message || data?.message || 'Booking failed. Please try again.');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeCart();
    setTimeout(() => { setStep('cart'); setBookingResult(null); setError(''); }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[201] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-brand" />
                <h2 className="text-lg font-bold text-slate-900">
                  {step === 'cart' ? `Cart (${items.length})` : step === 'passenger' ? 'Passenger Details' : 'Booking Confirmed!'}
                </h2>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* STEP 1: Cart Items */}
            {step === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <ShoppingCart size={48} className="text-slate-200 mb-4" />
                      <p className="text-slate-400 font-semibold">Your cart is empty</p>
                      <p className="text-slate-300 text-sm mt-1">Add tours to start booking</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={`${item.tourId}-${item.optionId}`} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">{item.cityTourType}</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item.tourName}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.optionName} · {item.transferName}</p>
                          </div>
                          <button onClick={() => removeItem(item.tourId, item.optionId)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-slate-400">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {item.tourDate}</span>
                            <span className="flex items-center gap-1"><Users size={12} /> {item.adults}A {item.children}C {item.infants}I</span>
                          </div>
                          <span className="font-bold text-brand">AED {item.total}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-4 border-t border-slate-100 space-y-3">
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <div className="flex justify-between items-center px-1">
                      <span className="text-sm font-bold text-slate-500">Total Amount</span>
                      <span className="text-xl font-bold text-brand">AED {totalAmount}</span>
                    </div>
                    <button
                      onClick={() => setStep('passenger')}
                      className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-base hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                    >
                      Proceed to Book →
                    </button>
                    <button onClick={clearCart} className="w-full text-slate-400 text-sm hover:text-red-500 transition-colors py-1">
                      Clear Cart
                    </button>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: Passenger Details */}
            {step === 'passenger' && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3">One set of passenger details will be used for all {items.length} tour{items.length > 1 ? 's' : ''}.</p>

                  <div className="grid grid-cols-3 gap-3">
                    {['Mr', 'Mrs', 'Ms'].map(p => (
                      <button key={p} onClick={() => setForm(prev => ({ ...prev, prefix: p }))}
                        className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.prefix === p ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 text-slate-500'}`}>
                        {p}
                      </button>
                    ))}
                  </div>

                  {[
                    { name: 'firstName', label: 'First Name', type: 'text' },
                    { name: 'lastName', label: 'Last Name', type: 'text' },
                    { name: 'email', label: 'Email Address', type: 'email' },
                    { name: 'mobile', label: 'Mobile Number', type: 'tel' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{f.label}</label>
                      <input
                        type={f.type}
                        name={f.name}
                        value={(form as any)[f.name]}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Nationality</label>
                    <div className="relative">
                      <select name="nationality" value={form.nationality} onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none">
                        <option value="IN">India</option>
                        <option value="AE">UAE</option>
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="PK">Pakistan</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 space-y-3">
                  {error && <p className="text-red-500 text-xs text-center bg-red-50 rounded-xl p-2">{error}</p>}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm font-bold text-slate-500">Total Amount</span>
                    <span className="text-xl font-bold text-brand">AED {totalAmount}</span>
                  </div>
                  <button
                    onClick={handleBookAll}
                    disabled={loading || !form.firstName || !form.email || !form.mobile}
                    className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-base hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : `Confirm Booking · AED ${totalAmount}`}
                  </button>
                  <button onClick={() => setStep('cart')} className="w-full text-slate-400 text-sm hover:text-slate-600 transition-colors py-1">
                    ← Back to Cart
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Booking Confirmed */}
            {step === 'booking' && bookingResult && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                <p className="text-slate-500 mb-6">Your tours have been booked successfully.</p>
                <div className="w-full bg-slate-50 rounded-2xl p-4 space-y-3 text-left mb-6">
                  {bookingResult.referenceNo && (
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400 uppercase font-bold">Reference No</span>
                      <span className="text-sm font-bold text-slate-900">{bookingResult.referenceNo}</span>
                    </div>
                  )}
                  {bookingResult.details?.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-xs text-slate-400 uppercase font-bold">Booking ID {i + 1}</span>
                      <span className="text-sm font-bold text-slate-900">{d.bookingId}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleClose} className="w-full bg-brand text-white py-4 rounded-2xl font-bold hover:bg-brand-dark transition-all">
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
