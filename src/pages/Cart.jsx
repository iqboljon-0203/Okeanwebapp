import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/price';

const Cart = () => {
  const { cartItems, subtotal, deliveryFee, total, count, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="cart-page animate-up">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Savatcha</h2>
        <button className="clear-btn" onClick={clearCart}>
          <Trash2 size={20} />
        </button>
      </div>

      <div className="page-container">
        {count > 0 ? (
          <>
            <div className="items-list">
              {cartItems.map(item => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>

            <div className="summary-card">
              <div className="summary-row">
                <span>Jami ({count} ta mahsulot):</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Yetkazib berish:</span>
                <span className={deliveryFee === 0 ? 'free' : ''}>
                  {deliveryFee === 0 ? 'Bepul' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="divider"></div>
              <div className="summary-row total">
                <span>Umumiy summa:</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              <Link to="/checkout" className="checkout-btn">
                Buyurtma berish
              </Link>
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <div className="empty-icon shadow">
              <ShoppingBag size={48} color="var(--primary)" />
            </div>
            <h3>Savat bo'sh</h3>
            <p>Xaridni boshlash uchun katalogga o'ting</p>
            <Link to="/catalog" className="go-to-catalog">Katalogga o'tish</Link>
          </div>
        )}
      </div>


    </div>
  );
};

export default Cart;
