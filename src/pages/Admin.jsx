import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Edit2, MapPin, Phone, Trash2, List, Settings, Upload, Loader2, Home, LayoutDashboard, ShoppingBag, Layers, Search, PlusCircle, X, Bell, ShoppingCart, AlertTriangle, CheckCircle, CheckCircle2, Truck, LogOut, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUser } from '../context/UserContext';

const Admin = () => {
    const { logout } = useUser();
    const navigate = useNavigate();
    // ... existing state

    // ... existing functions

    const handleLogout = () => {
        if (window.confirm("Admin panelidan chiqishni xohlaysizmi?")) {
            logout();
            navigate('/');
        }
    };

    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'products' | 'categories' | 'notifications'
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Stats
    const [stats, setStats] = useState({
        totalSales: 0,
        todayOrders: 0,
        totalProducts: 0,
        newOrders: 0
    });

    // Product Form State
    const [editingProduct, setEditingProduct] = useState(null); 
    const [productForm, setProductForm] = useState({
        name: '', price: '', discount_price: '', category_id: '',
        image_url: '', stock: 100, unit: 'dona', step: 1, is_popular: false
    });
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);

    // Category Form State
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        id: '', name: '', image_url: ''
    });
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

    useEffect(() => {
        loadAllData();

        const ordersSubscription = supabase
            .channel('public:orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                setOrders(prev => [payload.new, ...prev]);
                // Re-calculate stats efficiently or just refetch
                fetchOrders(); 
                toast.success('Yangi buyurtma keldi!');
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersSubscription);
        };
    }, []);

    useEffect(() => {
        if(orders.length > 0) updateStats(orders, products);
    }, [orders, products]);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([fetchOrders(), fetchProducts(), fetchCategories(), fetchCouriers()]);
        setLoading(false);
    };

    const updateStats = (currentOrders, currentProducts) => {
        const today = new Date().toISOString().split('T')[0];
        
        const totalSales = currentOrders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
            
        const todayOrders = currentOrders.filter(o => o.created_at.startsWith(today)).length;
        const newOrders = currentOrders.filter(o => o.status === 'new').length;

        setStats({
            totalSales,
            todayOrders,
            newOrders,
            totalProducts: currentProducts.length
        });
    };

    const fetchOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(name))')
            .order('created_at', { ascending: false });
        if (!error) setOrders(data || []);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
        if (!error) setProducts(data || []);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
        if (!error) setCategories(data || []);
    };

    const fetchCouriers = async () => {
        // 1. Get all users with role 'courier'
        const { data: users, error } = await supabase.from('profiles').select('*').eq('role', 'courier');
        if (error || !users) return;

        // 2. Get all orders to calculate stats
        const { data: allOrders } = await supabase.from('orders').select('id, courier_id, status');
        
        console.log('DEBUG: Couriers:', users);
        console.log('DEBUG: Orders:', allOrders);

        // 3. Match stats
        const stats = users.map(user => {
            // UUID ni ishlatamiz, chunki orders.courier_id uuid
            const uid = user.id; 
            const userOrders = allOrders.filter(o => o.courier_id && String(o.courier_id) === String(uid));
            
            return {
                ...user,
                accepted_count: userOrders.length,
                delivered_count: userOrders.filter(o => o.status === 'delivered').length
            };
        });
        setCouriers(stats);
    };

    // --- Image Upload Logic ---
    const handleImageUpload = async (e, type = 'product') => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) return toast.error("Rasm hajmi 5MB dan kam bo'lishi kerak");
        if (!file.type.startsWith('image/')) return toast.error("Faqat rasm yuklash mumkin");

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            if (type === 'product') {
                setProductForm(prev => ({ ...prev, image_url: data.publicUrl }));
            } else {
                setCategoryForm(prev => ({ ...prev, image_url: data.publicUrl }));
            }
            toast.success("Rasm yuklandi!");
        } catch (error) {
            console.error(error);
            toast.error("Rasm yuklashda xatolik: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    // --- Order Logic ---
    const handleUpdateStatus = async (orderId, status) => {
        try {
            // 1. Get current order info first
            const { data: order, error: fetchError } = await supabase
                .from('orders')
                .select('status, total_price, user_id')
                .eq('id', orderId)
                .single();
            
            if (fetchError) throw fetchError;

            // 2. Database update payload
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (updateError) throw updateError;

            // 3. POINTS LOGIC: If changing to 'delivered' AND it wasn't delivered before
            if (status === 'delivered' && order.status !== 'delivered' && order.user_id) {
                // Calculate 1% Cashback (e.g. 100,000 so'm -> 1000 ball)
                const cashbackPoints = Math.floor(parseFloat(order.total_price) * 0.01);
                
                if (cashbackPoints > 0) {
                    // Update user profile
                    const { error: profileError } = await supabase.rpc('increment_points', { 
                        user_id_param: order.user_id, 
                        points_to_add: cashbackPoints 
                    });

                    // Fallback if RPC doesn't exist (Direct Update - risky with race conditions but okay for MVP)
                    if (profileError) {
                        console.warn("RPC failed, trying direct update", profileError);
                        const { data: profile } = await supabase.from('profiles').select('points').eq('telegram_id', order.user_id).single();
                        const currentPoints = profile?.points || 0;
                        await supabase
                            .from('profiles')
                            .update({ points: currentPoints + cashbackPoints })
                            .eq('telegram_id', order.user_id);
                    }
                    
                    toast.success(`Buyurtma yetkazildi! Userga ${cashbackPoints} ball berildi.`);
                } else {
                    toast.success('Status yangilandi (yetkazildi)');
                }
            } else {
                toast.success('Status yangilandi');
            }

            // UI Update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
            
            // Recalculate stats immediately
            const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status } : o);
            updateStats(updatedOrders, products);

        } catch (error) {
            console.error(error);
            toast.error('Xatolik: ' + error.message);
        }
    };

    // --- Product Logic ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        
        const originalPrice = parseFloat(productForm.price);
        const discountAmount = productForm.discount_price ? parseFloat(productForm.discount_price) : 0;
        
        // Agar chegirma kiritilgan bo'lsa, asl narxdan ayiramiz
        // Eslatma: Bazaga 'discount_price' ustuniga yakuniy chegirmali narx yoziladi
        const finalPrice = discountAmount > 0 ? (originalPrice - discountAmount) : null;

        const payload = { 
            ...productForm,
            price: originalPrice,
            discount_price: finalPrice, // Bazaga hisoblangan narx ketadi
            stock: parseInt(productForm.stock),
            step: parseFloat(productForm.step)
        };
        
        if (!payload.category_id) return toast.error("Kategoriya tanlang!");

        let error;
        if (editingProduct) {
            ({ error } = await supabase.from('products').update(payload).eq('id', editingProduct.id));
        } else {
            ({ error } = await supabase.from('products').insert([payload]));
        }

        if (!error) {
            toast.success(editingProduct ? 'Mahsulot yangilandi' : 'Mahsulot qo\'shildi');
            setEditingProduct(null);
            setProductForm({ name: '', price: '', discount_price: '', category_id: '', image_url: '', stock: 100, unit: 'dona', step: 1, is_popular: false });
            setIsProductFormOpen(false);
            fetchProducts();
        } else {
            toast.error('Xatolik: ' + error.message);
        }
    };

    const editProduct = (p) => {
        setEditingProduct(p);
        
        // Chegirma summasini qayta hisoblash: Asl narx - Hozirgi narx
        const discountAmount = p.discount_price ? (p.price - p.discount_price) : '';
        
        setProductForm({
            name: p.name, price: p.price, 
            discount_price: discountAmount, // Formaga faqat chegirma miqdorini qo'yamiz
            category_id: p.category_id, image_url: p.image_url,
            stock: p.stock, unit: p.unit, step: p.step, is_popular: p.is_popular
        });
        setIsProductFormOpen(true);
    };

    const deleteProduct = async (id) => {
        if(!window.confirm('O\'chirishni xohlaysizmi?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        
        if(!error) {
            setProducts(products.filter(p => p.id !== id));
            toast.success('O\'chirildi');
        } else {
            console.error("Delete Error:", error);
            if (error.code === '23503') {
                toast.error("Bu mahsulot buyurtmalarda qatnashganligi uchun o'chirib bo'lmaydi!");
            } else {
                toast.error('Xatolik: ' + error.message);
            }
        }
    };

    // --- Category Logic ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if(!categoryForm.id || !categoryForm.name) return toast.error("Barcha maydonlarni to'ldiring");

        let error;
        if (editingCategory) {
            const { id, ...updatePayload } = categoryForm;
            ({ error } = await supabase.from('categories').update(updatePayload).eq('id', editingCategory.id));
        } else {
            ({ error } = await supabase.from('categories').insert([categoryForm]));
        }

        if (!error) {
            toast.success(editingCategory ? 'Kategoriya yangilandi' : 'Kategoriya yaratildi');
            setEditingCategory(null);
            setCategoryForm({ id: '', name: '', image_url: '' });
            setIsCategoryFormOpen(false);
            fetchCategories();
        } else {
            toast.error('Xatolik: ' + error.message);
        }
    };

    const deleteCategory = async (id) => {
        if(!window.confirm('Diqqat! Bu kategoriya ichidagi mahsulotlar ham o\'chib ketishi mumkin. Rozimisiz?')) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if(!error) {
            setCategories(categories.filter(c => c.id !== id));
            toast.success('Kategoriya o\'chirildi');
        } else {
            toast.error("O'chirishda xatolik (Avval mahsulotlarni o'chiring)");
        }
    };

    // --- Render Functions ---

    const renderDashboard = () => (
        <div className="dashboard-view animate-up">
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="icon"><Home size={24} color="#fff" /></div>
                    <div className="info">
                        <span>Jami Savdo</span>
                        <h3>{stats.totalSales.toLocaleString()} so'm</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon orange"><ShoppingBag size={24} color="#fff" /></div>
                    <div className="info">
                        <span>Bugungi buyurtmalar</span>
                        <h3>{stats.todayOrders} ta</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon blue"><Package size={24} color="#fff" /></div>
                    <div className="info">
                        <span>Jami mahsulotlar</span>
                        <h3>{stats.totalProducts} ta</h3>
                    </div>
                </div>
            </div>

            <div className="section-title">
                <h3>So'nggi buyurtmalar</h3>
                <button onClick={() => setActiveTab('orders')}>Barchasi</button>
            </div>

            <div className="recent-orders">
                {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="recent-order-row">
                        <div className="left">
                            <span className="id">#{order.id}</span>
                            <span className="price">{parseInt(order.total_price).toLocaleString()} so'm</span>
                        </div>
                        <span className={`status-pill ${order.status}`}>{order.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderOrders = () => (
        <div className="orders-list animate-up">
            {orders.length === 0 && <p className="empty-msg">Buyurtmalar yo'q</p>}
            {orders.map(order => (
                <div key={order.id} className={`order-card status-${order.status}`}>
                    <div className="order-header">
                        <div className="o-info">
                            <span className="order-id">№{order.id}</span>
                            <span className="order-date">{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <span className={`status-badge ${order.status}`}>
                            {order.status === 'new' ? 'Yangi' : 
                             order.status === 'pending' ? 'Tayyorlanmoqda' : 
                             order.status === 'delivered' ? 'Yetkazildi' : 
                             order.status === 'canceled' ? 'Bekor qilindi' : order.status}
                        </span>
                    </div>
                    <div className="customer-info">
                        <div className="info-row">
                            <Phone size={16} color="var(--primary)" />
                            <a href={`tel:${order.phone}`} className="phone-link">{order.phone}</a>
                        </div>
                        <div className="info-row">
                            <MapPin size={16} color="var(--primary)" />
                            <span>{order.address_text}</span>
                        </div>
                        {order.location_lat && (
                            <a 
                                href={`https://yandex.com/maps/?pt=${order.location_long},${order.location_lat}&z=18&l=map`} 
                                target="_blank" rel="noopener noreferrer" className="map-link-btn"
                            >
                                <MapPin size={14} /> Xaritada ko'rish
                            </a>
                        )}
                    </div>
                    <div className="order-items">
                        {order.order_items?.map((item, idx) => (
                            <div key={idx} className="order-item">
                                <span className="item-name">{item.product?.name}</span>
                                <div className="item-meta">
                                    <span className="qty">{item.quantity} {item.product?.unit || 'dona'}</span>
                                    <span className="price">x {parseInt(item.price_at_time).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="order-footer">
                        <div className="total-box">
                            <span>Jami:</span>
                            <span className="amount">{parseInt(order.total_price).toLocaleString()} so'm</span>
                        </div>
                        
                        <div className="order-actions-grid">
                            {/* Admin only views status, no longer accepts orders */}
                            {order.status === 'delivered' && (
                                <div className="status-done">
                                    <CheckCircle size={18} /> Muvaffaqiyatli yakunlandi
                                </div>
                            )}
                            {order.status === 'canceled' && (
                                <div className="status-cancelled">
                                    <X size={18} /> Buyurtma bekor qilingan
                                </div>
                            )}
                            {/* Show Info for active/new orders */}
                            {(order.status === 'new' || order.status === 'pending') && (
                                <div className="status-info text-center text-gray-400 font-bold p-3 bg-gray-50 rounded-xl">
                                    {order.status === 'new' ? 'Kuryer kutilmoqda...' : 'Kuryer yetkazmoqda...'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderProducts = () => (
        <div className="products-manager animate-up">
            <button className="add-float-btn" onClick={() => { 
                setEditingProduct(null); 
                setProductForm({ name: '', price: '', discount_price: '', category_id: '', image_url: '', stock: 100, unit: 'dona', step: 1, is_popular: false });
                setIsProductFormOpen(true);
            }}>
                <PlusCircle size={20} /> Yangi mahsulot
            </button>

            {isProductFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingProduct ? 'Tahrirlash' : 'Yangi mahsulot'}</h3>
                            <button onClick={() => setIsProductFormOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleProductSubmit} className="admin-form">
                            <div className="form-grid">
                                <input 
                                    placeholder="Nomi" value={productForm.name} 
                                    onChange={e => setProductForm({...productForm, name: e.target.value})} required 
                                />
                                <select 
                                    value={productForm.category_id}
                                    onChange={e => setProductForm({...productForm, category_id: e.target.value})}
                                    required
                                    className="custom-select"
                                >
                                    <option value="">Kategoriya tanlang</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-grid three-cols">
                                <input type="number" placeholder="Narxi" value={productForm.price} 
                                    onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                                <input type="number" placeholder="Chegirma summasi (ayriladi)" value={productForm.discount_price} 
                                    onChange={e => setProductForm({...productForm, discount_price: e.target.value})} />
                                <input type="number" placeholder="Ombor" value={productForm.stock} 
                                    onChange={e => setProductForm({...productForm, stock: e.target.value})} />
                            </div>

                            <div className="form-grid three-cols">
                                <select value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})}>
                                    <option value="dona">Dona</option>
                                    <option value="kg">Kg</option>
                                    <option value="litr">Litr</option>
                                </select>
                                <input type="number" step="0.1" placeholder="Qadam" 
                                    value={productForm.step} onChange={e => setProductForm({...productForm, step: e.target.value})} />
                            </div>

                            <div className="form-group-full">
                                <label className="upload-btn-label">
                                    {uploading ? <Loader2 className="spin" size={20}/> : <Upload size={20} />}
                                    <span>{uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleImageUpload(e, 'product')}
                                        style={{display: 'none'}}
                                    />
                                </label>
                                {productForm.image_url && (
                                    <div className="img-preview">
                                        <img src={productForm.image_url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                        <button type="button" className="remove-img" onClick={() => setProductForm({...productForm, image_url: ''})}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={productForm.is_popular}
                                    onChange={e => setProductForm({...productForm, is_popular: e.target.checked})}
                                />
                                <span>Ommabop mahsulot</span>
                            </label>

                            <button type="submit" className="submit-btn" disabled={uploading}>
                                {editingProduct ? 'Saqlash' : 'Qo\'shish'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="products-list">
                {products.length === 0 && <p className="empty-msg">Mahsulotlar yo'q</p>}
                {products.map(p => (
                    <div key={p.id} className="product-item-row">
                        <img src={p.image_url} alt="" className="p-img" />
                        <div className="p-info">
                            <h4>{p.name}</h4>
                            <p className="price">
                                {p.discount_price ? (
                                    <>
                                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px', marginRight: '6px' }}>
                                            {parseInt(p.price).toLocaleString()}
                                        </span>
                                        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                            {parseInt(p.discount_price).toLocaleString()}
                                        </span>
                                    </>
                                ) : (
                                    parseInt(p.price).toLocaleString()
                                )}
                            </p>
                            <span className="badge-sm">{categories.find(c => c.id === p.category_id)?.name || p.category_id}</span>
                        </div>
                        <div className="p-actions">
                            <button onClick={() => editProduct(p)} className="edit"><Edit2 size={18} /></button>
                            <button onClick={() => deleteProduct(p.id)} className="delete"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCategories = () => (
        <div className="categories-manager animate-up">
            <button className="add-float-btn" onClick={() => { 
                setEditingCategory(null);
                setCategoryForm({ id: '', name: '', image_url: '' });
                setIsCategoryFormOpen(true); 
            }}>
                <PlusCircle size={20} /> Yangi kategoriya
            </button>

            {isCategoryFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Tahrirlash' : 'Yangi kategoriya'}</h3>
                            <button onClick={() => setIsCategoryFormOpen(false)}><X size={24} /></button>
                        </div>
                         <form onSubmit={handleCategorySubmit} className="admin-form">
                            <div className="form-grid">
                                <input 
                                    placeholder="Nomi" value={categoryForm.name} 
                                    onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required 
                                />
                                <input 
                                    placeholder="Slug (id)" value={categoryForm.id} 
                                    onChange={e => setCategoryForm({...categoryForm, id: e.target.value})} 
                                    required disabled={!!editingCategory} 
                                />
                            </div>
                            
                            <div className="form-group-full">
                                <label className="upload-btn-label">
                                    {uploading ? <Loader2 className="spin" size={20}/> : <Upload size={20} />}
                                    <span>{uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleImageUpload(e, 'category')}
                                        style={{display: 'none'}}
                                    />
                                </label>
                                {categoryForm.image_url && (
                                    <div className="img-preview">
                                        <img src={categoryForm.image_url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                        <button type="button" className="remove-img" onClick={() => setCategoryForm({...categoryForm, image_url: ''})}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="submit-btn" disabled={uploading}>
                                {editingCategory ? 'Saqlash' : 'Yaratish'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="products-list">
                {categories.map(cat => (
                    <div key={cat.id} className="product-item-row">
                        {cat.image_url && <img src={cat.image_url} alt="" className="p-img" />}
                        <div className="p-info">
                            <h4>{cat.name}</h4>
                            <p className="sub-text">{cat.id}</p>
                        </div>
                        <div className="p-actions">
                            <button onClick={() => { setEditingCategory(cat); setCategoryForm(cat); setIsCategoryFormOpen(true); }} className="edit"><Edit2 size={18} /></button>
                            <button onClick={() => deleteCategory(cat.id)} className="delete"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCouriers = () => (
        <div className="couriers-list animate-up">
             {couriers.length === 0 && <p className="empty-msg">Kuryerlar topilmadi</p>}
             {couriers.map(courier => (
                 <div key={courier.id} className="courier-card">
                     <div className="c-avatar">
                        <Users size={24} color="#fff" />
                     </div>
                     <div className="c-info">
                         <h4>{courier.full_name || courier.name || 'Kuryer'}</h4>
                         <p className="courier-username">
                            {courier.username ? `@${courier.username}` : (courier.phone_number || 'Username yo\'q')}
                         </p>
                     </div>
                     <div className="c-stats">
                         <div className="c-stat-box">
                             <span className="lbl">Qabul</span>
                             <span className="val">{courier.accepted_count}</span>
                         </div>
                         <div className="c-stat-box green">
                             <span className="lbl">Yetkazdi</span>
                             <span className="val">{courier.delivered_count}</span>
                         </div>
                     </div>
                 </div>
             ))}
             
             <style>{`
                .courier-card {
                    background: #fff; padding: 15px; border-radius: 18px;
                    display: flex; align-items: center; gap: 15px; margin-bottom: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                }
                .c-avatar {
                    width: 50px; height: 50px; background: #00302D; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                }
                .c-info { flex: 1; }
                .c-info h4 { font-size: 16px; font-weight: 700; color: #2d3436; margin: 0; }
                .c-info p { font-size: 13px; color: #636e72; margin: 2px 0 0 0; }
                .c-info .courier-username { color: #0088cc; font-weight: 500; }
                
                .c-stats { display: flex; gap: 10px; }
                .c-stat-box {
                    background: #f8f9fa; padding: 6px 12px; border-radius: 10px;
                    display: flex; flex-direction: column; align-items: center; min-width: 60px;
                }
                .c-stat-box.green { background: #e8f5e9; }
                .c-stat-box.green .val { color: #00b894; }
                
                .c-stat-box .lbl { font-size: 10px; font-weight: 700; color: #b2bec3; text-transform: uppercase; }
                .c-stat-box .val { font-size: 16px; font-weight: 800; color: #2d3436; }
             `}</style>
        </div>
    );

    const renderNotifications = () => {
        // Derive notifications from orders and products
        const orderNotifs = orders.map(o => ({
            id: 'ord-'+o.id,
            type: 'order',
            title: o.status === 'new' ? 'Yangi buyurtma!' : o.status === 'delivered' ? 'Buyurtma yetkazildi' : 'Buyurtma holati',
            text: `№${o.id} raqamli buyurtma ${o.status === 'new' ? 'kelib tushdi' : 'o\'zgartirildi'}. Jami: ${parseInt(o.total_price).toLocaleString()} so'm`,
            time: new Date(o.created_at),
            isNew: o.status === 'new'
        }));

        const stockNotifs = products
            .filter(p => p.stock < 10)
            .map(p => ({
                id: 'stk-'+p.id,
                type: 'alert',
                title: 'Mahsulot tugamoqda!',
                text: `"${p.name}" mahsulotidan atigi ${p.stock} ta qoldi.`,
                time: new Date(), // For now just showing as current alert
                isNew: true
            }));

        const allNotifs = [...orderNotifs, ...stockNotifs].sort((a,b) => b.time - a.time);

        return (
            <div className="notifications-list animate-up">
                {allNotifs.length === 0 && <p className="empty-msg">Bildirishnomalar yo'q</p>}
                {allNotifs.map(n => (
                    <div key={n.id} className={`notification-card ${n.isNew ? 'unread' : ''}`}>
                        <div className={`notif-icon-box ${n.type}`}>
                            {n.type === 'order' ? <Package size={20} /> : <AlertTriangle size={20} />}
                            {n.isNew && <span className="red-dot"></span>}
                        </div>
                        <div className="notif-content">
                            <div className="notif-header">
                                <h4>{n.title}</h4>
                                <span className="time">
                                    {n.time.toLocaleDateString() === new Date().toLocaleDateString() 
                                        ? `Bugun, ${n.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                                        : n.time.toLocaleDateString()
                                    }
                                </span>
                            </div>
                            <p>{n.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="admin-container">
            <div className="admin-header-detailed">
                <div className="brand-box">
                    <div className="brand-logo-circle">
                        <ShoppingCart size={22} color="#FF4B3A" fill="#FF4B3A" style={{ marginRight: '2px' }} />
                    </div>
                    <div className="brand-text-col">
                        <h1 className="okean-title">OKEAN</h1>
                        <p className="market-subtitle">SUPERMARKET</p>
                    </div>
                </div>
                
                <div className="header-actions">
                    <button 
                        className={`notif-btn ${activeTab === 'notifications' ? 'active-notif' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell size={24} color={activeTab === 'notifications' ? '#fff' : '#00302D'} />
                        {stats.newOrders > 0 && <span className="notif-badge">{stats.newOrders}</span>}
                    </button>
                    <button className="notif-btn logout-btn" onClick={handleLogout}>
                        <LogOut size={22} color="#FF4B3A" />
                    </button>
                </div>
            </div>

            <div className="page-title">
                 <h2>{activeTab === 'dashboard' ? 'Umumiy hisobot' :
                     activeTab === 'orders' ? 'Buyurtmalar' :
                     activeTab === 'products' ? 'Mahsulotlar' : 
                     activeTab === 'orders' ? 'Buyurtmalar' :
                     activeTab === 'products' ? 'Mahsulotlar' : 
                     activeTab === 'categories' ? 'Kategoriyalar' : 
                     activeTab === 'couriers' ? 'Kuryerlar Statistkasi' : 'Bildirishnomalar'}
                </h2>
            </div>

            <div className="admin-content">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'products' && renderProducts()}
                {activeTab === 'categories' && renderCategories()}
                {activeTab === 'couriers' && renderCouriers()}
                {activeTab === 'notifications' && renderNotifications()}
            </div>

            <div className="admin-bottom-nav">
                <button 
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <LayoutDashboard size={24} />
                    <span>Asosiy</span>
                </button>
                <button 
                    className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    <div className="icon-badge-box">
                        <List size={24} />
                        {stats.newOrders > 0 && <span className="badge-dot"></span>}
                    </div>
                    <span>Buyurtmalar</span>
                </button>
                <button 
                    className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    <Package size={24} />
                    <span>Tovarlar</span>
                </button>
                <button 
                    className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    <Layers size={24} />
                    <span>Katalog</span>
                </button>
                <button 
                    className={`nav-item ${activeTab === 'couriers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('couriers')}
                >
                    <Users size={24} />
                    <span>Kuryerlar</span>
                </button>
            </div>

            <style>{`
                .admin-container { padding: 20px; background: #f2f2f2; min-height: 100vh; padding-bottom: 110px; padding-top: 10px; }
                
                .admin-header-detailed { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: #fff; padding: 15px 20px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
                .brand-box { display: flex; align-items: center; gap: 12px; }
                .header-actions { display: flex; gap: 10px; align-items: center; }
                
                .brand-logo-circle { 
                    width: 48px; height: 48px; 
                    background: #00302D; 
                    border-radius: 50%; 
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                    border: 2px solid #FFD700;
                }
                
                .brand-text-col { display: flex; flex-direction: column; justify-content: center; }
                .okean-title { font-size: 20px; font-weight: 900; color: #FF4B3A; line-height: 1; letter-spacing: 0.5px; margin: 0; }
                .market-subtitle { font-size: 11px; font-weight: 700; color: #00302D; letter-spacing: 1px; margin: 2px 0 0 0; text-transform: uppercase; }
                
                .notif-btn { position: relative; width: 44px; height: 44px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #f0f0f0; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .notif-btn:active { transform: scale(0.95); }
                .notif-badge { position: absolute; top: -4px; right: -4px; background: #FF4B3A; color: #fff; font-size: 11px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
                
                .page-title h2 { font-size: 22px; font-weight: 800; margin: 0 0 20px 10px; color: #00302D; }

                /* Stats Cards */
                .stats-grid { display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 30px; }
                .stat-card { background: #fff; padding: 20px; border-radius: 24px; display: flex; align-items: center; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
                .stat-card .icon { width: 48px; height: 48px; border-radius: 14px; background: #FF4B3A; display: flex; align-items: center; justify-content: center; }
                .stat-card .icon.orange { background: #FFA502; }
                .stat-card .icon.blue { background: #2E86DE; }
                .stat-card .info h3 { font-size: 22px; font-weight: 800; margin: 0; color: #2d3436; }
                .stat-card .info span { font-size: 13px; color: #636e72; font-weight: 600; }
                
                .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .section-title h3 { font-size: 18px; font-weight: 800; color: #2d3436; margin: 0; }
                .section-title button { color: #FF4B3A; font-weight: 700; font-size: 14px; background: none; border: none; }

                /* Recent Orders */
                .recent-order-row { background: #fff; padding: 15px; border-radius: 16px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
                .recent-order-row .left { display: flex; flex-direction: column; }
                .recent-order-row .id { font-size: 12px; color: #aaa; font-weight: 600; }
                .recent-order-row .price { font-size: 16px; font-weight: 800; color: #2d3436; }
                .status-pill { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-pill.new { background: #ffebeb; color: #ff4b3a; }
                .status-pill.pending { background: #fff3cd; color: #e1b12c; }
                .status-pill.delivered { background: #e8f5e9; color: #00b894; }

                /* Order Card */
                .order-card { background: #fff; border-radius: 20px; padding: 18px; margin-bottom: 15px; }
                .order-header { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
                .order-id { font-weight: 700; color: #2d3436; }
                .order-total { font-size: 18px; font-weight: 900; text-align: right; margin-top: 10px; }
                .btn-action { width: 100%; padding: 12px; background: #000; color: #fff; border-radius: 12px; font-weight: 700; margin-top: 10px; border: none; }
                .btn-success { background: #00b894; }
                .status-badge { padding: 4px 8px; border-radius: 6px; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; height: fit-content; }
                .status-badge.new { background: #ffebeb; color: #FF4B3A; }
                .status-badge.pending { background: #fff8e1; color: #fbc02d; }
                .status-badge.delivered { background: #e8f5e9; color: #43a047; }


                /* Bottom Nav */
                .admin-bottom-nav { 
                    position: fixed; bottom: 0; left: 0; right: 0; 
                    background: #fff; height: 80px; display: flex; justify-content: space-around; align-items: center;
                    border-top: 1px solid #f1f1f1; border-radius: 24px 24px 0 0; 
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.05); z-index: 1000;
                    max-width: 500px; margin: 0 auto;
                }
                .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #b2bec3; background: none; border: none; flex: 1; }
                .nav-item.active { color: #FF4B3A; }
                .nav-item span { font-size: 10px; font-weight: 700; }
                .icon-badge-box { position: relative; }
                .badge-dot { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #FF4B3A; border-radius: 50%; border: 2px solid #fff; }

                /* Floating Button */
                .add-float-btn {
                    width: 100%; padding: 16px; background: #000; color: #fff; border-radius: 16px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    font-weight: 800; font-size: 16px; border: none; margin-bottom: 20px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                }

                /* Modals */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); z-index: 2000;
                    display: flex; align-items: flex-end; justify-content: center;
                    padding: 0;
                }
                .modal-content {
                    background: #fff; width: 100%; max-width: 500px;
                    border-radius: 24px 24px 0 0; padding: 20px;
                    max-height: 90vh; overflow-y: auto;
                    animation: slideUp 0.3s ease-out;
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

                /* NEW ORDER CARD STYLES */
                .order-card { 
                    background: #fff; border-radius: 20px; padding: 20px; margin-bottom: 20px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f0f0f0;
                }
                .order-header { 
                    display: flex; justify-content: space-between; margin-bottom: 15px; 
                    padding-bottom: 15px; border-bottom: 1px solid #f5f5f5; 
                }
                .order-id { font-weight: 800; color: #2d3436; font-size: 16px; }
                .order-date { font-size: 12px; color: #aaa; display: block; margin-top: 4px; }
                
                .customer-info { 
                    background: #F8F9FA; padding: 15px; border-radius: 12px; margin-bottom: 15px; 
                    display: flex; flex-direction: column; gap: 10px;
                }
                .info-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #2d3436; font-weight: 500; }
                .phone-link { color: #007AFF; font-weight: 700; text-decoration: none; }
                .map-link-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: #fff; color: #2d3436; padding: 8px 12px; border-radius: 8px;
                    font-size: 12px; font-weight: 600; text-decoration: none;
                    border: 1px solid #e1e1e1; width: fit-content; margin-top: 5px;
                }

                .order-items { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
                .order-item { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
                .item-name { font-weight: 600; color: #2d3436; }
                .item-meta { display: flex; gap: 10px; color: #636e72; font-size: 13px; }
                .item-meta .price { font-weight: 700; color: #2d3436; }

                .order-footer { border-top: 2px dashed #f0f0f0; padding-top: 15px; }
                .total-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .total-box span { font-size: 14px; color: #636e72; font-weight: 600; }
                .total-box .amount { font-size: 20px; color: #2d3436; font-weight: 900; }

                .order-actions-grid { display: grid; gap: 10px; grid-template-columns: 1fr; }
                
                .btn-action { 
                    width: 100%; padding: 14px; border-radius: 12px; border: none; 
                    font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;
                    cursor: pointer; transition: 0.2s;
                }
                .btn-accept { background: #00b894; color: #fff; box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3); }
                .btn-delivered { background: #0984e3; color: #fff; box-shadow: 0 4px 15px rgba(9, 132, 227, 0.3); }
                .btn-cancel { background: #fff; color: #FF4B3A; border: 1px solid #FF4B3A; }
                
                .status-done { 
                    background: #E8F5E9; color: #00b894; padding: 15px; border-radius: 12px; 
                    display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; 
                }
                .status-cancelled {
                    background: #FFEBEE; color: #FF4B3A; padding: 15px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700;
                }

                .status-badge { padding: 6px 10px; border-radius: 8px; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; height: fit-content; }
                .status-badge.new { background: #FFF5F4; color: #FF4B3A; }
                .status-badge.pending { background: #fff8e1; color: #fbc02d; }
                .status-badge.delivered { background: #e8f5e9; color: #43a047; }
                .status-badge.canceled { background: #f1f2f6; color: #7f8c8d; }
                .modal-header h3 { font-size: 20px; font-weight: 800; margin: 0; }
                .modal-header button { background: #f5f5f5; border: none; padding: 8px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

                /* Shared Styles */
                .admin-form { padding-bottom: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
                .three-cols { grid-template-columns: 1fr 1.2fr 0.8fr; }
                
                input:not([type="checkbox"]), select { width: 100%; padding: 16px; border-radius: 16px; border: 1px solid #eee; background: #f9f9f9; font-size: 16px; outline: none; font-weight: 500; }
                input:not([type="checkbox"]):focus, select:focus { border-color: #000; background: #fff; }
                .checkbox-label { display: flex; align-items: center; gap: 12px; margin: 15px 0; font-weight: 600; font-size: 15px; color: #00302D; cursor: pointer; background: #f9f9f9; padding: 12px; border-radius: 12px; }
                .checkbox-label input { width: 20px; height: 20px; accent-color: #FF4B3A; }
                .submit-btn { width: 100%; padding: 16px; background: #FF4B3A; color: #fff; border-radius: 16px; font-weight: 800; font-size: 16px; border: none; box-shadow: 0 10px 20px rgba(255, 75, 58, 0.2); }
                
                /* Upload */
                .upload-btn-label { width: 100%; padding: 20px; border: 2px dashed #e0e0e0; border-radius: 16px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 600; color: #888; cursor: pointer; background: #fafafa; }
                .img-preview { margin-top: 10px; height: 120px; width: 100%; border-radius: 14px; overflow: hidden; position: relative; border: 1px solid #eee; }
                .img-preview img { width: 100%; height: 100%; object-fit: contain; }
                .remove-img { position: absolute; top: 10px; right: 10px; background: #fff; padding: 5px; border-radius: 50%; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: none; color: #FF4B3A; }
                
                .product-item-row { display: flex; background: #fff; padding: 12px; border-radius: 16px; gap: 12px; align-items: center; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .p-img { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; background: #f5f5f5; }
                .p-info { flex: 1; }
                .p-info h4 { font-weight: 700; font-size: 15px; margin: 0 0 4px 0; color: #2d3436; }
                .p-info .price { font-size: 14px; color: #FF4B3A; font-weight: 800; }
                
                .p-actions button { width: 40px; height: 40px; border: none; background: #f5f5f5; border-radius: 12px; margin-left: 8px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #2d3436; transition: 0.2s; }
                .p-actions button:hover { background: #e0e0e0; transform: scale(1.05); }
                .p-actions button.delete { color: #ff3b30; background: #fff0f0; }
                
                .animate-up { animation: fadeUp 0.3s ease-out; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* Notifications */
                .notifications-list { display: flex; flex-direction: column; gap: 15px; padding-bottom: 20px; }
                .notification-card { background: #fff; padding: 15px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; gap: 15px; align-items: flex-start; position: relative; }
                .notification-card.unread { border-left: 4px solid #FF4B3A; }
                .notif-icon-box { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
                .notif-icon-box.order { background: #FFF5F4; color: #FF4B3A; }
                .notif-icon-box.alert { background: #FFF8E1; color: #FFA000; }
                .red-dot { position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background: #FF4B3A; border-radius: 50%; border: 2px solid #fff; }
                .notif-content { flex: 1; }
                .notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
                .notif-header h4 { font-size: 15px; font-weight: 800; color: #00302D; margin: 0; }
                .notif-header .time { font-size: 12px; color: #999; font-weight: 600; }
                .notif-content p { font-size: 13px; color: #666; margin: 0; line-height: 1.4; }
                .active-notif { background: #FF4B3A !important; border-color: #FF4B3A !important; }
            `}</style>
        </div>
    );
};

export default Admin;
