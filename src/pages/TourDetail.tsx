import React, { useState, useEffect } from 'react';
import { ChevronLeft, Globe, Star, Clock, ShieldCheck, X, MessageCircle, Phone, Calendar, Users, ChevronDown } from 'lucide-react';
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
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [infants, setInfants] = useState(initialInfants);

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
      if (!lastSegment.includes('.')) {
        return `${url}_L.jpg`;
      }
      return url;
    }
    const cdn = 'https://d1i3enf1i5tb1f.cloudfront.net/';
    if (!url.includes('.')) {
      return `${cdn}${url}_L.jpg`;
    }
    return `${cdn}${url}`;
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
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        tourName={tour.tourName}
        optionName={staticOptions?.touroption.find(o => o.tourOptionId === selectedOptionId)?.optionName || ''}
        tourId={Number(tourId)}
        optionId={selectedOptionId || 0}
        transferId={selectedTransferId || 0}
        adults={adults}
        childrenCount={children}
        infants={infants}
        tourDate={selectedDate}
        adultRate={liveOptions.find(o => o.tourOptionId === selectedOptionId && o.transferId === selectedTransferId)?.adultPrice || 0}
        childRate={liveOptions.find(o => o.tourOptionId === selectedOptionId && o.transferId === selectedTransferId)?.childPrice || 0}
        infantRate={liveOptions.find(o => o.tourOptionId === selectedOptionId && o.transferId === selectedTransferId)?.infantPrice || 0}
        startTime={
          tour.isSlot && selectedTimeSlotId 
            ? timeSlots.find(s => s.timeSlotId === selectedTimeSlotId)?.timeSlot || '00:00:00'
            : liveOptions.find(o => o.tourOptionId === selectedOptionId && o.transferId === selectedTransferId)?.startTime || '00:00:00'
        }
        timeSlotId={selectedTimeSlotId || '0'}
      />
      
      {/* Detail Header */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-20 z-40">
        <div className="max-w-full mx-auto px-8 flex justify-between items-center">
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

      <div className="max-w-full mx-auto px-8 py-10">
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
                {(tour.tourImages || []).map((img, idx) => (
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

            {/* Options Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
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
                      className={`p-8 rounded-[2rem] border-2 transition-all ${
                        isSelected ? 'border-brand bg-brand/5 shadow-inner' : 'border-slate-100 hover:border-slate-200'
                      }`}
                      onClick={() => {
                        setSelectedOptionId(opt.tourOptionId);
                        if (!isSelected) {
                          setSelectedTransferId(optionLivePrices[0].transferId);
                        }
                      }}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-slate-900 mb-2">{opt.optionName}</h4>
                          <p className="text-sm text-slate-500 mb-6 line-clamp-2">{opt.optionDescription}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Transfer Dropdown */}
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
                                    <option key={lp.transferId} value={lp.transferId}>
                                      {lp.transferName}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                            </div>

                            {/* Time Slot Selection */}
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
                                      No time slots available for this selection.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Travelers Selection - Only show if selected */}
                            {isSelected && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Travelers</label>
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                      <span className="text-xs font-bold text-slate-600">Adult</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setAdults(Math.max(1, adults - 1)) }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{adults}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setAdults(adults + 1) }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">+</button>
                                      </div>
                                    </div>
                                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                      <span className="text-xs font-bold text-slate-600">Child</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setChildren(Math.max(0, children - 1)) }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{children}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setChildren(children + 1) }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">+</button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                      <span className="text-xs font-bold text-slate-600">Infant</span>
                                      <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setInfants(Math.max(0, infants - 1)) }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">-</button>
                                        <span className="text-sm font-bold w-4 text-center">{infants}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setInfants(infants + 1) }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">+</button>
                                      </div>
                                    </div>
                                    <div className="flex-1 invisible" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right flex flex-col justify-center min-w-[150px]">
                          <div className="mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                            <p className="text-3xl font-display font-bold text-brand">
                              AED {isSelected 
                                ? calculateTotal(selectedLivePrice.adultPrice, selectedLivePrice.childPrice, selectedLivePrice.infantPrice)
                                : optionLivePrices[0].finalAmount
                              }
                            </p>
                          </div>
                          {isSelected && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsBookingModalOpen(true);
                              }}
                              disabled={tour.isSlot && !selectedTimeSlotId}
                              className={`bg-brand text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 transition-all ${
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

                  {tour.importantInformation && (
                    <div className="mt-10">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Important Information</h3>
                      <div className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-6 rounded-3xl" dangerouslySetInnerHTML={{ __html: tour.importantInformation }} />
                    </div>
                  )}

                  {tour.itenararyDescription && (
                    <div className="mt-10">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Itinerary</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.itenararyDescription }} />
                    </div>
                  )}

                  {tour.usefulInformation && (
                    <div className="mt-10">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Useful Information</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.usefulInformation }} />
                    </div>
                  )}

                  {tour.faqDetails && (
                    <div className="mt-10">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">FAQ</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.faqDetails }} />
                    </div>
                  )}

                  {tour.termsAndConditions && (
                    <div className="mt-10">
                      <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Terms & Conditions</h3>
                      <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tour.termsAndConditions }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
