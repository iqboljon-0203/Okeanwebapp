import React, { useEffect, useRef, useState } from 'react';
import { X, Navigation, MapPin, Layers } from 'lucide-react';
import { createPortal } from 'react-dom';

const LocationPicker = ({ onClose, onSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  // Default: Andijon
  const [coords, setCoords] = useState([40.7821, 72.3442]); 
  const [address, setAddress] = useState('Manzil yuklanmoqda...');
  const [mapType, setMapType] = useState('yandex#satellite'); // 'yandex#map' or 'yandex#satellite'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMap = () => {
      if (!window.ymaps) return;
      
      window.ymaps.ready(() => {
        if (!mapContainerRef.current) return;
        
        // 1. Create Map
        const map = new window.ymaps.Map(mapContainerRef.current, {
            center: coords,
            zoom: 18,
            controls: ['zoomControl'],
            type: 'yandex#hybrid' // Default Satellite Hybrid
        }, {
            suppressMapOpenBlock: true
        });

        mapInstanceRef.current = map;
        setLoading(false);

        // 2. Handle Map Movements
        map.events.add('actionend', () => {
            const center = map.getCenter();
            setCoords(center); // Update state coords
            fetchAddress(center);
        });

        // Initial fetch
        fetchAddress(coords);
      });
    };

    if (window.ymaps) {
        initMap();
    } else {
        // Fallback or wait for load (usually loaded in index.html)
        const checkYmaps = setInterval(() => {
            if (window.ymaps) {
                clearInterval(checkYmaps);
                initMap();
            }
        }, 100);
        return () => clearInterval(checkYmaps);
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.destroy();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  const fetchAddress = (coords) => {
    setAddress('Manzil aniqlanmoqda...');
    window.ymaps.geocode(coords).then((res) => {
        const firstGeoObject = res.geoObjects.get(0);
        const name = firstGeoObject.getAddressLine();
        const shortName = [
            firstGeoObject.getLocalities()[0], 
            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
        ].filter(Boolean).join(', ');

        setAddress(shortName || name);
    });
  };

  const toggleMapType = () => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (mapType === 'yandex#hybrid') {
          map.setType('yandex#map');
          setMapType('yandex#map');
      } else {
          map.setType('yandex#hybrid');
          setMapType('yandex#hybrid');
      }
  };

  const handleLocateMe = () => {
    setLoading(true);
    
    // 1. Try Yandex Geolocation (More accurate provider)
    window.ymaps.geolocation.get({
        provider: 'auto', // Tries Yandex Network + Browser Geolocation
        mapStateAutoApply: true
    }).then((result) => {
        setLoading(false);
        const userCoords = result.geoObjects.get(0).geometry.getCoordinates();
        const map = mapInstanceRef.current;
        
        if (map) {
            map.setCenter(userCoords, 18, {
                checkZoomRange: true,
                duration: 300
            });
            // Update state
            setCoords(userCoords);
            fetchAddress(userCoords);
        }
    }).catch((err) => {
        console.log("Yandex Geo failed, trying native...", err);
        
        // 2. Fallback to Native Browser Geolocation (High Accuracy Mode)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setCenter([latitude, longitude], 18, {
                            checkZoomRange: true,
                            duration: 300
                        });
                        fetchAddress([latitude, longitude]);
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error("Native GPS Error", error);
                    setLoading(false);
                    alert("Joylashuvni aniqlab bo'lmadi. GPS yoqilganligini tekshiring.");
                },
                { 
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0 
                }
            );
        } else {
            setLoading(false);
        }
    });
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

        <div className="map-wrapper">
          <div ref={mapContainerRef} className="map-container" />
          
          {/* Static Center Pin */}
          <div className="center-pin">
            <MapPin size={42} color="#FF4B3A" fill="#FF4B3A" className="pin-icon" />
            <div className="pin-shadow"></div>
          </div>

          <div className="map-controls">
            <button className="control-btn" onClick={toggleMapType}>
                <Layers size={20} />
            </button>
            <button className="control-btn" onClick={handleLocateMe}>
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

        .map-wrapper { flex: 1; position: relative; background: #eee; overflow: hidden; }
        .map-container { width: 100%; height: 100%; }

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
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  );
};

export default LocationPicker;
