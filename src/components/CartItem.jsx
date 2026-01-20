import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/price';

const CartItem = ({ item }) => {
  const { removeFromCart, increaseQty, decreaseQty } = useCart();
  const { product, quantity } = item;
  const price = product.discountPrice || product.price;

  return (
    <div className="cart-item shadow-sm">
      <div className="img-box">
        <img 
          src={product.image} 
          alt={product.name} 
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'}
        />
      </div>
      
      <div className="details">
        <div className="top">
          <h4 className="name">{product.name}</h4>
          <button className="remove-btn" onClick={() => removeFromCart(product.id)}>
            <X size={16} />
          </button>
        </div>
        
        <p className="unit">{product.unit}</p>
        
        <div className="bottom">
          <div className="qty-controls">
            <button onClick={() => decreaseQty(product.id)} className="qty-btn" disabled={quantity <= 1}>
              <Minus size={14} />
            </button>
            <span className="qty">{quantity}</span>
            <button onClick={() => increaseQty(product.id)} className="qty-btn">
              <Plus size={14} />
            </button>
          </div>
          
          <div className="price-box">
            <span className="total-price">{formatPrice(price * quantity)}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .qty-btn:disabled { opacity: 0.3; }
        .name {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CartItem;
