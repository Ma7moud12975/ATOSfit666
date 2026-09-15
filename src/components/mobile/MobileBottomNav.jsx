import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useLanguage } from '../../contexts/LanguageContext';

const NavItem = ({ label, icon, path, isActive, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(path)}
    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 select-none ${
      isActive ? 'text-[#FAA802]' : 'text-[#A8A8A8] hover:text-white/80'
    }`}
  >
    <div className={`relative flex items-center justify-center p-2 rounded-xl transition-all ${
      isActive ? 'bg-[rgba(250,168,2,0.16)] shadow-[0_0_12px_rgba(250,168,2,0.2)]' : 'bg-transparent'
    }`}>
      <Icon name={icon} size={22} strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FAA802] rounded-full blur-[0.5px] shadow-[0_0_8px_#FAA802]" />
      )}
    </div>
    <span className={`text-[10px] tracking-wider transition-all ${
      isActive ? 'font-black text-[#FAA802] scale-105' : 'font-semibold opacity-70'
    }`}>
      {label}
    </span>
  </button>
);

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const navItems = [
    { label: ar ? 'الرئيسية' : 'Home', icon: 'Home', path: '/dashboard' },
    { label: ar ? 'التمارين' : 'Workouts', icon: 'Activity', path: '/exercise-library' },
    { label: ar ? 'سكان' : 'Scan', icon: 'Zap', path: '/food-scanner' },
    { label: ar ? 'المدرب' : 'Coach', icon: 'MessageCircle', path: '/ai-chat' },
    { label: ar ? 'حسابي' : 'Profile', icon: 'User', path: '/user-profile' }
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
