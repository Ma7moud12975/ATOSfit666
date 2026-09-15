import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './AppIcon';
import { useLanguage } from '../contexts/LanguageContext';

const HIDDEN_PATHS = [
  '/ai-chat',
  '/login-screen',
  '/register-screen',
  '/onboarding',
  '/exercise-workout-screen',
  '/payment-success',
  '/payment-cancel'
];

const FloatingCoachWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  // Do not show on auth screens or if already on chat page
  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <div
      className="fixed bottom-24 lg:bottom-8 right-5 lg:right-8 z-[90] flex items-center gap-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip badge on hover or desktop */}
      <div
        onClick={() => navigate('/ai-chat')}
        className={`cursor-pointer transition-all duration-300 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xl backdrop-blur-md ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100 bg-[#1A1A1E]/95 border border-[#FAA802]/40'
            : 'opacity-0 translate-x-2 scale-95 pointer-events-none'
        }`}
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 15px rgba(250, 168, 2, 0.2)'
        }}
      >
        <span className="w-2 h-2 rounded-full bg-[#FAA802] animate-pulse" />
        <span>{language === 'ar' ? 'تحدث مع المدرب الذكي' : 'Chat with AI Coach'}</span>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => navigate('/ai-chat')}
        aria-label="Chat with AI Coach"
        className="relative group w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #FAA802 0%, #E09600 100%)',
          boxShadow: '0 8px 25px rgba(250, 168, 2, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.25) inset'
        }}
      >
        {/* Pulsing ring */}
        <span
          className="absolute inset-0 rounded-full bg-[#FAA802] opacity-30 animate-ping"
          style={{ animationDuration: '2.5s' }}
        />

        {/* Icon */}
        <div className="relative z-10 text-white flex items-center justify-center">
          <Icon name="MessageSquare" size={24} color="#FFFFFF" strokeWidth={2.3} />
        </div>

        {/* Status Dot */}
        <span
          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#10B981] border-2 border-black rounded-full shadow-sm"
          title="Online"
        />
      </button>
    </div>
  );
};

export default FloatingCoachWidget;
