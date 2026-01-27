import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Trash2, Home, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LocationPicker from '../components/LocationPicker';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

const Addresses = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showPicker, setShowPicker] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user?.telegramId) return;
    try {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.telegramId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        setAddresses(data || []);
    } catch (error) {
        console.error("Error fetching addresses:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Manzilni o'chirasizmi?")) return;
    try {
        const { error } = await supabase.from('user_addresses').delete().eq('id', id);
        if (error) throw error;
        
        setAddresses(addresses.filter(a => a.id !== id));
        toast.success("Manzil o'chirildi");
    } catch (error) {
        toast.error("Xatolik: " + error.message);
    }
  };

  const handleAddNewAddress = async (data) => {
    // data = { address, coords: [lat, lng] }
    const name = window.prompt("Manzil nomini kiriting (masalan: Uy, Ishxona):", "Yangi manzil");
    if (!name) return; // Cancelled

    let type = 'other';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('uy') || lowerName.includes('home')) type = 'home';
    if (lowerName.includes('ish') || lowerName.includes('work')) type = 'work';

    try {
        const newAddressPayload = {
            user_id: user.telegramId,
            name: name,
            address: data.address,
            location_lat: data.coords ? data.coords[0] : null,
            location_long: data.coords ? data.coords[1] : null,
            type: type
        };

        const { data: insertedData, error } = await supabase
            .from('user_addresses')
            .insert([newAddressPayload])
            .select()
            .single();

        if (error) throw error;

        setAddresses([insertedData, ...addresses]);
        toast.success("Yangi manzil saqlandi");
    } catch (error) {
        console.error(error);
        toast.error("Saqlashda xatolik");
    }
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
        {loading ? (
            <div className="loading-state">
                <Loader2 className="spin" size={30} color="var(--primary)" />
            </div>
        ) : (
            <div className="addresses-list">
            {addresses.length === 0 && (
                <div className="empty-state">
                    <p>Manzillar yo'q</p>
                </div>
            )}
            
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
        )}
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
          border-radius: 10px; background: #FFF5F4; color: #FF4B3A; border: none;
        }

        .add-new-btn {
          background: #fff; border-radius: 20px; padding: 16px; display: flex; gap: 15px; align-items: center;
          width: 100%; border: 2px dashed #E5E9EB; cursor: pointer;
        }
        .icon-box.dashed { background: #FFF5F4; }
        .add-new-btn span { font-weight: 700; color: var(--secondary); }
        
        .loading-state, .empty-state { display: flex; justify-content: center; padding: 40px 0; color: #999; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Addresses;
