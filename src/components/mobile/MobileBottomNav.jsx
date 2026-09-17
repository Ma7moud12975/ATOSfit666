import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, ScanLine, MessageSquare, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const navItems = [
    {
      id: 'home',
      label: isAr ? 'الرئيسية' : 'Home',
      icon: Home,
      path: '/dashboard',
    },
    {
      id: 'workouts',
      label: isAr ? 'التمارين' : 'Workouts',
      icon: Dumbbell,
      path: '/exercise-library',
    },
    {
      id: 'scan',
      label: isAr ? 'سكان' : 'Scan',
      icon: ScanLine,
      path: '/food-scanner',
      isHero: true,
    },
    {
      id: 'coach',
      label: isAr ? 'المدرب' : 'Coach',
      icon: MessageSquare,
      path: '/ai-chat',
    },
    {
      id: 'profile',
      label: isAr ? 'حسابي' : 'Profile',
      icon: User,
      path: '/user-profile',
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] lg:hidden select-none">
      {/* Floating Glass Dock */}
      <div className="relative mx-auto w-full max-w-md bg-white/95 dark:bg-[#08080A]/95 backdrop-blur-2xl border-t border-black/[0.08] dark:border-white/[0.08] shadow-[0_-10px_35px_rgba(0,0,0,0.15)] dark:shadow-[0_-10px_35px_rgba(0,0,0,0.7)]">
        <div className="h-16 flex items-center justify-around px-2 pb-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/food-scanner' && location.pathname.includes('food-scanner'));

            if (item.isHero) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="relative -top-4 flex flex-col items-center justify-center transition-transform duration-200 active:scale-95"
                >
                  <div className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-[#FF9800] via-[#FAA802] to-[#FFC107] text-[#08080A] shadow-[0_4px_20px_rgba(250,168,2,0.45)] border-4 border-white dark:border-[#08080A] flex items-center justify-center">
                    <IconComponent size={22} strokeWidth={2.6} />
                  </div>
                  <span className="text-[10px] font-black text-[#FAA802] tracking-wider mt-0.5">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-200 active:scale-90 ${
                  isActive
                    ? 'text-[#FAA802]'
                    : 'text-slate-400 dark:text-[#8E8E93] hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-[#FAA802]/15 scale-105' : 'bg-transparent'
                  }`}
                >
                  <IconComponent size={20} strokeWidth={isActive ? 2.6 : 2} />
                </div>
                <span
                  className={`text-[10px] tracking-tight ${
                    isActive ? 'font-black text-[#FAA802]' : 'font-semibold'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* iPhone Gesture Home Bar Spacer */}
        <div className="h-[env(safe-area-inset-bottom,8px)]" />
      </div>
    </div>
  );
}
