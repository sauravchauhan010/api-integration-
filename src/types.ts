export interface Country {
  countryId: number;
  countryName: string;
}

export interface City {
  cityId: number;
  cityName: string;
}

export interface RaynaTour {
  tourId: number;
  countryId: number;
  countryName: string;
  cityId: number;
  cityName: string;
  tourName: string;
  reviewCount: number;
  rating: number;
  duration: string;
  imagePath: string;
  imageCaptionName: string;
  cityTourTypeId: string;
  cityTourType: string;
  tourShortDescription: string;
  cancellationPolicyName: string;
  isSlot: boolean;
  isSeat: boolean;
  onlyChild: boolean;
  contractId: number;
  recommended: boolean;
  isPrivate: boolean;
  categoryImage: string;
}

export interface TourImage {
  tourId: number;
  imagePath: string;
  imageCaptionName: string;
  isFrontImage: number;
  isBannerImage: number;
  isBannerRotateImage: number;
}

export interface TourDetail extends RaynaTour {
  departurePoint: string;
  reportingTime: string;
  tourLanguage: string;
  tourDescription: string;
  tourInclusion: string;
  raynaToursAdvantage: string;
  whatsInThisTour: string;
  importantInformation: string;
  itenararyDescription: string;
  usefulInformation: string;
  faqDetails: string;
  termsAndConditions: string;
  cancellationPolicyDescription: string;
  childCancellationPolicyName: string;
  childCancellationPolicyDescription: string;
  childAge: string;
  infantAge: string;
  infantCount: number;
  latitude: string;
  longitude: string;
  startTime: string;
  meal: string | null;
  videoUrl: string;
  googleMapUrl: string;
  tourExclusion: string;
  howToRedeem: string;
  tourImages: TourImage[];
}

export interface TourOption {
  tourId: number;
  tourOptionId: number;
  optionName: string;
  childAge: string;
  infantAge: string;
  optionDescription: string;
  cancellationPolicy: string;
  cancellationPolicyDescription: string;
  childPolicyDescription: string;
  xmlcode: string;
  xmloptioncode: string;
  countryId: number;
  cityId: number;
  minPax: number;
  maxPax: number;
  duration: string;
  timeZone: string;
  isWithoutAdult: boolean;
  isTourGuide: number;
  compulsoryOptions: boolean;
  isHideRateBreakup: boolean;
  isHourly: boolean;
  googleNavigation: string;
  address: string;
  termsAndConditions: string;
  displayName: string | null;
  byOrder: number;
}

export interface TourPrice {
  tourId: number;
  contractId: number;
  amount: number;
  discount: number;
  rewardPoints: number;
  sortOrder: number;
  pointRemark: string;
}

export interface TourOptionPrice {
  tourId: number;
  tourOptionId: number;
  transferId: number;
  transferName: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  withoutDiscountAmount: number;
  finalAmount: number;
  startTime: string;
  departureTime: string;
  disableChild: boolean;
  disableInfant: boolean;
  allowTodaysBooking: boolean;
  cutOff: number;
  isSlot: boolean;
  isSeat: boolean;
  isDefaultTransfer: number;
  rateKey: string | null;
}

export interface TimeSlot {
  tourOptionId: number;
  timeSlotId: string;
  timeSlot: string;
  available: number;
  adultPrice: number;
  childPrice: number;
  isDynamicPrice: boolean;
}

export interface BookingResponse {
  refernceNo: string;
  status: string;
  bookingId: string;
  downloadRequired: boolean;
  serviceUniqueId: string;
  servicetype: string;
  confirmationNo: string;
}
