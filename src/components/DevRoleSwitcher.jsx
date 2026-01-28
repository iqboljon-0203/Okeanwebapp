import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Shield, Truck, User, Settings, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setStorageItem, getStorageItem } from '../utils/storage';

const DevRoleSwitcher = () => {
  // Only show in Development
  if (!import.meta.env.DEV) return null;

  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  // Change to Bottom LEFT to avoid collisions
  const [position, setPosition] = useState({ bottom: 120, left: 20 }); 
  
  // Persist strict mode role
  const handleRoleChange = (newRole) => {
    setStorageItem('dev_forced_role', newRole);
    updateProfile({ role: newRole });
    
    console.log(`Switched to ${newRole} mode`);
    
    // Auto-navigate
    if (newRole === 'admin') navigate('/admin');
    else if (newRole === 'courier') navigate('/courier');
    else navigate('/');
  };

  const roles = [
    { id: 'user', icon: User, label: 'User', color: 'bg-blue-500' },
    { id: 'courier', icon: Truck, label: 'Courier', color: 'bg-orange-500' },
    { id: 'admin', icon: Shield, label: 'Admin', color: 'bg-red-600' }
  ];

  return (
    <div className="fixed z-[99999]" style={{ bottom: position.bottom, left: position.left }}>
       {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="size-14 rounded-full bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-indigo-200"
        title="Dev Tools"
      >
        {isOpen ? <X size={24} /> : <Settings size={28} className="animate-spin-slow" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-20 left-0 w-64 bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <h4 className="text-white font-bold text-sm">Dev Mode: {user?.role?.toUpperCase()}</h4>
                <div className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded border border-green-800">
                    Active
                </div>
            </div>
            
            <div className="space-y-2">
                {roles.map((role) => {
                    const Icon = role.icon;
                    const isActive = user?.role === role.id;
                    
                    return (
                        <button
                            key={role.id}
                            onClick={() => handleRoleChange(role.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                                isActive 
                                    ? `${role.color} text-white shadow-lg shadow-white/10 ring-2 ring-white/20` 
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <Icon size={18} />
                            <span className="font-medium text-sm">{role.label}</span>
                            {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />}
                        </button>
                    )
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700 text-[10px] text-slate-500 text-center">
                Only visible in localhost
            </div>
        </div>
      )}
      
      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default DevRoleSwitcher;
