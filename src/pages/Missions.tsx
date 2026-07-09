import React, { useState, useEffect, useRef } from 'react';
import { Lock, Camera, Mic as MicIcon, Users, Utensils, QrCode, Sparkles, Share2, Loader2, Scan, Crown, Edit3, X, Save, Image as ImageIcon, Plus, Trash } from 'lucide-react';
import { useUser } from '../context/UserContext';
import type { Mission } from '../context/UserContext';
import { compressImage } from '../utils/imageUtils';

const iconMap: Record<string, any> = {
  'Camera': <Camera size={20} color="var(--accent-secondary)" />,
  'Mic': <MicIcon size={20} color="var(--accent-secondary)" />,
  'Lock': <Lock size={20} color="var(--text-secondary)" />,
  'Users': <Users size={20} color="var(--accent-secondary)" />,
  'Utensils': <Utensils size={20} color="var(--accent-secondary)" />,
};

const Missions: React.FC = () => {
  const { missions, level, xp, completeMission, updateMission, addMission, deleteMission, language, aiMode, addJournalEntry, submitMissionForReview, approveMission, rejectMission } = useUser();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isElderMode, setIsElderMode] = useState(false);
  const [editingMissionId, setEditingMissionId] = useState<number | null>(null);
  const [reviewingMissionId, setReviewingMissionId] = useState<number | null>(null);
  const [tempMissionTitle, setTempMissionTitle] = useState('');
  const [tempMissionDesc, setTempMissionDesc] = useState('');
  const [tempMissionImage, setTempMissionImage] = useState<string | undefined>(undefined);
  const [tempMissionIcon, setTempMissionIcon] = useState('Camera');
  const [tempMissionXp, setTempMissionXp] = useState(100);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isReviewingPhoto, setIsReviewingPhoto] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);
  const [isMicOpen, setIsMicOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  
  const [targetMissionId, setTargetMissionId] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const activeMissions = missions.filter(m => m.status === 'active' || m.status === 'locked' || (!isElderMode && m.status === 'pending_review'));
  const completedMissions = missions.filter(m => m.status === 'completed');
  const pendingMissions = missions.filter(m => m.status === 'pending_review');

  const xpForNextLevel = 1200 * (level - 2);
  const progressPercent = (xp / xpForNextLevel) * 100;

  const handleComplete = (id: number, iconName: string) => {
    if (iconName === 'Camera') {
      setTargetMissionId(id);
      setIsCameraOpen(true);
    } else if (iconName === 'Lock') {
      setTargetMissionId(id);
      setIsQrOpen(true);
    } else if (iconName === 'Mic') {
      setTargetMissionId(id);
      setIsMicOpen(true);
      setRecordedAudio(null);
      audioChunksRef.current = [];
    } else {
      completeMission(id);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setCapturedPhoto(dataUrl);

    setFlash(1);
    setTimeout(() => setFlash(0), 100);
    setTimeout(() => {
      setIsCameraOpen(false);
      setIsReviewingPhoto(true);
    }, 600);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800);
        setCapturedPhoto(compressed);
        setIsCameraOpen(false);
        setIsReviewingPhoto(true);
      } catch (err) {
        console.error("Gallery upload failed", err);
      }
    }
  };

  const submitPhotoForReview = () => {
    if (targetMissionId && capturedPhoto) {
      submitMissionForReview(targetMissionId, capturedPhoto);
      // Wait, let's also show the postcard here so the tourist gets the artifact
      setShowPostcard(true);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }
    setIsReviewingPhoto(false);
  };

  const savePostcardAndComplete = () => {
    if (targetMissionId) {
      const mission = missions.find(m => m.id === targetMissionId);
      if (mission && capturedPhoto) {
        addJournalEntry(
          language === 'ZH' ? `任务日志: ${mission.title}` : `Field Log: ${mission.title}`, 
          language === 'ZH' ? '正在等待社区领袖的审核。' : 'Awaiting review from Community Leader.', 
          capturedPhoto
        );
      }
    }
    setShowPostcard(false);
    setTargetMissionId(null);
    setCapturedPhoto(null);
  };

  const simulateQrScan = () => {
    setFlash(1);
    setTimeout(() => setFlash(0), 100);
    setTimeout(() => {
      if (targetMissionId) {
        completeMission(targetMissionId);
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      }
      setIsQrOpen(false);
      setTargetMissionId(null);
    }, 600);
  };

  const handleScanQrGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If they pick a file from gallery, simulate a scan completion
    if (e.target.files && e.target.files.length > 0) {
      simulateQrScan();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setRecordedAudio(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Audio recording failed", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitAudioForReview = () => {
    if (targetMissionId && recordedAudio) {
      const mission = missions.find(m => m.id === targetMissionId);
      if (mission) {
        addJournalEntry(
          language === 'ZH' ? `语音日志: ${mission.title}` : `Audio Log: ${mission.title}`, 
          language === 'ZH' ? '从实地采访任务中保存的音频。' : 'Audio recording saved from interview mission.', 
          undefined,
          recordedAudio
        );
      }
      completeMission(targetMissionId);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }
    setIsMicOpen(false);
    setTargetMissionId(null);
    setRecordedAudio(null);
  };

  const MissionCard = ({ mission, onComplete }: { mission: Mission, onComplete?: () => void }) => {
    return (
      <div 
        onClick={() => {
          if (isElderMode) {
            if (mission.status === 'pending_review') {
              setReviewingMissionId(mission.id);
            } else {
              setTempMissionTitle(mission.title);
              setTempMissionDesc(mission.desc);
              setTempMissionImage(mission.image);
              setTempMissionIcon(mission.iconName);
              setTempMissionXp(mission.xp);
              setEditingMissionId(mission.id);
            }
          } else {
            if (mission.status === 'locked') return;
            if (mission.status === 'completed') return;
            if (mission.status === 'pending_review') {
              if (mission.iconName === 'Camera') {
                setCapturedPhoto(mission.submissionImage || null);
                setTargetMissionId(mission.id);
                setIsReviewingPhoto(true);
              }
              return;
            }
            if (onComplete) onComplete();
          }
        }}
        style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', opacity: mission.status === 'locked' ? 0.6 : 1, cursor: (isElderMode || mission.status === 'pending_review' || (!isElderMode && mission.status !== 'locked' && mission.status !== 'completed')) ? 'pointer' : 'default', border: isElderMode ? '1px dashed rgba(212, 133, 10, 0.3)' : '1px solid transparent' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {mission.image ? (
              <img src={mission.image} alt="Mission" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              iconMap[mission.iconName]
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span className={`pill ${mission.catColor ? `pill-${mission.catColor}` : ''}`}>{mission.category || 'Locked'}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>+{mission.xp} XP</span>
            </div>
            <h3 style={{ fontSize: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mission.title}
              {isElderMode && <Edit3 size={14} color="var(--accent-primary)" />}
            </h3>
            <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '12px', lineHeight: 1.4 }}>{mission.desc}</p>
            
            {mission.status === 'active' && !isElderMode && (
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
                  onClick={(e) => { e.stopPropagation(); if(onComplete) onComplete(); }}
                  className="pill pill-amber" style={{ border: 'none', padding: '6px 16px', cursor: 'pointer', fontWeight: 600 }}>
                  {language === 'ZH' ? '完成' : 'Complete'}
                </button>
              </div>
            )}
            {mission.status === 'pending_review' && !isElderMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff9800', fontSize: '12px', fontWeight: 600 }}>
                <Loader2 size={14} style={{ animation: 'spin 2s linear infinite' }} />
                {language === 'ZH' ? '等待长者审核...' : 'Pending Elder Approval...'}
              </div>
            )}
            {mission.status === 'completed' && !isElderMode && (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '24px', margin: '4px 0' }}>{language === 'ZH' ? '任务' : 'Missions'}</h1>
            {isElderMode && (
              <button 
                onClick={() => {
                  setTempMissionTitle('');
                  setTempMissionDesc('');
                  setTempMissionImage(undefined);
                  setTempMissionIcon('Camera');
                  setTempMissionXp(100);
                  setEditingMissionId(-1);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74, 158, 142, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(74, 158, 142, 0.3)', padding: '8px 16px', borderRadius: '16px', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={16} /> {language === 'ZH' ? '新任务' : 'New Mission'}
              </button>
            )}
          </div>
          <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '16px' }}>{language === 'ZH' ? '完成任务以解锁新知识。' : 'Complete tasks to unlock new knowledge.'}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(74, 158, 142, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 158, 142, 0.3)' }}>
              <Lock size={14} color="var(--accent-secondary)" />
              <span style={{ fontSize: '10px', color: 'var(--accent-secondary)' }}>
                {language === 'ZH' ? 'Edge AI: 本地处理' : 'Local AI Privacy'}
              </span>
            </div>
            
            <button 
              onClick={() => setIsElderMode(!isElderMode)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: isElderMode ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)', backgroundColor: isElderMode ? 'rgba(212, 133, 10, 0.1)' : 'transparent', color: isElderMode ? 'var(--accent-primary)' : 'var(--text-secondary)', fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              <Crown size={14} />
              {language === 'ZH' ? '长者模式' : 'Elder Mode'}
            </button>
          </div>
        </header>

        {/* Level Progress */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span style={{ fontWeight: 600 }}>{language === 'ZH' ? '社区关系 (Guanxi) 等级' : 'Guanxi (Trust) Level'} {level}</span>
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
            {language === 'ZH' ? '进行中' : 'Active'} ({activeMissions.length + pendingMissions.length})
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
            <>
              {activeMissions.map(m => (
                <MissionCard key={m.id} mission={m} onComplete={() => handleComplete(m.id, m.iconName)} />
              ))}
              {pendingMissions.map(m => (
                <MissionCard key={m.id} mission={m} />
              ))}
            </>
          ) : (
            completedMissions.map(m => (
              <MissionCard key={m.id} mission={m} />
            ))
          )}
        </div>
      </div>

      {isCameraOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
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
          <div style={{ padding: '40px', display: 'flex', gap: '24px', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
            {/* Gallery Button */}
            <label style={{ width: '50px', height: '50px', borderRadius: '25px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ImageIcon size={24} color="#FFF" />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryUpload} />
            </label>
            
            {/* Native Capture Button */}
            <button 
              onClick={takePhoto}
              style={{ width: '70px', height: '70px', borderRadius: '35px', border: '4px solid var(--accent-primary)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '27px', backgroundColor: 'var(--accent-primary)' }}></div>
            </button>
            
            {/* Empty space for balance */}
            <div style={{ width: '50px' }}></div>
          </div>
        </div>
      )}

      {/* Tourist Photo Review Step */}
      {isReviewingPhoto && capturedPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, paddingBottom: '100px' }}>
             <img src={capturedPhoto} alt="Review" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, padding: '0 24px', display: 'flex', gap: '16px', zIndex: 3010 }}>
            <button 
              onClick={() => {
                setCapturedPhoto(null);
                setIsReviewingPhoto(false);
                setIsCameraOpen(true);
              }}
              style={{ flex: 1, padding: '16px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {language === 'ZH' ? '重拍' : 'Retake'}
            </button>
            <button 
              onClick={submitPhotoForReview}
              style={{ flex: 1, padding: '16px', borderRadius: '24px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {language === 'ZH' ? '提交审核' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}

      {/* AI Postcard Result */}
      {showPostcard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
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
            {capturedPhoto ? (
              <img src={capturedPhoto} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                {/* Fake traditional painting composition (fallback) */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(to bottom, #d9ccb9 0%, #F5F1E7 100%)' }}></div>
                <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80%', height: '40%', opacity: 0.6 }}>
                  {/* Abstract ink mountains / geometry */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100px', height: '80px', borderRadius: '100px 100px 0 0', backgroundColor: '#333' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: '60px', width: '120px', height: '140px', borderRadius: '100px 100px 0 0', backgroundColor: '#555' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '90px', height: '60px', borderRadius: '100px 100px 0 0', backgroundColor: '#222' }}></div>
                  <div style={{ position: 'absolute', top: '-40px', right: '40px', width: '40px', height: '40px', borderRadius: '20px', backgroundColor: '#c7151c' }}></div>
                </div>
              </>
            )}
            
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '30px', height: '100px', border: '1px solid #c7151c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#c7151c', fontFamily: 'serif', padding: '4px 0', backgroundColor: 'rgba(245, 241, 231, 0.8)' }}>
              <span style={{ writingMode: 'vertical-rl', letterSpacing: '4px' }}>{language === 'ZH' ? '文化传承' : 'HERITAGE'}</span>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>
                {language === 'ZH' ? '文化之桥 • ' : 'CULTURAL BRIDGES • '}
                {aiMode ? (language === 'ZH' ? 'AI 版本' : 'AI EDITION') : (language === 'ZH' ? '真实版本' : 'AUTHENTIC EDITION')}
              </div>
              <div style={{ fontSize: '10px', color: '#666' }}>{language === 'ZH' ? '今天通过文化扫描仪捕获' : 'Captured today via Cultural Scanner'}</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', marginBottom: '40px', display: 'flex', gap: '16px', width: '100%', maxWidth: '320px' }}>
            <button 
              onClick={savePostcardAndComplete}
              style={{ flex: 1, padding: '16px', borderRadius: '24px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
              <Save size={20} />
              {language === 'ZH' ? '存入日记' : 'Save to Journal'}
            </button>
            <button 
              onClick={() => {
                const text = language === 'ZH' ? '看看我在 Cultural Bridges 拍摄的照片！' : 'Look at this photo I captured on Cultural Bridges!';
                const url = 'https://cultural-bridges-demo.com';
                
                if (navigator.share) {
                  navigator.share({ title: 'Cultural Bridges', text, url }).catch(() => {});
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
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
            <div style={{ position: 'relative', width: '200px', height: '200px', border: '2px solid rgba(74, 158, 142, 0.5)', borderRadius: '16px', overflow: 'hidden', display: 'block' }}>
              {/* Animated laser */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', backgroundColor: '#4A9E8E', animation: 'scan 2s linear infinite', boxShadow: '0 0 8px 2px rgba(74,158,142,0.5)' }}></div>
              <QrCode size={120} color="rgba(255,255,255,0.1)" style={{ margin: '40px' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', cursor: 'pointer' }}>
                <ImageIcon size={20} />
                {language === 'ZH' ? '从相册选择' : 'From Gallery'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleScanQrGallery} />
              </label>
              
              <button 
                onClick={simulateQrScan}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '20px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                <Scan size={20} />
                {language === 'ZH' ? '扫描' : 'Scan'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Mic Recording Modal */}
      {isMicOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 3000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', color: '#FFF' }}>
            <span onClick={() => {
              setIsMicOpen(false);
              setRecordedAudio(null);
            }} style={{ cursor: 'pointer' }}>Cancel</span>
            <span style={{ fontWeight: 600 }}>{language === 'ZH' ? '录制采访' : 'Record Interview'}</span>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            {recordedAudio ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', padding: '20px' }}>
                <audio controls src={recordedAudio} style={{ width: '100%', maxWidth: '300px' }} />
                <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '300px' }}>
                  <button 
                    onClick={() => setRecordedAudio(null)}
                    style={{ flex: 1, padding: '16px', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    {language === 'ZH' ? '重录' : 'Retake'}
                  </button>
                  <button 
                    onClick={submitAudioForReview}
                    style={{ flex: 1, padding: '16px', borderRadius: '24px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    {language === 'ZH' ? '保存' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '60px', 
                  backgroundColor: isRecording ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '40px',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                }}>
                  <MicIcon size={60} color={isRecording ? '#FF3B30' : '#FFF'} />
                </div>

                <p style={{ color: '#FFF', fontSize: '18px', marginBottom: '24px' }}>
                  {isRecording ? (language === 'ZH' ? '录音中...' : 'Recording...') : (language === 'ZH' ? '准备录音' : 'Ready to Record')}
                </p>

                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '40px', 
                    backgroundColor: isRecording ? '#FF3B30' : 'var(--accent-primary)', 
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer' 
                  }}>
                  {isRecording ? <div style={{ width: '24px', height: '24px', backgroundColor: '#FFF', borderRadius: '4px' }}></div> : <MicIcon size={32} color="var(--bg-main)" />}
                </button>
              </>
            )}
            
          </div>
        </div>
      )}
      
      {/* Elder Mode Approval Modal */}
      {reviewingMissionId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '350px', border: '1px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={20} color="var(--accent-primary)" />
                {language === 'ZH' ? '审核提交' : 'Review Submission'}
              </h3>
              <button onClick={() => setReviewingMissionId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                {missions.find(m => m.id === reviewingMissionId)?.title}
              </p>
              {missions.find(m => m.id === reviewingMissionId)?.submissionImage && (
                <img 
                  src={missions.find(m => m.id === reviewingMissionId)?.submissionImage} 
                  alt="Submission" 
                  style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)' }} 
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => {
                  rejectMission(reviewingMissionId);
                  setReviewingMissionId(null);
                }}
                style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid #FF3B30', color: '#FF3B30', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                {language === 'ZH' ? '拒绝 (重试)' : 'Reject (Retake)'}
              </button>
              <button 
                onClick={() => {
                  approveMission(reviewingMissionId);
                  setReviewingMissionId(null);
                }}
                style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', border: 'none', color: 'var(--bg-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                {language === 'ZH' ? '批准' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elder Mode Mission Editor Modal */}
      {editingMissionId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '350px', border: '1px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={20} color="var(--accent-primary)" />
                {editingMissionId === -1 ? (language === 'ZH' ? '创建任务' : 'Create Mission') : (language === 'ZH' ? '编辑任务' : 'Edit Mission')}
              </h3>
              <button onClick={() => setEditingMissionId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '任务名称' : 'Mission Title'}</label>
              <input 
                type="text" 
                value={tempMissionTitle} 
                onChange={e => setTempMissionTitle(e.target.value)} 
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '16px' }} 
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '任务描述' : 'Mission Description'}</label>
              <textarea 
                value={tempMissionDesc} 
                onChange={e => setTempMissionDesc(e.target.value)} 
                rows={4}
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '任务类型' : 'Mission Type'}</label>
                <select 
                  value={tempMissionIcon} 
                  onChange={e => setTempMissionIcon(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '14px' }}
                >
                  <option value="Camera" style={{ color: '#000' }}>Photo (Camera)</option>
                  <option value="Mic" style={{ color: '#000' }}>Interview (Mic)</option>
                  <option value="Lock" style={{ color: '#000' }}>Scan (QR Code)</option>
                  <option value="Users" style={{ color: '#000' }}>Social (Users)</option>
                  <option value="Utensils" style={{ color: '#000' }}>Food (Utensils)</option>
                </select>
              </div>
              <div style={{ width: '100px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>XP</label>
                <input 
                  type="number" 
                  value={tempMissionXp} 
                  onChange={e => setTempMissionXp(parseInt(e.target.value) || 0)} 
                  style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', padding: '12px 16px', borderRadius: '12px', fontSize: '14px' }} 
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{language === 'ZH' ? '任务照片' : 'Mission Photo'}</label>
              
              {!tempMissionImage ? (
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', color: 'var(--accent-primary)' }}>
                  <Camera size={20} /> {language === 'ZH' ? '上传照片' : 'Upload Photo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImage(file, 400, 400);
                        setTempMissionImage(compressed);
                      } catch (err) {
                        console.error("Mission image compression failed", err);
                      }
                    }
                  }} />
                </label>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={tempMissionImage} alt="Mission Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setTempMissionImage(undefined)} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: '#FFF' }}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {editingMissionId !== -1 && (
                <button 
                  onClick={() => {
                    if (window.confirm(language === 'ZH' ? '确定删除此任务吗？' : 'Are you sure you want to delete this mission?')) {
                      deleteMission(editingMissionId);
                      setEditingMissionId(null);
                    }
                  }}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <Trash size={20} />
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (editingMissionId === -1) {
                    addMission({
                      title: tempMissionTitle,
                      desc: tempMissionDesc,
                      image: tempMissionImage,
                      icon: tempMissionIcon === 'Camera' ? '📸' : tempMissionIcon === 'Mic' ? '🎤' : '🌟',
                      iconName: tempMissionIcon as any,
                      category: 'Custom',
                      catColor: 'green',
                      progressStr: '0/1',
                      percent: 0,
                      xp: tempMissionXp,
                      status: 'active'
                    });
                  } else {
                    updateMission(editingMissionId, {
                      title: tempMissionTitle,
                      desc: tempMissionDesc,
                      image: tempMissionImage,
                      iconName: tempMissionIcon as any,
                      xp: tempMissionXp
                    });
                  }
                  setEditingMissionId(null);
                }}
                style={{ flex: 3, padding: '16px', borderRadius: '16px', backgroundColor: 'var(--accent-primary)', border: 'none', color: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px' }}>
                <Save size={20} fill="currentColor" /> {language === 'ZH' ? '保存更改' : 'Save Changes'}
              </button>
            </div>
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
