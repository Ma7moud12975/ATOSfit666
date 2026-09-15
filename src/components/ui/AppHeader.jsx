import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import logoImage from '../../assets/logo.png';
import { applyTheme, getSavedTheme } from '../../utils/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { isNative } from '../../utils/platform';
import { logoutUser, getCurrentUser } from '../../utils/nativeAuth';

const AppHeader = ({ onSidebarToggle, isSidebarOpen, user, onLogout }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(getSavedTheme);
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const native = isNative();

  useEffect(() => {
    const handleThemeChange = (event) => setTheme(event.detail || getSavedTheme());
    window.addEventListener('atos-theme-change', handleThemeChange);
    return () => window.removeEventListener('atos-theme-change', handleThemeChange);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('header.morning');
    if (h < 18) return t('header.afternoon');
    return t('header.evening');
  };

  const activeUser = (user?.email && user?.name) ? user : (getCurrentUser() || user || {});

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowProfileMenu(false);

    try {
      if (onLogout) {
        const res = onLogout();
        if (res && typeof res.then === 'function') {
          await Promise.race([res, new Promise((r) => setTimeout(r, 400))]);
        }
      }
    } catch (err) {
      console.warn('[AppHeader] onLogout warning:', err);
    }

    try {
      await logoutUser();
    } catch {}

    try {
      localStorage.removeItem('user');
      localStorage.removeItem('atos_native_session');
      localStorage.removeItem('atos_auth_token');
      localStorage.removeItem('atos_auth_token_exp');
      localStorage.removeItem('atos_google_session');
      sessionStorage.clear();
    } catch {}

    window.location.href = '/login-screen';
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 16,
        zIndex: 150,
        background: 'var(--bento-card)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid var(--bento-border)',
        borderRadius: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1.25rem',
        boxShadow: 'var(--bento-shadow)',
        transition: 'left 0.3s ease-in-out'
      }} className={`left-3 right-3 sm:left-4 sm:right-4 ${native ? (isRTL ? 'lg:right-4' : 'lg:left-4') : (isRTL ? 'lg:right-[284px] lg:left-6' : 'lg:left-[284px] lg:right-6')}`}>

        {/* Left: Mobile Toggle & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!native && (
            <button
              type="button"
              onClick={onSidebarToggle}
              className="lg:hidden flex items-center justify-center p-1.5"
              style={{ background: 'transparent', border: 'none', color: 'var(--bento-soft-text)', cursor: 'pointer' }}
              aria-label="Toggle Navigation Menu"
            >
              <Icon name="Menu" size={22} />
            </button>
          )}

          {/* Logo shows on mobile/native, hidden on large screens (since sidebar has it) */}
          <div className={`${!native ? 'lg:hidden' : ''} flex items-center gap-2`}>
            <img src={logoImage} alt="ATOSfit Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span className="hidden xs:block" style={{ fontWeight: 800, color: 'var(--bento-text)', fontSize: '0.95rem' }}>ATOSfit</span>
          </div>

          <button
            onClick={() => navigate('/pricing')}
            style={{
              background: '#FAA802',
              color: '#08080A',
              border: 'none',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 0 1px rgba(250, 168, 2, 0.5), 0 4px 14px rgba(250, 168, 2, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#FBB502'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#FAA802'; }}
            className="hidden sm:block"
          >
            {t('header.premium')}
          </button>
        </div>

        {/* Center: Greeting (Hidden on small screens) */}
        <div className="hidden md:block text-center absolute left-1/2 transform -translate-x-1/2">
          <p style={{ fontSize: '0.7rem', color: 'var(--bento-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{greeting()}</p>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--bento-text)', margin: 0, letterSpacing: '-0.02em' }}>
            {user?.name?.split(' ')[0] || 'Mahmoud'} <span style={{ color: '#FAA802' }}>{user?.name?.split(' ').slice(1).join(' ') || 'Ayman'}</span>
          </h2>
        </div>

        {/* Right: Controls & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* AI Coach Quick Launcher */}
          <button
            type="button"
            onClick={() => navigate('/ai-chat')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FAA802]/30 bg-[#FAA802]/10 hover:bg-[#FAA802]/20 text-[#FAA802] font-bold text-xs transition-all shadow-[0_0_12px_rgba(250,168,2,0.15)] cursor-pointer"
            title={language === 'ar' ? 'محادثة المدرب الذكي' : 'Chat with AI Coach'}
          >
            <span className="w-2 h-2 rounded-full bg-[#FAA802] animate-ping" />
            <Icon name="MessageSquare" size={15} />
            <span>{language === 'ar' ? 'المدرب الذكي' : 'AI Coach'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(applyTheme(theme === 'dark' ? 'light' : 'dark'))}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08] text-[var(--bento-soft-text)] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
            title={theme === 'dark' ? t('header.lightMode') : t('header.darkMode')}
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={17} />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="atos-language-toggle"
            title={language === 'ar' ? t('common.switchToEnglish') : t('common.switchToArabic')}
          >
            <Icon name="Languages" size={15} />
            <span>{language === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: '12px',
                border: '1px solid var(--bento-border)',
                background: 'var(--bento-chip)',
                color: 'var(--bento-soft-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--bento-chip-hover)'; e.currentTarget.style.color = 'var(--bento-text)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--bento-chip)'; e.currentTarget.style.color = 'var(--bento-soft-text)'; }}
            >
              <Icon name="Bell" size={17} />
              <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#FAA802', boxShadow: '0 0 10px rgba(250, 168, 2, 0.6)', animation: 'badgePing 1.8s infinite' }}></div>
            </button>

            {showNotifications && (
              <div style={{ position: 'absolute', top: '50px', [isRTL ? 'left' : 'right']: 0, width: '320px', background: 'var(--bento-card-strong)', backdropFilter: 'blur(20px)', border: '1px solid var(--bento-border)', borderRadius: '20px', padding: '1rem', boxShadow: 'var(--bento-shadow)' }}>
                <h3 style={{ color: 'var(--bento-text)', fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>{t('header.notifications')}</h3>
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--bento-muted)' }}>
                  <Icon name="Bell" size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>{t('header.noNotifications')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(250, 168, 2, 0.15)', border: '2px solid rgba(250, 168, 2, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', boxShadow: '0 0 14px rgba(250, 168, 2, 0.25)' }}
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon name="User" size={20} color="#FAA802" />
              )}
            </button>

            {showProfileMenu && (
              <div style={{ position: 'absolute', top: '54px', [isRTL ? 'left' : 'right']: 0, width: '220px', background: 'var(--bento-card-strong)', backdropFilter: 'blur(20px)', border: '1px solid var(--bento-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--bento-shadow)' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontWeight: 700, color: 'var(--bento-text)', fontSize: '0.95rem', margin: '0 0 2px 0' }}>{activeUser?.name || 'Mahmoud Ayman'}</p>
                  <p style={{ color: 'var(--bento-muted)', fontSize: '0.75rem', margin: 0 }}>{activeUser?.email || 'user@example.com'}</p>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <button type="button" onClick={() => { navigate('/user-profile'); setShowProfileMenu(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: 'var(--bento-soft-text)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', borderRadius: '12px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bento-chip)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Icon name="User" size={16} /> {t('header.profile')}
                  </button>
                  <button type="button" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem', background: 'transparent', border: 'none', color: '#FAA802', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', borderRadius: '12px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(250, 168, 2, 0.12)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Icon name="LogOut" size={16} /> {t('header.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {(showProfileMenu || showNotifications) && (
        <div onClick={() => { setShowProfileMenu(false); setShowNotifications(false); }} style={{ position: 'fixed', inset: 0, zIndex: 140 }} />
      )}
    </>
  );
};

export default AppHeader;
