import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, User, MessageSquare, Globe, Database, Volume2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

type Message = {
  id: string;
  sender: 'user' | 'elder' | 'youth' | 'historian';
  text: string;
};

const Council: React.FC = () => {
  const { language, aiMode } = useUser();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('council_messages');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', sender: 'elder', text: language === 'ZH' ? '欢迎来到村庄议事厅。关于我们的传统，你想了解什么？' : 'Welcome to the Village Council. What would you like to know about our traditions?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState<'elder' | 'youth' | 'historian' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem('council_messages', JSON.stringify(messages));
  }, [messages, isTyping]);

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ZH' ? 'zh-CN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Simulate Multi-Agent Orchestration
    triggerAgentResponse(input);
  };

  const triggerAgentResponse = async (userText: string) => {
    setIsTyping('historian');
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    const msgLower = userText.toLowerCase();
    
    // Smart Fallback Generation Logic
    const getFallbacks = () => {
      if (msgLower.includes('food') || msgLower.includes('comida') || msgLower.includes('comer')) {
        return {
          h: language === 'ZH' ? '据记载，我们的主食木薯自17世纪以来就滋养着这片土地上的逃亡奴隶。' : 'Records show cassava has nourished the inhabitants of this land since the 17th century.',
          e: language === 'ZH' ? '不要忘记感谢土壤。我们种什么，土地就还给我们什么。' : 'Never forget to thank the soil. What we plant, the earth returns to us.',
          y: language === 'ZH' ? '我们在网上卖我们的面粉！它是完全有机的，全世界的人都喜欢它。' : 'We actually sell our flour online now! It is totally organic and people everywhere love it.'
        };
      } else if (msgLower.includes('history') || msgLower.includes('história') || msgLower.includes('historia')) {
        return {
          h: language === 'ZH' ? '卡伦加是巴西最大的残存逃亡奴隶社区，横跨三个城市。' : 'The Kalunga is the largest remnant quilombola community in Brazil, spanning across three municipalities.',
          e: language === 'ZH' ? '我们祖先的鲜血和汗水浸透了这些山脉，我们永远不会离开它们。' : 'Our ancestors blood and sweat soaked these mountains, and we shall never leave them.',
          y: language === 'ZH' ? '我们正在使用无人机来绘制我们的历史领土，以保护它免受森林砍伐！' : 'We are using drones to map our historical territory and protect it from deforestation!'
        };
      } else {
        return {
          h: language === 'ZH' ? '跨越数百年的口述传统证明了我们的韧性。' : 'Oral traditions spanning hundreds of years prove our resilience.',
          e: language === 'ZH' ? '大自然总能找到出路。就像水在岩石中穿行一样，我们的人民也是如此。' : 'Nature always finds a way. Just as water carves through rocks, so do our people.',
          y: language === 'ZH' ? '太棒了！只要我们记住根，世界就是我们的。' : 'That is awesome! The world is ours to explore as long as we remember our roots.'
        };
      }
    };

    const fallbacks = getFallbacks();

    if (!apiKey) {
      // Simulate orchestration offline
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString() + 'h', sender: 'historian', text: fallbacks.h }]);
        setIsTyping('elder');
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now().toString() + 'e', sender: 'elder', text: fallbacks.e }]);
          setIsTyping('youth');
          setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now().toString() + 'y', sender: 'youth', text: fallbacks.y }]);
            setIsTyping(null);
          }, 1500);
        }, 1500);
      }, 1500);
      return;
    }

    try {
      const callAgent = async (_role: string, prompt: string) => {
        const res = await fetch('/api/deepseek/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: userText }
            ],
            temperature: 0.8,
          })
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      };

      const histPrompt = language === 'ZH' ? '你是村庄的历史学家。用一句话客观地提供关于用户问题的历史事实。' : 'You are the village historian. Provide a 1-sentence objective historical fact about the user\'s topic.';
      const elderPrompt = language === 'ZH' ? '你是村庄的长老。用一句话提供关于用户问题的传统智慧和自然敬畏。' : 'You are the village elder. Provide a 1-sentence traditional wisdom and respect for nature regarding the user\'s topic.';
      const youthPrompt = language === 'ZH' ? '你是村里的年轻人。用一句话说明现代技术或年轻人如何看待或改变用户提到的这个问题。' : 'You are a village youth. Provide a 1-sentence modern perspective on how technology or youth view the user\'s topic.';

      // 1. Historian
      setIsTyping('historian');
      let histText = await callAgent('historian', histPrompt);
      if (!histText) histText = fallbacks.h;
      setMessages(prev => [...prev, { id: Date.now().toString() + 'h', sender: 'historian', text: histText }]);

      // 2. Elder
      setIsTyping('elder');
      let elderText = await callAgent('elder', elderPrompt);
      if (!elderText) elderText = fallbacks.e;
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', sender: 'elder', text: elderText }]);

      // 3. Youth
      setIsTyping('youth');
      let youthText = await callAgent('youth', youthPrompt);
      if (!youthText) youthText = fallbacks.y;
      setMessages(prev => [...prev, { id: Date.now().toString() + 'y', sender: 'youth', text: youthText }]);

    } catch (e) {
      // If network fails, append the offline responses instead of stopping
      setMessages(prev => [...prev, { id: Date.now().toString() + 'h', sender: 'historian', text: fallbacks.h }]);
      setIsTyping('elder');
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString() + 'e', sender: 'elder', text: fallbacks.e }]);
        setIsTyping('youth');
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now().toString() + 'y', sender: 'youth', text: fallbacks.y }]);
          setIsTyping(null);
        }, 1000);
      }, 1000);
      return; // return to avoid setting isTyping to null below immediately
    } finally {
      // Only set to null if we didn't enter the catch block with timeouts
      if (apiKey) {
        setIsTyping(null);
      }
    }
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
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
      {/* If AI is disabled, show Authentic Library */}
      {!aiMode ? (
        <div style={{ flex: 1, padding: '20px', backgroundColor: 'var(--bg-main)', overflowY: 'auto', paddingBottom: '100px' }}>
          <header style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: 'rgba(255,59,48,0.1)', color: '#FF3B30', borderRadius: '4px', fontSize: '10px', fontWeight: 700, marginBottom: '8px' }}>
              {language === 'ZH' ? 'AI已停用' : 'AI DISABLED'}
            </div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>
              {language === 'ZH' ? '长者智慧档案馆' : 'Elders Wisdom Archive'}
            </h1>
            <p className="text-secondary" style={{ fontSize: '14px', marginTop: '8px' }}>
              {language === 'ZH' ? '无AI干预的真实原住民会议记录。' : 'Authentic indigenous council records without AI intervention.'}
            </p>
          </header>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { 
                title: language === 'ZH' ? 'Kalunga 人 (巴西)' : 'The Kalunga People (Brazil)', 
                gradient: 'linear-gradient(135deg, #D4850A, #8B5704)',
                url: 'https://pt.wikipedia.org/wiki/Kalungas',
                desc: language === 'ZH' 
                  ? 'Kalunga 是巴西最大的 Quilombola（逃亡黑奴的后裔）社区，位于戈亚斯州的塞拉多生物群落中。他们保存了三个多世纪的非洲-巴西传统和可持续农业实践。' 
                  : 'The Kalunga are the largest Quilombola (descendants of escaped slaves) community in Brazil, located in the Cerrado biome of Goiás. They have preserved Afro-Brazilian traditions and sustainable farming for over three centuries.' 
              },
              { 
                title: language === 'ZH' ? '苗族文化 (中国)' : 'Miao Culture (China)', 
                gradient: 'linear-gradient(135deg, #4A9E8E, #1F5F54)',
                url: 'https://en.wikipedia.org/wiki/Miao_people',
                desc: language === 'ZH' 
                  ? '苗族以其精美的银饰、复杂的刺绣（蜡染）和芦笙节而闻名。他们的口述历史通过代代相传的纺织品图案被记录下来。' 
                  : 'The Miao people are renowned for their exquisite silver jewelry, intricate embroidery (Batik), and the Lusheng festival. Their oral history is literally woven into their textile patterns, passed down through generations.' 
              },
              { 
                title: language === 'ZH' ? 'Xingu 原住民公园 (巴西)' : 'Xingu Indigenous Park (Brazil)', 
                gradient: 'linear-gradient(135deg, #5E5CE6, #2E2C8F)',
                url: 'https://pib.socioambiental.org/en/Povo:Xingu',
                desc: language === 'ZH' 
                  ? '由 Villas-Bôas 兄弟于1961年建立，Xingu 是世界上第一个且最大的原住民保护区之一。这里有16个不同的部落和平共处，共享独特的跨部落文化。' 
                  : 'Created in 1961 by the Villas-Bôas brothers, the Xingu is one of the world\'s first and largest indigenous reserves. It is home to 16 different tribes living in peace and sharing a unique inter-tribal culture.' 
              }
            ].map((record, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ height: '160px', width: '100%', background: record.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Globe size={80} color="#FFF" style={{ opacity: 0.1, position: 'absolute', right: '-10px', bottom: '-10px' }} />
                  <Database size={64} color="#FFF" style={{ opacity: 0.2 }} />
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--accent-primary)' }}>{record.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {record.desc}
                  </p>
                  <button 
                    onClick={() => window.open(record.url, '_blank')}
                    style={{ marginTop: '16px', backgroundColor: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 133, 10, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {language === 'ZH' ? '阅读人类学文献' : 'READ ANTHROPOLOGICAL RECORD'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '90px' }}>
          <header style={{ padding: '20px', flexShrink: 0 }}>
            <div className="text-secondary" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>MULTI-AGENT AI</div>
            <h1 style={{ fontSize: '24px', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users color="var(--accent-primary)" />
              {language === 'ZH' ? '村庄议事厅' : 'Village Council'}
            </h1>
            <p className="text-secondary" style={{ fontSize: '14px' }}>
              {language === 'ZH' ? '听取不同视角的见解。' : 'Listen to insights from different perspectives.'}
            </p>
          </header>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px', paddingLeft: '20px' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: getAgentColor(m.sender), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {m.sender === 'user' ? <User size={16} color="#FFF" /> : <img src={`/avatars/${m.sender}.png`} alt={m.sender} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getAgentName(m.sender)}</span>
                {m.sender !== 'user' && (
                  <button onClick={() => speakText(m.text)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <Volume2 size={12} color="var(--accent-secondary)" />
                  </button>
                )}
              </div>
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
            <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={`/avatars/${isTyping}.png`} alt={isTyping} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      )}
    </div>
  );
};

export default Council;
