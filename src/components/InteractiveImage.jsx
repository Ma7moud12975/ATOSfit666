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

  // State for interactive features
  const [hudActive, setHudActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activeCueIndex, setActiveCueIndex] = useState(0);
  const videoRef = useRef(null);

  const coachingCues = isAr ? [
    { text: 'حافظ على ركبتيك فوق مستوى الحوض!', tag: 'توجيه فوري' },
    { text: 'استقامة العمود الفقري: مثالية (0° ميلان)', tag: 'الأمان الحركي' },
    { text: 'ادفع بكعبيك بقوة وثبات أثناء الصعود', tag: 'تحسين القوة' },
  ] : [
    { text: 'Keep your knees above the hip!', tag: 'LIVE CUE' },
    { text: 'Spine curvature: Optimal (0° drift)', tag: 'POSTURE' },
    { text: 'Drive firmly through heels on ascent', tag: 'POWER' },
  ];

  // Rotate coaching cues smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCueIndex((prev) => (prev + 1) % coachingCues.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [coachingCues.length]);

  const copy = isAr ? {
    angleTitle: 'تحليل الزوايا الحركية',
    angleValue: 'زاوية الركبة: 94.2°',
    angleStatus: 'عمق نزول مثالي',
    accuracyTitle: 'دقة أداء الحركة',
    accuracyValue: '98.5% ممتاز',
    accuracySub: 'استقامة مثالية للظهر',
    repTitle: 'العد التلقائي الذكي',
    repValue: '16 / 20 تكرار',
    repSub: 'الجولة 3 • سرعة 1.2 ث',
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
    repValue: '16 / 20 Reps',
    repSub: 'Set 3 • Cadence: 1.2s',
    privacyTitle: 'ZERO-CLOUD PRIVACY',
    privacyValue: '100% On-Device AI',
    privacySub: '0 KB transmitted to servers',
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleHud = (e) => {
    e.stopPropagation();
    setHudActive(!hudActive);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[720px] lg:max-w-[840px] xl:max-w-[980px] 2xl:max-w-[1080px] py-6 sm:py-8 lg:py-12 flex items-center justify-center select-none"
    >
      {/* Embedded High-Performance CSS Keyframes for Floating Cards & Biomechanical HUD */}
      <style>{`
        @keyframes cardFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cardFloatReverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes audioWaveBar {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>

      {/* Radiant Gold & Titanium Biomechanical Aura directly behind mockup */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[540px] md:w-[650px] h-[420px] sm:h-[540px] md:h-[650px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(250, 168, 2, 0.26) 0%, rgba(255, 174, 0, 0.12) 35%, rgba(192, 192, 192, 0.05) 55%, transparent 75%)',
          filter: 'blur(70px)',
        }}
      />

      {/* 3D Tilt Container for Phone Mockup */}
      <div 
        ref={imageRef}
        style={imageStyle}
        className="relative z-10 flex items-center justify-center"
      >
        {/* Futuristic Athletic Smartphone Frame */}
        <div 
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Bezel chassis with metallic titanium & amber edge reflections */}
          <div className="relative rounded-[48px] p-2 bg-gradient-to-b from-[#4A4B54] via-[#1E1F24] to-[#FAA802]/40 shadow-[0_30px_80px_-15px_rgba(250,168,2,0.4),0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden">
            
            {/* Screen inner enclosure */}
            <div className="relative rounded-[40px] overflow-hidden bg-[#060709] w-[270px] sm:w-[305px] md:w-[335px] xl:w-[360px] 2xl:w-[380px] h-[550px] sm:h-[590px] md:h-[630px] xl:h-[660px]">
              
              {/* Main Athletic Motion Video */}
              <video
                ref={videoRef}
                src="/schools-header-vp9-chrome-1.webm"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[1.03]"
              />

              {/* Dynamic Atmospheric Depth Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-[#060709]/75 pointer-events-none" />

              {/* Dynamic Island / Top Camera Bezel */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-5 rounded-full bg-black/90 border border-white/10 flex items-center justify-center gap-2 z-30 shadow-md pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1E] border border-white/15"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FAA802]/70 animate-pulse"></span>
              </div>

              {/* Athletic Large Rep Watermark (16 Reps Count) */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none z-10"
                style={{ opacity: hudActive ? 0.22 : 0.08, transition: 'opacity 0.4s ease' }}
              >
                <span className="text-[120px] sm:text-[145px] font-black text-white tracking-tighter leading-none block font-mono drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                  16
                </span>
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#FAA802]">
                  {isAr ? 'تكرار مكتمل' : 'VALID REPS'}
                </span>
              </div>

              {/* ============================================================ */}
              {/* Creative Biomechanical Vision HUD Overlays (Interactive)      */}
              {/* ============================================================ */}
              {hudActive && (
                <>
                  {/* SVG Computer Vision Skeletal Kinematics Mesh */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 340 600" fill="none">
                    {/* Upper torso / spine axis */}
                    <line x1="170" y1="175" x2="170" y2="305" stroke="#FAA802" strokeWidth="2" strokeDasharray="3 3" opacity="0.85" />
                    
                    {/* Shoulders */}
                    <line x1="130" y1="205" x2="210" y2="205" stroke="#00F0FF" strokeWidth="1.5" opacity="0.75" />
                    
                    {/* Arms to elbows */}
                    <line x1="130" y1="205" x2="105" y2="265" stroke="#FAA802" strokeWidth="1.5" opacity="0.7" />
                    <line x1="210" y1="205" x2="235" y2="265" stroke="#FAA802" strokeWidth="1.5" opacity="0.7" />
                    
                    {/* Pelvis to knees (motion dynamic kinematics) */}
                    <line x1="150" y1="305" x2="135" y2="405" stroke="#10B981" strokeWidth="2" opacity="0.8" />
                    <line x1="190" y1="305" x2="205" y2="380" stroke="#FAA802" strokeWidth="2.5" opacity="0.9" />
                    
                    {/* Knees to ankles */}
                    <line x1="135" y1="405" x2="140" y2="490" stroke="#10B981" strokeWidth="2" opacity="0.75" />
                    <line x1="205" y1="380" x2="200" y2="465" stroke="#FAA802" strokeWidth="2" opacity="0.85" />

                    {/* Joint Landmark Nodes with Pulsing Glow */}
                    {/* Head / Cervical */}
                    <circle cx="170" cy="175" r="5" fill="#FAA802" stroke="#FFFFFF" strokeWidth="1.5" className="animate-pulse" />
                    
                    {/* Shoulders */}
                    <circle cx="130" cy="205" r="4" fill="#00F0FF" />
                    <circle cx="210" cy="205" r="4" fill="#00F0FF" />

                    {/* Elbows */}
                    <circle cx="105" cy="265" r="3.5" fill="#FAA802" />
                    <circle cx="235" cy="265" r="3.5" fill="#FAA802" />

                    {/* Hip Joint center */}
                    <circle cx="170" cy="305" r="5" fill="#FAA802" stroke="#00F0FF" strokeWidth="1.5" />

                    {/* Active Knee Angle Arc & Node */}
                    <circle cx="205" cy="380" r="6" fill="#FAA802" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="205" cy="380" r="14" stroke="#FAA802" strokeWidth="1.5" strokeDasharray="3 4" className="animate-[spin_6s_linear_infinite]" />
                    
                    {/* Dynamic flexion arc */}
                    <path d="M 218 368 A 18 18 0 0 1 216 394" stroke="#00F0FF" strokeWidth="2" fill="none" />
                    
                    {/* Target Knee flexion text */}
                    <g transform="translate(225, 375)">
                      <rect x="0" y="-12" width="62" height="20" rx="6" fill="rgba(6,7,9,0.85)" stroke="#FAA802" strokeWidth="1" />
                      <text x="6" y="2" fill="#00F0FF" fontSize="10" fontWeight="bold" fontFamily="monospace">94.2°</text>
                      <text x="36" y="2" fill="#10B981" fontSize="9" fontWeight="bold">✓ ROM</text>
                    </g>

                    {/* Ground contact plane */}
                    <line x1="110" y1="520" x2="230" y2="520" stroke="#10B981" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                  </svg>

                  {/* Dynamic Real-Time Coaching Cue Card (Speech Bubble from video) */}
                  <div className="absolute top-12 left-3 right-3 z-30 pointer-events-none transition-all duration-500">
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0B0D14]/90 backdrop-blur-xl border border-[#FAA802]/40 shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2.5 animate-fadeIn">
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] flex-shrink-0 shadow-[0_0_12px_rgba(250,168,2,0.3)]">
                          <Icon name="Volume2" size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-[#FAA802] uppercase tracking-wider block">
                            {coachingCues[activeCueIndex].tag}
                          </span>
                          <p className="text-[11px] sm:text-xs font-bold text-white truncate">
                            {coachingCues[activeCueIndex].text}
                          </p>
                        </div>
                      </div>

                      {/* Animated Audio Waveform Bars */}
                      <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-white/5 flex-shrink-0">
                        <span className="w-0.5 rounded-full bg-[#FAA802] animate-[audioWaveBar_1.2s_ease-in-out_infinite]" />
                        <span className="w-0.5 rounded-full bg-[#FAA802] animate-[audioWaveBar_0.9s_ease-in-out_0.2s_infinite]" />
                        <span className="w-0.5 rounded-full bg-[#FAA802] animate-[audioWaveBar_1.4s_ease-in-out_0.4s_infinite]" />
                        <span className="w-0.5 rounded-full bg-[#FAA802] animate-[audioWaveBar_1.1s_ease-in-out_0.1s_infinite]" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* HUD: Quick Interactive Toggle Control Bar (Sound & HUD overlays) */}
              <div className="absolute top-28 right-3 z-30 flex flex-col gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/75 hover:bg-[#FAA802] hover:text-black text-white/80 border border-white/15 flex items-center justify-center transition-all shadow-md"
                  title={isMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
                >
                  <Icon name={isMuted ? 'VolumeX' : 'Volume2'} size={13} />
                </button>
                <button
                  type="button"
                  onClick={toggleHud}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${hudActive ? 'bg-[#FAA802] text-black' : 'bg-black/75 text-white/80'} border border-white/15 flex items-center justify-center transition-all shadow-md`}
                  title={hudActive ? (isAr ? 'إخفاء عناصر التتبع' : 'Hide HUD') : (isAr ? 'إظهار عناصر التتبع' : 'Show HUD')}
                >
                  <Icon name="Activity" size={13} />
                </button>
              </div>

              {/* Athletic HUD: Top Live Biomechanics Pill */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between px-3 py-1.5 rounded-full bg-[#08080A]/85 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-semibold text-white pointer-events-none z-20">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FAA802] animate-pulse shadow-[0_0_8px_#FAA802]"></span>
                  <span className="tracking-wider uppercase text-white font-bold">{isAr ? 'تتبع حركي مباشر' : 'MOTION TRACKING'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-[9px] font-bold">&lt; 15ms</span>
                  <span className="text-[#FAA802] font-mono font-bold" dir="ltr">60 FPS</span>
                </div>
              </div>

              {/* Athletic HUD: Bottom Real-Time Telemetry Bar */}
              <div className="absolute bottom-4 left-3 right-3 p-3 rounded-2xl bg-[#08080A]/92 backdrop-blur-xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-none z-30">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-white">
                  <div className="flex items-center gap-1.5">
                    <Icon name="Flame" size={14} className="text-[#FAA802]" />
                    <span className="font-bold text-white font-mono" dir="ltr">420</span>
                    <span className="text-[10px] text-[#A8A8A8]">{isAr ? 'سعرة' : 'kcal'}</span>
                  </div>
                  <div className="h-3 w-[1px] bg-white/20"></div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="Zap" size={14} className="text-[#FAA802]" />
                    <span className="font-bold text-[#FAA802] font-mono" dir="ltr">16/20</span>
                    <span className="text-[10px] text-[#A8A8A8]">{isAr ? 'تكرار' : 'reps'}</span>
                  </div>
                  <div className="h-3 w-[1px] bg-white/20"></div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="Target" size={14} className="text-emerald-400" />
                    <span className="font-bold text-emerald-300 font-mono" dir="ltr">99.2%</span>
                    <span className="text-[10px] text-[#A8A8A8]">{isAr ? 'دقة' : 'form'}</span>
                  </div>
                </div>

                {/* Micro Progress Bar on Rep Progress */}
                <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#FAA802] to-emerald-400 h-full rounded-full w-[80%]" />
                </div>
              </div>

              {/* Glossy Curved Phone Reflection overlay */}
              <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] pointer-events-none z-20" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Distributed Flanking Telemetry Cards (Spreads across space)  */}
      {/* ============================================================ */}
      
      {/* Card 1: Form Accuracy Score (Top Flank 1) */}
      <div 
        className={`hidden lg:flex flex-col gap-2 absolute top-8 ${
          isAr ? 'right-0 xl:-right-4 2xl:-right-8' : 'left-0 xl:-left-4 2xl:-left-8'
        } z-30 p-4 rounded-2xl bg-white/95 dark:bg-[#121316]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-[#FAA802]/60 hover:scale-105 transition-all duration-300 pointer-events-auto w-[220px] xl:w-[245px]`}
        style={{ animation: 'cardFloatSlow 6s ease-in-out infinite' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] shadow-[0_0_12px_rgba(250,168,2,0.25)]">
              <Icon name="Activity" size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#636779] dark:text-[#A8A8A8] uppercase tracking-wider truncate">
              {copy.accuracyTitle}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            {copy.accuracyStatus || 'LIVE'}
          </span>
        </div>
        <div className="text-xl font-black text-[#0F1015] dark:text-white tracking-tight" dir="ltr">
          {copy.accuracyValue}
        </div>
        <div className="text-xs text-[#525866] dark:text-[#8E95A3] font-medium truncate">
          {copy.accuracySub}
        </div>
      </div>

      {/* Card 2: Adaptive Rep Cadence (Bottom Flank 1) */}
      <div 
        className={`hidden lg:flex flex-col gap-2 absolute bottom-10 ${
          isAr ? 'right-2 xl:-right-2 2xl:-right-4' : 'left-2 xl:-left-2 2xl:-left-4'
        } z-30 p-4 rounded-2xl bg-white/95 dark:bg-[#121316]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-[#FAA802]/60 hover:scale-105 transition-all duration-300 pointer-events-auto w-[215px] xl:w-[240px]`}
        style={{ animation: 'cardFloatReverse 7s ease-in-out 1s infinite' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] shadow-[0_0_12px_rgba(250,168,2,0.25)]">
              <Icon name="Zap" size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#636779] dark:text-[#A8A8A8] uppercase tracking-wider truncate">
              {copy.repTitle}
            </span>
          </div>
        </div>
        <div className="text-xl font-black text-[#0F1015] dark:text-white tracking-tight" dir="ltr">
          {copy.repValue}
        </div>
        <div className="text-xs text-[#525866] dark:text-[#8E95A3] font-medium truncate">
          {copy.repSub}
        </div>
      </div>

      {/* Card 3: Joint Kinematics (Top Flank 2) */}
      <div 
        className={`hidden lg:flex flex-col gap-2 absolute top-12 ${
          isAr ? 'left-0 xl:-left-4 2xl:-left-8' : 'right-0 xl:-right-4 2xl:-right-8'
        } z-30 p-4 rounded-2xl bg-white/95 dark:bg-[#121316]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-[#FAA802]/60 hover:scale-105 transition-all duration-300 pointer-events-auto w-[220px] xl:w-[245px]`}
        style={{ animation: 'cardFloatReverse 8s ease-in-out 0.5s infinite' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] shadow-[0_0_12px_rgba(250,168,2,0.25)]">
              <Icon name="Compass" size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#636779] dark:text-[#A8A8A8] uppercase tracking-wider truncate">
              {copy.angleTitle}
            </span>
          </div>
        </div>
        <div className="text-xl font-black text-[#0F1015] dark:text-white tracking-tight" dir="ltr">
          {copy.angleValue}
        </div>
        <div className="text-xs text-[#FAA802] font-semibold flex items-center gap-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FAA802]"></span>
          <span className="truncate">{copy.angleStatus}</span>
        </div>
      </div>

      {/* Card 4: Zero-Cloud Privacy (Bottom Flank 2) */}
      <div 
        className={`hidden lg:flex flex-col gap-2 absolute bottom-8 ${
          isAr ? 'left-2 xl:-left-2 2xl:-left-4' : 'right-2 xl:-right-2 2xl:-right-4'
        } z-30 p-4 rounded-2xl bg-white/95 dark:bg-[#121316]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-[#FAA802]/60 hover:scale-105 transition-all duration-300 pointer-events-auto w-[215px] xl:w-[240px]`}
        style={{ animation: 'cardFloatSlow 7.5s ease-in-out 2s infinite' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] shadow-[0_0_12px_rgba(250,168,2,0.25)]">
              <Icon name="Shield" size={16} />
            </div>
            <span className="text-[11px] font-bold text-[#636779] dark:text-[#A8A8A8] uppercase tracking-wider truncate">
              {copy.privacyTitle}
            </span>
          </div>
        </div>
        <div className="text-xl font-black text-[#0F1015] dark:text-white tracking-tight">
          {copy.privacyValue}
        </div>
        <div className="text-xs text-[#525866] dark:text-[#8E95A3] font-medium truncate">
          {copy.privacySub}
        </div>
      </div>
    </div>
  );
};

export default InteractiveImage;