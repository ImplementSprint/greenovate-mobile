import { addCartItem, getCartQuantity, getCartSubtotal, updateCartItemQuantity } from '@/utils/cart';
import type { Product } from '@/types';

const product: Product = {
  id: 'p1',
  name: 'Paracetamol',
  description: 'Pain relief',
  price: 12.5,
  category: 'Medicine',
};

describe('cart utilities', () => {
  it('adds new and existing products', () => {
    const once = addCartItem([], product);
    const twice = addCartItem(once, product);

    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(2);
  });

  it('calculates quantity and subtotal', () => {
    const items = [{ product, quantity: 3 }];

    expect(getCartQuantity(items)).toBe(3);
    expect(getCartSubtotal(items)).toBe(37.5);
  });

  it('removes items when quantity reaches zero', () => {
    const items = updateCartItemQuantity([{ product, quantity: 1 }], product.id, 0);

    expect(items).toEqual([]);
  });
});
