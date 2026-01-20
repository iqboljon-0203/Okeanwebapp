import React from 'react';
import { X, Check } from 'lucide-react';

const FilterModal = ({ isOpen, onClose, currentSort, onApply }) => {
  if (!isOpen) return null;

  const options = [
    { id: 'default', label: 'Tavsiya etilgan' },
    { id: 'price-asc', label: 'Arzonroqdan qimmatroqqa' },
    { id: 'price-desc', label: 'Qimmatroqdan arzonroqqa' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Saralash</h3>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>
        
        <div className="filter-options">
          {options.map((option) => (
            <button 
              key={option.id} 
              className={`filter-option ${currentSort === option.id ? 'active' : ''}`}
              onClick={() => onApply(option.id)}
            >
              <span>{option.label}</span>
              {currentSort === option.id && <Check size={20} />}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: flex-end;
          z-index: 2000;
          backdrop-filter: blur(2px);
        }
        .modal-content {
          background: #fff;
          width: 100%;
          border-radius: 24px 24px 0 0;
          padding: 24px;
          padding-bottom: 40px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h3 {
          font-size: 20px;
          font-weight: 800;
          color: var(--secondary);
        }
        .close-btn {
          color: var(--text-muted);
        }
        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .filter-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #F8F9FA;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          color: var(--secondary);
          border: 2px solid transparent;
        }
        .filter-option.active {
          background: #FFF5F4;
          color: var(--primary);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default FilterModal;
