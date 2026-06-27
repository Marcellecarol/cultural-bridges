import React, { useState, useEffect, useRef } from 'react';
import { Lock, Camera, Mic as MicIcon, Users, Utensils, QrCode, Sparkles, Download, Share2, Loader2, Scan } from 'lucide-react';
import { useUser } from '../context/UserContext';
import type { Mission } from '../context/UserContext';

const iconMap: Record<string, any> = {
  'Camera': <Camera size={20} color="var(--accent-secondary)" />,
  'Mic': <MicIcon size={20} color="var(--accent-secondary)" />,
  'Lock': <Lock size={20} color="var(--text-secondary)" />,
  'Users': <Users size={20} color="var(--accent-secondary)" />,
  'Utensils': <Utensils size={20} color="var(--accent-secondary)" />,
};

const Missions: React.FC = () => {
  const { missions, level, xp, completeMission, language, aiMode } = useUser();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isGeneratingPostcard, setIsGeneratingPostcard] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);
  const [targetMissionId, setTargetMissionId] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen || isQrOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => console.error("Camera error:", err));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCameraOpen, isQrOpen]);

  const activeMissions = missions.filter(m => m.status === 'active' || m.status === 'locked');
  const completedMissions = missions.filter(m => m.status === 'completed');

  const xpForNextLevel = 1200 * (level - 2);
  const progressPercent = (xp / xpForNextLevel) * 100;

  const handleComplete = (id: number, iconName: string) => {
    if (iconName === 'Camera') {
      setTargetMissionId(id);
      setIsCameraOpen(true);
    } else if (iconName === 'Lock') {
      setTargetMissionId(id);
      setIsQrOpen(true);
    } else {
      completeMission(id);
    }
  };

  const handleCapture = () => {
    setFlash(1);
    setTimeout(() => setFlash(0), 100);
    setTimeout(() => {
      setIsCameraOpen(false);
      setIsGeneratingPostcard(true);
      // Simulate AI generation time
      setTimeout(() => {
        setIsGeneratingPostcard(false);
        setShowPostcard(true);
      }, 3000);
    }, 600);
  };

  const savePostcardAndComplete = () => {
    if (targetMissionId) completeMission(targetMissionId);
    setShowPostcard(false);
    setTargetMissionId(null);
  };

  const handleScanQr = () => {
    setFlash(1);
    setTimeout(() => setFlash(0), 100);
    setTimeout(() => {
      if (targetMissionId) completeMission(targetMissionId);
      setIsQrOpen(false);
      setTargetMissionId(null);
    }, 600);
  };

  const MissionCard = ({ mission, onComplete }: { mission: Mission, onComplete?: () => void }) => {
    return (
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', opacity: mission.status === 'locked' ? 0.6 : 1 }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {iconMap[mission.iconName]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span className={`pill ${mission.catColor ? `pill-${mission.catColor}` : ''}`}>{mission.category || 'Locked'}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>+{mission.xp} XP</span>
            </div>
            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{mission.title}</h3>
            <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '12px', lineHeight: 1.4 }}>{mission.desc}</p>
            
            {mission.status === 'active' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, marginRight: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    <span>Progress</span>
                    <span>{mission.progressStr}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${mission.percent}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }}></div>
                  </div>
                </div>
                <button 
                  onClick={onComplete}
                  className="pill pill-amber" style={{ border: 'none', padding: '6px 16px', cursor: 'pointer', fontWeight: 600 }}>
                  {language === 'ZH' ? '完成' : 'Complete'}
                </button>
              </div>
            )}
            {mission.status === 'completed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600 }}>
                {language === 'ZH' ? '任务完成！' : 'Mission Accomplished!'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="page-container" style={{ paddingBottom: '90px' }}>
        <header style={{ marginBottom: '20px' }}>
          <div className="text-secondary" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>{language === 'ZH' ? '实地研究' : 'FIELDWORK'}</div>
          <h1 style={{ fontSize: '24px', margin: '4px 0' }}>{language === 'ZH' ? '任务' : 'Missions'}</h1>
          <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '16px' }}>{language === 'ZH' ? '完成任务以解锁新知识。' : 'Complete tasks to unlock new knowledge.'}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(74, 158, 142, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 158, 142, 0.3)' }}>
            <Lock size={14} color="var(--accent-secondary)" />
            <span style={{ fontSize: '10px', color: 'var(--accent-secondary)' }}>
              {language === 'ZH' ? 'Edge AI: 相机/GPS 数据仅在本地处理，符合 PIPL 标准。' : 'Edge AI: Camera & GPS data processed locally (PIPL Compliant).'}
            </span>
          </div>
        </header>

        {/* Level Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ fontWeight: 600 }}>{language === 'ZH' ? '探索者等级' : 'Explorer Level'} {level}</span>
            <span className="text-secondary">{xp} / {xpForNextLevel} XP</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
          <div 
            onClick={() => setActiveTab('active')}
            style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '14px', fontWeight: 600, color: activeTab === 'active' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'active' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer' }}
          >
            {language === 'ZH' ? '进行中' : 'Active'} ({activeMissions.length})
          </div>
          <div 
            onClick={() => setActiveTab('completed')}
            style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '14px', fontWeight: 600, color: activeTab === 'completed' ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'completed' ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer' }}
          >
            {language === 'ZH' ? '已完成' : 'Completed'} ({completedMissions.length})
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'active' ? (
            activeMissions.map(m => (
              <MissionCard key={m.id} mission={m} onComplete={() => handleComplete(m.id, m.iconName)} />
            ))
          ) : (
            completedMissions.map(m => (
              <MissionCard key={m.id} mission={m} />
            ))
          )}
        </div>
      </div>

      {isCameraOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', color: '#FFF' }}>
            <span onClick={() => setIsCameraOpen(false)} style={{ cursor: 'pointer' }}>Cancel</span>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scan size={16} color="var(--accent-primary)" />
              {language === 'ZH' ? 'AR 文化扫描仪' : 'AR Cultural Scanner'}
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden' }}>
               <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            {/* AR Tracking Overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ width: '250px', height: '250px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '3px solid var(--accent-primary)', borderLeft: '3px solid var(--accent-primary)' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '3px solid var(--accent-primary)', borderRight: '3px solid var(--accent-primary)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '3px solid var(--accent-primary)', borderLeft: '3px solid var(--accent-primary)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '3px solid var(--accent-primary)', borderRight: '3px solid var(--accent-primary)' }}></div>
                
                {/* Simulated tracking points */}
                <div style={{ position: 'absolute', top: '30%', left: '40%', width: '6px', height: '6px', backgroundColor: 'var(--accent-secondary)', borderRadius: '3px', animation: 'ping 2s infinite' }}></div>
                <div style={{ position: 'absolute', top: '60%', left: '70%', width: '6px', height: '6px', backgroundColor: 'var(--accent-secondary)', borderRadius: '3px', animation: 'ping 2.5s infinite 0.5s' }}></div>
                <div style={{ position: 'absolute', top: '70%', left: '20%', width: '6px', height: '6px', backgroundColor: 'var(--accent-secondary)', borderRadius: '3px', animation: 'ping 1.5s infinite 1s' }}></div>
              </div>
              <div style={{ marginTop: '32px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '16px', color: '#FFF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={12} style={{ animation: 'spin 2s linear infinite' }} />
                {language === 'ZH' ? '正在识别文化特征...' : 'Identifying cultural features...'}
              </div>
            </div>

            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#FFF', opacity: flash, pointerEvents: 'none', transition: 'opacity 0.1s' }}></div>
          </div>
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
            <label 
              style={{ width: '70px', height: '70px', borderRadius: '35px', border: '4px solid var(--accent-primary)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '27px', backgroundColor: 'var(--accent-primary)' }}></div>
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleCapture} />
            </label>
          </div>
        </div>
      )}

      {/* AI Generating State */}
      {isGeneratingPostcard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-main)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>
            {language === 'ZH' 
              ? (aiMode ? 'AI 正在生成水墨画...' : '正在保存真实照片...') 
              : (aiMode ? 'AI Generating Ink Painting...' : 'Saving Authentic Photo...')}
          </h2>
          <p className="text-secondary" style={{ fontSize: '14px' }}>
            {language === 'ZH' 
              ? (aiMode ? '正在融合文化元素' : '应用传统相框') 
              : (aiMode ? 'Fusing cultural elements...' : 'Applying traditional frame...')}
          </p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* AI Postcard Result */}
      {showPostcard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          <div style={{ alignSelf: 'flex-start', color: '#FFF', padding: '20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {aiMode ? <Sparkles color="var(--accent-primary)" /> : <Camera color="var(--accent-primary)" />}
            <span style={{ fontWeight: 600 }}>{language === 'ZH' ? (aiMode ? 'AI 文化工作室' : '真实记录') : (aiMode ? 'AI Cultural Studio' : 'Authentic Record')}</span>
          </div>
          
          <div style={{ 
            width: '100%', 
            maxWidth: '320px', 
            height: '420px', 
            backgroundColor: '#F5F1E7', 
            borderRadius: '12px', 
            marginTop: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {/* Fake traditional painting composition */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(to bottom, #d9ccb9 0%, #F5F1E7 100%)' }}></div>
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '30px', height: '100px', border: '1px solid #c7151c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#c7151c', fontFamily: 'serif', padding: '4px 0' }}>
              <span style={{ writingMode: 'vertical-rl', letterSpacing: '4px' }}>{language === 'ZH' ? '文化传承' : 'HERITAGE'}</span>
            </div>
            
            <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80%', height: '40%', opacity: 0.6 }}>
              {/* Abstract ink mountains / geometry */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100px', height: '80px', borderRadius: '100px 100px 0 0', backgroundColor: '#333' }}></div>
              <div style={{ position: 'absolute', bottom: 0, left: '60px', width: '120px', height: '140px', borderRadius: '100px 100px 0 0', backgroundColor: '#555' }}></div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '90px', height: '60px', borderRadius: '100px 100px 0 0', backgroundColor: '#222' }}></div>
              <div style={{ position: 'absolute', top: '-40px', right: '40px', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#c7151c' }}></div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>
                {language === 'ZH' ? '故事之地 • ' : 'LAND OF STORIES • '}
                {aiMode ? (language === 'ZH' ? 'AI 版本' : 'AI EDITION') : (language === 'ZH' ? '真实版本' : 'AUTHENTIC EDITION')}
              </div>
              <div style={{ fontSize: '10px', color: '#666' }}>{language === 'ZH' ? '今天通过文化扫描仪捕获' : 'Captured today via Cultural Scanner'}</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', marginBottom: '40px', display: 'flex', gap: '16px', width: '100%', maxWidth: '320px' }}>
            <button 
              onClick={savePostcardAndComplete}
              style={{ flex: 1, padding: '16px', borderRadius: '24px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <Download size={20} />
              {language === 'ZH' ? '保存并完成' : 'Save & Complete'}
            </button>
            <button 
              onClick={() => {
                const text = language === 'ZH' ? '看看我在 Land of Stories 制作的 AI 文化明信片！' : 'Look at this AI-generated cultural postcard I made on Land of Stories!';
                const url = 'https://land-of-stories-demo.com';
                if (navigator.share) {
                  navigator.share({ title: 'Land of Stories', text, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${text} ${url}`);
                  alert(language === 'ZH' ? '链接已复制到剪贴板！' : 'Link copied to clipboard!');
                }
              }}
              style={{ width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#07C160', color: '#FFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Share2 size={24} />
            </button>
          </div>
        </div>
      )}

      {isQrOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', color: '#FFF' }}>
            <span onClick={() => setIsQrOpen(false)} style={{ cursor: 'pointer' }}>Cancel</span>
            <span style={{ fontWeight: 600 }}>{language === 'ZH' ? 'O2O: 扫描二维码' : 'O2O: Scan QR Code'}</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden' }}>
               <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#FFF', opacity: flash, pointerEvents: 'none', transition: 'opacity 0.1s' }}></div>
            
            <p style={{ color: '#FFF', marginBottom: '20px' }}>{language === 'ZH' ? '将二维码放在取景器内' : 'Align QR code within frame'}</p>
            <label style={{ position: 'relative', width: '200px', height: '200px', border: '2px solid rgba(74, 158, 142, 0.5)', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'block' }}>
              {/* Animated laser */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', backgroundColor: '#4A9E8E', animation: 'scan 2s linear infinite', boxShadow: '0 0 8px 2px rgba(74,158,142,0.5)' }}></div>
              <QrCode size={120} color="rgba(255,255,255,0.1)" style={{ margin: '40px' }} />
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleScanQr} />
            </label>
            
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </>
  );
};

export default Missions;
