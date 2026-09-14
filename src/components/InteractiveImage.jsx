import React, { useState, useRef, useEffect } from 'react';
import Icon from './AppIcon';
import { useLanguage } from '../contexts/LanguageContext';

const InteractiveImage = () => {
  const { language } = useLanguage();
  const [imageStyle, setImageStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Enhanced mouse tracking for 3D tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      // Controlled tilt angles
      const rotateX = Math.max(-12, Math.min(12, deltaY * -10));
      const rotateY = Math.max(-12, Math.min(12, deltaX * 10));
      const translateZ = isHovered ? 25 : 0;
      const scale = isHovered ? 1.03 : 1;

      setImageStyle({
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
        transition: isHovered ? 'transform 0.25s ease-out' : 'transform 0.12s ease-out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  const isAr = language === 'ar';

  const copy = isAr ? {
    angleTitle: 'تحليل الزوايا الحركية',
    angleValue: 'زاوية الركبة: 94.2°',
    angleStatus: 'عمق نزول مثالي',
    accuracyTitle: 'دقة أداء الحركة',
    accuracyValue: '98.5% ممتاز',
    accuracySub: 'استقامة مثالية للظهر',
    repTitle: 'العد التلقائي الذكي',
    repValue: '12 / 12 تكرار',
    repSub: 'الجولة 3 • سرعة 1.3 ث',
    privacyTitle: 'خصوصية تامة 100%',
    privacyValue: 'معالجة محلية بالكامل',
    privacySub: '0 بايت تُرسل للسحابة',
  } : {
    angleTitle: 'LIVE POSE ESTIMATION',
    angleValue: 'Knee Flexion: 94.2°',
    angleStatus: 'Optimal Squat Depth',
    accuracyTitle: 'FORM ACCURACY SCORE',
    accuracyValue: '98.5% Perfect',
    accuracySub: 'Zero spine curvature drift',
    repTitle: 'REAL-TIME REP COUNTER',
    repValue: '12 / 12 Reps',
    repSub: 'Set 3 • Cadence: 1.3s',
    privacyTitle: 'ZERO-CLOUD PRIVACY',
    privacyValue: '100% On-Device AI',
    privacySub: '0 KB transmitted to servers',
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full py-4 sm:py-6 lg:py-8 flex items-center justify-center select-none"
    >
      {/* Radiant Gold & Metallic Titanium Aura directly behind mockup */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] md:w-[500px] h-[340px] sm:h-[440px] md:h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(250, 168, 2, 0.28) 0%, rgba(192, 192, 192, 0.12) 42%, transparent 72%)',
          filter: 'blur(55px)',
        }}
      />

      {/* 3D Tilt Container */}
      <div 
        ref={imageRef}
        style={imageStyle}
        className="relative z-10 flex items-center justify-center"
      >
        {/* Phone Mockup with exercise GIF */}
        <div className="relative group cursor-pointer">
          <div className="relative rounded-[42px] p-1.5 bg-gradient-to-b from-[#C0C0C0]/40 via-[#222227]/40 to-[#FAA802]/30 shadow-[0_25px_60px_-15px_rgba(250, 168, 2,0.35)] overflow-hidden">
            <img 
              src="/assets/images/weekly_tasks.gif" 
              alt="ATOS fit Exercise AI Motion Tracking" 
              className="w-[260px] sm:w-[300px] md:w-[330px] xl:w-[360px] h-auto object-contain rounded-[34px] block"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            />
            
            {/* Athletic HUD: Top Live Biomechanics Pill */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between px-3 py-1.5 rounded-full bg-[#08080A]/85 backdrop-blur-md border border-[#C0C0C0]/20 text-[10px] sm:text-xs font-semibold text-white pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FAA802] animate-pulse shadow-[0_0_8px_#FAA802]"></span>
                <span className="tracking-wider uppercase text-white font-bold">{isAr ? 'تتبع حركي مباشر' : 'MOTION TRACKING'}</span>
              </div>
              <span className="text-[#FAA802] font-mono font-bold" dir="ltr">60 FPS</span>
            </div>

            {/* Athletic HUD: Bottom Real-Time Telemetry Bar */}
            <div className="absolute bottom-4 left-3 right-3 p-2.5 rounded-2xl bg-[#08080A]/90 backdrop-blur-md border border-[#C0C0C0]/20 shadow-lg pointer-events-none">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-white">
                <div className="flex items-center gap-1.5">
                  <Icon name="Flame" size={13} className="text-[#FAA802]" />
                  <span className="font-bold text-white font-mono" dir="ltr">420</span>
                  <span className="text-[10px] text-[#A8A8A8]">{isAr ? 'سعرة' : 'kcal'}</span>
                </div>
                <div className="h-3 w-[1px] bg-white/20"></div>
                <div className="flex items-center gap-1.5">
                  <Icon name="Zap" size={13} className="text-[#FAA802]" />
                  <span className="font-bold text-[#FAA802] font-mono" dir="ltr">8/12</span>
                  <span className="text-[10px] text-[#A8A8A8]">{isAr ? 'تكرار' : 'reps'}</span>
                </div>
                <div className="h-3 w-[1px] bg-white/20"></div>
                <div className="flex items-center gap-1.5">
                  <Icon name="Target" size={13} className="text-emerald-400" />
                  <span className="font-bold text-emerald-300 font-mono" dir="ltr">99%</span>
                  <span className="text-[10px] text-[#A8A8A8]">{isAr ? 'دقة' : 'form'}</span>
                </div>
              </div>
            </div>

            {/* Glossy Reflection overlay */}
            <div className="absolute inset-0 rounded-[34px] bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveImage;