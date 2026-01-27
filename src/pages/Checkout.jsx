import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { ArrowLeft, MapPin, CreditCard, MessageCircle, User as UserIcon, CheckCircle2, Truck, Wallet } from 'lucide-react';
import { formatPrice } from '../utils/price';
import { toast } from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, total, clearCart, submitOrder } = useCart();
  const { user, updateProfile } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    coords: user.coords || null,
    comment: '',
    paymentMethod: 'cash'
  });

  // Sync with user context if it updates
  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        coords: user.coords || prev.coords
    }));
  }, [user]);

  const handleLocationSelect = (data) => {
    setFormData(prev => ({
        ...prev,
        address: data.address,
        coords: data.coords
    }));
    // User Update Profile
    updateProfile({ address: data.address, coords: data.coords });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Savatchangiz bo\'sh');
      return;
    }

    if (!formData.address) {
        toast.error("Iltimos, manzilni kiriting");
        return;
    }
    
    try {
      setLoading(true);

      // Submit to Supabase
      const result = await submitOrder({
          userId: user.telegramId, // Might be undefined for guest, configured in CartContext to handle null
          address: formData.address,
          coords: formData.coords,
          phone: `+998${formData.phone}`,
          total: total
      });
      
      if (result.success) {
        setOrderId(result.orderId);
        setSuccess(true);
        // clearCart is called inside submitOrder
        updateProfile({ 
          name: formData.name, 
          phone: formData.phone 
        });
        
        // Optional: Send data to Telegram Bot also if needed for other bot logic
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify({
                order_id: result.orderId,
                total,
                status: 'new'
            }));
        }

        toast.success('Buyurtmangiz qabul qilindi!');
      } else {
          toast.error(result.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      toast.error('Buyurtma berishda xatolik yuz berdi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-screen animate-up">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle2 size={80} color="#fff" />
          </div>
          <h1>Rahmat!</h1>
          <p className="order-num">Buyurtma raqami: <strong>#{orderId}</strong></p>
          <p className="desc">Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorlarimiz siz bilan bog'lanadi.</p>
          <button className="home-btn" onClick={() => navigate('/')}>
            Bosh sahifaga qaytish
          </button>
        </div>
        <style>{`
            .success-screen {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: #fff; z-index: 5000;
                display: flex; align-items: center; justify-content: center;
                padding: 20px;
            }
            .success-card {
                text-align: center; display: flex; flex-direction: column; align-items: center;
                width: 100%; max-width: 400px;
            }
            .success-icon {
                width: 120px; height: 120px; background: #00B894;
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0, 184, 148, 0.3);
            }
            .success-card h1 { font-size: 28px; font-weight: 800; color: #00302D; margin-bottom: 8px; }
            .order-num { font-size: 18px; color: #00302D; margin-bottom: 12px; }
            .desc { color: #7A869A; margin-bottom: 30px; line-height: 1.5; }
            .home-btn {
                width: 100%; height: 56px; background: var(--primary); color: #fff;
                border-radius: 16px; font-weight: 700; font-size: 16px;
            }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page animate-up">
      <div className="checkout-header sticky-top">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Rasmiylashtirish</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <form onSubmit={handleSubmit} className="page-container">
        
        {/* Personal Info */}
        <section className="checkout-section">
          <h3><UserIcon size={20} className="icon" /> Shaxsiy ma'lumotlar</h3>
          <div className="card-content">
            <div className="input-group">
                <label>Ismingiz</label>
                <input 
                required
                type="text" 
                placeholder="Ismingizni kiriting" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div className="input-group">
                <label>Telefon raqam</label>
                <div className="phone-wrapper">
                    <span className="prefix">+998</span>
                    <input 
                        required
                        type="tel" 
                        maxLength="9"
                        placeholder="90 123 45 67" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                    />
                </div>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="checkout-section">
          <h3><MapPin size={20} className="icon" /> Manzil</h3>
          <div className="card-content">
            <div className="address-box" onClick={() => setShowLocationPicker(true)}>
                <div className="addr-icon">
                    <MapPin size={24} color="#FF4B3A" />
                </div>
                <div className="addr-text">
                    <span>Yetkazib berish manzili</span>
                    <p>{formData.address || 'Xaritadan belgilash'}</p>
                </div>
                <button type="button" className="change-btn">O'zgartirish</button>
            </div>
            
            <div className="input-group mt-3">
                <label>Izoh (mo'ljal, dom kodi)</label>
                <input 
                type="text"
                placeholder="Kuryer uchun izoh..."
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="checkout-section">
          <h3><CreditCard size={20} className="icon" /> To'lov turi</h3>
          <div className="payment-grid">
            <label className={`payment-card ${formData.paymentMethod === 'cash' ? 'active' : ''}`}>
                <input 
                    type="radio" 
                    name="payment" 
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                />
                <div className="pay-icon"><Wallet size={24} /></div>
                <span>Naqd pul</span>
                <div className="check-mark"><CheckCircle2 size={16} /></div>
            </label>

            <label className={`payment-card ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                <input 
                    type="radio" 
                    name="payment" 
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                />
                <div className="pay-icon card-color"><CreditCard size={24} /></div>
                <span>Click / Payme</span>
                <div className="check-mark"><CheckCircle2 size={16} /></div>
            </label>
          </div>
        </section>

        {/* Total & Submit */}
        <div className="checkout-footer-fixed">
            <div className="total-row">
                <span>Jami to'lov:</span>
                <span className="amount">{formatPrice(total)}</span>
            </div>
            <button type="submit" className="submit-order-btn" disabled={loading}>
                {loading ? 'Yuborilmoqda...' : 'Buyurtma berish'}
            </button>
        </div>

      </form>

      {showLocationPicker && (
        <LocationPicker 
            onClose={() => setShowLocationPicker(false)}
            onSelect={handleLocationSelect}
        />
      )}

      <style>{`
        .checkout-page { padding-bottom: 100px; background: #F8F9FA; min-height: 100vh; }
        
        .checkout-header {
          padding: 15px 16px;
          display: flex; justify-content: space-between; align-items: center;
          background: #fff; z-index: 100; border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .checkout-header h2 { font-size: 18px; font-weight: 800; color: var(--secondary); }
        .back-btn {
          width: 40px; height: 40px; border-radius: 12px; background: #F1F4F5;
          display: flex; align-items: center; justify-content: center; color: var(--text-muted);
        }

        .checkout-section {
            background: #fff; margin: 15px 16px; border-radius: 20px; padding: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .checkout-section h3 {
            font-size: 16px; font-weight: 700; color: var(--secondary);
            margin-bottom: 15px; display: flex; align-items: center; gap: 8px;
        }
        .checkout-section h3 .icon { color: var(--primary); }

        .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
        .input-group label { font-size: 13px; font-weight: 600; color: #7A869A; }
        .input-group input {
            height: 48px; border-radius: 14px; border: 1px solid #E5E9EB;
            padding: 0 16px; font-size: 16px; color: var(--secondary); font-weight: 600;
            background: #F8F9FA; outline: none; transition: all 0.2s;
        }
        .input-group input:focus { border-color: var(--primary); background: #fff; }

        .phone-wrapper { position: relative; }
        .phone-wrapper .prefix {
            position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
            font-size: 16px; font-weight: 600; color: #7A869A;
        }
        .phone-wrapper input { padding-left: 65px; width: 100%; }

        .address-box {
            display: flex; align-items: center; gap: 12px;
            background: #FFF5F4; border: 1px dashed #FF4B3A;
            padding: 12px; border-radius: 16px; cursor: pointer;
        }
        .addr-icon {
            width: 40px; height: 40px; background: #fff; border-radius: 12px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .addr-text { flex: 1; }
        .addr-text span { font-size: 11px; color: #7A869A; font-weight: 600; display: block; }
        .addr-text p {
             font-size: 14px; font-weight: 700; color: var(--secondary);
             display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; 
             -webkit-box-orient: vertical; overflow: hidden;
        }
        .change-btn {
            font-size: 12px; font-weight: 700; color: var(--primary); background: #fff;
            padding: 6px 12px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .mt-3 { margin-top: 15px; }

        .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .payment-card {
            background: #F8F9FA; border: 2px solid transparent; border-radius: 16px;
            padding: 15px; display: flex; flex-direction: column; align-items: center;
            cursor: pointer; position: relative; transition: all 0.2s;
        }
        .payment-card input { display: none; }
        .payment-card.active {
            background: #fff; border-color: var(--primary);
            box-shadow: 0 4px 15px rgba(255, 75, 58, 0.1);
        }
        .pay-icon {
            width: 48px; height: 48px; background: #E5E9EB; border-radius: 12px;
            display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
            color: #7A869A;
        }
        .payment-card.active .pay-icon { background: var(--primary); color: #fff; }
        .card-color { background: #E1F0FF; color: #007AFF; }
        .payment-card.active .card-color { background: #007AFF; color: #fff; }
        
        .payment-card span { font-size: 13px; font-weight: 700; color: var(--secondary); }
        .check-mark {
            position: absolute; top: 10px; right: 10px; color: var(--primary);
            opacity: 0; transform: scale(0.5); transition: all 0.2s;
        }
        .payment-card.active .check-mark { opacity: 1; transform: scale(1); }

        .checkout-footer-fixed {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: #fff; padding: 16px 20px;
            border-radius: 24px 24px 0 0;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
            z-index: 1000;
        }
        .total-row {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 15px; font-size: 16px; color: #7A869A; font-weight: 600;
        }
        .total-row .amount { font-size: 20px; color: var(--secondary); font-weight: 900; }
        
        .submit-order-btn {
            width: 100%; height: 56px; background: var(--primary); color: #fff;
            border-radius: 16px; font-size: 18px; font-weight: 800;
            box-shadow: 0 10px 25px rgba(255, 75, 58, 0.25);
            display: flex; align-items: center; justify-content: center;
        }
        .submit-order-btn:disabled { background: #ccc; box-shadow: none; }
      `}</style>
    </div>
  );
};

export default Checkout;
