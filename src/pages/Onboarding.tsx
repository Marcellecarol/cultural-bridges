import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Compass, Sparkles, Check } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { completeOnboarding, language } = useUser();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [interest, setInterest] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (step === 1 && name.trim()) setStep(2);
    else if (step === 2 && interest) {
      setIsGenerating(true);
      setTimeout(() => {
        completeOnboarding(name);
      }, 2000);
    }
  };

  if (isGenerating) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B1310' }}>
        <Sparkles size={48} color="var(--accent-primary)" style={{ animation: 'pulse 1.5s infinite', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#FFF' }}>
          {language === 'ZH' ? '生成您的导师...' : 'Generating your Mentor...'}
        </h2>
        <p className="text-secondary" style={{ fontSize: '14px' }}>
          {language === 'ZH' ? '定制您的文化体验' : 'Tailoring your cultural experience'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 20px', backgroundColor: '#0B1310' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {step === 1 ? (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: 'rgba(212, 133, 10, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={32} color="var(--accent-primary)" />
              </div>
            </div>
            <h1 style={{ fontSize: '28px', marginBottom: '12px', textAlign: 'center' }}>
              {language === 'ZH' ? '欢迎来到故事之地' : 'Welcome to Land of Stories'}
            </h1>
            <p className="text-secondary" style={{ fontSize: '14px', textAlign: 'center', marginBottom: '40px' }}>
              {language === 'ZH' ? '您的文化桥梁之旅从这里开始。您叫什么名字？' : 'Your journey across cultural bridges starts here. What is your name?'}
            </p>
            <input 
              type="text" 
              placeholder={language === 'ZH' ? '输入您的名字' : 'Enter your name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#FFF', fontSize: '16px', outline: 'none' }}
            />
            
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div 
                onClick={() => setAgreed(!agreed)}
                style={{ width: '20px', height: '20px', borderRadius: '4px', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: agreed ? 'var(--accent-primary)' : 'transparent', cursor: 'pointer' }}>
                {agreed && <Check size={14} color="#0B1310" />}
              </div>
              <p className="text-secondary" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                {language === 'ZH' 
                  ? '我同意本地数据处理政策。所有数据（包括相机和 GPS）都在边缘端本地处理，不会未经同意上传到云端，确保隐私安全。' 
                  : 'I agree to the Local Data Processing Policy. All data (Camera/GPS) is processed locally on the Edge and never sent to the cloud, ensuring strict data privacy.'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '12px', textAlign: 'center' }}>
              {language === 'ZH' ? `很高兴见到你, ${name}` : `Nice to meet you, ${name}`}
            </h1>
            <p className="text-secondary" style={{ fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
              {language === 'ZH' ? '你最想探索什么？' : 'What are you most interested in exploring?'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['History & Ancestry', 'Gastronomy', 'Arts & Music'].map(item => (
                <div 
                  key={item}
                  onClick={() => setInterest(item)}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: interest === item ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    backgroundColor: 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>{item}</span>
                  {interest === item && <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)' }}></div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleNext}
        disabled={step === 1 ? (!name.trim() || !agreed) : !interest}
        style={{ 
          width: '100%', 
          padding: '16px', 
          borderRadius: '24px', 
          backgroundColor: (step === 1 ? (name.trim() && agreed) : interest) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
          color: (step === 1 ? (name.trim() && agreed) : interest) ? '#0B1310' : 'rgba(255,255,255,0.3)',
          border: 'none',
          fontSize: '16px',
          fontWeight: 700,
          cursor: (step === 1 ? (name.trim() && agreed) : interest) ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s'
        }}>
        {language === 'ZH' ? '继续' : 'Continue'}
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
