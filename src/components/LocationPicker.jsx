import React, { useEffect, useRef, useState } from 'react';
import { X, Navigation, MapPin, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationPicker = ({ onClose, onSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  // Default: Andijon
  const [coords, setCoords] = useState([40.7821, 72.3442]); 
  const [address, setAddress] = useState('Manzil yuklanmoqda...');
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 15, // Slightly zoomed out initially
        zoomControl: false,
        attributionControl: false
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    mapInstanceRef.current = map;
    setLoading(false);

    // Initial GPS Locate
    handleLocateMe(map);

    // Event Listener for Drag End
    map.on('moveend', () => {
        const center = map.getCenter();
        const newCoords = [center.lat, center.lng];
        setCoords(newCoords);
        fetchAddress(newCoords[0], newCoords[1]);
    });

    return () => {
        map.remove();
        mapInstanceRef.current = null;
    };
  }, []);

  const fetchAddress = async (lat, lng) => {
    setAddress('Manzil aniqlanmoqda...');
    
    try {
        // Use BigDataCloud API (Free, Client-side friendly, No CORS issues)
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=uz`
        );
        
        const data = await response.json();
        
        if (data) {
            // Construct address from available fields
            const parts = [
                data.locality,
                data.city,
                data.principalSubdivision,
                data.countryName
            ].filter((part) => part && part.trim() !== '');

            // Remove duplicates (e.g. if city and locality are same)
            const uniqueParts = [...new Set(parts)];
            
            setAddress(uniqueParts.join(', ') || "Noma'lum hudud");
        } else {
            setAddress("Manzil topilmadi");
        }
    } catch (err) {
        console.error("Geocoding failed:", err);
        // Fallback to coordinates
        setAddress(`Koordinata: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  const handleSearch = async (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      try {
          // Use Photon API (based on OSM) -> No CORS issues, fast, reliable
          const response = await fetch(
              `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`
          );
          const data = await response.json();
          
          if (data && data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].geometry.coordinates; // Photon returns [lng, lat]
              const newCoords = [lat, lng];
              
              if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView(newCoords, 16, { animate: true });
                  setCoords(newCoords);
                  fetchAddress(newCoords[0], newCoords[1]);
              }
          } else {
              alert("Manzil topilmadi. Boshqa nom bilan qidirib ko'ring.");
          }
      } catch (err) {
          console.error("Search failed", err);
          alert("Qidirishda xatolik bo'ldi. Internetni tekshiring.");
      } finally {
          setIsSearching(false);
      }
  };

  const handleLocateMe = (mapInstance = mapInstanceRef.current) => {
    if (!mapInstance) return;
    setLoading(true);

    if (!navigator.geolocation) {
        alert("Sizning qurilmangizda geolokatsiya qo'llab-quvvatlanmaydi.");
        setLoading(false);
        return;
    }

    const options = {
        enableHighAccuracy: true, // Force GPS
        timeout: 20000,           // Wait longer for satellite lock
        maximumAge: 0             // Do not use cached older positions
    };

    let bestAcc = Infinity;
    
    // We use watchPosition instead of getCurrentPosition because the first result
    // is often inaccurate (cell tower based). Subsequent updates are real GPS.
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            // Check if map still exists (component might be unmounted)
            const map = mapInstanceRef.current;
            if (!map) return;

            const { latitude, longitude, accuracy } = position.coords;
            console.log(`GPS Update: Lat: ${latitude}, Lng: ${longitude}, Acc: ${accuracy}m`);

            // Only update if this new position is better or we just started
            if (accuracy < bestAcc) {
                bestAcc = accuracy;
                
                try {
                    // Safe move
                    map.setView([latitude, longitude], 18, { animate: true });
                    setCoords([latitude, longitude]);
                    fetchAddress(latitude, longitude);

                    // If accuracy is very good (< 20 meters), we can stop and convert to static
                    if (accuracy < 20) {
                        navigator.geolocation.clearWatch(watchId);
                        setLoading(false);
                    }
                } catch (e) {
                    console.warn("Map update error:", e);
                }
            }
        },
        (error) => {
            console.warn("GPS Watching Error:", error);
            if (error.code === error.PERMISSION_DENIED) {
                 alert("Joylashuvni aniqlashga ruxsat berilmadi. Sozlamalarni tekshiring.");
                 setLoading(false);
                 navigator.geolocation.clearWatch(watchId);
            }
        },
        options
    );

    // Safety: Stop watching after 20 seconds
    const timeoutId = setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        setLoading(false);
        if (bestAcc === Infinity) {
             alert("GPS signali past. Qidiruvdan foydalaning yoki xaritani qo'lda suring.");
        }
    }, 20000);

    // Cleanup function to clear watch if component unmounts
    return () => {
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timeoutId);
    };
  };

  const handleConfirm = () => {
    onSelect({
      address: address, 
      coords: coords
    });
    onClose();
  };

  return createPortal(
    <div className="location-picker-overlay animate-fade-in">
      <div className="location-picker-card animate-up">
        
        <div className="picker-header">
          <h3>Yetkazib berish manzili</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
                <input 
                    type="text" 
                    placeholder="Qidirish... (Masalan: Andijon, Jalaquduq)" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-btn" disabled={isSearching}>
                    {isSearching ? <div className="spinner-sm"></div> : <Search size={20} />}
                </button>
            </form>
        </div>

        <div className="map-wrapper">
          <div ref={mapContainerRef} className="map-container" />
          
          {/* Static Center Pin */}
          <div className="center-pin">
            <MapPin size={42} color="#FF4B3A" fill="#FF4B3A" className="pin-icon" />
            <div className="pin-shadow"></div>
          </div>

          <div className="map-controls">
            <button className="control-btn" onClick={() => handleLocateMe()}>
                <Navigation size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="picker-footer">
          <div className="address-preview">
            <MapPin size={24} color="var(--primary)" />
            <div className="address-info">
                <span className="coords-label">Tanlangan joylashuv:</span>
                <p className="address-text">{address}</p>
            </div>
          </div>

          <button className="confirm-btn" onClick={handleConfirm}>
            Manzilni tasdiqlash
          </button>
        </div>

      </div>

      <style>{`
        .location-picker-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); z-index: 10000;
          display: flex; align-items: flex-end; backdrop-filter: blur(4px);
        }
        
        .location-picker-card {
          background: #fff; width: 100%; height: 90vh;
          border-radius: 24px 24px 0 0;
          display: flex; flex-direction: column; overflow: hidden;
        }

        .picker-header {
          padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid rgba(0,0,0,0.05); z-index: 2; background: #fff;
        }
        .picker-header h3 { font-size: 18px; font-weight: 800; color: var(--secondary); }
        .close-btn { background: #f2f2f2; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }

        .search-container {
            padding: 10px 20px; background: #fff; border-bottom: 1px solid #eee; z-index: 2;
        }
        .search-form {
            display: flex; gap: 8px;
        }
        .search-input {
            flex: 1; height: 44px; padding: 0 16px; border-radius: 12px;
            background: #f5f5f5; border: none; font-size: 15px; outline: none;
        }
        .search-input:focus { background: #eee; }
        .search-btn {
            width: 44px; height: 44px; background: var(--primary); color: #fff;
            border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }

        .map-wrapper { flex: 1; position: relative; background: #eee; overflow: hidden; }
        .map-container { width: 100%; height: 100%; z-index: 1; }

        .center-pin {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%); /* Center perfectly */
            z-index: 1000; pointer-events: none;
            display: flex; flex-direction: column; align-items: center;
            margin-top: -21px; /* Offset for pin height */
        }
        .pin-icon { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); stroke-width: 2px; stroke: #fff; }
        .pin-shadow {
            width: 10px; height: 4px; background: rgba(0,0,0,0.3);
            border-radius: 50%; margin-top: -2px; filter: blur(2px);
        }
        
        .map-controls {
            position: absolute; bottom: 40px; right: 20px;
            display: flex; flex-direction: column; gap: 10px; z-index: 1000;
        }
        .control-btn {
            width: 50px; height: 50px; background: #fff; border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15); color: var(--secondary);
        }
        .control-btn:active { transform: scale(0.95); }

        .picker-footer {
          padding: 20px 20px 30px 20px; background: #fff; z-index: 2;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
        }

        .address-preview {
          display: flex; gap: 12px; align-items: center; margin-bottom: 20px;
          padding: 16px; background: #F8F9FA; border-radius: 16px;
        }
        .address-info { flex: 1; overflow: hidden; }
        .coords-label { font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 2px;}
        .address-text {
          font-size: 15px; font-weight: 700; color: var(--secondary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        
        .confirm-btn {
          width: 100%; height: 56px; background: var(--primary); color: #fff;
          border-radius: 18px; font-weight: 800; font-size: 16px;
          box-shadow: 0 4px 15px rgba(255, 75, 58, 0.3);
        }
        .animate-spin { animation: spin 1s linear infinite; }
        .spinner-sm { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
};

export default LocationPicker;
