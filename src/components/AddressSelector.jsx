import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { MapPin, Home, Briefcase, Plus, X, Loader2, Navigation } from 'lucide-react';
import { createPortal } from 'react-dom';

const AddressSelector = ({ onClose, onSelect, onAddNew }) => {
    const { user } = useUser();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user?.telegramId) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('user_addresses')
                    .select('*')
                    .eq('user_id', user.telegramId)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setAddresses(data || []);
            } catch (error) {
                console.error("Error fetching addresses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, [user]);

    const getIcon = (type) => {
        switch (type) {
            case 'home': return <Home size={20} color="#FF4B3A" />;
            case 'work': return <Briefcase size={20} color="#4facfe" />;
            default: return <MapPin size={20} color="#00302D" />;
        }
    };

    return createPortal(
        <div className="address-selector-overlay animate-fade-in">
            <div className="address-selector-card animate-up">
                <div className="selector-header">
                    <h3>Manzilni tanlang</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="selector-body">
                    {loading ? (
                       <div className="loading-state">
                           <Loader2 className="spin" size={24} color="#FF4B3A" />
                       </div>
                    ) : (
                        <div className="address-list">
                            <button className="new-address-btn" onClick={onAddNew}>
                                <div className="icon-box new">
                                    <Navigation size={22} color="#fff" />
                                </div>
                                <div className="content">
                                    <h4>Xaritadan belgilash</h4>
                                    <p>Yangi manzil qo'shish</p>
                                </div>
                                <div className="action-icon">
                                    <Plus size={20} color="#FF4B3A" />
                                </div>
                            </button>

                            <div className="divider">Mening manzillarim</div>

                            {addresses.length === 0 ? (
                                <div className="empty-msg">Saqlangan manzillar yo'q</div>
                            ) : (
                                addresses.map(addr => (
                                    <button 
                                        key={addr.id} 
                                        className="saved-address-btn"
                                        onClick={() => onSelect({
                                            address: addr.address,
                                            coords: [addr.location_lat, addr.location_long]
                                        })}
                                    >
                                        <div className="icon-box saved">
                                            {getIcon(addr.type)}
                                        </div>
                                        <div className="content">
                                            <h4>{addr.name}</h4>
                                            <p className="line-clamp">{addr.address}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .address-selector-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6); z-index: 10000;
                    display: flex; align-items: flex-end; backdrop-filter: blur(4px);
                }
                .address-selector-card {
                    background: #fff; width: 100%; max-height: 85vh;
                    border-radius: 24px 24px 0 0;
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .selector-header {
                    padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid #f0f0f0; background: #fff;
                }
                .selector-header h3 { font-size: 18px; font-weight: 800; margin: 0; }
                .close-btn { background: #f5f5f5; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #555; }

                .selector-body { padding: 20px; overflow-y: auto; }
                .address-list { display: flex; flex-direction: column; gap: 12px; }

                .new-address-btn {
                    display: flex; align-items: center; gap: 15px;
                    background: #FFF5F4; border: 2px dashed #FF4B3A;
                    padding: 15px; border-radius: 20px; text-align: left; width: 100%;
                }
                .icon-box.new {
                    width: 44px; height: 44px; background: #FF4B3A; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(255, 75, 58, 0.3);
                }
                .action-icon { margin-left: auto; }
                
                .saved-address-btn {
                    display: flex; align-items: center; gap: 15px;
                    background: #fff; border: 1px solid #f1f1f1;
                    padding: 15px; border-radius: 20px; text-align: left; width: 100%;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    transition: 0.2s;
                }
                .saved-address-btn:active { background: #f9f9f9; transform: scale(0.98); }
                
                .icon-box.saved {
                    width: 44px; height: 44px; background: #F8F9FA; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                
                .content h4 { font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #2d3436; }
                .content p { font-size: 13px; color: #636e72; margin: 0; line-height: 1.3; }
                .line-clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

                .divider {
                    font-size: 13px; font-weight: 700; color: #b2bec3; text-transform: uppercase; letter-spacing: 0.5px;
                    margin: 10px 0 5px 0;
                }
                .empty-msg { text-align: center; color: #b2bec3; padding: 20px; font-weight: 500; }
                
                .loading-state { display: flex; justify-content: center; padding: 40px; }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>,
        document.body
    );
};

export default AddressSelector;
