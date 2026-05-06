import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  tourId: number;
  tourName: string;
  optionId: number;
  optionName: string;
  transferId: number;
  transferName: string;
  contractId: number;
  tourDate: string;
  startTime: string;
  timeSlotId: string;
  adults: number;
  children: number;
  infants: number;
  adultRate: number;
  childRate: number;
  infantRate: number;
  total: number;
  imageUrl: string;
  cityTourType: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (tourId: number, optionId: number) => void;
  clearCart: () => void;
  isInCart: (tourId: number, optionId: number) => boolean;
  totalAmount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.tourId === item.tourId && i.optionId === item.optionId);
      if (exists) return prev.map(i => i.tourId === item.tourId && i.optionId === item.optionId ? item : i);
      return [...prev, item];
    });
    setIsOpen(true);
  };

  const removeItem = (tourId: number, optionId: number) => {
    setItems(prev => prev.filter(i => !(i.tourId === tourId && i.optionId === optionId)));
  };

  const clearCart = () => setItems([]);
  const isInCart = (tourId: number, optionId: number) => items.some(i => i.tourId === tourId && i.optionId === optionId);
  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, totalAmount, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
