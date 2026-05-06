import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Star,
  Clock,
  ShieldCheck,
  X,
  Calendar,
  ChevronDown,
  ShoppingCart
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { tourService } from '../services/api';
import { TourDetail, TourOptionPrice, TourOptionStaticData, TimeSlot } from '../types';
import { BookingModal } from '../components/BookingModal';
import { useCart } from '../context/CartContext';

export const TourDetailView = () => {
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
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

  // 🔥 NEW
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);

  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [infants, setInfants] = useState(initialInfants);

  const [showPaxDropdown, setShowPaxDropdown] = useState<number | null>(null);

  const calculateTotal = (adult: number, child: number, infant: number) =>
    adults * adult + children * child + infants * infant;

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cdn = 'https://d1i3enf1i5tb1f.cloudfront.net';
    const clean = url.startsWith('/') ? url : '/' + url;
    return clean.includes('.') ? `${cdn}${clean}` : `${cdn}${clean}_L.jpg`;
  };

  const allImages = tour ? [{ imagePath: tour.imagePath }, ...(tour.tourImages || [])] : [];

  const changeImage = (dir: number) => {
    const next = (activeImageIndex + dir + allImages.length) % allImages.length;
    setActiveImageIndex(next);
    setActiveImage(allImages[next].imagePath);
  };

  // keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isImageViewerOpen) return;
      if (e.key === 'ArrowRight') changeImage(1);
      if (e.key === 'ArrowLeft') changeImage(-1);
      if (e.key === 'Escape') setIsImageViewerOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isImageViewerOpen, activeImageIndex]);

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
          setSelectedTransferId(liveData[0]?.transferId || null);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [tourId, cityId, contractId, selectedDate]);

  if (loading) return <div className="h-screen flex justify-center items-center">Loading...</div>;
  if (!tour) return <div>No Tour Found</div>;

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* IMAGE */}
      <div className="h-[400px] relative">
        <img
          src={getImageUrl(activeImage)}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsImageViewerOpen(true)}
        />

        <button onClick={() => changeImage(-1)} className="absolute left-4 top-1/2 text-white">
          <ChevronLeft size={30} />
        </button>

        <button onClick={() => changeImage(1)} className="absolute right-4 top-1/2 text-white">
          <ChevronRight size={30} />
        </button>
      </div>

      {/* 🔥 FULLSCREEN VIEWER */}
      {isImageViewerOpen && (
        <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center">

          <button
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute top-6 right-6 text-white"
          >
            <X size={30} />
          </button>

          <button
            onClick={() => changeImage(-1)}
            className="absolute left-6 text-white"
          >
            <ChevronLeft size={40} />
          </button>

          <img
            src={getImageUrl(activeImage)}
            className="max-h-[90%] max-w-[90%] object-contain"
          />

          <button
            onClick={() => changeImage(1)}
            className="absolute right-6 text-white"
          >
            <ChevronRight size={40} />
          </button>

        </div>
      )}

      {/* BASIC CONTENT */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">{tour.tourName}</h1>
        <p className="text-gray-500 mt-2">{tour.duration}</p>
      </div>

    </div>
  );
};
