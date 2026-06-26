export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type UserProfile = {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  full_name?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  phone?: string;
  birthday?: string;
  dob?: string;
  address?: string;
  profileImage?: string;
  profile_image?: string;
  role?: string;
};

export type OrderSummary = {
  id: string;
  receiptNumber?: string;
  orderNumber?: string;
  status: string;
  total: number;
  createdAt?: string;
  date?: string;
};

export type ReturnRequestSummary = {
  id: string;
  receiptNumber: string;
  reason: string;
  status: string;
  createdAt?: string;
};

export type PromoValidationResult =
  | {
      valid: true;
      normalizedCode: string;
      discountAmount: number;
      message: string;
    }
  | {
      valid: false;
      normalizedCode: string;
      message: string;
    };
