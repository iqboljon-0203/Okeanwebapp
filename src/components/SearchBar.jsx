import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';

const SearchBar = ({ value, onChange, onSubmit, onFilterApply, currentSort = 'default' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { id: 'default', label: 'Tavsiya etilgan' },
    { id: 'price-asc', label: 'Arzonroqdan qimmatroqqa' },
    { id: 'price-desc', label: 'Qimmatroqdan arzonroqqa' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    if (onFilterApply) {
      onFilterApply(id);
    }
    setIsOpen(false);
  };

  return (
    <div className="search-container animate-up">
      <div className="search-input-wrapper">
        <Search size={20} color="#6C7278" />
        <input 
          type="text" 
          placeholder="Mahsulotlarni qidiring..." 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit && onSubmit()}
        />
      </div>
      
      <div className="filter-wrapper" ref={dropdownRef}>
        <button 
          className={`filter-btn shadow-sm ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <SlidersHorizontal size={20} />
        </button>

        {isOpen && (
          <div className="filter-dropdown shadow-lg animate-fade-in">
            {options.map((option) => (
              <button 
                key={option.id} 
                className={`dropdown-item ${currentSort === option.id ? 'active' : ''}`}
                onClick={() => handleSelect(option.id)}
              >
                <span>{option.label}</span>
                {currentSort === option.id && <Check size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .search-container {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          padding: 5px 16px 15px 16px;
          position: relative; 
          z-index: 2000; /* Ensure search bar stays on top */
        }
        .search-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          background: #F1F4F5;
          border-radius: 16px;
          padding: 0 16px;
          border: 1.5px solid transparent;
          transition: all 0.3s;
          z-index: 10;
        }
        .search-input-wrapper:focus-within {
          border-color: var(--primary);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(255, 75, 58, 0.08);
        }
        .search-input-wrapper input {
          width: 100%;
          border: none;
          background: transparent;
          padding: 14px 10px;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          color: var(--secondary);
        }
        .search-input-wrapper input::placeholder {
          color: #A0AAB0;
        }
        
        /* Filter Dropdown Styles */
        .filter-wrapper {
          position: relative;
          z-index: 1001; /* Ensure higher than input */
        }
        .filter-btn {
          width: 48px;
          height: 48px;
          background: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary);
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.2s;
          cursor: pointer;
        }
        .filter-btn:active {
          transform: scale(0.95);
        }
        .filter-btn.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }
        
        .filter-dropdown {
          position: absolute;
          top: 60px;
          right: 0;
          width: 240px;
          background: #fff;
          border-radius: 20px;
          padding: 8px;
          z-index: 9999; /* Max z-index */
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .dropdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: var(--secondary);
          text-align: left;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .dropdown-item:hover {
          background: #F8F9FA;
        }
        
        .dropdown-item.active {
          background: #FFF5F4;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
