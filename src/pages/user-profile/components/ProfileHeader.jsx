import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';

const ProfileHeader = ({ user, onProfilePictureUpdate }) => {
  const [showImageOptions, setShowImageOptions] = useState(false);
  const { language, t } = useLanguage();
  const isAr = language === 'ar';

  const handleImageUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e?.target?.result;
        if (!rawData) return;

        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 320;
          let w = img.width;
          let h = img.height;

          if (w > h) {
            if (w > MAX_SIZE) {
              h = Math.round((h * MAX_SIZE) / w);
              w = MAX_SIZE;
            }
          } else {
            if (h > MAX_SIZE) {
              w = Math.round((w * MAX_SIZE) / h);
              h = MAX_SIZE;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onProfilePictureUpdate(compressedDataUrl);
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
    setShowImageOptions(false);
  };

  const membershipDuration = () => {
    const joinDate = new Date(user?.joinDate || Date.now());
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return isAr ? `${diffDays} يوم` : `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return isAr ? `${months} شهر` : `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return isAr ? `${years} سنة` : `${years} year${years > 1 ? 's' : ''}`;
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="relative overflow-hidden rounded-2xl border border-[#FAA802]/25 bg-gradient-to-r from-card via-background to-card p-6 mb-6 shadow-elevation-2 backdrop-blur-md"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Profile Picture */}
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-muted border-2 border-[#FAA802]/50 shadow-elevation-3 transition-transform duration-300 group-hover:scale-105">
            <Image
              src={user?.profilePicture}
              alt={`${user?.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Camera Overlay */}
          <button
            onClick={() => setShowImageOptions(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#FAA802] text-black font-bold rounded-xl flex items-center justify-center shadow-elevation-2 hover:bg-[#FAA802]/90 transition-all duration-200"
            aria-label={t('profile.updatePicture')}
          >
            <Icon name="Camera" size={15} />
          </button>

          {/* Image Upload Options */}
          {showImageOptions && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowImageOptions(false)}
              />
              <div className="absolute top-full right-0 mt-2 bg-[#12141a] border border-[#FAA802]/30 rounded-xl shadow-elevation-3 z-50 min-w-48 overflow-hidden">
                <div className="p-2">
                  <label className="flex items-center space-x-3 space-x-reverse px-3 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                    <Icon name="Upload" size={16} className="text-[#FAA802]" />
                    <span>{t('profile.uploadDevice')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button 
                    onClick={() => {
                      onProfilePictureUpdate('');
                      setShowImageOptions(false);
                    }}
                    className="flex items-center space-x-3 space-x-reverse w-full px-3 py-2 text-sm text-destructive hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <Icon name="Trash2" size={16} />
                    <span>{t('profile.removePhoto')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left rtl:sm:text-right">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              {user?.name || (isAr ? 'رياضي جديد' : 'ATOS Athlete')}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAA802]/15 text-[#FAA802] border border-[#FAA802]/30 capitalize">
              {user?.fitnessLevel || 'Beginner'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4 text-xs">
            <div className="flex items-center space-x-1.5 space-x-reverse text-muted-foreground">
              <Icon name="Calendar" size={14} className="text-[#FAA802]" />
              <span>{t('profile.memberFor')} {membershipDuration()}</span>
            </div>
            
            <div className="flex items-center space-x-1.5 space-x-reverse">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold">{t('profile.active')}</span>
            </div>
          </div>

          {/* Quick Stats Bento Pills */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <div className="px-3.5 py-1.5 rounded-xl border border-border/70 bg-card/70 flex items-center gap-2">
              <Icon name="Dumbbell" size={15} className="text-primary" />
              <span className="text-sm font-bold text-foreground">{user?.totalWorkouts || 0}</span>
              <span className="text-xs text-muted-foreground">{t('profile.workouts')}</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl border border-border/70 bg-card/70 flex items-center gap-2">
              <Icon name="Flame" size={15} className="text-[#FAA802]" />
              <span className="text-sm font-bold text-foreground">{user?.currentStreak || 0}</span>
              <span className="text-xs text-muted-foreground">{t('profile.dayStreak')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
