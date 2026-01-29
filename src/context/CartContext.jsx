import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

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
        const step = Number(product.step) || 1; 
        toast.success(`${product.name} miqdori oshirildi`);
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, product: product, quantity: Number(item.quantity) + step } // Update product ref & force number
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
        const step = Number(item.product.step) || 1;
        console.log(`Increasing qty for ${item.product.name}. Step: ${step}, Current: ${item.quantity}`);
        if (step > 1) toast(`Qadam: ${step}`); 
        return { ...item, quantity: Number(item.quantity) + step };
      }
      return item;
    }));
  };

  const decreaseQty = (productId) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const step = Number(item.product.step) || 1;
        const newQty = Number(item.quantity) - step;
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
    
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;
    
    return { subtotal, deliveryFee, total, count: cartItems.length };
  }, [cartItems]);

  const submitOrder = async (orderData) => {
    const { address, coords, phone, userId, total } = orderData;
    
    // Validation
    if (cartItems.length === 0) return { success: false, message: 'Savat bo\'sh' };

    try {
        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: userId, // Can be null if guest, but ideally we have a telegram_id
                total_price: total,
                status: 'new',
                location_lat: coords ? coords[0] : null,
                location_long: coords ? coords[1] : null,
                address_text: address,
                phone: phone
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const orderItemsData = cartItems.map(item => ({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price_at_time: item.product.discountPrice || item.product.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) throw itemsError;

        // Success
        clearCart();

        // 3. Send Telegram Notification
        await sendTelegramNotification({
            id: order.id,
            total: total,
            address: address,
            phone: phone,
            lat: coords ? coords[0] : null,
            lng: coords ? coords[1] : null
        });

        return { success: true, orderId: order.id };

    } catch (error) {
        console.error('Order submission error:', error);
        return { success: false, message: error.message };
    }
  };

    const sendTelegramNotification = async (orderData) => {
    // 1. Tokenni olishga harakat qilamiz (Env yoki Hardcode)
    const envToken = import.meta.env.VITE_BOT_TOKEN;
    const BOT_TOKEN = envToken || '8503195199:AAFnjXFzYIMGxTA3TK6yu0erWZFwsIhOeZE'; 
    const CHAT_ID = '-1003804421466'; 

    console.log("TG Notification Start.");
    console.log("Token check:", envToken ? "Found in ENV" : "Using Fallback");

    if (!BOT_TOKEN) {
        console.error('Telegram notification failed: Token is completely missing');
        toast.error('Telegram bot tokeni topilmadi!');
        return;
    }

    const message = `
📦 <b>Yangi Buyurtma!</b> №${orderData.id}

💰 <b>Narxi:</b> ${parseInt(orderData.total).toLocaleString()} so'm
📞 <b>Tel:</b> ${orderData.phone}
📍 <b>Manzil:</b> ${orderData.address || 'Belgilanmagan'}
    `.trim();

    // 4. Send Request
    try {
        let response;
        const isDev = import.meta.env.DEV;

        if (isDev) {
            // Local Development: Use Vite Proxy
            // URL: /telegram-api/bot<TOKEN>/sendMessage
            const baseUrl = '/telegram-api';
            const url = `${baseUrl}/bot${BOT_TOKEN}/sendMessage`;
            
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🚀 Qabul qilish", url: "https://t.me/okean_delivery_bot/courier" }]
                        ]
                    }
                })
            });
        } else {
            // Production (Vercel): Use Serverless Function
            // URL: /api/telegram (No token needed in URL, handled by server)
            response = await fetch('/api/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "🚀 Qabul qilish", url: "https://t.me/okean_delivery_bot/courier" }]
                        ]
                    }
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Telegram API Error:', errorData);
            throw new Error(errorData.description || 'Telegram API xatosi');
        }
        
        const resData = await response.json();
        console.log("TG Notification sent successfully. Result:", resData);

    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
        toast.error('Guruhga xabar yuborilmadi: ' + error.message);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      increaseQty,
      decreaseQty,
      clearCart,
      submitOrder,
      ...totals
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
