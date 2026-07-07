import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Compass, Map as MapIcon, Users } from 'lucide-react';
import { useUser } from '../context/UserContext';

const BottomNav: React.FC = () => {
  const { language } = useUser();

  const navItems = [
    { path: '/', icon: <Home size={24} />, label: language === 'ZH' ? '导师' : 'Mentor' },
    { path: '/council', icon: <Users size={24} />, label: language === 'ZH' ? '议事厅' : 'Council' },
    { path: '/talk', icon: <MessageSquare size={24} />, label: language === 'ZH' ? '交流' : 'Talk' },
    { path: '/missions', icon: <Compass size={24} />, label: language === 'ZH' ? '任务' : 'Missions' },
    { path: '/map', icon: <MapIcon size={24} />, label: language === 'ZH' ? '地图' : 'Map' },
  ];

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => (
        <NavLink 
          key={item.path} 
          to={item.path} 
          style={({isActive}) => isActive ? {...styles.link, ...styles.active} : styles.link}
        >
          {item.icon}
          <span style={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px', // Matches #root max-width
    height: '70px',
    backgroundColor: 'var(--bg-card)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    zIndex: 1000,
  },
  link: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    gap: '4px',
  },
  active: {
    color: 'var(--accent-primary)',
  },
  label: {
    fontSize: '10px',
    fontWeight: 600,
  }
};

export default BottomNav;
