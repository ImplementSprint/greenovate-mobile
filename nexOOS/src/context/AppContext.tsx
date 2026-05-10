import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getJson } from '../lib/api';
import { clearAccessToken, fetchWithAuth, storeAccessToken } from '../lib/auth-client';
import type { Branch, BranchInventory, CartItem, Order, Product, User } from '../types';

type AppContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  cart: CartItem[];
  orders: Order[];
  branches: Branch[];
  branchInventory: BranchInventory[];
  selectedBranch: Branch | null;
  products: Product[];
  isLoadingProducts: boolean;
  productError: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedBranch: (branch: Branch | null) => void;
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProducts: () => Promise<void>;
  placeOrder: (payload: PlaceOrderPayload) => Promise<Order>;
  searchOrders: (query: string) => Promise<Order[]>;
};

type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
};

type PlaceOrderPayload = {
  shippingAddress: string;
  paymentMethod: string;
  deliveryFee?: number;
  promoCode?: string;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

type ProductResponse = {
  data?: Product[];
};

type LoginResponse = {
  token?: string;
  user?: User;
  error?: string;
};

type OrderPlaceResponse = {
  order?: Partial<Order> & {
    id: string;
    orderNumber?: string;
    txNo?: string;
    date?: string;
    total?: number;
  };
  error?: string;
};

export function AppProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchInventory, setBranchInventory] = useState<BranchInventory[]>([]);
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const fetchBranches = useCallback(async () => {
    try {
      const payload = await getJson<Branch[]>('/api/branches');
      setBranches(payload);
      setSelectedBranchState((current) => current ?? payload[0] ?? null);
    } catch {
      setBranches([]);
    }
  }, []);

  const fetchBranchInventory = useCallback(async (branchId: number) => {
    try {
      const payload = await getJson<BranchInventory[]>(`/api/branches/${branchId}/inventory`);
      setBranchInventory(payload);
    } catch {
      setBranchInventory([]);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductError('');

    try {
      const params = new URLSearchParams({ sortBy: 'price-asc' });

      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }

      if (selectedBranch) {
        params.set('branchId', String(selectedBranch.id));
      }

      const payload = await getJson<ProductResponse>(`/api/products?${params.toString()}`);
      setProducts(payload.data ?? []);
    } catch (error) {
      setProducts([]);
      setProductError(error instanceof Error ? error.message : 'Unable to load products.');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [searchQuery, selectedBranch]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (selectedBranch) {
      fetchBranchInventory(selectedBranch.id);
    }
  }, [fetchBranchInventory, selectedBranch]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const setSelectedBranch = useCallback((branch: Branch | null) => {
    setSelectedBranchState(branch);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json().catch(() => null)) as LoginResponse | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? 'Invalid credentials.');
    }

    if (payload?.token) {
      storeAccessToken(payload.token);
    }

    if (payload?.user) {
      setUser(payload.user);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as LoginResponse | null;

    if (!response.ok) {
      throw new Error(data?.error ?? 'Unable to create account.');
    }

    if (data?.token) {
      storeAccessToken(data.token);
    }

    if (data?.user) {
      setUser(data.user);
    }
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setCart([]);
  }, []);

  const placeOrder = useCallback(async (payload: PlaceOrderPayload) => {
    const response = await fetchWithAuth('/api/orders/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    });
    const data = (await response.json().catch(() => null)) as OrderPlaceResponse | null;

    if (!response.ok) {
      throw new Error(data?.error ?? 'Failed to place order.');
    }

    const serverOrder = data?.order ?? null;
    const order: Order = {
      id: serverOrder?.id ?? `${Date.now()}`,
      orderNumber: serverOrder?.orderNumber,
      txNo: serverOrder?.txNo,
      date: serverOrder?.date ?? new Date().toISOString(),
      items: cart.map((item) => ({ ...item })),
      subtotal: cartTotal,
      deliveryFee: payload.deliveryFee ?? 0,
      discountAmount: 0,
      promoCode: payload.promoCode,
      total: Number(serverOrder?.total ?? cartTotal + (payload.deliveryFee ?? 0)),
      status: 'Processing',
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod,
    };

    setOrders((current) => [order, ...current]);
    setCart([]);
    return order;
  }, [cart, cartTotal]);

  const searchOrders = useCallback(async (query: string) => {
    const response = await fetchWithAuth(`/api/orders/search?q=${encodeURIComponent(query)}`);
    const payload = (await response.json().catch(() => null)) as { data?: Order[]; orders?: Order[]; error?: string } | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? 'Unable to search orders.');
    }

    return payload?.data ?? payload?.orders ?? [];
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    user,
    isLoggedIn: Boolean(user),
    cart,
    orders,
    branches,
    branchInventory,
    selectedBranch,
    products,
    isLoadingProducts,
    productError,
    searchQuery,
    setSearchQuery,
    setSelectedBranch,
    addToCart,
    updateQuantity,
    clearCart,
    cartTotal,
    login,
    register,
    logout,
    refreshProducts,
    placeOrder,
    searchOrders,
  }), [
    user,
    cart,
    orders,
    branches,
    branchInventory,
    selectedBranch,
    products,
    isLoadingProducts,
    productError,
    searchQuery,
    setSelectedBranch,
    addToCart,
    updateQuantity,
    clearCart,
    cartTotal,
    login,
    register,
    logout,
    refreshProducts,
    placeOrder,
    searchOrders,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }

  return context;
}
