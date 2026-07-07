import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic as MicIcon, ChevronLeft, MapPin, AlertCircle, Play, Database, Brain, Search, Volume2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Talk: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([
    { id: 1, role: 'assistant', content: 'Hello, Explorer! I am Ana Terena, your cultural mentor. How can I assist you with your fieldwork today?', hasAudio: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ragStep, setRagStep] = useState(0); // 0: None, 1: Search, 2: Context, 3: Generating
  const [isTyping, setIsTyping] = useState(false);
  const [translatorMode, setTranslatorMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isOffline, language, aiMode } = useUser();

  // Translate initial message dynamically
  useEffect(() => {
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[0] && newMsgs[0].id === 1) {
        newMsgs[0].content = language === 'ZH' 
          ? '你好，探索者！我是你的文化导师 Ana Terena。今天我能为你提供什么帮助？'
          : 'Hello, Explorer! I am Ana Terena, your cultural mentor. How can I assist you with your fieldwork today?';
      }
      return newMsgs;
    });
  }, [language]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingLevel(Math.random() * 100);
      }, 100);
    } else {
      setRecordingLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, ragStep, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);
    setRagStep(1);

    // Simulate RAG Steps
    setTimeout(() => setRagStep(2), 1000);
    setTimeout(() => setRagStep(3), 2000);

    try {
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const systemPrompt = language === 'ZH' 
        ? "你叫 Ana Terena。你是巴西Kalunga社区的土著向导。请简短地回答（最多2句话），表现得热情、充满文化气息。"
        : "Your name is Ana Terena. You are a native guide from the Kalunga community in Brazil. Answer briefly (max 2 sentences), be welcoming and culturally rich.";
        
      const res = await fetch('/api/deepseek/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ],
          temperature: 0.7,
        })
      });
      const data = await res.json();
      
      const fallbackZh = "欢迎！在我们的Kalunga文化中，土地是我们神圣的家园。我们致力于在尊重自然的同时连接世界。";
      const fallbackEn = "Welcome! In our Kalunga culture, the land is our sacred home. We strive to connect the world while respecting nature.";
      const reply = data.choices?.[0]?.message?.content || (language === 'ZH' ? fallbackZh : fallbackEn);
      
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'assistant', 
        content: reply,
        hasAudio: true 
      }]);
      
      if ('vibrate' in navigator) navigator.vibrate(50); // Haptic feedback on reply received
      
      setIsLoading(false);
      setRagStep(0);
      
    } catch (err) {
      console.error(err);
      const errFallbackZh = "你好！由于网络波动，我暂时用传统的方式向你问好：愿自然的智慧指引你的旅程！";
      const errFallbackEn = "Hello! Due to the winds of connectivity, I greet you traditionally: May nature's wisdom guide your journey!";
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'assistant', 
        content: language === 'ZH' ? errFallbackZh : errFallbackEn 
      }]);
      setIsLoading(false);
      setRagStep(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ZH' ? 'zh-CN' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
          
          if (translatorMode) {
            setIsTyping(true);
            try {
              const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
              if (!apiKey) throw new Error("API Key missing");
              const res = await fetch('/api/deepseek/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [{ role: 'system', content: `Translate the following text to ${language === 'ZH' ? 'Chinese' : 'English'}. Reply ONLY with the translated text, nothing else.` }, { role: 'user', content: transcript }],
                  temperature: 0.3,
                })
              });
              const data = await res.json();
              const translated = data.choices?.[0]?.message?.content;
              if (translated) {
                playAudio(translated);
              } else {
                throw new Error("Empty translation");
              }
            } catch (e) {
              console.error(e);
              const fallback = language === 'ZH' ? "你好朋友，欢迎来到我们的村庄。" : "Hello friend, welcome to our village.";
              playAudio(fallback);
            } finally {
              setIsTyping(false);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          // Only unset if not handled by result
          setIsRecording(false);
        };

        recognition.start();
      } else {
        alert("Microfone não suportado neste navegador.");
        setIsRecording(false);
      }
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        console.log("TTS Triggered for:", text);
        window.speechSynthesis.resume(); // Fix for Chrome silence bug
        const utterance = new SpeechSynthesisUtterance(text);
        if (language === 'ZH') utterance.lang = 'zh-CN';
        else utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("TTS Error:", e);
      }
    } else {
      alert(language === 'ZH' ? '此浏览器不支持语音合成。' : 'Text-to-speech not supported.');
    }
  };

  if (isOffline) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>{language === 'ZH' ? '网络不可用' : 'Network Unavailable'}</h2>
        <p className="text-secondary" style={{ fontSize: '14px', maxWidth: '300px' }}>
          {language === 'ZH' ? '您当前处于离线状态。连接到网络以访问您的AI导师。' : 'You are currently offline. Connect to the cloud to access your AI Mentor.'}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="pill pill-dark" style={{ marginTop: '24px', border: 'none', padding: '12px 24px', cursor: 'pointer' }}>
          {language === 'ZH' ? '返回首页' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const renderRagStatus = () => {
    if (ragStep === 1) {
      return <><Search size={14} className="spin" /> <span>{language === 'ZH' ? '正在搜索向量数据库...' : 'Searching vector database...'}</span></>;
    }
    if (ragStep === 2) {
      return <><Database size={14} className="spin" /> <span>{language === 'ZH' ? '正在检索文化背景...' : 'Retrieving cultural context...'}</span></>;
    }
    if (ragStep === 3) {
      return <><Brain size={14} className="pulse" /> <span>{language === 'ZH' ? '正在生成响应 (DeepSeek)...' : 'Generating response (DeepSeek)...'}</span></>;
    }
    return null;
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      {/* If AI is disabled, show Authentic Archive Mode */}
      {!aiMode ? (
        <div style={{ flex: 1, padding: '20px', backgroundColor: 'var(--bg-main)', overflowY: 'auto', paddingBottom: '100px' }}>
          <header style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: 'rgba(255,59,48,0.1)', color: '#FF3B30', borderRadius: '4px', fontSize: '10px', fontWeight: 700, marginBottom: '8px' }}>
              {language === 'ZH' ? 'AI已停用' : 'AI DISABLED'}
            </div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>
              {language === 'ZH' ? '纯正口述档案馆' : 'Authentic Oral Archive'}
            </h1>
            <p className="text-secondary" style={{ fontSize: '14px', marginTop: '8px' }}>
              {language === 'ZH' ? '您正在访问未经过滤的真实社区录音。' : 'You are accessing raw, unfiltered community recordings.'}
            </p>
          </header>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { 
                title: language === 'ZH' ? '创世神话 (1998)' : 'Creation Myth (1998)', 
                type: 'Audio Cassette', 
                duration: '14:20',
                text: language === 'ZH' ? '一开始，河流是由星星的眼泪诞生的。我们的祖先学会了如何倾听水的声音。' : 'In the beginning, the rivers were born from the tears of the stars. Our ancestors learned how to listen to the water.'
              },
              { 
                title: language === 'ZH' ? '治疗草药指南' : 'Healing Herbs Guide', 
                type: 'Video Record', 
                duration: '08:45',
                text: language === 'ZH' ? '森林药房拥有我们所需的一切。这片叶子，当被阳光烤干时，可以治愈最深的伤口。' : 'The forest pharmacy holds everything we need. This leaf, when dried by the sun, heals the deepest wounds.'
              },
              { 
                title: language === 'ZH' ? '雨季仪式' : 'Rain Season Rituals', 
                type: 'Transcribed Text', 
                duration: '20 Pages',
                text: language === 'ZH' ? '当第一滴雨落下时，我们唱歌感谢天空。这是一个我们必须保存的循环。' : 'When the first rain falls, we sing to thank the sky. It is a cycle we must preserve.'
              }
            ].map((record, idx) => (
              <div 
                key={idx} 
                onClick={() => playAudio(record.text)}
                style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 133, 10, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(212, 133, 10, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Play size={24} color="var(--accent-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{record.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{record.type} • {record.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Chat Header */}
          <header style={{ padding: '20px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                <ChevronLeft size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', overflow: 'hidden' }}>
                    <img src="/avatars/ana.png" alt="Ana Terena" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '6px', backgroundColor: '#34C759', border: '2px solid var(--bg-main)' }}></div>
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', margin: 0 }}>Ana Terena</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <MapPin size={10} /> Kalunga Community
                  </div>
                </div>
              </div>
            </div>
            <div onClick={() => setTranslatorMode(!translatorMode)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--accent-primary)' }}>
              <Globe size={18} style={{ marginRight: '8px', opacity: translatorMode ? 1 : 0.5 }} />
              <span>{language === 'ZH' ? '语音翻译' : 'Translator'}</span>
            </div>
          </header>

          {translatorMode ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{language === 'ZH' ? '同声传译' : 'Live Translation'}</h2>
                <p className="text-secondary">{language === 'ZH' ? '按住说话。松开翻译。' : 'Hold to speak. Release to translate.'}</p>
              </div>

              <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isRecording && (
                  <>
                    <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '2px solid var(--accent-primary)', opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
                    <div style={{ position: 'absolute', bottom: '-40px', display: 'flex', gap: '4px', alignItems: 'flex-end', height: '30px' }}>
                      {[...Array(10)].map((_, i) => (
                        <div key={i} style={{ width: '4px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px', height: `${Math.random() * recordingLevel}%`, transition: 'height 0.1s' }}></div>
                      ))}
                    </div>
                  </>
                )}
                <button 
                  onMouseDown={() => setIsRecording(true)}
                  onMouseUp={() => {}}
                  onTouchStart={() => setIsRecording(true)}
                  onTouchEnd={() => {}}
                  style={{ width: '120px', height: '120px', borderRadius: '60px', backgroundColor: isRecording ? 'var(--accent-primary)' : 'var(--bg-card)', border: `4px solid ${isRecording ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', transform: isRecording ? 'scale(1.1)' : 'scale(1)' }}>
                  <MicIcon size={48} color={isRecording ? 'var(--bg-main)' : 'var(--accent-primary)'} />
                </button>
              </div>

              {isTyping && (
                <div style={{ marginTop: '60px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-primary)' }}>
                  <Volume2 size={24} style={{ animation: 'pulse 1s infinite' }} />
                  <span style={{ fontWeight: 600 }}>{language === 'ZH' ? '翻译并播放...' : 'Translating and playing...'}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
                <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>TODAY 09:41 AM</div>
                
                {messages.map((msg, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '80%', 
                      backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: msg.role === 'user' ? '#FFF' : 'var(--text-primary)',
                      padding: '12px 16px', 
                      borderRadius: '16px',
                      borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      position: 'relative'
                    }}>
                      {msg.content}
                      {msg.hasAudio && msg.role === 'assistant' && (
                        <div 
                          onClick={() => playAudio(msg.content)}
                          style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '12px', width: 'fit-content' }}>
                          <Play size={12} fill="currentColor" />
                          <span style={{ fontSize: '10px', fontWeight: 600 }}>{language === 'ZH' ? '播放音频' : 'PLAY AUDIO'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && ragStep > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeIn 0.3s' }}>
                    <div style={{ backgroundColor: 'rgba(74, 158, 142, 0.1)', border: '1px solid rgba(74, 158, 142, 0.3)', padding: '8px 12px', borderRadius: '12px', color: 'var(--accent-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderRagStatus()}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-main)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', position: 'fixed', bottom: '70px', left: 0, right: 0, maxWidth: '480px', margin: '0 auto', zIndex: 50 }}>
                <div style={{ flex: 1, backgroundColor: 'var(--bg-card)', borderRadius: '24px', padding: '10px 16px', display: 'flex', alignItems: 'center', border: isRecording ? '1px solid var(--accent-secondary)' : 'none' }}>
                  {isRecording ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', color: 'var(--accent-secondary)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: 'var(--accent-secondary)', animation: 'pulse 1.5s infinite' }}></div>
                      <span style={{ fontSize: '14px' }}>{language === 'ZH' ? '聆听中...' : 'Listening...'}</span>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder={language === 'ZH' ? '询问导师...' : 'Ask your mentor...'}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
                    />
                  )}
                </div>
                
                {input.trim() ? (
                  <div 
                    onClick={handleSend}
                    style={{ width: '44px', height: '44px', borderRadius: '22px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={18} />
                  </div>
                ) : (
                  <div 
                    onClick={toggleRecording}
                    style={{ width: '44px', height: '44px', borderRadius: '22px', backgroundColor: isRecording ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.3s' }}>
                    <MicIcon size={18} color={isRecording ? '#000' : 'var(--text-secondary)'} />
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .pulse { animation: pulse 1.5s infinite; }
      `}</style>
    </div>
  );
};

export default Talk;
