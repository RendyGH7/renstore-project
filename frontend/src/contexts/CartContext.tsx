import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../api/axios';
import { CartItem, CartResponse, ApiResponse } from '../types';
import { useAuth } from './AuthContext';

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotalItems(0);
      setTotalAmount(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<CartResponse>>('/cart');
      if (response.data?.data) {
        setItems(response.data.data.items || []);
        setTotalItems(response.data.data.total_items || 0);
        setTotalAmount(response.data.data.total_amount || 0);
      } else {
        setItems([]);
        setTotalItems(0);
        setTotalAmount(0);
      }
    } catch {
      setItems([]);
      setTotalItems(0);
      setTotalAmount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      setIsLoading(true);
      api.get<ApiResponse<CartResponse>>('/cart')
        .then((response) => {
          if (isMounted) {
            if (response.data?.data) {
              setItems(response.data.data.items || []);
              setTotalItems(response.data.data.total_items || 0);
              setTotalAmount(response.data.data.total_amount || 0);
            } else {
              setItems([]);
              setTotalItems(0);
              setTotalAmount(0);
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            setItems([]);
            setTotalItems(0);
            setTotalAmount(0);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setItems([]);
      setTotalItems(0);
      setTotalAmount(0);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity = 1): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post('/cart', {
        product_id: productId,
        quantity,
      });
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number): Promise<void> => {
    setIsLoading(true);
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number): Promise<void> => {
    setIsLoading(true);
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.delete('/cart');
      setItems([]);
      setTotalItems(0);
      setTotalAmount(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
