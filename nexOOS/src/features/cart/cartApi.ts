import type { CartItem, Product } from '@/types';
import { fetchJson } from '@/utils/apiClient';

type RemoteCartItem = Product & {
  productId?: string;
  quantity?: number;
};

type CartResponse = {
  items?: RemoteCartItem[];
};

const mapRemoteCartItem = (item: RemoteCartItem): CartItem => {
  const productId = String(item.id || item.productId || 'unknown-product');

  return {
    product: {
      id: productId,
      name: item.name || `Product ${productId}`,
      description: item.description || '',
      price: Number(item.price ?? 0),
      category: item.category || 'Uncategorized',
      image: item.image,
      stock: item.stock,
    },
    quantity: Math.max(1, Math.trunc(Number(item.quantity ?? 1))),
  };
};

export const getRemoteCart = async () => {
  const payload = await fetchJson<CartResponse>('/cart', {
    auth: true,
  });

  return Array.isArray(payload.items) ? payload.items.map(mapRemoteCartItem) : [];
};

export const saveRemoteCart = (items: CartItem[]) =>
  fetchJson<{ success: boolean }>('/cart', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({
      items: items.map((item) => ({
        id: String(item.product.id),
        productId: String(item.product.id),
        quantity: item.quantity,
      })),
    }),
  });
