import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { ChevronLeft, Users, DollarSign, BrainCircuit, Activity, ShieldCheck, ArrowUpRight, Building2, Leaf, BarChart3, MapPin, Navigation, Store, Map, Smartphone, Fingerprint, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { language, aiMode, toggleAiMode } = useUser();
  const navigate = useNavigate();
  const [b2gMode, setB2gMode] = useState(false);
  const [radarDistance, setRadarDistance] = useState<string | null>(null);
  const [isScanningLocation, setIsScanningLocation] = useState(false);
  const [localRoute, setLocalRoute] = useState<{name: string, type: string, dist: string}[] | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mintingArtifact, setMintingArtifact] = useState<any>(null);
  const [mintProgress, setMintProgress] = useState(0);
  const [pendingArtifacts, setPendingArtifacts] = useState([
    { id: 1, user: 'Tourist_Ana', img: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=400', desc: 'Is this the sacred waterfall?', status: 'pending' },
    { id: 2, user: 'JohnDoe', img: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=400', desc: 'Found this clay pot fragment', status: 'pending' }
  ]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleRadar = () => {
    setIsScanningLocation(true);
    setTimeout(() => {
      setRadarDistance('840m');
      setLocalRoute([
        { name: language === 'ZH' ? 'Maria 的纺织作坊' : 'Maria\'s Weaving Studio', type: language === 'ZH' ? '当地工匠' : 'Local Artisan', dist: '120m' },
        { name: language === 'ZH' ? '黑人区餐厅' : 'Quilombola Restaurant', type: language === 'ZH' ? '土著美食' : 'Native Culinary', dist: '350m' },
        { name: language === 'ZH' ? '若昂指南 (Kalunga)' : 'João Guide (Kalunga)', type: language === 'ZH' ? '经认证的导游' : 'Certified Guide', dist: '800m' }
      ]);
      setIsScanningLocation(false);
    }, 2000);
  };

  return (
    <div className="page-container" style={{ padding: '20px', paddingBottom: '90px' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
          <ChevronLeft size={28} />
        </div>
        <h1 style={{ fontSize: '24px', margin: 0, flex: 1 }}>
          {language === 'ZH' ? '社区控制面板' : 'Community Dashboard'}
        </h1>
        <button 
          onClick={() => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the A2HS prompt');
                }
                setDeferredPrompt(null);
              });
            } else {
              alert(language === 'ZH' ? '应用可能已经安装，或者请通过浏览器菜单"添加到主屏幕"进行安装。' : 'App may already be installed, or please use the browser menu to "Add to Home Screen".');
            }
          }}
          style={{ backgroundColor: deferredPrompt ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', color: deferredPrompt ? 'var(--bg-main)' : 'var(--text-secondary)', border: 'none', padding: '8px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smartphone size={14} />
          {language === 'ZH' ? '安装应用' : 'Install App'}
        </button>
      </header>

      {/* Tabs / Toggle */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
        <div 
          onClick={() => setB2gMode(false)}
          style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '14px', fontWeight: 600, color: !b2gMode ? 'var(--accent-primary)' : 'var(--text-secondary)', borderBottom: !b2gMode ? '2px solid var(--accent-primary)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <ShieldCheck size={16} />
          {language === 'ZH' ? '社区领袖' : 'Community Leader'}
        </div>
        <div 
          onClick={() => setB2gMode(true)}
          style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: '14px', fontWeight: 600, color: b2gMode ? '#007AFF' : 'var(--text-secondary)', borderBottom: b2gMode ? '2px solid #007AFF' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Building2 size={16} />
          {language === 'ZH' ? '政府/B2B 视图' : 'Gov/B2B View'}
        </div>
      </div>

      {!b2gMode ? (
        <>
          {/* Sovereign Identity Banner */}
          <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', padding: '16px', borderRadius: '20px', border: '1px solid rgba(52, 199, 89, 0.3)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ position: 'relative' }}>
              <img src="https://i.pravatar.cc/150?img=68" alt="Leader" style={{ width: '56px', height: '56px', borderRadius: '28px', border: '2px solid #34C759', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#34C759', borderRadius: '50%', padding: '4px' }}>
                <Fingerprint size={12} color="#FFF" />
              </div>
            </div>
            <div>
              <div style={{ color: '#34C759', fontSize: '10px', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>
                {language === 'ZH' ? '主权身份已验证' : 'SOVEREIGN IDENTITY VERIFIED'}
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600 }}>
                {language === 'ZH' ? '欢迎回来，Huni 长老' : 'Welcome back, Elder Huni'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                {language === 'ZH' ? 'Web3 DID 认证 (0x8F2...9A1)' : 'Auth: Web3 DID (0x8F2...9A1)'}
              </div>
            </div>
          </div>

          {/* Artifact Validation Inbox (Tinder-style approval) */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="var(--accent-secondary)" />
                <h3 style={{ fontSize: '16px', margin: 0 }}>{language === 'ZH' ? '文化审核收件箱' : 'Cultural Review Inbox'}</h3>
              </div>
              <div style={{ backgroundColor: '#FF3B30', color: '#FFF', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                {pendingArtifacts.filter(a => a.status === 'pending').length} {language === 'ZH' ? '待审核' : 'Pending'}
              </div>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {language === 'ZH' ? '审核游客拍摄的照片。如果是神圣/私密物品，请拒绝分享。' : 'Review photos taken by tourists. Reject if it is a sacred/private artifact.'}
            </p>

            <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {pendingArtifacts.map(artifact => artifact.status === 'pending' && (
                <div key={artifact.id} style={{ minWidth: '160px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ height: '120px', backgroundImage: `url(${artifact.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>@{artifact.user}</div>
                    <div style={{ fontSize: '12px', marginBottom: '12px', lineHeight: 1.3 }}>"{artifact.desc}"</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setPendingArtifacts(prev => prev.map(p => p.id === artifact.id ? { ...p, status: 'rejected' } : p))}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                        <XCircle size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setMintingArtifact(artifact);
                          setMintProgress(0);
                          let prog = 0;
                          const intv = setInterval(() => {
                            prog += 20;
                            setMintProgress(prog);
                            if (prog >= 100) {
                              clearInterval(intv);
                              setTimeout(() => {
                                setPendingArtifacts(prev => prev.map(p => p.id === artifact.id ? { ...p, status: 'approved' } : p));
                                setMintingArtifact(null);
                              }, 1000);
                            }
                          }, 500);
                        }}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(52,199,89,0.1)', color: '#34C759', border: '1px solid rgba(52,199,89,0.3)', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingArtifacts.filter(a => a.status === 'pending').length === 0 && (
                <div style={{ width: '100%', padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {language === 'ZH' ? '干得好！收件箱已清空。' : 'All caught up! Inbox is empty.'}
                </div>
              )}
            </div>
          </div>

          {/* Community Info Card */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', backgroundColor: 'var(--accent-primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }}></div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Kalunga Territory</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontSize: '14px', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              {language === 'ZH' ? '官方文化守护者' : 'Verified Cultural Guardian'}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '20px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} /> {language === 'ZH' ? '本月访客' : 'Visitors (Month)'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>1,248</div>
              <div style={{ color: '#34C759', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={12} /> +15.4%
              </div>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '20px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} /> {language === 'ZH' ? '生态旅游收入' : 'O2O Revenue'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>$4,520</div>
              <div style={{ color: '#34C759', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center' }}>
                <ArrowUpRight size={12} /> +8.2%
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Smart City B2G Dashboard */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', backgroundColor: '#007AFF', opacity: 0.1, borderRadius: '50%', filter: 'blur(30px)' }}></div>
            <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Smart City Tourism</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#007AFF', fontSize: '14px', fontWeight: 600 }}>
              <Building2 size={16} />
              {language === 'ZH' ? '市政监控面板' : 'Municipal Dashboard'}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Leaf size={20} color="#34C759" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{language === 'ZH' ? 'ESG 影响仪表板' : 'ESG Impact Dashboard'}</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Carbon */}
              <div style={{ backgroundColor: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>{language === 'ZH' ? '碳信用额生成' : 'Carbon Credits Generated'}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34C759' }}>14.5 {language === 'ZH' ? '吨' : 'Tons'}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={20} color="#FFF" />
                </div>
              </div>
              
              {/* Revenue */}
              <div style={{ backgroundColor: 'rgba(212, 133, 10, 0.1)', border: '1px solid rgba(212, 133, 10, 0.3)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>{language === 'ZH' ? '注入社区的收入' : 'Community Revenue Injected'}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D4850A' }}>$4,250</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#D4850A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} color="#FFF" />
                </div>
              </div>
              
              {/* Oral History */}
              <div style={{ backgroundColor: 'rgba(94, 92, 230, 0.1)', border: '1px solid rgba(94, 92, 230, 0.3)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>{language === 'ZH' ? '数字化的口述历史' : 'Oral Histories Digitized'}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5E5CE6' }}>124 {language === 'ZH' ? '故事' : 'Stories'}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#5E5CE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="#FFF" />
                </div>
              </div>
            </div>
          </div>

          {/* B2G DataViz Chart */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#007AFF" />
              {language === 'ZH' ? '生态旅游增长 (4个月)' : 'Eco-Tourism Growth (4 Mo)'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '16px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { label: 'Jan', h: '40%', val: '2.1k' },
                { label: 'Feb', h: '65%', val: '3.4k' },
                { label: 'Mar', h: '80%', val: '4.8k' },
                { label: 'Apr', h: '100%', val: '6.2k' }
              ].map((bar, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', height: '100%' }}>
                  <span style={{ fontSize: '10px', color: '#007AFF', fontWeight: 600 }}>{bar.val}</span>
                  <div style={{ width: '100%', backgroundColor: 'rgba(0, 122, 255, 0.2)', borderRadius: '4px 4px 0 0', position: 'relative', height: bar.h }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', backgroundColor: '#007AFF', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                  </div>
                </div>
              ))}
            </div>

          {/* O2O Cultural Radar */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={18} color="var(--accent-secondary)" />
                <span style={{ fontWeight: 600 }}>{language === 'ZH' ? 'O2O 文化雷达' : 'O2O Cultural Radar'}</span>
              </div>
              {radarDistance && (
                <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {language === 'ZH' ? '附近目标' : 'TARGET NEARBY'}
                </span>
              )}
            </div>
            
            <p className="text-secondary" style={{ fontSize: '13px', lineHeight: 1.4, marginBottom: '16px' }}>
              {language === 'ZH' ? '使用 GPS 寻找您周围有形文化遗产的现实生活足迹。' : 'Use GPS to find real-life footprints of tangible cultural heritage around you.'}
            </p>

            {radarDistance ? (
              <div style={{ backgroundColor: 'rgba(74, 158, 142, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(74, 158, 142, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{language === 'ZH' ? '最近的部落 (卡伦加)' : 'Nearest Tribe (Kalunga)'}</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-secondary)' }}>{radarDistance}</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="var(--bg-main)" />
                </div>
              </div>
            ) : (
              <button 
                onClick={handleRadar}
                disabled={isScanningLocation}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                {isScanningLocation ? (
                  <span style={{ animation: 'pulse 1s infinite' }}>{language === 'ZH' ? '获取坐标中...' : 'Acquiring Coordinates...'}</span>
                ) : (
                  <>{language === 'ZH' ? '扫描我的位置' : 'Scan My Location'}</>
                )}
              </button>
            )}
          </div>
          
          {localRoute && (
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '24px', marginBottom: '24px', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Map size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '16px', margin: 0 }}>{language === 'ZH' ? '个性化 O2O 路线' : 'Personalized O2O Route'}</h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {language === 'ZH' ? '在附近找到可接待游客并直接接收付款的当地企业。' : 'Local businesses nearby ready to host visitors and receive direct payments.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {localRoute.map((business, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '18px', backgroundColor: 'rgba(212, 133, 10, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store size={16} color="var(--accent-primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{business.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{business.type}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#34C759', marginBottom: '4px' }}>{business.dist}</span>
                      <button 
                        onClick={() => navigate('/map')}
                        style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '8px', backgroundColor: 'var(--accent-secondary)', color: 'var(--bg-main)', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Navigation size={10} />
                        {language === 'ZH' ? '导航' : 'NAVIGATE'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Jan</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Feb</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mar</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Apr</span>
            </div>
          </div>
        </>
      )}

      {/* AI Governance Section */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'rgba(212, 133, 10, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', margin: 0 }}>{language === 'ZH' ? 'AI 社区主权' : 'AI Sovereignty Mode'}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {aiMode ? (language === 'ZH' ? '系统由 AI 辅助运行' : 'System running with AI assist') : (language === 'ZH' ? '系统以纯人类模式运行' : 'System running in Human-only mode')}
              </div>
            </div>
          </div>
        </div>
        
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
          {language === 'ZH' 
            ? '作为文化守护者，您可以随时关闭人工智能生成功能。关闭后，应用程序将仅显示社区预先批准的真实口述记录和真实照片。' 
            : 'As a cultural guardian, you can disable AI generation at any time. When disabled, the app will strictly display authentic, pre-approved oral records and real photos.'}
        </p>

        <button 
          onClick={toggleAiMode}
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: '16px', 
            backgroundColor: aiMode ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)', 
            border: `1px solid ${aiMode ? 'rgba(255, 59, 48, 0.3)' : 'rgba(52, 199, 89, 0.3)'}`,
            color: aiMode ? '#FF3B30' : '#34C759',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
          {aiMode 
            ? (language === 'ZH' ? '停用 AI (切换为真实记录)' : 'Disable AI (Switch to Authentic Records)') 
            : (language === 'ZH' ? '启用 AI (恢复智能功能)' : 'Enable AI (Restore Smart Features)')}
        </button>
      </div>

      {/* Cultural Library / Suggested Readings */}
      <div style={{ marginTop: '24px', backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '24px', position: 'relative' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf size={18} color="var(--accent-primary)" />
          {language === 'ZH' ? '文化阅读推荐' : 'Cultural Reading List'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {language === 'ZH' ? '深入了解您正在探索的社区的历史。' : 'Dive deeper into the history of the communities you are exploring.'}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: language === 'ZH' ? 'Kalunga：抵抗与自然守护者' : 'Kalunga: Resistance & Nature Guardians', source: 'NatGeo / UNESCO', url: 'https://en.wikipedia.org/wiki/Kalunga' },
            { title: language === 'ZH' ? 'Xingu：连接天空与大地的神话' : 'Xingu: Myths connecting Sky and Earth', source: 'Instituto Socioambiental (ISA)', url: 'https://pib.socioambiental.org/en/Main_Page' },
            { title: language === 'ZH' ? 'Miao族银饰：穿在身上的历史' : 'Miao Silver: History worn on the body', source: 'Cultural Bridges Magazine', url: 'https://en.wikipedia.org/wiki/Miao_people' }
          ].map((item, i) => (
            <div key={i} onClick={() => window.open(item.url, '_blank')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.source}</div>
              </div>
              <ArrowUpRight size={16} color="var(--accent-primary)" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Platform Activity */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-secondary)" />
          {language === 'ZH' ? '平台活动' : 'Platform Activity'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { action: 'Donation via Blind Box', user: 'Alex C.', time: '2 mins ago', val: '+$15' },
            { action: 'Completed O2O Route', user: 'Maria S.', time: '14 mins ago', val: '+50 XP' },
            { action: 'Purchased Local Craft', user: 'John D.', time: '1 hour ago', val: '+$45' }
          ].map((log, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{log.action}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.user} • {log.time}</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: log.val.includes('$') ? '#34C759' : 'var(--accent-secondary)' }}>
                {log.val}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Web3 Minting Simulation Modal */}
      {mintingArtifact && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 4000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: 'rgba(94, 92, 230, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: '#5E5CE6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mintProgress >= 100 ? <CheckCircle2 size={32} color="#FFF" /> : <Fingerprint size={32} color="#FFF" style={{ animation: 'pulse 1s infinite' }} />}
            </div>
          </div>
          
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFF', marginBottom: '8px', textAlign: 'center' }}>
            {mintProgress >= 100 
              ? (language === 'ZH' ? 'NFT 铸造成功！' : 'NFT Minted Successfully!') 
              : (language === 'ZH' ? '将资产铸造为 NFT...' : 'Minting Asset as NFT...')}
          </h2>
          
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px', maxWidth: '80%' }}>
            {mintProgress >= 100 
              ? (language === 'ZH' ? '该文化遗产现已被永久记录在区块链上。' : 'This cultural artifact is now permanently recorded on the blockchain.') 
              : (language === 'ZH' ? '正在连接 Polygon 网络，生成智能合约...' : 'Connecting to Polygon network, generating smart contract...')}
          </p>

          <div style={{ width: '100%', maxWidth: '280px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${mintProgress}%`, height: '100%', backgroundColor: '#5E5CE6', transition: 'width 0.5s ease-out' }}></div>
          </div>
          
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#5E5CE6', fontFamily: 'monospace' }}>
            {mintProgress > 20 && 'TxHash: 0x' + Math.random().toString(16).slice(2, 10) + '...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
