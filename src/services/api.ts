import axios from 'axios';
import { 
  Country, 
  City, 
  RaynaTour, 
  TourDetail, 
  TourOption, 
  TourOptionStaticData,
  TourPrice, 
  TourOptionPrice, 
  TimeSlot, 
  BookingRequest,
  BookingResponse,
  GetBookedTicketsRequest,
  GetBookedTicketsResponse
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

export const tourService = {
  getCountries: async (): Promise<Country[]> => {
    const response = await api.get('/countries');
    return response.data.result || [];
  },

  getCities: async (countryId: number): Promise<City[]> => {
    const response = await api.post('/cities', { CountryId: countryId });
    return response.data.result || [];
  },

  getTours: async (countryId: number, cityId: number): Promise<RaynaTour[]> => {
    const response = await api.post('/tours', { countryId, cityId });
    return response.data.result || [];
  },

  getTourDetails: async (params: {
    countryId: number;
    cityId: number;
    tourId: number;
    contractId: number;
    travelDate: string;
    languageId?: number;
    currencyCode?: string;
  }): Promise<TourDetail> => {
    const response = await api.post('/tour-details', {
      ...params,
      languageId: params.languageId || 1,
      currencyCode: params.currencyCode || 'AED'
    });
    return response.data.result?.[0];
  },

  getTourOptionsStatic: async (tourId: number, contractId: number): Promise<TourOptionStaticData> => {
    const response = await api.post('/tour-options-static', { tourId, contractId });
    return response.data.result;
  },

  createBooking: async (bookingData: BookingRequest): Promise<BookingResponse> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getTourPrices: async (countryId: number, cityId: number, travelDate: string): Promise<TourPrice[]> => {
    const response = await api.post('/tour-prices', { countryId, cityId, travelDate });
    return response.data.result || [];
  },

  getTourOptions: async (params: {
    tourId: number;
    contractId: number;
    travelDate: string;
    noOfAdult: number;
    noOfChild?: number;
    noOfInfant?: number;
  }): Promise<TourOptionPrice[]> => {
    const response = await api.post('/tour-options', params);
    return response.data.result || [];
  },

  getTimeSlots: async (params: {
    tourId: number;
    tourOptionId: number;
    travelDate: string;
    transferId: number;
    adult: number;
    child?: number;
    contractId: number;
  }): Promise<TimeSlot[]> => {
    const response = await api.post('/tour-timeslots', params);
    return response.data.result || [];
  },

  checkAvailability: async (params: {
    tourId: number;
    tourOptionId: number;
    transferId: number;
    travelDate: string;
    adult: number;
    child?: number;
    infant?: number;
    contractId: number;
  }): Promise<{ status: number; message: string }> => {
    const response = await api.post('/tour-availability', params);
    return response.data.result;
  }
};

export const bookingService = {
  createBooking: async (bookingData: BookingRequest): Promise<BookingResponse> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getBookedTickets: async (params: GetBookedTicketsRequest): Promise<GetBookedTicketsResponse> => {
    const response = await api.post('/get-tickets', params);
    return response.data;
  },

  cancelBooking: async (params: {
    bookingId: string;
    referenceNo: string;
    cancellationReason: string;
  }): Promise<{ status: number; message: string }> => {
    const response = await api.post('/cancel-booking', params);
    return response.data.result;
  }
};
