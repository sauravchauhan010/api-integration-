import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Globe, Star, Clock, ShieldCheck, X, Calendar, ChevronDown } from 'lucide-react';
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
          if (firstOptionLive.length > 0) setSelectedTransferId(firstOptionLive[0].transferId);
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
        if (slots.length > 0) setSelectedTimeSlotId(slots[0].timeSlotId);
        else setSelectedTimeSlotId(null);
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
      if (!lastSegment.includes('.')) return url + '_L.jpg';
      return url;
    }
    const cdn = 'https://d1i3enf1i5tb1f.cloudfront.net/';
    if (!url.includes('.')) return cdn + url + '_L.jpg';
    return cdn + url;
  };

  const allImages = tour ? [{ imagePath: tour.imagePath }, ...(tour.tourImages || [])] : [];

  const changeImage = (dir: number) => {
    const next = (activeImageIndex + dir + allImages.length) % allImages.length;
    setActiveImageIndex(next);
    setActiveImage(allImages[next].imagePath);
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

  const selLP = liveOptions.find(o => o.tourOptionId === selectedOptionId && o.transferId === selectedTransferId);

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
        adultRate={selLP?.adultPrice || 0}
        childRate={selLP?.childPrice || 0}
        infantRate={selLP?.infantPrice || 0}
        startTime={tour.isSlot && selectedTimeSlotId ? timeSlots.find(s => s.timeSlotId === selectedTimeSlotId)?.timeSlot || '00:00:00' : selLP?.startTime || '00:00:00'}
        timeSlotId={selectedTimeSlotId || '0'}
      />

      <div className="bg-white border-b border-slate-200 py-4 sticky top-20 z-40">
        <div className="max-w-full mx-auto px-8 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-brand flex items-center gap-1 transition-colors text-sm font-medium">
            <ChevronLeft size={18} /> Back to Results
          </button>
          <button onClick={() => setIsBookingModalOpen(true)} className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20">
            Book Now
          </button>
        </div>
      </div>

      <div className="max-w-full mx-auto px-8 py-10 space-y-6">

        <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-2xl bg-slate-200">
          <img
            src={getImageUrl(activeImage)}
            className="w-full h-full object-cover"
            alt={tour.tourName}
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + tour.tourId + '/1200/600'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-5 left-5">
            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-lg">{tour.cityTourType}</span>
          </div>
          {allImages.length > 1 && (
            <div className="absolute top-5 right-5 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {activeImageIndex + 1} / {allImages.length}
            </div>
          )}
          {allImages.length > 1 && (
            <button onClick={() => changeImage(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-brand hover:text-white rounded-full flex items-center justify-center shadow-lg transition-all text-slate-800 z-10">
              <ChevronLeft size={22} />
            </button>
          )}
          {allImages.length > 1 && (
            <button onClick={() => changeImage(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-brand hover:text-white rounded-full flex items-center justify-center shadow-lg transition-all text-slate-800 z-10">
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveImageIndex(idx); setActiveImage(allImages[idx].imagePath); }}
              className={'relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ' + (activeImageIndex === idx ? 'border-brand scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100')}
            >
              <img
                src={getImageUrl(img.imagePath)}
                className="w-full h-full object-cover"
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/' + tour.tourId + '-' + idx + '/200/200'; }}
              />
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">{tour.tourName}</h1>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Clock size={20} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Duration</p>
                <p className="text-sm font-bold text-slate-900">{tour.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Globe size={20} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Language</p>
                <p className="text-sm font-bold text-slate-900">{tour.tourLanguage || 'English'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Star size={20} className="text-brand" fill="#f27d26" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Rating</p>
                <p className="text-sm font-bold text-slate-900">{tour.rating} ({tour.reviewCount} Reviews)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-900">Select Option</h3>
            <div className="flex flex-col space-y-1.5 min-w-[200px]">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Travel Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand" size={18} />
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/10 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {staticOptions?.touroption.map((opt) => {
              const optLP = liveOptions.filter(l => l.tourOptionId === opt.tourOptionId);
              if (optLP.length === 0) return null;
              const isSel = selectedOptionId === opt.tourOptionId;
              const curLP = optLP.find(l => l.transferId === selectedTransferId) || optLP[0];
              return (
                <div
                  key={opt.tourOptionId}
                  className={'p-6 rounded-2xl border-2 transition-all cursor-pointer ' + (isSel ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-slate-200')}
                  onClick={() => { setSelectedOptionId(opt.tourOptionId); if (!isSel) setSelectedTransferId(optLP[0].transferId); }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{opt.optionName}</h4>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{opt.optionDescription}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transfer Type</label>
                          <div className="relative">
                            <select className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer" value={isSel ? selectedTransferId || '' : optLP[0].transferId} onChange={(e) => { setSelectedOptionId(opt.tourOptionId); setSelectedTransferId(Number(e.target.value)); }}>
                              {optLP.map(lp => (<option key={lp.transferId} value={lp.transferId}>{lp.transferName}</option>))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                          </div>
                        </div>
                        {isSel && tour.isSlot && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time Slot</label>
                            {loadingTimeSlots ? (
                              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                                <span className="text-slate-400">Loading...</span>
                              </div>
                            ) : timeSlots.length > 0 ? (
                              <div className="relative">
                                <select className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer" value={selectedTimeSlotId || ''} onChange={(e) => setSelectedTimeSlotId(e.target.value)}>
                                  {timeSlots.map(slot => (<option key={slot.timeSlotId} value={slot.timeSlotId}>{slot.timeSlot} ({slot.available} available)</option>))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                              </div>
                            ) : (
                              <div className="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">No slots available.</div>
                            )}
                          </div>
                        )}
                        {isSel && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travelers</label>
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                  <span className="text-xs font-bold text-slate-600">Adult</span>
                                  <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setAdults(Math.max(1, adults - 1)); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">-</button>
                                    <span className="text-sm font-bold w-4 text-center">{adults}</span>
                                    <button onClick={(e) => { e.stopPropagation(); setAdults(adults + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">+</button>
                                  </div>
                                </div>
                                <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                  <span className="text-xs font-bold text-slate-600">Child</span>
                                  <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setChildren(Math.max(0, children - 1)); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">-</button>
                                    <span className="text-sm font-bold w-4 text-center">{children}</span>
                                    <button onClick={(e) => { e.stopPropagation(); setChildren(children + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">+</button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                  <span className="text-xs font-bold text-slate-600">Infant</span>
                                  <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setInfants(Math.max(0, infants - 1)); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">-</button>
                                    <span className="text-sm font-bold w-4 text-center">{infants}</span>
                                    <button onClick={(e) => { e.stopPropagation(); setInfants(infants + 1); }} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">+</button>
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
                      <p className="text-3xl font-display font-bold text-brand">AED {isSel ? calculateTotal(curLP.adultPrice, curLP.childPrice, curLP.infantPrice) : optLP[0].finalAmount}</p>
                      {isSel && (
                        <button onClick={(e) => { e.stopPropagation(); setIsBookingModalOpen(true); }} disabled={tour.isSlot && !selectedTimeSlotId} className={'mt-3 bg-brand text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ' + (tour.isSlot && !selectedTimeSlotId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-dark')}>
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

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Description</h3>
          <div className="text-slate-600 leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: tour.tourDescription }} />
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-green-500" size={24} /> Inclusions
              </h3>
              <div className="text-slate-600 text-sm" dangerouslySetInnerHTML={{ __html: tour.tourInclusion }} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2 text-red-500">
                <X size={24} /> Exclusions
              </h3>
              <div className="text-slate-600 text-sm" dangerouslySetInnerHTML={{ __html: tour.tourExclusion }} />
            </div>
          </div>
          {tour.importantInformation && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Important Information</h3>
              <div className="text-slate-600 text-sm bg-slate-50 p-6 rounded-2xl" dangerouslySetInnerHTML={{ __html: tour.importantInformation }} />
            </div>
          )}
          {tour.itenararyDescription && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Itinerary</h3>
              <div className="text-slate-600 text-sm" dangerouslySetInnerHTML={{ __html: tour.itenararyDescription }} />
            </div>
          )}
          {tour.usefulInformation && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Useful Information</h3>
              <div className="text-slate-600 text-sm" dangerouslySetInnerHTML={{ __html: tour.usefulInformation }} />
            </div>
          )}
          {tour.faqDetails && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">FAQ</h3>
              <div className="text-slate-600 text-sm" dangerouslySetInnerHTML={{ __html: tour.faqDetails }} />
            </div>
          )}
          {tour.termsAndConditions && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-bold text-slate-900 mb-4">Terms and Conditions</h3>
              <div className="text-slate-600 text-sm" dangerouslySetInnerHTML={{ __html: tour.termsAndConditions }} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
