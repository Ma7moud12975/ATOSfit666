import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const NavItem = ({ label, icon, path, isActive, onClick }) => (
  <button
    onClick={() => onClick(path)}
    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 ${
      isActive ? 'text-[#FFD700]' : 'text-[#A8A8A8]'
    }`}
  >
    <div className={`relative flex items-center justify-center p-2 rounded-xl transition-all ${
      isActive ? 'bg-[rgba(255,215,0,0.14)]' : 'bg-transparent'
    }`}>
      <Icon name={icon} size={22} strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFD700] rounded-full blur-[1px] shadow-[0_0_6px_#FFD700]" />
      )}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100 font-extrabold text-[#FFD700]' : 'opacity-70'}`}>
      {label}
    </span>
  </button>
);

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: 'Home', path: '/dashboard' },
    { label: 'Workouts', icon: 'Activity', path: '/exercise-library' },
    { label: 'Scan', icon: 'Zap', path: '/food-scanner' },
    { label: 'Coach', icon: 'MessageCircle', path: '/ai-chat' },
    { label: 'Profile', icon: 'User', path: '/user-profile' }
  ];

  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] lg:hidden">
      {/* Glossy Background */}
      <div className="absolute inset-0 bg-white/95 dark:bg-[#08080A]/95 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.06] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] rounded-t-[28px]" />

      {/* Nav Content */}
      <div className="relative h-20 flex items-center justify-around px-4 pb-2">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            isActive={location.pathname === item.path}
            onClick={handleNav}
          />
        ))}
      </div>

      {/* Safe Area Spacer (for modern phones) */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white/95 dark:bg-[#141416]/95" />
    </div>
  );
};

export default MobileBottomNav;
