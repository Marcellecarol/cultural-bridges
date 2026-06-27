import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { ChevronLeft, PackageOpen, Sparkles, AlertCircle, Share2, Hexagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Gacha: React.FC = () => {
  const { language, xp } = useUser();
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<{name: string, rarity: string} | null>(null);
  const [showShare, setShowShare] = useState(false);

  const handleOpenBox = () => {
    if (xp < 100) return;
    
    setIsOpening(true);
    
    // Simulate API call / animation delay
    setTimeout(() => {
      setIsOpening(false);
      // Mock logic: 10% Epic, 30% Rare, 60% Common
      const rand = Math.random();
      if (rand < 0.1) {
        setReward({ name: 'Golden Chief Headdress', rarity: 'Epic' });
      } else if (rand < 0.4) {
        setReward({ name: 'Carved Wooden Flute', rarity: 'Rare' });
      } else {
        setReward({ name: 'Traditional Woven Band', rarity: 'Common' });
      }
    }, 2000);
  };

  const getRarityColor = (rarity: string) => {
    if (rarity === 'Epic') return '#D4850A';
    if (rarity === 'Rare') return '#4A9E8E';
    return '#FFF';
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      <header style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
          <ChevronLeft size={28} />
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
          <Sparkles size={14} color="var(--accent-secondary)" />
          {xp} XP
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
        
        {/* Background glow */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', opacity: 0.15, filter: 'blur(60px)', zIndex: 0 }}></div>

        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {!reward ? (
            <>
              <div style={{ marginBottom: '40px', position: 'relative' }}>
                <PackageOpen 
                  size={120} 
                  color={xp >= 100 ? "var(--accent-primary)" : "rgba(255,255,255,0.2)"} 
                  style={{ animation: isOpening ? 'shake 0.5s infinite' : 'pulse 2s infinite' }} 
                />
              </div>

              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {language === 'ZH' ? '文化盲盒' : 'Cultural Blind Box'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
                  {language === 'ZH' 
                    ? '使用 100 XP 兑换盲盒，发现珍贵的数字文物并支持当地社区！' 
                    : 'Spend 100 XP to open a blind box. Discover rare digital artifacts and support the local community!'}
                </p>
              </div>

              <button 
                onClick={handleOpenBox}
                disabled={xp < 100 || isOpening}
                style={{ 
                  width: '80%', 
                  padding: '18px', 
                  borderRadius: '24px', 
                  backgroundColor: xp >= 100 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', 
                  border: 'none', 
                  color: xp >= 100 ? 'var(--bg-main)' : 'rgba(255,255,255,0.3)',
                  fontSize: '18px', 
                  fontWeight: 700, 
                  cursor: xp >= 100 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: xp >= 100 ? '0 8px 24px rgba(212, 133, 10, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                {isOpening 
                  ? (language === 'ZH' ? '开启中...' : 'Opening...') 
                  : (language === 'ZH' ? '开启 (100 XP)' : 'Open Box (100 XP)')}
              </button>

              {xp < 100 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF3B30', fontSize: '12px', marginTop: '16px' }}>
                  <AlertCircle size={14} />
                  {language === 'ZH' ? '经验值不足。完成更多任务！' : 'Not enough XP. Complete more missions!'}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease', width: '100%' }}>
              <div style={{ marginBottom: '30px', position: 'relative', display: 'inline-block' }}>
                <div style={{ position: 'absolute', inset: -20, backgroundColor: getRarityColor(reward.rarity), filter: 'blur(30px)', opacity: 0.3, borderRadius: '50%' }}></div>
                <Sparkles size={100} color={getRarityColor(reward.rarity)} style={{ position: 'relative', zIndex: 2 }} />
              </div>
              
              <div style={{ fontSize: '14px', fontWeight: 700, color: getRarityColor(reward.rarity), marginBottom: '8px', letterSpacing: '2px' }}>
                {reward.rarity.toUpperCase()} ARTIFACT
              </div>
              
              <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>{reward.name}</h2>
              
              {/* Web3 / Blockchain Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(130, 71, 229, 0.15)', border: '1px solid rgba(130, 71, 229, 0.4)', padding: '6px 12px', borderRadius: '12px', marginBottom: '24px' }}>
                <Hexagon size={14} color="#8247E5" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8247E5' }}>
                  {language === 'ZH' ? 'Polygon 链上存证' : 'Polygon Blockchain Verified'}
                </span>
              </div>
              
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {language === 'ZH' 
                    ? '恭喜你！该数字文物的 50% 收益已直接捐赠给创作者社区。' 
                    : 'Congratulations! 50% of the proceeds from this digital artifact have been directly donated to the creator community.'}
                </p>
              </div>
              
              <button 
                onClick={() => setReward(null)}
                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.2)', padding: '16px 32px', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '80%', marginBottom: '16px' }}>
                {language === 'ZH' ? '放入背包' : 'Add to Backpack'}
              </button>

              <button 
                onClick={() => setShowShare(true)}
                style={{ backgroundColor: '#07C160', color: '#FFF', border: 'none', padding: '16px 32px', borderRadius: '24px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', width: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(7, 193, 96, 0.4)' }}>
                <Share2 size={18} /> {language === 'ZH' ? '分享至微信 (+50 XP)' : 'Share to WeChat (+50 XP)'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WeChat Share Modal */}
      {showShare && reward && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '300px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{language === 'ZH' ? '分享至微信' : 'Share to WeChat'}</h3>
            <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '24px' }}>
              {language === 'ZH' ? `炫耀你的 ${reward.rarity} 神器并获得 XP！` : `Show off your ${reward.rarity} artifact and gain XP!`}
            </p>
            <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#07C160', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => {
                const text = language === 'ZH' 
                  ? `看看我在 Land of Stories 中解锁的 ${reward.rarity} 神器！` 
                  : `Check out this ${reward.rarity} artifact I unlocked in Land of Stories!`;
                const url = 'https://land-of-stories-demo.com';
                
                if (navigator.share) {
                  navigator.share({ title: 'Land of Stories', text, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${text} ${url}`);
                  alert(language === 'ZH' ? '链接已复制到剪贴板！' : 'Link copied to clipboard!');
                }
                
                setShowShare(false);
                setReward(null);
                // Assume context handles xp update when they share from inventory, we could trigger it here.
              }}>
              <Share2 size={32} color="#FFF" />
            </div>
            <div style={{ color: '#07C160', fontWeight: 600, marginBottom: '16px' }}>+50 XP Bonus!</div>
            <button onClick={() => setShowShare(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              {language === 'ZH' ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gacha;
