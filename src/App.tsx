import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
          {reward.name.includes('Kalunga') ? (
            <img src="/artifacts/kalunga.png" alt="Kalunga Artifact" style={{ width: '120px', height: '120px', marginBottom: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          ) : reward.name.includes('Miao') ? (
            <img src="/artifacts/miao.png" alt="Miao Artifact" style={{ width: '120px', height: '120px', marginBottom: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          ) : reward.name.includes('Xingu') ? (
            <img src="/artifacts/xingu.png" alt="Xingu Artifact" style={{ width: '120px', height: '120px', marginBottom: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          ) : (
            <Sparkles size={60} color={reward.rarity === 'Epic' ? '#D4850A' : reward.rarity === 'Rare' ? '#4A9E8E' : '#FFF'} style={{ marginBottom: '20px' }} />
          )}
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

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><Mentor /></motion.div>} />
        <Route path="/talk" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><Talk /></motion.div>} />
        <Route path="/council" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><Council /></motion.div>} />
        <Route path="/missions" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><Missions /></motion.div>} />
        <Route path="/map" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><MapPage /></motion.div>} />
        <Route path="/dashboard" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><Dashboard /></motion.div>} />
        <Route path="/gacha" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><Gacha /></motion.div>} />
      </Routes>
    </AnimatePresence>
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
      <AnimatedRoutes />
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
