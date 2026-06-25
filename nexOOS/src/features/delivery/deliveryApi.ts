import { fetchJsonWithRetry } from '@/utils/apiClient';

export type DeliveryEstimate = {
  fee?: number;
  etaMinutes?: number;
  etaMinMinutes?: number;
  etaMaxMinutes?: number;
  etaLabel?: string;
  matchedLocation?: string;
  message?: string;
  deliveryMethod?: string;
  branchId?: number | null;
};

type LocationsResponse = {
  provinces?: string[];
  cities?: string[];
};

type EstimateDeliveryInput = {
  address: string;
  city: string;
  province: string;
  barangay?: string;
  branchId?: number;
  deliveryMethod: 'claim_at_branch' | 'same_day' | 'scheduled';
};

type EstimateDeliveryResponse = {
  estimate?: DeliveryEstimate | null;
};

export const estimateDelivery = async (input: EstimateDeliveryInput) => {
  const response = await fetchJsonWithRetry<EstimateDeliveryResponse>('/delivery/estimate', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return response?.estimate ?? null;
};

export const getProvinces = async () => {
  const response = await fetchJsonWithRetry<LocationsResponse>('/locations?scope=provinces');
  return Array.isArray(response.provinces) ? response.provinces : [];
};

export const getCities = async (province: string) => {
  const response = await fetchJsonWithRetry<LocationsResponse>(
    `/locations?scope=cities&province=${encodeURIComponent(province)}`,
  );
  return Array.isArray(response.cities) ? response.cities : [];
};
