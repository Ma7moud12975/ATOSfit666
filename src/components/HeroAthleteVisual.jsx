import React, { useState } from 'react';
import Icon from './AppIcon';
import { useLanguage } from '../contexts/LanguageContext';

const HeroAthleteVisual = ({ onStartTrial }) => {
  const { isAr } = useLanguage();
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-full max-w-[700px] xl:max-w-[780px] 2xl:max-w-[860px] flex items-center justify-center select-none py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Keyframe animations for telemetry floats and radar pulses */}
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(-0.5deg); }
        }
        @keyframes pulseGlowRing {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes scanSweep {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(200%); opacity: 0; }
        }
      `}</style>

      {/* 1. Ambient Golden Halo & Depth Glow behind the Athlete */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] sm:w-[580px] h-[360px] sm:h-[480px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(250, 168, 2, 0.28) 0%, rgba(250, 168, 2, 0.1) 45%, transparent 72%)',
          filter: 'blur(55px)',
        }}
      />

      {/* 2. Main Athlete Visual Container with Seamless Edge Blending */}
      <div className="relative z-10 w-full rounded-[32px] overflow-hidden group">
        
        {/* The Athlete Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-h-[520px] rounded-[28px] overflow-hidden bg-[#060709]">
          <img 
            src="/assets/images/hero-athlete.jpg" 
            alt="ATOSfit Athlete Performing Pushups"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              filter: 'contrast(1.08) brightness(1.02)',
            }}
          />

          {/* Cinematic Vignette & Edge Blend Masks (Blends into #08080A seamlessly) */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(to right, #08080A 0%, transparent 18%, transparent 82%, #08080A 100%),
                linear-gradient(to bottom, #08080A 0%, transparent 12%, transparent 70%, #08080A 100%),
                radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(8, 8, 10, 0.7) 85%, #08080A 100%)
              `
            }}
          />

          {/* Subtle Cyber Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(250, 168, 2, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(250, 168, 2, 0.12) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Scanning Line Animation (Subtle AI inspection beam) */}
          {showSkeleton && (
            <div 
              className="absolute inset-x-0 h-16 pointer-events-none bg-gradient-to-b from-transparent via-[#FAA802]/15 to-transparent"
              style={{
                animation: 'scanSweep 4s ease-in-out infinite',
              }}
            />
          )}

          {/* 3. Interactive Computer Vision Skeletal Kinematics Mesh */}
          {showSkeleton && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 800 600" 
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              {/* Spine and Neck Line */}
              <line x1="400" y1="260" x2="400" y2="400" stroke="#FAA802" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.85" />
              
              {/* Shoulder Clavicle Span */}
              <line x1="285" y1="365" x2="400" y2="355" stroke="#FAA802" strokeWidth="3" opacity="0.9" />
              <line x1="400" y1="355" x2="515" y2="365" stroke="#FAA802" strokeWidth="3" opacity="0.9" />

              {/* Upper Arms to Elbows */}
              <line x1="285" y1="365" x2="250" y2="405" stroke="#FAA802" strokeWidth="3.5" opacity="0.95" />
              <line x1="515" y1="365" x2="550" y2="405" stroke="#FAA802" strokeWidth="3.5" opacity="0.95" />

              {/* Forearms from Elbows to Hands on Floor */}
              <line x1="250" y1="405" x2="280" y2="520" stroke="#FAA802" strokeWidth="3" opacity="0.85" />
              <line x1="550" y1="405" x2="520" y2="520" stroke="#FAA802" strokeWidth="3" opacity="0.85" />

              {/* Head Anchor */}
              <circle cx="400" cy="275" r="7" fill="#08080A" stroke="#FAA802" strokeWidth="2.5" />
              <circle cx="400" cy="275" r="3" fill="#FAA802" />

              {/* Left Shoulder Node */}
              <circle cx="285" cy="365" r="9" fill="#08080A" stroke="#FAA802" strokeWidth="2" />
              <circle cx="285" cy="365" r="4" fill="#FAA802" />

              {/* Right Shoulder Node */}
              <circle cx="515" cy="365" r="9" fill="#08080A" stroke="#FAA802" strokeWidth="2" />
              <circle cx="515" cy="365" r="4" fill="#FAA802" />

              {/* Left Elbow Joint - 90° Flexion Arc */}
              <circle cx="250" cy="405" r="11" fill="#08080A" stroke="#FAA802" strokeWidth="2" />
              <circle cx="250" cy="405" r="4.5" fill="#FAA802" />
              <circle cx="250" cy="405" r="22" stroke="#FAA802" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.7" style={{ animation: 'pulseGlowRing 2.5s infinite' }} />

              {/* Right Elbow Joint - 90° Flexion Arc */}
              <circle cx="550" cy="405" r="11" fill="#08080A" stroke="#FAA802" strokeWidth="2" />
              <circle cx="550" cy="405" r="4.5" fill="#FAA802" />
              <circle cx="550" cy="405" r="22" stroke="#FAA802" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.7" style={{ animation: 'pulseGlowRing 2.5s infinite' }} />

              {/* Hand Ground Contact Nodes */}
              <circle cx="280" cy="520" r="7" fill="#08080A" stroke="#10B981" strokeWidth="2" />
              <circle cx="280" cy="520" r="3" fill="#10B981" />
              <circle cx="520" cy="520" r="7" fill="#08080A" stroke="#10B981" strokeWidth="2" />
              <circle cx="520" cy="520" r="3" fill="#10B981" />

              {/* Kinematic Angle Callout - Left Arm */}
              <g transform="translate(130, 390)">
                <rect x="0" y="0" width="105" height="34" rx="8" fill="rgba(8, 8, 10, 0.85)" stroke="#FAA802" strokeWidth="1.2" />
                <text x="12" y="16" fill="#FAA802" fontSize="11" fontWeight="bold" fontFamily="monospace">ELBOW: 90.2°</text>
                <text x="12" y="28" fill="#10B981" fontSize="9" fontWeight="bold">✓ PERFECT DEPTH</text>
              </g>

              {/* Kinematic Angle Callout - Right Arm */}
              <g transform="translate(565, 390)">
                <rect x="0" y="0" width="105" height="34" rx="8" fill="rgba(8, 8, 10, 0.85)" stroke="#FAA802" strokeWidth="1.2" />
                <text x="12" y="16" fill="#FAA802" fontSize="11" fontWeight="bold" fontFamily="monospace">ELBOW: 90.5°</text>
                <text x="12" y="28" fill="#10B981" fontSize="9" fontWeight="bold">✓ SYMMETRICAL</text>
              </g>
            </svg>
          )}

          {/* Interactive Mode Toggle Button (Top Center of Image) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
            <button
              type="button"
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-[#FAA802]/40 backdrop-blur-md text-xs font-semibold text-white transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <span className={`w-2 h-2 rounded-full ${showSkeleton ? 'bg-[#FAA802] animate-pulse shadow-[0_0_8px_#FAA802]' : 'bg-gray-500'}`} />
              <span>
                {showSkeleton 
                  ? (isAr ? 'الرؤية الحاسوبية: نشطة' : 'AI Kinematics: Active')
                  : (isAr ? 'عرض فحص الذكاء الاصطناعي' : 'View AI Inspection')}
              </span>
            </button>
          </div>

          {/* Watermark Rep Count (Integrated into Floor) */}
          <div className="absolute bottom-4 left-6 z-20 pointer-events-none">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                24
              </span>
              <span className="text-xs font-bold text-[#FAA802] uppercase tracking-wider">
                {isAr ? 'تكرار صحيح' : 'VALID REPS'}
              </span>
            </div>
          </div>

          {/* 60 FPS Badge (Bottom Right) */}
          <div className="absolute bottom-4 right-6 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 border border-white/10 text-[11px] font-mono text-emerald-400 font-bold backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              60 FPS • Real-Time
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Floating Glassmorphic Telemetry Cards (Sports Tech Ads)   */}
      {/* ============================================================ */}

      {/* Card 1: Top-Right Biomechanical Accuracy Score */}
      <div 
        className="hidden sm:flex absolute -top-4 -right-4 lg:-right-8 z-30 flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#0F1015]/90 border border-white/15 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        style={{ animation: 'floatSlow1 6s ease-in-out infinite' }}
      >
        <div className="w-11 h-11 rounded-xl bg-[#FAA802]/15 border border-[#FAA802]/30 flex items-center justify-center text-[#FAA802] shadow-[0_0_15px_rgba(250,168,2,0.3)]">
          <Icon name="Activity" size={22} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#A8A8A8]">
            {isAr ? 'دقة التكنيك والعمق' : 'FORM ACCURACY'}
          </div>
          <div className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
            <span>99.4%</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              {isAr ? 'مثالي' : 'ELITE'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Bottom-Left Real-time Cadence & Angle Score */}
      <div 
        className="hidden sm:flex absolute -bottom-6 -left-4 lg:-left-8 z-30 flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#0F1015]/90 border border-white/15 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        style={{ animation: 'floatSlow2 7s ease-in-out infinite' }}
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Icon name="CheckCircle" size={22} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#A8A8A8]">
            {isAr ? 'زاوية الصدر للأرض' : 'CHEST-TO-FLOOR'}
          </div>
          <div className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>90° Angle</span>
            <span className="text-xs text-[#FAA802] font-semibold">1.1s Pace</span>
          </div>
        </div>
      </div>

      {/* Card 3: Instant Voice Correction Notification (Top-Left on large screens) */}
      <div 
        className="hidden md:flex absolute top-1/4 -left-10 z-30 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0F1015]/85 border border-[#FAA802]/30 backdrop-blur-md shadow-lg"
        style={{ animation: 'floatSlow1 8s ease-in-out infinite reverse' }}
      >
        <span className="w-2 h-2 rounded-full bg-[#FAA802] animate-ping" />
        <Icon name="Volume2" size={15} className="text-[#FAA802]" />
        <span className="text-xs font-bold text-white">
          {isAr ? 'توجيه صوتي: عمق ممتاز!' : 'Audio Cue: Perfect Depth!'}
        </span>
      </div>

    </div>
  );
};

export default HeroAthleteVisual;
