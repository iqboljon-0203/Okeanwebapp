import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => getStorageItem('cart', []));

  useEffect(() => {
    setStorageItem('cart', cartItems);
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product.isAvailable) {
      toast.error('Bu mahsulot hozirda mavjud emas');
      return;
    }
    
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const step = product.step || 1;
        toast.success(`${product.name} miqdori oshirildi`);
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + step } 
            : item
        );
      }
      toast.success(`${product.name} savatga qo'shildi`);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    toast.success('Mahsulot savatdan olib tashlandi');
  };

  const increaseQty = (productId) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const step = item.product.step || 1;
        return { ...item, quantity: item.quantity + step };
      }
      return item;
    }));
  };

  const decreaseQty = (productId) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const step = item.product.step || 1;
        const newQty = item.quantity - step;
        return { ...item, quantity: newQty < step ? step : newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + (price * item.quantity);
    }, 0);
    
    // DELIVERY LOGIC:
    // < 100,000 = 15,000 fee
    // >= 100,000 = Free
    const deliveryFee = (subtotal >= 100000 || subtotal === 0) ? 0 : 15000;
    const total = subtotal + deliveryFee;
    
    return { subtotal, deliveryFee, total, count: cartItems.length };
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      increaseQty,
      decreaseQty,
      clearCart,
      ...totals
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
