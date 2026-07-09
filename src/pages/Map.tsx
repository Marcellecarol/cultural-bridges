import React, { useState, useEffect } from 'react';
import { MapPin, Lock, CheckCircle2, Play, Layers, Thermometer, Wind } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useUser } from '../context/UserContext';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const lockedIcon = createIcon('rgba(255,255,255,0.3)');
const brIcon = createIcon('var(--accent-primary)');
const cnIcon = createIcon('var(--accent-secondary)');
const userIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="position: relative; width: 16px; height: 16px; background-color: #007AFF; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
           <div style="position: absolute; inset: -10px; border-radius: 50%; border: 2px solid #007AFF; opacity: 0.5; animation: ping 1.5s infinite;"></div>
           <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
         </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const MapUpdater: React.FC<{ userLocation: {lat: number, lng: number} | null }> = ({ userLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 4);
    }
  }, [userLocation, map]);
  return null;
};

const Map: React.FC = () => {
  const [selectedCommId, setSelectedCommId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapType, setMapType] = useState<'dark' | 'satellite'>('dark');
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosData, setSosData] = useState<{lat: number, lng: number} | null>(null);
  const { communities, exploreCommunity, language } = useUser();

  const selectedComm = communities.find(c => c.id === selectedCommId) || null;

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const routePositions: [number, number][] = [
    [communities[0].lat, communities[0].lng],
    [communities[1].lat, communities[1].lng]
  ];
  if (communities[2].status !== 'locked') {
    routePositions.push([communities[2].lat, communities[2].lng]);
  }

  const crossContinentPositions: [number, number][] = [
    [communities[0].lat, communities[0].lng],
    [communities[3].lat, communities[3].lng]
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <header style={{ padding: '20px', zIndex: 1000, backgroundColor: 'var(--bg-main)', position: 'relative' }}>
        <div className="text-secondary" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>
          {language === 'ZH' ? '互动地图' : 'INTERACTIVE MAP'}
        </div>
        <h1 style={{ fontSize: '24px', margin: '4px 0' }}>{language === 'ZH' ? '文化领地' : 'Cultural Territories'}</h1>
        <p className="text-secondary" style={{ fontSize: '14px' }}>
          {language === 'ZH' ? '滑动以探索' : 'Scroll to explore'}
        </p>
      </header>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#13221C' }}>
        <MapContainer 
          center={[0, 0]} 
          zoom={2} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          {mapType === 'dark' ? (
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          
          <MapUpdater userLocation={userLocation} />

          {/* Lines */}
          <Polyline positions={routePositions} pathOptions={{ color: 'rgba(212, 133, 10, 0.5)', dashArray: '5, 5', weight: 2 }} />
          <Polyline positions={crossContinentPositions} pathOptions={{ color: 'rgba(74, 158, 142, 0.3)', dashArray: '4, 4', weight: 2 }} />

          {/* Communities */}
          {communities.map(comm => {
            let icon = lockedIcon;
            if (comm.status !== 'locked') {
              icon = comm.country === 'BR' ? brIcon : cnIcon;
            }
            return (
              <Marker 
                key={comm.id} 
                position={[comm.lat, comm.lng]} 
                icon={icon}
                eventHandlers={{
                  click: () => {
                    setSelectedCommId(comm.id);
                  },
                }}
              >
              </Marker>
            );
          })}

          {/* User Location */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={100}>
              <Popup autoClose={false}>
                 <span style={{color: '#000', fontWeight: 'bold'}}>{language === 'ZH' ? '你在哪' : 'You are here'}</span>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Map Type Toggle & SOS Button */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div 
            onClick={() => {
              if (window.confirm(language === 'ZH' ? '🚨 发送 SOS 紧急警报？这会将您的精确 GPS 坐标发送给最近的社区向导。' : '🚨 Send SOS Emergency Alert? This will ping your exact GPS coordinates to the nearest community guide.')) {
                if (userLocation) {
                  setSosData(userLocation);
                  setShowSOSModal(true);
                  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
                } else {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setSosData({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      setShowSOSModal(true);
                      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
                    },
                    () => {
                      setSosData(null);
                      setShowSOSModal(true);
                      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
                    }
                  );
                }
              }
            }}
            style={{ backgroundColor: '#FF3B30', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,59,48,0.5)', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.5)', width: '48px', height: '48px' }}
          >
            <span style={{ color: '#FFF', fontWeight: 900, fontSize: '14px', letterSpacing: '1px' }}>SOS</span>
          </div>
          
          <div 
            onClick={() => setMapType(mapType === 'dark' ? 'satellite' : 'dark')}
            style={{ backgroundColor: 'var(--bg-card)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', width: '48px', height: '48px' }}
          >
            <Layers size={20} color="var(--accent-primary)" />
          </div>
        </div>

        {/* Selected Community Card Overlay */}
        {selectedComm && (
          <div style={{ position: 'absolute', bottom: '100px', left: '20px', right: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 1000 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedComm.name} {selectedComm.status === 'visited' && <CheckCircle2 size={16} color="var(--accent-primary)" />}
                </h3>
                <div style={{ color: 'var(--accent-primary)', fontSize: '14px', marginBottom: '8px' }}>{selectedComm.people}</div>
                <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '16px' }}>{selectedComm.desc}</p>
                
                {/* Environmental Data Bar */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Thermometer size={14} color="#FF9500" /> 
                    <span>{selectedComm.country === 'BR' ? '28°C' : '22°C'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <Wind size={14} color="#34C759" /> 
                    <span>{language === 'ZH' ? '空气质量: 优' : 'AQI: Excellent'}</span>
                  </div>
                </div>
              </div>
              <div 
                style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer' }}
                onClick={() => setSelectedCommId(null)}
              >
                ✕
              </div>
            </div>
            {selectedComm.status === 'available' ? (
              <button 
                onClick={() => exploreCommunity(selectedComm.id)}
                className="pill pill-amber" style={{ width: '100%', border: 'none', padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Play size={16} /> {language === 'ZH' ? '探索' : 'Explore Now'}
              </button>
            ) : selectedComm.status === 'visited' ? (
              <button className="pill pill-teal" style={{ width: '100%', border: 'none', padding: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                {language === 'ZH' ? '再次探索' : 'Re-explore'}
              </button>
            ) : (
              <button className="pill pill-dark" style={{ width: '100%', border: 'none', padding: '12px', cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                <Lock size={16} /> {language === 'ZH' ? '已锁定' : 'Locked'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* List Area */}
      <div style={{ height: '35%', backgroundColor: 'var(--bg-main)', padding: '20px', overflowY: 'auto', paddingBottom: '90px', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {language === 'ZH' ? '所有社区' : 'ALL COMMUNITIES'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {communities.map(comm => (
            <div 
              key={comm.id} 
              onClick={() => setSelectedCommId(comm.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: comm.status === 'locked' ? 0.5 : 1, cursor: 'pointer' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: comm.country === 'BR' ? 'var(--accent-primary)' : 'var(--accent-secondary)' }}>
                <MapPin size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px' }}>{comm.name}</h3>
                <div className="text-secondary" style={{ fontSize: '12px' }}>{comm.people}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`pill ${comm.country === 'BR' ? 'pill-amber' : 'pill-teal'}`} style={{ padding: '2px 6px', fontSize: '10px' }}>{comm.country}</span>
                {comm.status === 'visited' && <CheckCircle2 size={18} color="var(--accent-primary)" />}
                {comm.status === 'locked' && <Lock size={18} color="var(--text-secondary)" />}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* SOS Modal */}
      {showSOSModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#1A1108', borderRadius: '24px', padding: '32px 24px', width: '100%', maxWidth: '350px', border: '2px solid #FF3B30', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 0 40px rgba(255,59,48,0.3)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: 'rgba(255,59,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ping 1.5s infinite' }}>
                <span style={{ color: '#FFF', fontWeight: 900, fontSize: '18px' }}>SOS</span>
              </div>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FF3B30', marginBottom: '12px' }}>
              {language === 'ZH' ? '警报已发送' : 'ALERT DISPATCHED'}
            </h2>
            <p style={{ fontSize: '16px', color: '#FFF', marginBottom: '24px', lineHeight: 1.5 }}>
              {language === 'ZH' 
                ? '您的信号已传输至最近的文化保护站。请留在原地，向导正在路上。' 
                : 'Your signal has been transmitted to the nearest cultural preservation post. Stay where you are, a guide is en route.'}
            </p>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', width: '100%', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {language === 'ZH' ? '传输坐标' : 'TRANSMITTED COORDINATES'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#07C160', letterSpacing: '1px' }}>
                {sosData ? `${sosData.lat.toFixed(5)}, ${sosData.lng.toFixed(5)}` : 'UNKNOWN (IP TRACING)'}
              </div>
            </div>

            <button 
              onClick={() => setShowSOSModal(false)}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}>
              {language === 'ZH' ? '我知道了，关闭' : 'Acknowledged, Close'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Map;
