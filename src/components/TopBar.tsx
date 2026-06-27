import React from 'react';
import { Wifi, WifiOff, Globe, BrainCircuit, BarChart2, PackageOpen, Eye, Ticket, QrCode, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const TopBar: React.FC = () => {
  const { isOffline, toggleOffline, language, setLanguage, aiMode, toggleAiMode, highContrast, toggleHighContrast } = useUser();
  const navigate = useNavigate();
  const [showPassport, setShowPassport] = React.useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'ZH' : 'EN');
  };

  return (
    <div style={styles.topbar}>
      <div style={styles.left}>
        <div onClick={() => setShowPassport(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <Ticket size={16} color="var(--accent-secondary)" />
        </div>
        <div onClick={toggleHighContrast} style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <Eye size={16} color={highContrast ? "var(--accent-primary)" : "var(--text-secondary)"} />
        </div>
        <div onClick={toggleLanguage} style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <Globe size={16} color="var(--text-secondary)" />
          <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)' }}>{language}</span>
        </div>
        <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--accent-secondary)' }}>
          <BarChart2 size={16} />
        </div>
      </div>
      <div style={styles.right}>
        <div onClick={() => navigate('/gacha')} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <PackageOpen size={16} color="#D4850A" />
        </div>
        <div style={{ ...styles.action, opacity: aiMode ? 1 : 0.5, borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '12px' }} onClick={toggleAiMode}>
          <BrainCircuit size={16} color={aiMode ? "var(--accent-primary)" : "var(--text-secondary)"} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: aiMode ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
            AI: {aiMode ? 'ON' : 'OFF'}
          </span>
        </div>
        
        <div style={styles.action} onClick={toggleOffline}>
          {isOffline ? (
            <>
              <WifiOff size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>OFFLINE</span>
            </>
          ) : (
            <>
              <Wifi size={16} color="var(--accent-secondary)" />
              <span style={{ fontSize: '10px', color: 'var(--accent-secondary)' }}>ONLINE</span>
            </>
          )}
        </div>
      </div>

      {showPassport && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer' }} onClick={() => setShowPassport(false)}>
            <X size={32} color="#FFF" />
          </div>
          
          <div style={{ backgroundColor: 'var(--accent-primary)', width: '100%', maxWidth: '320px', borderRadius: '24px', padding: '2px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', width: '100%', borderRadius: '22px', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {language === 'ZH' ? 'O2O 护照' : 'O2O Passport'}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
                {language === 'ZH' ? '出示此二维码即可进入文化领地。' : 'Show this QR code for physical entry to the cultural territory.'}
              </p>
              
              <div style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '16px', marginBottom: '32px' }}>
                <QrCode size={180} color="#000" />
              </div>
              
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'ZH' ? '身份' : 'Status'}</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-secondary)' }}>{language === 'ZH' ? '已验证' : 'Verified'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'ZH' ? '有效期' : 'Valid For'}</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>24h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  topbar: {
    height: '40px',
    backgroundColor: 'var(--bg-main)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    zIndex: 50,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  }
};

export default TopBar;
