import React, { useState } from 'react';
import { Sparkles, MapPin, Play, Trophy, WifiOff, Box, Lock, Share2, Clock, HeartHandshake, Shield, Download, Trash, Volume2, Bell, Scan, CheckCircle, Edit3, X, Save, BookOpen, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { compressImage } from '../utils/imageUtils';

const Mentor: React.FC = () => {
  const navigate = useNavigate();
  const { xp, communitiesVisited, completeRoute, isOffline, language, userName, userTitle, userAvatar, setUserName, setUserTitle, setUserAvatar, inventory, shareArtifact, journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useUser();
  const [shareItem, setShareItem] = useState<any>(null);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'scanning' | 'success'>('idle');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userName || 'Explorer');
  const [tempTitle, setTempTitle] = useState(userTitle);

  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [journalTempTitle, setJournalTempTitle] = useState('');
  const [journalTempContent, setJournalTempContent] = useState('');
  const [journalTempImage, setJournalTempImage] = useState<string | undefined>(undefined);
  const [journalTempAudio, setJournalTempAudio] = useState<string | undefined>(undefined);

  const handleStartRoute = () => {
    completeRoute();
    navigate('/map');
  };

  const [pushStatus, setPushStatus] = useState<string>('default');

  const enablePush = () => {
    if (!('Notification' in window)) {
      alert("Push notifications not supported.");
      return;
    }
    
    Notification.requestPermission().then((permission) => {
      setPushStatus(permission);
      if (permission === 'granted') {
        new Notification("Land of Stories", {
          body: language === 'ZH' ? "一个新的卡伦加故事今天被揭示！" : "A new Kalunga story was revealed today!",
          icon: "/favicon.ico"
        });
      }
    });
  };

  const insightText = language === 'ZH' 
    ? "卡伦加人对自然疗法的知识通过口述传统代代相传..." 
    : "The Kalunga people's knowledge of natural remedies is passed down through oral tradition...";

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      try {
        console.log("TTS Triggered for:", insightText);
        window.speechSynthesis.cancel(); // Clears any stuck TTS queue (very common Chrome bug)
        const utterance = new SpeechSynthesisUtterance(insightText);
        if (language === 'ZH') utterance.lang = 'zh-CN';
        else utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch(e) {
        console.error("TTS Error:", e);
      }
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      
      {isOffline && (
        <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
          <WifiOff size={20} color="#FF3B30" />
          <div style={{ fontSize: '12px' }}>
            <span style={{ fontWeight: 600, color: '#FF3B30', display: 'block' }}>{language === 'ZH' ? '离线模式激活' : 'Offline Mode Active'}</span>
            <span className="text-secondary">{language === 'ZH' ? '任务和地图在本地保存。' : 'Fieldwork progress is being saved locally.'}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ cursor: 'pointer', position: 'relative' }}>
            <img src={userAvatar} alt="User Avatar" style={{ width: '60px', height: '60px', borderRadius: '30px', objectFit: 'cover', border: '2px solid var(--accent-primary)', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  const compressed = await compressImage(file, 200, 200);
                  setUserAvatar(compressed);
                } catch (err) {
                  console.error("Avatar compression failed", err);
                }
              }
            }} />
          </label>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '28px', lineHeight: 1.2, margin: 0 }}>
                {language === 'ZH' ? '你好' : 'Hello'}, {userName || 'Explorer'}
              </h1>
              <button onClick={() => { setIsEditingProfile(true); setTempName(userName || 'Explorer'); setTempTitle(userTitle); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', padding: '4px' }}>
                <Edit3 size={16} />
              </button>
            </div>
            <span className="text-secondary" style={{ fontSize: '14px', fontWeight: 400 }}>{userTitle}</span>
          </div>
        </div>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}>
          Reset Demo
        </button>
      </header>

      {/* AI Insight Card */}
      <div style={{ backgroundColor: 'var(--accent-primary)', borderRadius: '20px', padding: '24px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
          <Sparkles size={120} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="https://i.pravatar.cc/100?img=68" alt="Elder" style={{ width: '24px', height: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: '#FFF' }}>{language === 'ZH' ? '长者洞察' : 'ELDER\'S INSIGHT'}</span>
          </div>
          <div onClick={playAudio} style={{ cursor: 'pointer', padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex' }}>
            <Volume2 size={16} color="#FFF" />
          </div>
        </div>
        <p style={{ fontSize: '16px', lineHeight: 1.5, color: '#FFF', fontWeight: 500, marginBottom: '20px' }}>
          "{insightText}"
        </p>
        <button 
          onClick={() => navigate('/talk')}
          className="pill pill-dark" style={{ border: 'none', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Sparkles size={14} />
          {language === 'ZH' ? '深入询问' : 'Ask for more depth'}
        </button>
      </div>

      {/* Recommended Route */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{language === 'ZH' ? '推荐路线' : 'Recommended Route'}</h2>
          <span className="text-secondary" style={{ fontSize: '12px' }}>{language === 'ZH' ? '基于您的进度' : 'Based on your progress'}</span>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }}>
            <img src="/route_kalunga.png" alt="Kalunga Territory" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
            <div style={{ position: 'absolute', bottom: '12px', left: '16px', display: 'flex', gap: '8px' }}>
              <span className="pill pill-amber" style={{ fontSize: '10px', padding: '4px 8px' }}>History</span>
              <span className="pill pill-teal" style={{ fontSize: '10px', padding: '4px 8px' }}>2 hrs</span>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{language === 'ZH' ? '祖先的足迹' : 'Ancestral Footsteps'}</h3>
            <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '16px' }}><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }}/> Kalunga Territory, BR</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600 }}>
                <Trophy size={16} /> +150 XP
              </div>
              <button 
                onClick={handleStartRoute}
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none', padding: '8px 24px', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                {language === 'ZH' ? '开始' : 'Start'} <Play size={12} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ESG Impact Stats */}
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>{language === 'ZH' ? '你的文化影响 (ESG)' : 'Your Cultural Impact (ESG)'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(212, 133, 10, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            <Clock size={16} color="var(--accent-primary)" /> <span style={{ fontSize: '12px' }}>{language === 'ZH' ? '遗产保存时间' : 'Heritage Saved'}</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-primary)' }}>12 hrs</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            <HeartHandshake size={16} color="#34C759" /> <span style={{ fontSize: '12px' }}>{language === 'ZH' ? '社区资金' : 'Funds Donated'}</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#34C759' }}>$15.50</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            <MapPin size={16} /> <span style={{ fontSize: '12px' }}>{language === 'ZH' ? '支持的文化' : 'Cultures Supported'}</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{communitiesVisited}</div>
        </div>
        <div style={{ backgroundColor: 'rgba(212, 133, 10, 0.1)', border: '1px solid rgba(212, 133, 10, 0.3)', padding: '16px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-primary)', fontWeight: 600 }}>
            <Trophy size={16} /> <span style={{ fontSize: '12px' }}>{language === 'ZH' ? '关系 (Guanxi) 经验值' : 'Guanxi XP'}</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{xp}</div>
        </div>
      </div>

      {/* Explorer Backpack */}
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Box size={20} color="var(--accent-secondary)" /> {language === 'ZH' ? '探险家背包' : 'Explorer\'s Backpack'}
      </h2>
      <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '16px' }}>
        {language === 'ZH' ? '完成实地研究任务以解锁文化文物。' : 'Complete fieldwork missions to unlock cultural artifacts.'}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {inventory.map(item => (
          <div key={item.id} 
            onClick={() => {
              if (item.unlocked) {
                setShareItem(item);
              } else {
                setCheckoutState('scanning');
                if ('vibrate' in navigator) navigator.vibrate([50]);
                setTimeout(() => {
                  setCheckoutState('success');
                  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                }, 2500);
                setTimeout(() => setCheckoutState('idle'), 5000);
              }
            }}
            style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '16px 8px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            opacity: item.unlocked ? 1 : 0.7,
            border: item.unlocked ? '1px solid rgba(212, 133, 10, 0.3)' : '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer',
            position: 'relative'
          }}>
            {item.unlocked && !item.shared && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#FF3B30' }}></div>}
            
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '24px', 
              backgroundColor: item.unlocked ? 'rgba(212, 133, 10, 0.1)' : 'rgba(255,255,255,0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '8px'
            }}>
              {item.unlocked ? <Sparkles size={24} color={item.rarity === 'Epic' ? '#D4850A' : item.rarity === 'Rare' ? '#4A9E8E' : 'var(--text-primary)'} /> : <Lock size={24} color="var(--text-secondary)" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '10px', textAlign: 'center', fontWeight: 600 }}>
                {item.unlocked ? item.name : (language === 'ZH' ? '已锁定' : 'Locked')}
              </span>
              {item.ich && <span style={{ fontSize: '8px', backgroundColor: '#FFD700', color: '#000', padding: '2px 4px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.5px' }}>UNESCO ICH</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Field Journal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="#4A9E8E" /> {language === 'ZH' ? '实地日记' : 'Field Journal'}
        </h2>
        <button 
          onClick={() => {
            setJournalTempTitle('');
            setJournalTempContent('');
            setJournalTempImage(undefined);
            setJournalTempAudio(undefined);
            setEditingJournalId('new');
          }}
          style={{ background: 'rgba(74, 158, 142, 0.1)', color: '#4A9E8E', border: '1px solid rgba(74, 158, 142, 0.3)', padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> {language === 'ZH' ? '新笔记' : 'New Note'}
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {journalEntries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
            {language === 'ZH' ? '暂无笔记。点击“新笔记”添加。' : 'No entries yet. Add a new note.'}
          </div>
        ) : (
          journalEntries.map(entry => (
            <div key={entry.id} 
              onClick={() => {
                setJournalTempTitle(entry.title);
                setJournalTempContent(entry.content);
                setJournalTempImage(entry.image);
                setJournalTempAudio(entry.audio);
                setEditingJournalId(entry.id);
              }}
              style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              {entry.image && (
                <img src={entry.image} alt="Journal" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />
              )}
              {entry.audio && (
                <audio controls src={entry.audio} style={{ width: '100%', marginBottom: '16px', height: '36px' }} />
              )}
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{entry.title}</h3>
              <p className="text-secondary" style={{ fontSize: '14px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.content}</p>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
                {new Date(entry.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Data Privacy Center */}
      <div style={{ marginTop: '48px', padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Shield size={20} color="var(--accent-secondary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{language === 'ZH' ? '数据隐私中心' : 'Data Privacy Center'}</h2>
        </div>
        <p className="text-secondary" style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
          {language === 'ZH' 
            ? '符合 PIPL 和 LGPD。社区对自己的文化数据拥有完全主权。' 
            : 'PIPL & LGPD Compliant. Communities have full sovereignty over their cultural data.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => {
              const data = JSON.stringify(localStorage);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'los_privacy_export.json';
              a.click();
            }}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Download size={16} /> {language === 'ZH' ? '导出我的数据 (JSON)' : 'Export My Data (JSON)'}
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm(language === 'ZH' ? '确定要删除所有数据吗？此操作不可逆。' : 'Are you sure you want to delete all your data? This is irreversible.')) {
                localStorage.clear();
                window.location.href = '/';
              }
            }}
            style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <Trash size={16} /> {language === 'ZH' ? '遗忘我 (删除所有数据)' : 'Forget Me (Delete All Data)'}
          </button>
        </div>
      </div>

      {/* Engagement / Retention Settings */}
      <div style={{ marginTop: '24px', padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Bell size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{language === 'ZH' ? '文化提醒' : 'Cultural Alerts'}</h2>
        </div>
        <p className="text-secondary" style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
          {language === 'ZH' 
            ? '启用推送通知，接收每日文化故事、新任务和盲盒奖励的提醒。' 
            : 'Enable push notifications to receive daily cultural stories, new missions, and blind box drops.'}
        </p>
        <button 
          onClick={enablePush}
          disabled={pushStatus === 'granted'}
          style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: pushStatus === 'granted' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(212, 133, 10, 0.1)', border: `1px solid ${pushStatus === 'granted' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(212, 133, 10, 0.3)'}`, color: pushStatus === 'granted' ? '#34C759' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: pushStatus === 'granted' ? 'default' : 'pointer', fontWeight: 600 }}>
          <Bell size={16} /> {pushStatus === 'granted' ? (language === 'ZH' ? '通知已开启' : 'Notifications Active') : (language === 'ZH' ? '开启推送通知' : 'Enable Push Notifications')}
        </button>
      </div>

      {/* WeChat Share Modal */}
      {shareItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '300px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{language === 'ZH' ? '分享至微信' : 'Share to WeChat'}</h3>
            <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '24px' }}>
              {language === 'ZH' ? `炫耀你的 ${shareItem.rarity} 神器并获得 XP！` : `Show off your ${shareItem.rarity} artifact and gain XP!`}
            </p>
            <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#07C160', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onClick={() => {
                const text = language === 'ZH' 
                  ? `看看我在 Land of Stories 中解锁的 ${shareItem.rarity} 神器！` 
                  : `Check out this ${shareItem.rarity} artifact I unlocked in Land of Stories!`;
                const url = 'https://land-of-stories-demo.com';
                
                if (navigator.share) {
                  navigator.share({ title: 'Land of Stories', text, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(`${text} ${url}`);
                  alert(language === 'ZH' ? '链接已复制到剪贴板！' : 'Link copied to clipboard!');
                }
                
                shareArtifact(shareItem.id);
                setShareItem(null);
              }}>
              <Share2 size={32} color="#FFF" />
            </div>
            {!shareItem.shared && <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px' }}>+50 XP Bonus!</div>}
            <button onClick={() => setShareItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
              {language === 'ZH' ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Biometric Checkout Modal */}
      {checkoutState !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          
          {checkoutState === 'scanning' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px' }}>
                <Scan size={80} color="#34C759" />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#34C759', boxShadow: '0 0 10px #34C759', animation: 'scan 1.5s ease-in-out infinite alternate' }} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#FFF', marginBottom: '8px' }}>
                {language === 'ZH' ? '验证付款...' : 'Verifying Payment...'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Face ID / WeChat Pay</p>
            </div>
          )}

          {checkoutState === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <CheckCircle size={40} color="#FFF" />
              </div>
              <h3 style={{ fontSize: '24px', color: '#FFF', marginBottom: '12px', fontWeight: 700 }}>
                {language === 'ZH' ? '付款成功' : 'Payment Successful'}
              </h3>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', color: '#FFF', marginBottom: '4px' }}>$50.00</p>
                <p style={{ fontSize: '12px', color: 'var(--accent-primary)' }}>{language === 'ZH' ? '直接存入卡伦加基金' : 'Directly deposited to Kalunga Fund'}</p>
              </div>
            </div>
          )}
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { transform: translateY(0); }
              100% { transform: translateY(80px); }
            }
          `}} />
        </div>
      )}

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px' }}>{language === 'ZH' ? '编辑个人资料' : 'Edit Profile'}</h3>
              <button onClick={() => setIsEditingProfile(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ cursor: 'pointer', position: 'relative' }}>
                <img src={userAvatar} alt="User Avatar" style={{ width: '80px', height: '80px', borderRadius: '40px', objectFit: 'cover', border: '2px solid var(--accent-primary)', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--accent-primary)', borderRadius: '50%', padding: '6px' }}>
                  <Edit3 size={12} color="#FFF" />
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 200, 200);
                      setUserAvatar(compressed);
                    } catch (err) {
                      console.error("Avatar compression failed", err);
                    }
                  }
                }} />
              </label>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{language === 'ZH' ? '点击更改照片' : 'Tap to change photo'}</span>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '姓名' : 'Name'}</label>
              <input 
                type="text" 
                value={tempName} 
                onChange={e => setTempName(e.target.value)} 
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} 
              />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '头衔' : 'Title'}</label>
              <input 
                type="text" 
                value={tempTitle} 
                onChange={e => setTempTitle(e.target.value)} 
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} 
              />
            </div>

            <button 
              onClick={() => {
                setUserName(tempName);
                setUserTitle(tempTitle);
                setIsEditingProfile(false);
              }}
              style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', border: 'none', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px' }}>
              <Save size={20} /> {language === 'ZH' ? '保存更改' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Field Journal Edit Modal */}
      {editingJournalId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px' }}>{editingJournalId === 'new' ? (language === 'ZH' ? '新笔记' : 'New Note') : (language === 'ZH' ? '编辑笔记' : 'Edit Note')}</h3>
              <button onClick={() => setEditingJournalId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '标题' : 'Title'}</label>
              <input 
                type="text" 
                value={journalTempTitle} 
                onChange={e => setJournalTempTitle(e.target.value)} 
                placeholder={language === 'ZH' ? '例如：长者的故事' : 'e.g. Story of the Elder'}
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} 
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '现场笔记' : 'Field Notes'}</label>
              <textarea 
                value={journalTempContent} 
                onChange={e => setJournalTempContent(e.target.value)} 
                rows={5}
                placeholder={language === 'ZH' ? '写下你的发现...' : 'Write down your findings...'}
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' }} 
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600 }}>
                <Plus size={16} /> {language === 'ZH' ? '添加照片' : 'Attach Photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 800, 800);
                      setJournalTempImage(compressed);
                    } catch (err) {
                      console.error("Journal image compression failed", err);
                    }
                  }
                }} />
              </label>
              {journalTempImage && (
                <div style={{ position: 'relative', marginTop: '12px' }}>
                  <img src={journalTempImage} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                  <button onClick={() => setJournalTempImage(undefined)} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: '#FFF' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {editingJournalId !== 'new' && (
                <button 
                  onClick={() => {
                    if (window.confirm(language === 'ZH' ? '确定删除这条笔记吗？' : 'Are you sure you want to delete this note?')) {
                      deleteJournalEntry(editingJournalId);
                      setEditingJournalId(null);
                    }
                  }}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <Trash size={20} />
                </button>
              )}
              <button 
                onClick={() => {
                  if (!journalTempTitle.trim()) return;
                  if (editingJournalId === 'new') {
                    addJournalEntry(journalTempTitle, journalTempContent, journalTempImage, journalTempAudio);
                  } else {
                    updateJournalEntry(editingJournalId, journalTempTitle, journalTempContent, journalTempImage, journalTempAudio);
                  }
                  setEditingJournalId(null);
                }}
                style={{ flex: 3, padding: '16px', borderRadius: '16px', backgroundColor: 'var(--text-primary)', border: 'none', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px' }}>
                <Save size={20} fill="currentColor" /> {language === 'ZH' ? '保存' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Mentor;
