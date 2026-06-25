import type { Product } from '@/types';
import { fetchJsonWithRetry } from '@/utils/apiClient';

export type ProductQuery = {
  q?: string;
  category?: string;
  limit?: number;
};

type ProductsResponse = Product[] | { products?: Product[]; data?: Product[] };

const normalizeProduct = (product: Product): Product => ({
  ...product,
  id: String(product.id),
  price: Number(product.price ?? 0),
});

const toProducts = (payload: ProductsResponse): Product[] => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeProduct);
  }

  return (payload.products ?? payload.data ?? []).map(normalizeProduct);
};

export const getProducts = async (query: ProductQuery = {}) => {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.category && query.category !== 'All') params.set('category', query.category);
  if (query.limit) params.set('limit', String(query.limit));

  const search = params.toString();
  const payload = await fetchJsonWithRetry<ProductsResponse>(
    `/products${search ? `?${search}` : ''}`,
  );

  return toProducts(payload);
};

export const searchProducts = (q: string) => getProducts({ q });

export const getProductRecommendations = async (productId: string, limit = 4) => {
  const payload = await fetchJsonWithRetry<ProductsResponse>(
    `/products/${encodeURIComponent(productId)}/recommendations?limit=${encodeURIComponent(String(limit))}`,
  );

  return toProducts(payload);
};
