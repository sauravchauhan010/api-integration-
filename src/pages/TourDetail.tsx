import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Globe, Star, Clock, ShieldCheck, X, Calendar, ChevronDown, ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { tourService } from '../services/api';
import { TourDetail, TourOptionPrice, TourOptionStaticData, TimeSlot } from '../types';
import { BookingModal } from '../components/BookingModal';

export const TourDetailView = () => {
  const navigate = useNavigate();
  const { tourId } = useParams();
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('cityId');
  const contractId = searchParams.get('contractId');
  const date = searchParams.get('date');
  const initialAdults = Number(searchParams.get('adults') || '1');
  const initialChildren = Number(searchParams.get('children') || '0');
  const initialInfants = Number(searchParams.get('infants') || '0');

  const [tour, setTour] = useState<TourDetail | null>(null);
  const [staticOptions, setStaticOptions] = useState<TourOptionStaticData | null>(null);
  const [liveOptions, setLiveOptions] = useState<TourOptionPrice[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [infants, setInfants] = useState(initialInfants);
  const [policy, setPolicy] = useState<any[]>([]);
  const [policyLoading, setPolicyLoading] = useState(false);

  const calculateTotal = (adultPrice: number, childPrice: number, infantPrice: number) => {
    return (adults * adultPrice) + (children * childPrice) + (infants * infantPrice);
  };

  useEffect(() => {
    const loadDetail = async () => {
      if (!tourId || !cityId || !contractId || !selectedDate) return;
      setLoading(true);
      try {
        const detail = await tourService.getTourDetails({
          countryId: 13063,
          cityId: Number(cityId),
          tourId: Number(tourId),
          contractId: Number(contractId),
          travelDate: selectedDate
        });
        setTour(detail);
        setActiveImage(detail.imagePath);
        setActiveImageIndex(0);

        const [staticData, liveData] = await Promise.all([
          tourService.getTourOptionsStatic(Number(tourId), Number(contractId)),
          tourService.getTourOptions({
            tourId: Number(tourId),
            contractId: Number(contractId),
            travelDate: selectedDate,
            noOfAdult: 1
          })
        ]);

        setStaticOptions(staticData);
        setLiveOptions(liveData);

        if (staticData.touroption.length > 0) {
          setSelectedOptionId(staticData.touroption[0].tourOptionId);
          const firstOptionLive = liveData.filter(o => o.tourOptionId === staticData.touroption[0].tourOptionId);
          if (firstOptionLive.length > 0) {
            setSelectedTransferId(firstOptionLive[0].transferId);
          }
        }

        // Fetch cancellation policy
        setPolicyLoading(true);
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
        const travelDateFormatted = selectedDate.replace(/-/g, '/');
        fetch('/api/tour-policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tourId: Number(tourId),
            travelDate: travelDateFormatted,
            startTime: '00:00:00',
            currentDate: today,
            contractId: 300,
            tourOptionId: staticData.touroption[0]?.tourOptionId || 0
          })
        })
          .then(r => r.json())
          .then(data => setPolicy(data.result || []))
          .catch(() => setPolicy([]))
          .finally(() => setPolicyLoading(false));

      } catch (error) {
        console.error('Error loading tour detail:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [tourId, cityId, contractId, date]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!tour?.isSlot || !selectedOptionId || !selectedTransferId || !selectedDate) {
        setTimeSlots([]);
        setSelectedTimeSlotId(null);
        return;
      }
      setLoadingTimeSlots(true);
      try {
        const slots = await tourService.getTimeSlots({
          tourId: Number(tourId),
          tourOptionId: selectedOptionId,
          travelDate: selectedDate,
          transferId: selectedTransferId,
          adult: adults,
          child: children,
          contractId: Number(contractId)
        });
        setTimeSlots(slots);
        if (slots.length > 0) {
          setSelectedTimeSlotId(slots[0].timeSlotId);
        } else {
          setSelectedTimeSlotId(null);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };
    fetchSlots();
  }, [selectedOptionId, selectedTransferId, tour?.isSlot, tourId, selectedDate, adults, children, contractId]);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) {
      const lastSegment = url.split('/').pop() || '';
      if (!lastSegment.includes('.')) return `${url}_L.jpg`;
      return url;
    }
    const cdn = 'https://d1i3enf1i5tb1f.cloudfront.net/';
    if (!url.includes('.')) return `${cdn}${url}_L.jpg`;
    return `${cdn}${url}`;
  };

  const allImages = tour ? [{ imagePath: tour.imagePath }, ...(tour.tourImages || [])] : [];

  const changeImage = (dir: number) => {
    const next = (activeImageIndex + dir + allImages.length) % allImages.length;
    setActiveImageIndex(next);
    setActiveImage(allImages[next].imagePath);
  };

  const setImageByIndex = (idx: number) => {
    setActiveImageIndex(idx);
    setActiveImage(allImages[idx].imagePath);
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

  const selectedLivePrice = liveOptions.find(o => o.tourOptionId === selectedOptionId && o.transferId === selectedTransferId);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        tourName={tour.tourName}
        optionName={staticOptions?.touroption.find(o => o.tourOptionId === selectedOptionId)?.optionName || ''}
        tourId={Number(tourId)}
        optionId={selectedOptionId || 0}
        transferId={selectedTransferId || 0}
        contractId={300}
        adults={adults}
        childrenCount={children}
        infants={infants}
        tourDate={selectedDate}
        adultRate={selectedLivePrice?.adultPrice || 0}
        childRate={selectedLivePrice?.childPrice || 0}
        infantRate={selectedLivePrice?.infantPrice || 0}
        startTime={
          tour.isSlot && selectedTimeSlotId
            ? timeSlots.find(s => s.timeSlotId === selectedTimeSlotId)?.timeSlot || '00:00:00'
            : selectedLivePrice?.startTime || '00:00:00'
        }
        timeSlotId={selectedTimeSlotId || '0'}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-20 z-40">
        <div className="max-w-full mx-auto px-8 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-brand flex items-center gap-1 transition-colors text-sm font-medium">
            <ChevronLeft size={18} /> Back to Results
          </button>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="max-w-full mx-auto px-8 py-10">

        {/* FULL WIDTH IMAGE */}
        <div className="relative w-full h-[460px] rounded-[2rem] overflow-hidden shadow-2xl bg-slate-200 mb-4">
          <img
            src={getImageUrl(activeImage)}
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={tour.tourName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tour.tourId}/1200/600`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Badge */}
          <div className="absolute top-5 left-5">
            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-900 shadow-lg">
              {tour.cityTourType}
            </span>
          </div>

          {/* Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-5 right-5 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {activeImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Prev / Next arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => changeImage(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-brand hover:text-white backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all text-slate-800 z-10"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => changeImage(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-brand hover:text-white backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-all text-slate-800 z-10"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* THUMBNAILS - full width scrollable */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8" style={{ scrollbarWidth: 'thin' }}>
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setImageByIndex(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                activeImageIndex === idx ? 'border-brand scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
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

        {/* 2-COL: OPTIONS LEFT, SIDEBAR RIGHT */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* LEFT: Options + Content */}
          <div className="lg:col-span-3 space-y-8">

            {/* Tour Title & Stats */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
              <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">{tour.tourName}</h1>
              <div className="flex flex-wrap gap-6">
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
            </div>

            {/* Options */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h3 className="text-2xl font-display font-bold text-slate-900">Select Option</h3>
                <div className="flex flex-col space-y-1.5 min-w-[200px]">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Travel Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand" size={18} />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {staticOptions?.touroption.map((opt) => {
                  const optionLivePrices = liveOptions.filter(l => l.tourOptionId === opt.tourOptionId);
                  if (optionLivePrices.length === 0) return null;
                  const isSelected = selectedOptionId === opt.tourOptionId;
                  const selectedLivePrice = optionLivePrices.find(l => l.transferId === selectedTransferId) || optionLivePrices[0];

                  return (
                    <div
                      key={opt.tourOptionId}
                      className={`p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer ${
                        isSelected ? 'border-brand bg-brand/5 shadow-inner' : 'border-slate-100 hover:border-slate-200'
                      }`}
                      onClick={() => {
                        setSelectedOptionId(opt.tourOptionId);
                        if (!isSelected) setSelectedTransferId(optionLivePrices[0].transferId);
                      }}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-900 mb-1">{opt.optionName}</h4>
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2">{opt.optionDescription}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transfer Type</label>
                              <div className="relative">
                                <select
                                  className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                                  value={isSelected ? selectedTransferId || '' : optionLivePrices[0].transferId}
                                  onChange={(e) => {
                                    setSelectedOptionId(opt.tourOptionId);
                                    setSelectedTransferId(Number(e.target.value));
                                  }}
                                >
                                  {optionLivePrices.map(lp => (
                                    <option key={lp.transferId} value={lp.transferId}>{lp.transferName}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                            </div>

                            {isSelected && tour.isSlot && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Slot</label>
                                <div className="relative">
                                  {loadingTimeSlots ? (
                                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                                      <span className="text-slate-400">Loading slots...</span>
                                    </div>
                                  ) : timeSlots.length > 0 ? (
                                    <>
                                      <select
                                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                                        value={selectedTimeSlotId || ''}
                                        onChange={(e) => setSelectedTimeSlotId(e.target.value)}
                                      >
                                        {timeSlots.map(slot => (
                                          <option key={slot.timeSlotId} value={slot.timeSlotId}>
                                            {slot.timeSlot} ({slot.available} available)
                                          </option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </>
                                  ) : (
                                    <div className="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
                                      No time slots available.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {isSelected && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travelers</label>
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                      <span className="text-xs font-bold text-slate-600">Adult</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setAdults(Math.max(1, adults - 1)); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{adults}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setAdults(adults + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">+</button>
                                      </div>
                                    </div>
                                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                      <span className="text-xs font-bold text-slate-600">Child</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setChildren(Math.max(0, children - 1)); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{children}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setChildren(children + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">+</button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                      <span className="text-xs font-bold text-slate-600">Infant</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setInfants(Math.max(0, infants - 1)); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{infants}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setInfants(infants + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">+</button>
                                      </div>
                                    </div>
                                    <div className="flex-1 invisible" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-center min-w-[140px]">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-3xl font-display font-bold text-brand">
                            AED {isSelected
                              ? calculateTotal(selectedLivePrice.adultPrice, selectedLivePrice.childPrice, selectedLivePrice.infantPrice)
                              : optionLivePrices[0].finalAmount
                            }
                          </p>
                          {isSelected && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setIsBookingModalOpen(true); }}
                              disabled={tour.isSlot && !selectedTimeSlotId}
                              className={`mt-3 bg-brand text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 transition-all ${
                                tour.isSlot && !selectedTimeSlotId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-dark'
                              }`}
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description & Details */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8">
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Description</h3>
                  <div className="text-slate-600 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: tour.tourDescription }} />

                  <div className="grid md:grid-cols-2 gap-8">
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

                  {tour.importantInformation && (
                    <div className="mt-8">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Important Information</h3>
                      <div className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-6 rounded-2xl" dangerouslySetInnerHTML={{ __html: tour.importantInformation }} />
                    </div>
                  )}
                  {tour.itenararyDescription && (
                    <div className="mt-8">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Itinerary</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.itenararyDescription }} />
                    </div>
                  )}
                  {tour.usefulInformation && (
                    <div className="mt-8">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Useful Information</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.usefulInformation }} />
                    </div>
                  )}
                  {tour.faqDetails && (
                    <div className="mt-8">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">FAQ</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.faqDetails }} />
                    </div>
                  )}
                  {tour.termsAndConditions && (
                    <div className="mt-8">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Terms & Conditions</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.termsAndConditions }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tour Info */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 sticky top-36">
              <h4 className="text-base font-bold text-slate-900 mb-4">Tour Info</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Duration</span>
                  <span className="text-sm font-bold text-slate-900">{tour.duration}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Language</span>
                  <span className="text-sm font-bold text-slate-900">{tour.tourLanguage || 'English'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Rating</span>
                  <span className="text-sm font-bold text-slate-900">⭐ {tour.rating} ({tour.reviewCount})</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tour Type</span>
                  <span className="text-sm font-bold text-slate-900">{tour.cityTourType}</span>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert size={15} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Cancellation Policy</span>
                </div>
                {policyLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 size={12} className="animate-spin" /> Loading...
                  </div>
                ) : policy.length > 0 ? (
                  policy.map((p: any, i: number) => (
                    <div key={i} className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-1">
                      {p.percentage === 100
                        ? `⚠️ 100% charge: ${new Date(p.fromDate).toDateString()} → ${new Date(p.toDate).toDateString()}`
                        : `${p.percentage}% charge: ${new Date(p.fromDate).toDateString()} → ${new Date(p.toDate).toDateString()}`
                      }
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No policy available.</p>
                )}
              </div>

              {/* Book CTA */}
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full mt-6 bg-brand text-white py-4 rounded-2xl font-bold text-base hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
              >
                Book Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
