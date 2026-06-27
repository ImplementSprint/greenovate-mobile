import { getMyOrders, placeOrder, trackOrder, type CheckoutInput } from '@/features/orders/ordersApi';
import { fetchJson, fetchJsonWithRetry } from '@/utils/apiClient';

jest.mock('@/utils/apiClient', () => ({
  fetchJson: jest.fn(),
  fetchJsonWithRetry: jest.fn(),
}));

const mockedFetchJson = jest.mocked(fetchJson);
const mockedFetchJsonWithRetry = jest.mocked(fetchJsonWithRetry);

const checkoutInput: CheckoutInput = {
  customerName: 'Jane Doe',
  phone: '09171234567',
  address: '123 Sample Street',
  promoCode: ' less50 ',
  items: [
    {
      product: {
        id: 'prod-1',
        name: 'Paracetamol',
        description: 'Pain relief',
        price: 20,
        category: 'Medicine',
      },
      quantity: 2,
    },
  ],
};

describe('ordersApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends checkout data using the backend order payload shape', async () => {
    mockedFetchJson.mockResolvedValueOnce({
      order: {
        id: 'order-1',
        receiptNumber: 'RCPT-1001',
        status: 'Processing',
        total: 90,
      },
    });

    await placeOrder(checkoutInput);

    expect(mockedFetchJson).toHaveBeenCalledWith(
      '/orders/place',
      expect.objectContaining({
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          shippingAddress: '123 Sample Street',
          promoCode: 'less50',
          paymentMethod: 'Cash on Delivery',
          items: [{ id: 'prod-1', quantity: 2 }],
        }),
      }),
    );
  });

  it('unwraps the orders list response envelope', async () => {
    mockedFetchJsonWithRetry.mockResolvedValueOnce({
      data: [
        {
          id: 'db-id',
          receiptNumber: 'RCPT-1001',
          orderNumber: 'TXN-1001',
          status: 'Delivered',
          total: 120,
          date: '2026-05-19T00:00:00.000Z',
        },
      ],
    });

    await expect(getMyOrders()).resolves.toEqual([
      {
        id: 'db-id',
        receiptNumber: 'RCPT-1001',
        orderNumber: 'TXN-1001',
        status: 'Delivered',
        total: 120,
        createdAt: '2026-05-19T00:00:00.000Z',
        date: '2026-05-19T00:00:00.000Z',
      },
    ]);
  });

  it('tracks orders by receipt number', async () => {
    mockedFetchJsonWithRetry.mockResolvedValueOnce({
      status: 'In Transit',
      rawStatus: 'in_transit',
      updatedAt: '2026-05-19T01:00:00.000Z',
    });

    await expect(trackOrder('RCPT-1001')).resolves.toEqual({
      id: 'RCPT-1001',
      receiptNumber: 'RCPT-1001',
      orderNumber: undefined,
      status: 'In Transit',
      total: 0,
      createdAt: '2026-05-19T01:00:00.000Z',
      date: '2026-05-19T01:00:00.000Z',
    });

    expect(mockedFetchJsonWithRetry).toHaveBeenCalledWith(
      '/orders/track?receiptNumber=RCPT-1001',
      { auth: true },
    );
  });
});
