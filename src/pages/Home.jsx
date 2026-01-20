import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import Skeleton from '../components/Skeleton';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Home = () => {
  const { categories, getPopularProducts, loading } = useProducts();
  const [search, setSearch] = useState('');
  const popular = getPopularProducts();
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleApplyFilter = (sortId) => {
    // Navigate to catalog with sort param
    navigate(`/catalog?sort=${sortId}`);
  };

  // Auto-scroll logic for categories
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const speed = 0.5;
    let animationId;
    let isPaused = false;

    const scrollStep = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += speed;
        if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1) {
             scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scrollStep);
    };

    const pauseScroll = () => { isPaused = true; };
    const resumeScroll = () => { isPaused = false; };

    scrollContainer.addEventListener('mouseenter', pauseScroll);
    scrollContainer.addEventListener('mouseleave', resumeScroll);
    scrollContainer.addEventListener('touchstart', pauseScroll);
    scrollContainer.addEventListener('touchend', resumeScroll);

    animationId = requestAnimationFrame(scrollStep);

    return () => {
      cancelAnimationFrame(animationId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', pauseScroll);
        scrollContainer.removeEventListener('mouseleave', resumeScroll);
        scrollContainer.removeEventListener('touchstart', pauseScroll);
        scrollContainer.removeEventListener('touchend', resumeScroll);
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="home-page">
        <Header />
        <div className="page-container">
          <Skeleton height="160px" radius="28px" className="mb-20" />
          <div className="section">
            <div className="flex-between mb-15">
              <Skeleton width="120px" height="24px" />
              <Skeleton width="60px" height="20px" />
            </div>
            <div className="categories-grid">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex-center flex-column gap-8">
                  <Skeleton width="75px" height="75px" radius="24px" />
                  <Skeleton width="50px" height="12px" />
                </div>
              ))}
            </div>
          </div>
          <div className="section mt-30">
            <Skeleton width="180px" height="24px" className="mb-15" />
            <div className="products-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-column gap-12">
                  <Skeleton width="100%" height="160px" radius="24px" />
                  <Skeleton width="80%" height="18px" />
                  <Skeleton width="40%" height="14px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page animate-up">
      <Header />
      <SearchBar 
        value={search} 
        onChange={setSearch} 
        onSubmit={handleSearch} 
        onFilterApply={handleApplyFilter}
        currentSort="default"
      />
      
      <div className="page-container">
        <div className="banner">
          <div className="banner-content">
            <span className="tag"><Sparkles size={12} /> Yangi yetkazib berish</span>
            <h2>Buyurtmangiz 30 daqiqada yetib boradi!</h2>
            <p>50,000 so'mdan ortiq buyurtmalar uchun bepul yetkazib berish.</p>
            <Link to="/catalog" className="banner-btn">Hoziroq buyurtma berish</Link>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3>Kategoriyalar</h3>
            <Link to="/catalog" className="view-all">
              Barchasi <ChevronRight size={16} />
            </Link>
          </div>
          <div 
            className="categories-grid" 
            ref={scrollRef}
          >
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
            <Link to="/catalog" className="category-card">
              <div className="icon-box more" style={{ background: '#F4F7F6', color: '#6C7278', fontSize: '20px', fontWeight: 'bold' }}>...</div>
              <span className="name">Barchasi</span>
            </Link>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h3>Ommabop Mahsulotlar</h3>
          </div>
          <div className="products-grid">
            {popular.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
