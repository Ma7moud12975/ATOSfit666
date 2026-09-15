import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const AuthenticationLayout = ({ 
  children, 
  title, 
  subtitle,
  showLogo = true,
  className = ""
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen bg-[#08080A] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#FAA802]/30 ${className}`}
      style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(250, 168, 2, 0.16) 0%, transparent 55rem),
                     radial-gradient(circle at 85% 45%, rgba(250, 168, 2, 0.08) 0%, transparent 40rem),
                     radial-gradient(ellipse at top, #141416 0%, #08080A 40%, #050506 100%)`
      }}
    >
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#FAA802]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[450px] rounded-full bg-[#FAA802]/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Logo Section */}
        {showLogo && (
          <div 
            className="text-center mb-6 cursor-pointer group inline-block w-full"
            onClick={() => navigate('/')}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FAA802]/15 border border-[#FAA802]/30 mb-3 shadow-[0_0_25px_rgba(250,168,2,0.3)] group-hover:scale-105 transition-transform">
              <img src="/assets/images/atosfit.png" alt="ATOS fit Logo" className="w-9 h-9 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">ATOS <span className="text-[#FAA802]">fit</span></h1>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-[#0D0E12] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-6 sm:p-8 animate-spring"
          style={{ boxShadow: '0 0 50px rgba(250, 168, 2, 0.12)' }}
        >
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-6">
              {title && (
                <h2 className="text-2xl font-black text-white tracking-tight mb-1.5">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-gray-400 text-xs leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <button type="button" onClick={() => navigate('/privacy')} className="text-[#FAA802] hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" onClick={() => navigate('/privacy')} className="text-[#FAA802] hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationLayout;