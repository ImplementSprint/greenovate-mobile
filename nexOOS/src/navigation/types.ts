import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { OrderSummary, Product } from '@/types';
import type { SavedAddress } from '@/features/account/accountShared';

export type CheckoutDeliveryMethod = 'branch' | 'same-day' | 'scheduled';
export type CheckoutPaymentMethod = 'card' | 'cash' | 'gcash' | 'maya';

export type CheckoutDraft = {
  selectedAddress: SavedAddress;
  selectedAddressIndex: number;
  deliveryMethod: CheckoutDeliveryMethod;
  branchId?: number;
  promoCode: string;
  discount: number;
  deliveryFee: number;
  deliveryMessage: string;
  subtotal: number;
  total: number;
  branchName: string;
};

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Shop: undefined;
  ProductDetails: { product: Product };
  Cart: undefined;
  Checkout: undefined;
  Shipping: undefined;
  Payment: { draft: CheckoutDraft };
  Review: { draft: CheckoutDraft; paymentMethod: CheckoutPaymentMethod };
  Orders: undefined;
  OrderDetails: { order: OrderSummary };
  Account: undefined;
  AccountProfile: undefined;
  AccountAddresses: undefined;
  AccountOrderHistory: undefined;
  AccountRefundRequests: undefined;
  AccountSettings: undefined;
  AccountAddressForm: {
    mode: 'create' | 'edit';
    index?: number;
    address?: SavedAddress;
  };
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
