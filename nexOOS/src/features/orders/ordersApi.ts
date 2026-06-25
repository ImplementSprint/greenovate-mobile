import type { CartItem, OrderSummary, ReturnRequestSummary } from '@/types';
import { fetchJson, fetchJsonWithRetry } from '@/utils/apiClient';

export type CheckoutInput = {
  customerName: string;
  phone: string;
  address: string;
  promoCode?: string;
  paymentMethod?: string;
  branchId?: number;
  deliveryMethod?: string;
  deliveryFee?: number;
  items: CartItem[];
};

type OrderApiRecord = Partial<OrderSummary> & {
  receiptNumber?: string | null;
  orderNumber?: string | null;
  date?: string | null;
  createdAt?: string | null;
};

type PlaceOrderResponse = {
  order?: OrderApiRecord;
  id?: string;
  message?: string;
};

type OrdersListResponse = {
  data?: OrderApiRecord[];
};

type TrackOrderResponse = {
  status?: string;
  rawStatus?: string;
  updatedAt?: string;
};

type ReturnRequestRecord = {
  id?: string;
  receipt_number?: string | null;
  reason?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type ReturnRequestsResponse = {
  data?: ReturnRequestRecord[];
};

const normalizeOrder = (order: OrderApiRecord): OrderSummary => ({
  id:
    String(order.id ?? '').trim() ||
    String(order.receiptNumber ?? '').trim() ||
    String(order.orderNumber ?? '').trim(),
  receiptNumber: order.receiptNumber ?? undefined,
  orderNumber: order.orderNumber ?? undefined,
  status: String(order.status ?? 'Unknown'),
  total: Number(order.total ?? 0),
  createdAt: order.createdAt ?? order.date ?? undefined,
  date: order.date ?? order.createdAt ?? undefined,
});

const normalizeReturnRequest = (request: ReturnRequestRecord): ReturnRequestSummary => ({
  id: String(request.id ?? ''),
  receiptNumber: String(request.receipt_number ?? ''),
  reason: String(request.reason ?? ''),
  status: String(request.status ?? 'pending'),
  createdAt: request.created_at ?? undefined,
});

export const placeOrder = async (input: CheckoutInput) => {
  const response = await fetchJson<PlaceOrderResponse>('/orders/place', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({
      shippingAddress: input.address,
      promoCode: input.promoCode?.trim() || undefined,
      paymentMethod: input.paymentMethod || 'Cash on Delivery',
      branchId: input.branchId,
      deliveryMethod: input.deliveryMethod,
      deliveryFee: input.deliveryFee,
      items: input.items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      })),
    }),
  });

  return response.order ? normalizeOrder(response.order) : response;
};

export const getMyOrders = async () => {
  const response = await fetchJsonWithRetry<OrdersListResponse>('/orders/my', {
    auth: true,
  });

  return Array.isArray(response.data) ? response.data.map(normalizeOrder) : [];
};

export const trackOrder = async (receiptNumber: string) => {
  const response = await fetchJsonWithRetry<TrackOrderResponse>(
    `/orders/track?receiptNumber=${encodeURIComponent(receiptNumber)}`,
    {
      auth: true,
    },
  );

  return normalizeOrder({
    id: receiptNumber.trim(),
    receiptNumber: receiptNumber.trim(),
    status: response.status ?? response.rawStatus ?? 'Unknown',
    total: 0,
    createdAt: response.updatedAt,
    date: response.updatedAt,
  });
};

export const getMyReturnRequests = async () => {
  const response = await fetchJsonWithRetry<ReturnRequestsResponse>('/orders/my-return-requests', {
    auth: true,
  });

  return Array.isArray(response.data) ? response.data.map(normalizeReturnRequest) : [];
};
