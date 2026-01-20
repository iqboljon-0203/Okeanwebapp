import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import Skeleton from '../components/Skeleton';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const { products, categories, loading } = useProducts();
  const [search, setSearch] = useState(searchQuery || '');
  const [activeTab, setActiveTab] = useState(categoryId || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-asc', 'price-desc'

  useEffect(() => {
    setActiveTab(searchParams.get('category') || 'all');
    setSearch(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'default');
  }, [searchParams]);

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const handleApplyFilter = (sortId) => {
    setSortBy(sortId);
    if (sortId !== 'default') {
      const label = sortId === 'price-asc' ? "Narx: Arzonroqdan qimmatroqqa" : "Narx: Qimmatroqdan arzonroqqa";
      toast.success(label);
    } else {
      toast.success("Saralash tozalandi");
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    const currentCat = activeTab;
    if (currentCat !== 'all') {
      result = result.filter(p => p.categoryId === currentCat);
    }
    if (search) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }
    
    return result;
  }, [products, activeTab, search, sortBy]);

  if (loading) {
    return (
      <div className="catalog-page">
        <Header />
        <div className="filter-tabs">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} width="80px" height="36px" radius="12px" />
          ))}
        </div>
        <div className="page-container">
          <div className="catalog-header">
            <Skeleton width="140px" height="18px" />
            <Skeleton width="80px" height="36px" radius="10px" />
          </div>
          <div className={`products-grid ${viewMode}`}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex-column gap-12">
                <Skeleton width="100%" height={viewMode === 'grid' ? "180px" : "120px"} radius="24px" />
                <Skeleton width="90%" height="20px" />
                <Skeleton width="50%" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page animate-up">
      <Header />
      <SearchBar 
        value={search} 
        onChange={handleSearchChange} 
        onFilterApply={handleApplyFilter}
        currentSort={sortBy}
      />
      
      <div className="filter-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Hammasi
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`tab ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="page-container">
        <div className="catalog-header">
          <span className="results-count">
            {filteredProducts.length > 0 
              ? `${filteredProducts.length} mahsulot topildi`
              : "Mahsulotlar topilmadi"}
          </span>
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''} 
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className={`products-grid ${viewMode}`}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon shadow">
              <SlidersHorizontal size={40} color="var(--text-muted)" />
            </div>
            <h3>Hech narsa topilmadi</h3>
            <p>Boshqa qidiruv so'zini sinab ko'ring yoki filtrlarni tozalang</p>
            <button className="reset-btn" onClick={() => { setSearch(''); setActiveTab('all'); setSortBy('default'); }}>
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .filter-tabs {
          display: flex;
          overflow-x: auto;
          gap: 10px;
          padding: 15px 16px;
          background: #fff;
          border-bottom: 1px solid #E5E9EB;
          scrollbar-width: none;
        }
        .filter-tabs::-webkit-scrollbar { display: none; }
        .tab {
          padding: 10px 20px;
          background: #F1F4F5;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #7A869A;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .tab.active {
          background: var(--primary);
          color: #fff;
        }
        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .results-count {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .view-toggle {
          display: flex;
          gap: 8px;
        }
        .view-toggle button {
          width: 36px;
          height: 36px;
          background: #F1F4F5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7A869A;
          transition: all 0.2s;
        }
        .view-toggle button.active {
          background: var(--primary);
          color: #fff;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }
        .empty-icon {
          width: 80px;
          height: 80px;
          background: #fff;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .reset-btn {
          margin-top: 20px;
          padding: 10px 24px;
          background: var(--secondary);
          color: #fff;
          border-radius: 12px;
          font-weight: 600;
        }
        
        /* Grid Views */
        .products-grid.grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .products-grid.list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
      `}</style>
    </div>
  );
};

export default Catalog;
