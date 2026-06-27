import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, User, MessageSquare } from 'lucide-react';
import { useUser } from '../context/UserContext';

type Message = {
  id: string;
  sender: 'user' | 'elder' | 'youth' | 'historian';
  text: string;
};

const Council: React.FC = () => {
  const { language, aiMode } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'elder', text: language === 'ZH' ? '欢迎来到村庄议事厅。关于我们的传统，你想了解什么？' : 'Welcome to the Village Council. What would you like to know about our traditions?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState<'elder' | 'youth' | 'historian' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Simulate Multi-Agent Orchestration
    triggerAgentResponse();
  };

  const triggerAgentResponse = () => {
    // 1. Historian replies first (facts)
    setIsTyping('historian');
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + 'h', 
        sender: 'historian', 
        text: language === 'ZH' ? '从历史上看，这种习俗起源于明朝，为了庆祝丰收。' : 'Historically, this practice originated during the Ming Dynasty to celebrate the harvest.' 
      }]);
      setIsTyping('elder');
      
      // 2. Elder adds traditional wisdom
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: Date.now().toString() + 'e', 
          sender: 'elder', 
          text: language === 'ZH' ? '是的。它教会我们尊重自然，敬畏大地。' : 'Indeed. It teaches us to respect nature and revere the earth.' 
        }]);
        setIsTyping('youth');
        
        // 3. Youth adds modern perspective
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now().toString() + 'y', 
            sender: 'youth', 
            text: language === 'ZH' ? '现在我们还会在短视频上直播这个仪式，让更多人看到！' : 'Nowadays we also livestream this ceremony on short-video apps so more people can see it!' 
          }]);
          setIsTyping(null);
        }, 2000);
      }, 2500);
    }, 1500);
  };

  const getAgentColor = (sender: string) => {
    if (sender === 'elder') return '#D4850A'; // Epic/Gold
    if (sender === 'youth') return '#4A9E8E'; // Primary Green
    if (sender === 'historian') return '#5E5CE6'; // Purple
    return 'var(--bg-card)';
  };

  const getAgentName = (sender: string) => {
    if (sender === 'elder') return language === 'ZH' ? '长老' : 'Elder';
    if (sender === 'youth') return language === 'ZH' ? '年轻人' : 'Youth';
    if (sender === 'historian') return language === 'ZH' ? '历史学家' : 'Historian';
    return 'You';
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '90px' }}>
      <header style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div className="text-secondary" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>MULTI-AGENT AI</div>
        <h1 style={{ fontSize: '24px', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users color="var(--accent-primary)" />
          {language === 'ZH' ? '村庄议事厅' : 'Village Council'}
        </h1>
        <p className="text-secondary" style={{ fontSize: '14px' }}>
          {language === 'ZH' ? '听取不同视角的见解。' : 'Listen to insights from different perspectives.'}
        </p>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: getAgentColor(m.sender), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {m.sender === 'user' ? <User size={16} color="#FFF" /> : <MessageSquare size={16} color="#FFF" />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{getAgentName(m.sender)}</span>
              <div style={{ 
                backgroundColor: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)', 
                color: m.sender === 'user' ? 'var(--bg-main)' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                fontSize: '14px',
                lineHeight: 1.5,
                boxShadow: m.sender !== 'user' ? `0 2px 10px ${getAgentColor(m.sender)}20` : 'none',
                borderLeft: m.sender !== 'user' ? `2px solid ${getAgentColor(m.sender)}` : 'none'
              }}>
                {m.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && aiMode && (
          <div style={{ display: 'flex', gap: '12px', opacity: 0.7 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '16px', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '2px', backgroundColor: '#FFF', animation: 'pulse 1s infinite' }}></div>
              <div style={{ width: '4px', height: '4px', borderRadius: '2px', backgroundColor: '#FFF', animation: 'pulse 1s infinite 0.2s' }}></div>
              <div style={{ width: '4px', height: '4px', borderRadius: '2px', backgroundColor: '#FFF', animation: 'pulse 1s infinite 0.4s' }}></div>
            </div>
          </div>
        )}
        
        {!aiMode && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7, padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: 'rgba(74, 158, 142, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={24} color="var(--accent-secondary)" />
            </div>
            <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: 1.5 }}>
              {language === 'ZH' ? 'AI 议事厅已禁用。显示真实的口述历史记录。' : 'AI Council disabled. Displaying authentic oral history records.'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={!aiMode}
            placeholder={aiMode 
              ? (language === 'ZH' ? '向村庄议事厅提问...' : 'Ask the council...') 
              : (language === 'ZH' ? '（只读模式）' : '(Read-only mode)')}
            style={{ 
              flex: 1, 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '16px', 
              borderRadius: '24px', 
              color: '#FFF', 
              fontSize: '16px', 
              outline: 'none',
              opacity: aiMode ? 1 : 0.5
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!aiMode || !input.trim()}
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '28px', 
              backgroundColor: aiMode ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', 
              border: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: aiMode ? 'pointer' : 'not-allowed',
              opacity: aiMode ? 1 : 0.5
            }}>
            <Send size={24} color={aiMode ? 'var(--bg-main)' : 'rgba(255,255,255,0.3)'} />
          </button>
      </div>
    </div>
    </div>
  );
};

export default Council;
