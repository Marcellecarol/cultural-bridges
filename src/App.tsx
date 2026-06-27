import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sparkles, PackageOpen } from 'lucide-react';
import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';
import Mentor from './pages/Mentor';
import Talk from './pages/Talk';
import Missions from './pages/Missions';
import MapPage from './pages/Map';
import Onboarding from './pages/Onboarding';
import Council from './pages/Council';
import Dashboard from './pages/Dashboard';
import Gacha from './pages/Gacha';
import { UserProvider, useUser } from './context/UserContext';
import type { Artifact } from './context/UserContext';
import './index.css';

const BlindBox: React.FC<{ reward: Artifact, onClaim: () => void, language: string }> = ({ reward, onClaim, language }) => {
  const [opened, setOpened] = useState(false);
  
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(11, 19, 16, 0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {!opened ? (
        <div style={{ textAlign: 'center', animation: 'pulse 1.5s infinite' }} onClick={() => setOpened(true)}>
          <PackageOpen size={80} color="var(--accent-primary)" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '24px' }}>{language === 'ZH' ? '新发现！' : 'New Discovery!'}</h2>
          <p className="text-secondary">{language === 'ZH' ? '点击打开盲盒' : 'Tap to open the blind box'}</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
          <Sparkles size={60} color={reward.rarity === 'Epic' ? '#D4850A' : reward.rarity === 'Rare' ? '#4A9E8E' : '#FFF'} style={{ marginBottom: '20px' }} />
          <div style={{ fontSize: '12px', fontWeight: 700, color: reward.rarity === 'Epic' ? '#D4850A' : reward.rarity === 'Rare' ? '#4A9E8E' : '#FFF', marginBottom: '8px', letterSpacing: '1px' }}>
            {reward.rarity.toUpperCase()} ARTIFACT
          </div>
          <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>{reward.name}</h2>
          <button 
            onClick={onClaim}
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', padding: '16px 32px', borderRadius: '24px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
            {language === 'ZH' ? '放入背包' : 'Add to Backpack'}
          </button>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  const { hasOnboarded, rewardToClaim, claimReward, language } = useUser();

  if (!hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <TopBar />
      {rewardToClaim && <BlindBox reward={rewardToClaim} onClaim={claimReward} language={language} />}
      <Routes>
        <Route path="/" element={<Mentor />} />
        <Route path="/talk" element={<Talk />} />
        <Route path="/council" element={<Council />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gacha" element={<Gacha />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
