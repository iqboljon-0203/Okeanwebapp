import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Trash2, Home, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';

const Addresses = () => {
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'home', name: 'Uy', address: 'Toshkent sh., Chilonzor tumani, 19-mavze, 45-uy' },
    { id: 2, type: 'work', name: 'Ishxona', address: 'Toshkent sh., Yunusobod, Amir Temur ko\'chasi, 107B' },
  ]);

  const handleDelete = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success("Manzil o'chirildi");
  };

  const handleAddNewAddress = (data) => {
    const newAddress = {
      id: Date.now(),
      type: 'other',
      name: 'Yangi Manzil',
      address: data.address
    };
    setAddresses([...addresses, newAddress]);
    toast.success("Yangi manzil qo'shildi");
  };

  const getIcon = (type) => {
    switch (type) {
      case 'home': return <Home size={24} color="#FF4B3A" />;
      case 'work': return <Briefcase size={24} color="#4facfe" />;
      default: return <MapPin size={24} color="#00302D" />;
    }
  };

  return (
    <div className="addresses-page animate-up">
      <div className="page-header sticky-top">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Mening manzillarim</h2>
        <div style={{ width: 40 }}></div>
      </div>

      <div className="page-container">
        <div className="addresses-list">
          {addresses.map((item) => (
            <div key={item.id} className="address-card shadow-sm">
              <div className="icon-box">
                {getIcon(item.type)}
              </div>
              <div className="content">
                <h3>{item.name}</h3>
                <p>{item.address}</p>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(item.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button className="add-new-btn" onClick={() => setShowPicker(true)}>
            <div className="icon-box dashed">
              <Plus size={24} color="var(--primary)" />
            </div>
            <span>Yangi manzil qo'shish</span>
          </button>
        </div>
      </div>

      {showPicker && (
        <LocationPicker 
          onClose={() => setShowPicker(false)} 
          onSelect={handleAddNewAddress} 
        />
      )}

      <style>{`
        .page-header {
          padding: 15px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .page-header h2 { font-size: 18px; font-weight: 800; color: var(--secondary); }
        .back-btn {
          width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
          border-radius: 12px; background: #F1F4F5; color: var(--text-muted);
        }
        
        .addresses-list { display: flex; flex-direction: column; gap: 15px; padding: 10px 0; }
        
        .address-card {
          background: #fff; border-radius: 20px; padding: 16px; display: flex; gap: 15px; align-items: center;
        }
        .icon-box {
          width: 50px; height: 50px; border-radius: 16px; background: #F8F9FA;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .content { flex: 1; }
        .content h3 { font-size: 16px; font-weight: 700; color: var(--secondary); margin-bottom: 4px; }
        .content p { font-size: 13px; color: var(--text-muted); line-height: 1.3; }
        
        .delete-btn {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border-radius: 10px; background: #FFF5F4; color: #FF4B3A;
        }

        .add-new-btn {
          background: #fff; border-radius: 20px; padding: 16px; display: flex; gap: 15px; align-items: center;
          width: 100%; border: 2px dashed #E5E9EB;
        }
        .icon-box.dashed { background: #FFF5F4; }
        .add-new-btn span { font-weight: 700; color: var(--secondary); }
      `}</style>
    </div>
  );
};

export default Addresses;
