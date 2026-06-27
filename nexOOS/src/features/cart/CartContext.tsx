import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import type { CartItem, Product } from '@/types';
import { tokenStorage } from '@/utils/storage';
import {
  addCartItem,
  getCartQuantity,
  getCartSubtotal,
  updateCartItemQuantity,
} from '@/utils/cart';

import { getRemoteCart, saveRemoteCart } from './cartApi';

type CartContextValue = {
  items: CartItem[];
  quantity: number;
  subtotal: number;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  isSyncing: boolean;
  syncMessage: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const persistIfLoggedIn = useCallback(async (nextItems: CartItem[]) => {
    const token = await tokenStorage.get();

    if (!token) {
      return;
    }

    try {
      await saveRemoteCart(nextItems);
    } catch (error) {
      console.warn('Cart sync failed.', error);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    const token = await tokenStorage.get();

    if (!token) {
      setItems([]);
      setSyncMessage('Log in to load your saved cart.');
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const remoteItems = await getRemoteCart();
      setItems(remoteItems);
      setSyncMessage(remoteItems.length === 0 ? 'No saved backend cart items found.' : null);
    } catch (error) {
      console.warn('Cart load failed.', error);
      setSyncMessage(error instanceof Error ? error.message : 'Unable to load saved cart.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      quantity: getCartQuantity(items),
      subtotal: getCartSubtotal(items),
      isSyncing,
      syncMessage,
      addItem: (product) =>
        setItems((current) => {
          const nextItems = addCartItem(current, product);
          void persistIfLoggedIn(nextItems);
          return nextItems;
        }),
      updateQuantity: (productId, quantity) =>
        setItems((current) => {
          const nextItems = updateCartItemQuantity(current, productId, quantity);
          void persistIfLoggedIn(nextItems);
          return nextItems;
        }),
      clearCart: () => {
        setItems([]);
        void persistIfLoggedIn([]);
      },
      refreshCart,
    }),
    [isSyncing, items, persistIfLoggedIn, refreshCart, syncMessage],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider.');
  }

  return context;
};
