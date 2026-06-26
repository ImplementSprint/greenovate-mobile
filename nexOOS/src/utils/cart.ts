import type { CartItem, Product } from '@/types';

export const getCartSubtotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export const getCartQuantity = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const addCartItem = (items: CartItem[], product: Product): CartItem[] => {
  const normalizedProduct = { ...product, id: String(product.id) };
  const existing = items.find((item) => String(item.product.id) === normalizedProduct.id);

  if (!existing) {
    return [...items, { product: normalizedProduct, quantity: 1 }];
  }

  return items.map((item) =>
    String(item.product.id) === normalizedProduct.id
      ? { ...item, quantity: item.quantity + 1 }
      : item,
  );
};

export const updateCartItemQuantity = (
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] => {
  if (quantity <= 0) {
    return items.filter((item) => String(item.product.id) !== String(productId));
  }

  return items.map((item) =>
    String(item.product.id) === String(productId) ? { ...item, quantity } : item,
  );
};
