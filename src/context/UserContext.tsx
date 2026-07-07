import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Mission = {
  id: number;
  icon: string;
  iconName: 'Camera' | 'Mic' | 'Lock' | 'Users' | 'Utensils';
  title: string;
  desc: string;
  category: string;
  catColor: string;
  xp: number;
  progressStr: string;
  percent: number;
  status: 'active' | 'completed' | 'locked' | 'pending_review';
  image?: string; // Optional custom photo from Elder Mode
  submissionImage?: string; // Photo submitted by tourist
};

export type Community = {
  id: number;
  name: string;
  people: string;
  country: 'BR' | 'CN';
  status: 'visited' | 'available' | 'locked';
  desc: string;
  x: number; // for map (legacy)
  y: number; // for map (legacy)
  lat: number;
  lng: number;
};

export type Artifact = {
  id: string;
  name: string;
  missionId: number;
  unlocked: boolean;
  shared?: boolean; // For social fission
  rarity: 'Common' | 'Rare' | 'Epic';
  ich?: boolean;
};

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
  audio?: string;
};

interface UserContextData {
  xp: number;
  level: number;
  streak: number;
  routesDone: number;
  communitiesVisited: number;
  missions: Mission[];
  communities: Community[];
  inventory: Artifact[];
  isOffline: boolean;
  language: string;
  hasOnboarded: boolean;
  userName: string;
  userTitle: string;
  userAvatar: string;
  setUserName: (name: string) => void;
  setUserTitle: (title: string) => void;
  setUserAvatar: (avatar: string) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (title: string, content: string, image?: string, audio?: string) => void;
  updateJournalEntry: (id: string, title: string, content: string, image?: string, audio?: string) => void;
  deleteJournalEntry: (id: string) => void;
  rewardToClaim: Artifact | null;
  completeMission: (id: number) => void;
  updateMission: (id: number, updates: Partial<Mission>) => void;
  addMission: (mission: Omit<Mission, 'id'>) => void;
  deleteMission: (id: number) => void;
  submitMissionForReview: (id: number, image: string) => void;
  approveMission: (id: number) => void;
  rejectMission: (id: number) => void;
  exploreCommunity: (id: number) => void;
  completeRoute: () => void;
  toggleOffline: () => void;
  setLanguage: (lang: string) => void;
  completeOnboarding: (name: string, avatar: string) => void;
  claimReward: () => void;
  shareArtifact: (id: string | number) => void;
  aiMode: boolean;
  toggleAiMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(`los_${key}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => getInitialState('hasOnboarded', false));
  const [userName, setUserName] = useState<string>(() => getInitialState('userName', ''));
  const [userTitle, setUserTitle] = useState<string>(() => getInitialState('userTitle', 'Cultural Explorer'));
  const [userAvatar, setUserAvatar] = useState<string>(() => getInitialState('userAvatar', '/avatar_boy.png'));
  const [language, setLanguage] = useState<string>(() => getInitialState('language', 'EN'));
  const [xp, setXp] = useState<number>(() => getInitialState('xp', 250));
  const [streak] = useState<number>(() => getInitialState('streak', 3));
  const [routesDone, setRoutesDone] = useState<number>(() => getInitialState('routesDone', 1));
  
  const [inventory, setInventory] = useState<Artifact[]>(() => getInitialState('inventory', [
    { id: '1', name: 'Kalunga Woven Basket', missionId: 1, rarity: 'Rare', unlocked: true, shared: false },
    { id: '2', name: 'Miao Silver', missionId: 2, rarity: 'Epic', unlocked: false, shared: false, ich: true },
    { id: '3', name: 'QR Village Token', missionId: 3, rarity: 'Epic', unlocked: false, shared: false }
  ]));

  const [missions, setMissions] = useState<Mission[]>(() => getInitialState('missions', [
    { id: 1, icon: 'Camera', iconName: 'Camera', title: 'Cultural Photographer', desc: 'Take a photo of a traditional artifact', category: 'Documentation', catColor: 'purple', xp: 50, status: 'active', progressStr: '0/1', percent: 0 },
    { id: 2, icon: 'Mic', iconName: 'Mic', title: 'Oral History', desc: 'Record a story from a village elder', category: 'Preservation', catColor: 'blue', xp: 100, status: 'locked', progressStr: 'Locked', percent: 0 },
    { id: 3, icon: 'Lock', iconName: 'Lock', title: 'O2O: Scan Village Code', desc: 'Find and scan the QR code located in the community center', category: 'O2O', catColor: 'amber', xp: 150, status: 'active', progressStr: '0/1', percent: 0 }
  ]));

  const [isOffline, setIsOffline] = useState(false);
  const [aiMode, setAiMode] = useState<boolean>(() => getInitialState('aiMode', true));
  const [highContrast, setHighContrast] = useState<boolean>(() => getInitialState('highContrast', false));
  const [rewardToClaim, setRewardToClaim] = useState<Artifact | null>(null);
  
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getInitialState('journalEntries', [
    { id: '1', title: 'Arrival at Kalunga', content: 'The road was long, but the community is vibrant. I learned about their connection to the Cerrado today.', date: new Date().toISOString() }
  ]));

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem('los_hasOnboarded', JSON.stringify(hasOnboarded));
    localStorage.setItem('los_userName', JSON.stringify(userName));
    localStorage.setItem('los_userTitle', JSON.stringify(userTitle));
    localStorage.setItem('los_userAvatar', JSON.stringify(userAvatar));
    localStorage.setItem('los_language', JSON.stringify(language));
    localStorage.setItem('los_xp', JSON.stringify(xp));
    localStorage.setItem('los_streak', JSON.stringify(streak));
    localStorage.setItem('los_routesDone', JSON.stringify(routesDone));
    localStorage.setItem('los_inventory', JSON.stringify(inventory));
    localStorage.setItem('los_missions', JSON.stringify(missions));
    localStorage.setItem('los_aiMode', JSON.stringify(aiMode));
    localStorage.setItem('los_highContrast', JSON.stringify(highContrast));
    localStorage.setItem('los_journalEntries', JSON.stringify(journalEntries));
  }, [hasOnboarded, userName, userTitle, userAvatar, language, xp, streak, routesDone, inventory, missions, aiMode, highContrast, journalEntries]);

  const [communities, setCommunities] = useState<Community[]>([
    { id: 1, name: 'Kalunga Community', people: 'Kalunga People', country: 'BR', status: 'visited', desc: 'Largest quilombola territory in Brazil', x: 30, y: 40, lat: -13.79, lng: -47.45 },
    { id: 2, name: 'Xingu Park', people: 'Kamayurá People', country: 'BR', status: 'available', desc: 'Indigenous territory in Mato Grosso', x: 20, y: 35, lat: -11.66, lng: -53.47 },
    { id: 3, name: 'Rio Negro', people: 'Tukano People', country: 'BR', status: 'locked', desc: 'Northwestern Amazon region. (Unlocks at Lvl 4)', x: 15, y: 25, lat: -0.12, lng: -67.08 },
    { id: 4, name: 'Qiandongnan', people: 'Miao People', country: 'CN', status: 'visited', desc: 'Autonomous prefecture in Guizhou', x: 75, y: 30, lat: 26.58, lng: 107.98 },
  ]);

  const level = Math.floor(xp / 1200) + 3; // Mocking starting at level 3
  const communitiesVisited = communities.filter(c => c.status === 'visited').length;

  // Watch level to unlock Rio Negro
  useEffect(() => {
    if (level >= 4) {
      setCommunities(prev => prev.map(c => {
        if (c.id === 3 && c.status === 'locked') {
          return { ...c, status: 'available', desc: 'Northwestern Amazon region.' };
        }
        return c;
      }));
    }
  }, [level]);

  const completeOnboarding = (name: string, avatar: string) => {
    setUserName(name || 'Explorer');
    setUserAvatar(avatar || '/avatar_boy.png');
    setHasOnboarded(true);
  };

  const completeMission = (id: number) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && m.status !== 'completed') {
        setXp(prevXp => prevXp + m.xp);
        return { ...m, status: 'completed', progressStr: 'Completed', percent: 100 };
      }
      return m;
    }));

    // Unlock artifact if exists and trigger blind box
    const unlockedItem = inventory.find(item => item.missionId === id && !item.unlocked);
    if (unlockedItem) {
      setRewardToClaim(unlockedItem);
    }
  };

  const submitMissionForReview = (id: number, image: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'pending_review', submissionImage: image } : m));
  };

  const approveMission = (id: number) => {
    completeMission(id);
  };

  const rejectMission = (id: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: 'active', submissionImage: undefined } : m));
  };

  const updateMission = (id: number, updates: Partial<Mission>) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const addMission = (mission: Omit<Mission, 'id'>) => {
    setMissions(prev => {
      const newId = Math.max(...prev.map(m => m.id), 0) + 1;
      return [...prev, { ...mission, id: newId }];
    });
  };

  const deleteMission = (id: number) => {
    setMissions(prev => prev.filter(m => m.id !== id));
  };

  const addJournalEntry = (title: string, content: string, image?: string, audio?: string) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString(),
      image,
      audio
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  const updateJournalEntry = (id: string, title: string, content: string, image?: string) => {
    setJournalEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, title, content, image: image !== undefined ? image : entry.image, date: new Date().toISOString() } : entry
    ));
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const claimReward = () => {
    if (rewardToClaim) {
      setInventory(prev => prev.map(item => item.id === rewardToClaim.id ? { ...item, unlocked: true } : item));
      setRewardToClaim(null);
    }
  };

  const shareArtifact = (id: string | number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id && !item.shared) {
        setXp(x => x + 50); // Social fission bonus
        return { ...item, shared: true };
      }
      return item;
    }));
  };

  const exploreCommunity = (id: number) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === id && c.status === 'available') {
        setXp(prevXp => prevXp + 50); // Bonus XP for exploring
        return { ...c, status: 'visited' };
      }
      return c;
    }));
  };

  const completeRoute = () => {
    setRoutesDone(prev => prev + 1);
    setXp(prevXp => prevXp + 150);
  };

  const toggleOffline = () => setIsOffline(!isOffline);
  const toggleAiMode = () => setAiMode(!aiMode);
  const toggleHighContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    if (newVal) {
      document.body.classList.add('a11y-mode');
    } else {
      document.body.classList.remove('a11y-mode');
    }
  };

  // Sync class on mount
  useEffect(() => {
    if (highContrast) document.body.classList.add('a11y-mode');
  }, []);

  const translatedMissions = missions.map(m => {
    if (m.id === 1) return { ...m, title: language === 'ZH' ? '文化摄影师' : 'Cultural Photographer', desc: language === 'ZH' ? '拍下传统工艺品的照片' : 'Take a photo of a traditional artifact', category: language === 'ZH' ? '记录' : 'Documentation' };
    if (m.id === 2) return { ...m, title: language === 'ZH' ? '口述历史' : 'Oral History', desc: language === 'ZH' ? '记录村里长者的故事' : 'Record a story from a village elder', progressStr: language === 'ZH' ? '已锁定' : 'Locked', category: language === 'ZH' ? '保存' : 'Preservation' };
    if (m.id === 3) return { ...m, title: language === 'ZH' ? 'O2O：扫描村庄二维码' : 'O2O: Scan Village Code', desc: language === 'ZH' ? '找到并扫描社区中心的二维码' : 'Find and scan the QR code located in the community center', category: language === 'ZH' ? '线下' : 'O2O' };
    return m;
  });

  const translatedInventory = inventory.map(item => {
    if (item.id === '1') return { ...item, name: language === 'ZH' ? '卡伦加编织篮' : 'Kalunga Woven Basket' };
    if (item.id === '2') return { ...item, name: language === 'ZH' ? '苗族银饰' : 'Miao Silver' };
    if (item.id === '3') return { ...item, name: language === 'ZH' ? '村庄纪念币' : 'QR Village Token' };
    return item;
  });

  const translatedCommunities = communities.map(c => {
    if (c.id === 1) return { ...c, name: language === 'ZH' ? '卡伦加社区' : 'Kalunga Community', desc: language === 'ZH' ? '巴西最大的基隆博拉领地' : 'Largest quilombola territory in Brazil' };
    if (c.id === 2) return { ...c, name: language === 'ZH' ? '辛古公园' : 'Xingu Park', desc: language === 'ZH' ? '马托格罗索州的土著领地' : 'Indigenous territory in Mato Grosso' };
    if (c.id === 3) return { ...c, name: language === 'ZH' ? '内格罗河' : 'Rio Negro', desc: language === 'ZH' ? '亚马逊西北部地区。（4级解锁）' : 'Northwestern Amazon region. (Unlocks at Lvl 4)' };
    if (c.id === 4) return { ...c, name: language === 'ZH' ? '黔东南' : 'Qiandongnan', desc: language === 'ZH' ? '贵州省自治州' : 'Autonomous prefecture in Guizhou' };
    return c;
  });

  const translatedRewardToClaim = rewardToClaim ? translatedInventory.find(i => i.id === rewardToClaim.id) || rewardToClaim : null;

  return (
    <UserContext.Provider value={{
      xp, level, streak, routesDone, communitiesVisited, 
      missions: translatedMissions, 
      communities: translatedCommunities, 
      inventory: translatedInventory, 
      isOffline, language, hasOnboarded, userName, userTitle, userAvatar, setUserName, setUserTitle, setUserAvatar,
      journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry,
      rewardToClaim: translatedRewardToClaim, 
      completeMission, updateMission, addMission, deleteMission, submitMissionForReview, approveMission, rejectMission, exploreCommunity, completeRoute, toggleOffline, setLanguage, completeOnboarding, claimReward, shareArtifact, aiMode, toggleAiMode, highContrast, toggleHighContrast
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
