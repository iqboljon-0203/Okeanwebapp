import React from 'react';
import { Heart, Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { formatPrice } from '../utils/price';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart, cartItems, increaseQty, decreaseQty } = useCart();
  const { toggleFavorite, isFavorite } = useUser();
  
  const favorited = isFavorite(product.id);
  const cartItem = cartItems.find(item => item.product.id === product.id);
  const price = product.discountPrice || product.price;

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop';
  };

  return (
    <div className={`product-card ${viewMode} animate-up`}>
      <div className="image-container">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          onError={handleImageError}
        />
        <button 
          className={`fav-btn ${favorited ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
        >
          <Heart size={18} fill={favorited ? "#FF4B3A" : "none"} stroke={favorited ? "none" : "currentColor"} />
        </button>
        
        {product.isPopular && viewMode === 'grid' && (
          <div className="popular-tag">
            <Star size={12} fill="#000" stroke="none" />
            <span>Top</span>
          </div>
        )}
      </div>
      
      <div className="info">
        <h3 className="name">{product.name}</h3>
        <div className="price-row">
          {product.discountPrice ? (
             <div className="discount-block">
                <span className="original-price-crossed">{formatPrice(product.price)}</span>
                <span className="current-price discount">{formatPrice(product.discountPrice)}</span>
             </div>
          ) : (
             <span className="current-price">{formatPrice(product.price)}</span>
          )}
          <span className="unit">/ {product.unit}</span>
        </div>
        
        {cartItem ? (
          <div className="qty-controls">
            <button className="qty-btn" onClick={() => decreaseQty(product.id)}>
              <Minus size={18} strokeWidth={3} />
            </button>
            <span className="qty-value">
              {cartItem.quantity} {product.unit === 'kg' ? 'kg' : ''}
            </span>
            <button className="qty-btn" onClick={() => increaseQty(product.id)}>
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button 
            className="add-btn" 
            disabled={!product.isAvailable}
            onClick={() => addToCart(product)}
          >
            <Plus size={20} strokeWidth={3} />
            <span>{product.isAvailable ? 'Savatga' : 'Mavjud emas'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
