import axios from 'axios';
import { 
  Country, 
  City, 
  RaynaTour, 
  TourDetail, 
  TourOption, 
  TourPrice, 
  TourOptionPrice, 
  TimeSlot, 
  BookingResponse 
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
    CountryId: number;
    CityId: number;
    TourId: number;
    ContractId: number;
    TravelDate: string;
    LanguageId?: number;
    CurrencyCode?: string;
  }): Promise<TourDetail> => {
    const response = await api.post('/tour-details', {
      ...params,
      LanguageId: params.LanguageId || 1,
      CurrencyCode: params.CurrencyCode || 'AED'
    });
    return response.data.result?.[0];
  },

  getTourOptionsStatic: async (tourId: number, contractId: number): Promise<TourOption[]> => {
    const response = await api.post('/tour-options-static', { tourId, contractId });
    return response.data.result?.touroption || [];
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
  createBooking: async (bookingData: any): Promise<BookingResponse[]> => {
    const response = await api.post('/bookings', bookingData);
    return response.data.result || [];
  },

  getTickets: async (params: {
    uniqNO: number;
    referenceNo: string;
    bookedOption: Array<{ serviceUniqueId: string; bookingId: number }>;
  }): Promise<any> => {
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
