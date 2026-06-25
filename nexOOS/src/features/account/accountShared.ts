import type { OrderSummary, UserProfile } from '@/types';

export type SavedAddress = {
  fullName: string;
  phoneNumber: string;
  province: string;
  city: string;
  postalCode: string;
  streetAddress: string;
  label: 'Home' | 'Work';
};

export const ADDRESS_STORAGE_PREFIX = '__addresses_json__:';
export const MAX_SAVED_ADDRESSES = 4;

export const getDisplayName = (profile: UserProfile | null) =>
  profile?.full_name ||
  profile?.fullName ||
  profile?.name ||
  [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
  [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
  'Customer';

export const getDisplayOrderNumber = (order: OrderSummary) =>
  order.receiptNumber || order.orderNumber || order.id;

export const formatReadableDate = (value?: string) => {
  if (!value) {
    return 'Not provided';
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

export const formatAddressPreview = (address: SavedAddress) =>
  [address.streetAddress, address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(', ');

export const parseAddresses = (address?: string, profile?: UserProfile | null): SavedAddress[] => {
  if (!address) {
    return [];
  }

  const fallbackName = getDisplayName(profile ?? null);
  const fallbackPhone = profile?.phone || '';

  if (address.startsWith(ADDRESS_STORAGE_PREFIX)) {
    try {
      const parsed = JSON.parse(address.slice(ADDRESS_STORAGE_PREFIX.length));

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((entry) => ({
        fullName: entry?.fullName || fallbackName,
        phoneNumber: entry?.phoneNumber || fallbackPhone,
        province: entry?.province || '',
        city: entry?.city || '',
        postalCode: entry?.postalCode || '',
        streetAddress: entry?.streetAddress || '',
        label: entry?.label === 'Work' ? 'Work' : 'Home',
      }));
    } catch {
      return [];
    }
  }

  return [
    {
      fullName: fallbackName,
      phoneNumber: fallbackPhone,
      province: '',
      city: '',
      postalCode: '',
      streetAddress: address,
      label: 'Home',
    },
  ];
};

export const stringifyAddresses = (addresses: SavedAddress[]) =>
  `${ADDRESS_STORAGE_PREFIX}${JSON.stringify(addresses)}`;
