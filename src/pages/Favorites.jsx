import React from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useUser } from '../context/UserContext';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { products, loading } = useProducts();
  const { favorites } = useUser();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  if (loading) return <div className="loading">Yuklanmoqda...</div>;

  return (
    <div className="favorites-page animate-up">
      <Header />
      
      <div className="page-container">
        <h2 className="title">Saralanganlar</h2>

        {favoriteProducts.length > 0 ? (
          <div className="products-grid">
            {favoriteProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <div className="empty-icon shadow">
              <Heart size={48} color="var(--primary)" />
            </div>
            <h3>Hech narsa yo'q</h3>
            <p>Sizga yoqqan mahsulotlarni ushbu bo'limda saqlashingiz mumkin</p>
            <Link to="/catalog" className="go-to-catalog">Mahsulotlarni tanlash</Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .title {
          font-size: 24px;
          font-weight: 900;
          color: var(--secondary);
          margin-bottom: 20px;
        }
        .empty-favorites {
          text-align: center;
          padding: 80px 20px;
        }
        .empty-icon {
          width: 100px;
          height: 100px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .go-to-catalog {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 28px;
          background: var(--primary);
          color: #fff;
          border-radius: 14px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default Favorites;
