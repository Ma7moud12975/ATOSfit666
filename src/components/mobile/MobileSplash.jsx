import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../../assets/logo.png';

const STATUS_MESSAGES = [
  'Initializing ATOS Neural Vision...',
  'Syncing Metabolic Profile...',
  'Calibrating AI Gym Coach...',
  'Ready to Train'
];

const MobileSplash = ({ onFinish }) => {
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 bg-[#08080A] z-[300] flex flex-col items-center justify-center overflow-hidden select-none"
      onClick={onFinish}
    >
      {/* Ambient Radial Energy Auras */}
      <div className="absolute top-[-15%] right-[-10%] w-[85vw] h-[85vw] bg-[#FAA802] opacity-[0.14] blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[85vw] h-[85vw] bg-[#FF6B00] opacity-[0.12] blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        {/* Glowing Logo Frame */}
        <div className="w-28 h-28 mb-6 relative flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-[-8%] border-2 border-[#FAA802] rounded-3xl blur-[3px]"
          />
          <div className="w-full h-full p-2.5 rounded-2xl bg-white/[0.04] border border-[#FAA802]/30 shadow-[0_0_30px_rgba(250,168,2,0.25)] backdrop-blur-xl flex items-center justify-center">
            <img
              src={logoImage}
              alt="ATOS Fit Logo"
              className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          ATOS <span className="text-[#FAA802]">FIT</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-6">
          AI Biomechanics & Fitness Companion
        </p>

        {/* Dynamic Status Bar */}
        <div className="flex flex-col items-center gap-3 w-64">
          <div className="h-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={statusIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-bold text-[#FAA802] tracking-wider uppercase text-center"
              >
                {STATUS_MESSAGES[statusIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Progress Track */}
          <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '10%' }}
              animate={{ width: `${((statusIdx + 1) / STATUS_MESSAGES.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#FFC107] via-[#FAA802] to-[#FF6B00] shadow-[0_0_10px_#FAA802]"
            />
          </div>
        </div>
      </motion.div>

      {/* Subtle Mobile Tag */}
      <div className="absolute bottom-8 text-[11px] text-slate-500 font-bold tracking-widest uppercase">
        Tap anywhere to enter
      </div>
    </motion.div>
  );
};

export default MobileSplash;
