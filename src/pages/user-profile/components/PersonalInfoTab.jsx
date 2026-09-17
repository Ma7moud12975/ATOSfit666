import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { applyTheme } from '../../../utils/theme';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../utils/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

const PersonalInfoTab = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const [editingField, setEditingField] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || ''
  });

  // Sync when user prop changes
  React.useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth || ''
    });
  }, [user?.name, user?.email, user?.dateOfBirth]);

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleSave = async (field) => {
    const value = formData?.[field];
    const updated = { ...user, [field]: value };
    if (field === 'name') {
      updated.fullName = value;
    }
    onUpdateUser(updated);

    try {
      const { resolveDbUserId } = await import('../../../utils/api/chatApi');
      const { updateUser } = await import('../../../utils/api/userApi');
      const resolved = await resolveDbUserId(user?.id || user?.email);
      if (resolved) {
        const dbUpdates = {};
        if (field === 'name') dbUpdates.full_name = value;
        if (field === 'email') dbUpdates.email = value;
        if (field === 'dateOfBirth') dbUpdates.date_of_birth = value;
        if (Object.keys(dbUpdates).length > 0) {
          await updateUser(resolved, dbUpdates);
        }
      }
    } catch (err) {
      console.warn('Supabase direct update warning:', err);
    }

    try {
      const { updateUserProfile } = await import('../../../utils/db');
      await updateUserProfile(user.id, { [field]: value });
    } catch {}
    setEditingField(null);
  };

  const handleCancel = (field) => {
    setFormData({ ...formData, [field]: user?.[field] });
    setEditingField(null);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Delete account function
  const handleDeleteAccount = async () => {
    if (!user?.id && !user?.email) {
      alert(isAr ? 'لم يتم العثور على حساب لحذفه' : 'No user found to delete');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting user account:', user.id || user.email);

      const { resolveDbUserId } = await import('../../../utils/api/chatApi');
      const targetUserId = (await resolveDbUserId(user?.id || user?.email)) || user?.id;

      if (targetUserId) {
        // 1. Delete achievements
        await supabase.from('achievements').delete().eq('user_id', targetUserId);
        // 2. Delete exercises
        await supabase.from('exercises').delete().eq('user_id', targetUserId);
        // 3. Delete food logs
        await supabase.from('food_logs').delete().eq('user_id', targetUserId);
        // 4. Delete chatbot logs
        await supabase.from('chatbot_logs').delete().eq('user_id', targetUserId);
        // 5. Delete user stats
        await supabase.from('user_stats').delete().eq('user_id', targetUserId);
        // 6. Delete user record
        await supabase.from('users').delete().eq('id', targetUserId);
      }

      // Clear all local storage
      localStorage.removeItem('user');
      localStorage.removeItem('theme');
      localStorage.removeItem('fitcoach_badges');
      localStorage.removeItem('workoutAnalytics');
      localStorage.removeItem('fitcoach_today_plan');
      
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('achievement') || key.includes('pushup') || key.includes('plank') || key.includes('atos_account'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear IndexedDB
      try {
        const { db } = await import('../../../utils/db');
        await db.delete();
      } catch (dbError) {
        console.warn('⚠️ Could not clear IndexedDB:', dbError);
      }

      alert(isAr ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully!');
      navigate('/register-screen', { replace: true });
    } catch (error) {
      console.error('❌ Error deleting account:', error);
      alert(isAr ? 'فشل حذف الحساب. يرجى المحاولة لاحقاً.' : 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const InfoField = ({ label, field, icon, type = "text" }) => {
    const isEditing = editingField === field;
    
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Icon name={icon} size={16} className="text-muted-foreground" />
            <label className="text-sm font-medium text-card-foreground">{label}</label>
          </div>
          
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(field)}
              className="text-primary hover:text-primary/80"
            >
              <Icon name="Edit2" size={14} />
            </Button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              type={type}
              value={formData?.[field]}
              onChange={(e) => handleChange(field, e?.target?.value)}
              className="w-full"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSave(field)}
                className="flex-1"
              >
                <Icon name="Check" size={14} className="mr-1" />
                {t('profile.save')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(field)}
                className="flex-1"
              >
                <Icon name="X" size={14} className="mr-1" />
                {t('profile.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground font-medium">
            {formData?.[field] || t('profile.notProvided')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('profile.personalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoField
            label={t('profile.fullName')}
            field="name"
            icon="User"
          />
          <InfoField
            label={t('profile.email')}
            field="email"
            icon="Mail"
            type="email"
          />
          {/* Phone removed per request */}
          <InfoField
            label={t('profile.birthDate')}
            field="dateOfBirth"
            icon="Calendar"
            type="date"
          />
        </div>
      </div>

      {/* Location removed per request */}

      {/* Account Settings */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('profile.accountSettings')}</h3>
        <div className="space-y-3">
          {/* Theme Toggle in Profile Settings */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Sun" size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">{t('profile.appearance')}</p>
                  <p className="text-sm text-muted-foreground">{t('profile.appearanceCopy')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const isDark = document.documentElement.classList.contains('dark');
                    applyTheme(isDark ? 'light' : 'dark');
                  }}
                  className="inline-flex items-center rounded-[12px] border border-input px-3 py-2 text-sm hover:bg-muted"
                >
                  <Icon name="Moon" size={16} className="mr-2" />
                  {t('profile.toggleTheme')}
                </button>
              </div>
            </div>
          </div>
          {/* Privacy settings removed per request */}

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Bell" size={20} className="text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">Notification Preferences</p>
                  <p className="text-sm text-muted-foreground">Control your notification settings</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Trash2" size={20} className="text-destructive" />
                <div>
                  <p className="font-medium text-destructive">{t('profile.deleteAccount')}</p>
                  <p className="text-sm text-muted-foreground">{isAr ? 'حذف حسابك وبياناتك نهائياً من النظام' : 'Permanently delete your account'}</p>
                </div>
              </div>
              {!showDeleteConfirm ? (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  {t('profile.deleteAccount')}
                </Button>
              ) : (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    {t('profile.cancel')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Icon name="Loader" size={14} className="mr-1 animate-spin" />
                        {isAr ? 'جارِ الحذف...' : 'Deleting...'}
                      </>
                    ) : (
                      t('profile.confirmDelete')
                    )}
                  </Button>
                </div>
              )}
            </div>
            {showDeleteConfirm && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-bold">
                  {t('profile.deleteWarning')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('profile.deleteCopy')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
