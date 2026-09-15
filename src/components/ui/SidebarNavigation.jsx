import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import logoImage from '../../assets/logo.png';
import { useLanguage } from '../../contexts/LanguageContext';
import { logoutUser } from '../../utils/nativeAuth';

const SidebarNavigation = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isRTL, t } = useLanguage();

  const navItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: 'Home' },
    { label: t('nav.exercises'), path: '/exercise-library', icon: 'Dumbbell' },
    { label: t('nav.aiChatbot'), path: '/ai-chat', icon: 'MessageCircle' },
    { label: t('nav.foodScanner'), path: '/food-scanner', icon: 'ScanLine' },
    { label: t('nav.profile'), path: '/user-profile', icon: 'User' },
    { label: t('nav.achievements'), path: '/achievements', icon: 'Trophy' },
    { label: t('nav.community'), path: '/community', icon: 'Users' },
  ];

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    onClose?.();
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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190] lg:hidden transition-opacity"
        />
      )}

      {/* Modern Floating Bento Sidebar */}
      <aside 
        style={{
          position: 'fixed',
          top: 16,
          bottom: 16,
          [isRTL ? 'right' : 'left']: 16,
          width: '260px',
          background: 'var(--bento-card)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid var(--bento-border)',
          borderRadius: '26px',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--bento-shadow)',
          overflow: 'hidden',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className={`atos-sidebar lg:translate-x-0 ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-[120%]' : '-translate-x-[120%]'}`}
      >
        {/* Logo Area */}
        <div style={{ padding: '1.5rem 1.25rem 1.25rem', borderBottom: '1px solid var(--bento-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logoImage} alt="ATOSfit Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--bento-text)', letterSpacing: '0.02em' }}>ATOSfit</span>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden"
            style={{ background: 'transparent', border: 'none', color: 'var(--bento-muted)', padding: '4px' }}
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '1.25rem 1rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--bento-muted)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem', paddingInlineStart: '0.5rem' }}>{t('nav.mainMenu')}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map(it => {
              const active = location.pathname === it.path;
              return (
                <button
                  key={it.path}
                  onClick={() => handleNav(it.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '0.85rem 1rem',
                    borderRadius: '14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s ease',
                    background: active ? 'rgba(250, 168, 2, 0.12)' : 'transparent',
                    color: active ? 'var(--bento-text)' : 'var(--bento-muted)',
                    borderInlineStart: active ? '3px solid #FAA802' : '3px solid transparent',
                    boxShadow: active ? '0 0 15px rgba(250, 168, 2, 0.2)' : 'none'
                  }}
                  onMouseOver={e => { if (!active) { e.currentTarget.style.backgroundColor = 'var(--bento-chip)'; e.currentTarget.style.color = 'var(--bento-text)'; } }}
                  onMouseOut={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--bento-muted)'; } }}
                >
                  <Icon name={it.icon} size={20} color={active ? '#FAA802' : 'var(--bento-muted)'} />
                  <span style={{ fontSize: '0.9rem', fontWeight: active ? 600 : 500 }}>{it.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer: Free Plan Badge & Sign Out */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--bento-border)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ background: 'rgba(250, 168, 2, 0.10)', border: '1px solid rgba(250, 168, 2, 0.25)', borderRadius: '14px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon name="Crown" size={16} color="#FAA802" />
            <span style={{ fontSize: '0.78rem', color: '#FAA802', fontWeight: 600 }}>{t('nav.freePlan')}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: '#FAA802',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(250, 168, 2, 0.12)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Icon name="LogOut" size={16} />
            <span>{t('header.signOut')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarNavigation;
