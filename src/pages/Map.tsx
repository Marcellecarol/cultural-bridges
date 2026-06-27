import React, { useState, useEffect } from 'react';
import { MapPin, Lock, CheckCircle2, Play } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Map: React.FC = () => {
  const [selectedCommId, setSelectedCommId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { communities, exploreCommunity, language } = useUser();

  const selectedComm = communities.find(c => c.id === selectedCommId) || null;

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // Em um app real, faríamos a conversão de Lat/Lng real para X/Y do Canvas.
          // Aqui, como é um mapa vetorial estilizado, validamos que o GPS funciona 
          // e plotamos o ponto relativo ao território atual.
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.log('GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <header style={{ padding: '20px', zIndex: 10, backgroundColor: 'var(--bg-main)' }}>
        <div className="text-secondary" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>
          {language === 'ZH' ? '互动地图' : 'INTERACTIVE MAP'}
        </div>
        <h1 style={{ fontSize: '24px', margin: '4px 0' }}>{language === 'ZH' ? '文化领地' : 'Cultural Territories'}</h1>
        <p className="text-secondary" style={{ fontSize: '14px' }}>
          {language === 'ZH' ? '滑动以探索' : 'Scroll to explore'}
        </p>
      </header>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative', backgroundColor: '#13221C', overflow: 'auto' }}>
        
        {/* Movable Map Container (Native Scroll) */}
        <div style={{ position: 'relative', width: '200%', height: '150%', minHeight: '600px', backgroundColor: '#13221C' }}>
          
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(#4A9E8E 1px, transparent 1px), linear-gradient(90deg, #4A9E8E 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          {/* Connecting Lines (SVG) */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
            <path 
              d={`M ${communities[0].x}% ${communities[0].y}% L ${communities[1].x}% ${communities[1].y}%`} 
              stroke="rgba(212, 133, 10, 0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none"
            />
            {communities[2].status !== 'locked' && (
              <path 
                d={`M ${communities[1].x}% ${communities[1].y}% L ${communities[2].x}% ${communities[2].y}%`} 
                stroke="rgba(212, 133, 10, 0.5)" strokeWidth="2" strokeDasharray="5,5" fill="none"
              />
            )}
            <path 
              d={`M ${communities[0].x}% ${communities[0].y}% C 50% 10%, 60% 80%, ${communities[3].x}% ${communities[3].y}%`} 
              stroke="rgba(74, 158, 142, 0.3)" strokeWidth="2" strokeDasharray="4,4" fill="none"
            />
          </svg>

          {/* Points */}
          {communities.map(comm => (
            <div 
              key={comm.id}
              onClick={(e) => { e.stopPropagation(); setSelectedCommId(comm.id); }}
              style={{ 
                position: 'absolute', 
                top: `${comm.y}%`, 
                left: `${comm.x}%`, 
                width: '24px', 
                height: '24px', 
                borderRadius: '12px', 
                transform: 'translate(-50%, -50%)',
                backgroundColor: comm.status === 'visited' ? (comm.country === 'BR' ? 'var(--accent-primary)' : 'var(--accent-secondary)') : (comm.status === 'locked' ? 'rgba(255,255,255,0.2)' : 'var(--bg-main)'), 
                border: comm.status === 'available' ? `3px solid ${comm.country === 'BR' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}` : 'none',
                cursor: comm.status === 'locked' ? 'not-allowed' : 'pointer', 
                boxShadow: selectedComm?.id === comm.id ? `0 0 0 6px ${comm.country === 'BR' ? 'rgba(212, 133, 10, 0.3)' : 'rgba(74, 158, 142, 0.3)'}` : 'none',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5
              }}
            >
              {comm.status === 'locked' && <Lock size={12} color="#FFF" />}
              {comm.status === 'visited' && <CheckCircle2 size={12} color="#FFF" />}
            </div>
          ))}

          {/* User Location Pulse */}
          {userLocation && (
            <>
              <div style={{ position: 'absolute', top: '30%', left: '25%', transform: 'translate(-50%, -100%)', backgroundColor: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, color: '#FFF', zIndex: 7, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(212, 133, 10, 0.4)' }}>
                {language === 'ZH' ? '附近有 2 位探索者' : '2 Explorers Nearby'}
              </div>
              <div style={{ position: 'absolute', top: '35%', left: '25%', width: '16px', height: '16px', backgroundColor: '#007AFF', borderRadius: '8px', transform: 'translate(-50%, -50%)', zIndex: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '2px solid #007AFF', opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                 <div style={{ width: '6px', height: '6px', backgroundColor: '#FFF', borderRadius: '3px' }}></div>
              </div>
            </>
          )}

          {/* Local Guide Pulse */}
          <div style={{ position: 'absolute', top: '45%', left: '40%', width: '16px', height: '16px', backgroundColor: '#34C759', borderRadius: '8px', transform: 'translate(-50%, -50%)', zIndex: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ position: 'absolute', top: '-25px', whiteSpace: 'nowrap', backgroundColor: 'var(--bg-card)', border: '1px solid #34C759', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', color: '#34C759' }}>
               {language === 'ZH' ? '在线本地向导' : 'Local Guide Online'}
             </div>
             <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: '2px solid #34C759', opacity: 0.5, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite 1s' }}></div>
             <div style={{ width: '6px', height: '6px', backgroundColor: '#FFF', borderRadius: '3px' }}></div>
          </div>
        </div>

        {/* Selected Community Card Overlay */}
        {selectedComm && (
          <div style={{ position: 'sticky', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 20, margin: '20px', marginTop: '-150px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedComm.name} {selectedComm.status === 'visited' && <CheckCircle2 size={16} color="var(--accent-primary)" />}
                </h3>
                <div style={{ color: 'var(--accent-primary)', fontSize: '14px', marginBottom: '8px' }}>{selectedComm.people}</div>
                <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '16px' }}>{selectedComm.desc}</p>
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
      <div style={{ height: '40%', backgroundColor: 'var(--bg-main)', padding: '20px', overflowY: 'auto', paddingBottom: '90px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
