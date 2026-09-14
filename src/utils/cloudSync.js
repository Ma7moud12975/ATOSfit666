/**
 * Cloud Synchronization & Cross-Device Hydration Manager
 * Ensures that full onboarding profile, metabolic calculations, and 4-week training mesocycles
 * are persisted to the cloud and restored seamlessly across any device or Vercel deployment.
 */

import { supabase } from './supabase.js';
import { saveUserTrainingPlan, getUserTrainingPlan } from './trainingPlanEngine.js';

const CLOUD_CACHE_PREFIX = 'atos_cloud_profile_';

/**
 * Normalizes email or identifier for consistent lookup
 */
export const normalizeIdentifier = (identifier) => {
  if (!identifier) return '';
  return String(identifier).trim().toLowerCase();
};

/**
 * Saves complete user profile and training mesocycle to the cloud.
 * Tries Supabase first; persists to cloud sync API and local persistent cache.
 */
export async function saveCloudUserProfile(userProfile, trainingMesocycle = null) {
  if (!userProfile) return null;

  const email = normalizeIdentifier(userProfile.email);
  const userId = userProfile.id || userProfile.googleId || (email ? `google_${btoa(email).replace(/=/g, '')}` : `user_${Date.now()}`);
  const now = new Date().toISOString();

  // If training plan not provided, try to retrieve it from local storage
  const activePlan = trainingMesocycle || getUserTrainingPlan(userId, userProfile);

  const enrichedProfile = {
    ...userProfile,
    id: userId,
    email: email || userProfile.email || '',
    name: userProfile.name || userProfile.fullName || 'ATOS Athlete',
    onboardingCompleted: true,
    updatedAt: now,
    trainingMesocycleId: activePlan?.id || userProfile.trainingMesocycleId,
    metabolicProfile: userProfile.metabolicProfile || {
      bmr: userProfile.bmr,
      tdee: userProfile.tdee,
      dailyCalorieGoal: userProfile.dailyCalorieGoal || userProfile.calorieGoal,
      proteinGoal: userProfile.proteinGoal,
      carbsGoal: userProfile.carbsGoal,
      fatGoal: userProfile.fatGoal,
      waterGoal: userProfile.waterGoal,
      bmi: userProfile.bmi,
    }
  };

  const fullPayload = {
    user: enrichedProfile,
    trainingPlan: activePlan,
    syncedAt: now,
  };

  // 1. Save locally with fast hydration keys
  try {
    localStorage.setItem('user', JSON.stringify(enrichedProfile));
    if (email) {
      localStorage.setItem(`${CLOUD_CACHE_PREFIX}${email}`, JSON.stringify(fullPayload));
    }
    localStorage.setItem(`${CLOUD_CACHE_PREFIX}${userId}`, JSON.stringify(fullPayload));
    if (activePlan) {
      saveUserTrainingPlan(userId, activePlan);
    }
  } catch (lsErr) {
    console.warn('LocalStorage save warning:', lsErr);
  }

  // 2. Sync to Supabase if connected
  let supabaseSuccess = false;
  try {
    if (supabase && typeof supabase.from === 'function') {
      const basePayload = {
        id: userId,
        email: enrichedProfile.email,
        full_name: enrichedProfile.name,
        role: 'user',
        fitness_level: enrichedProfile.fitnessLevel || 'intermediate',
        goals: Array.isArray(enrichedProfile.goals) ? enrichedProfile.goals : [enrichedProfile.primaryGoal].filter(Boolean),
        age: Number(enrichedProfile.age) || null,
        height: Number(enrichedProfile.height) || null,
        weight: Number(enrichedProfile.weight) || null,
        last_login: now,
      };

      const { data, error } = await supabase
        .from('users')
        .upsert({
          ...basePayload,
          raw_user_meta_data: fullPayload
        }, { onConflict: 'id' })
        .select()
        .single();

      if (!error) {
        supabaseSuccess = true;
        console.log('[CloudSync] Successfully saved to Supabase:', userId);
      } else {
        // Fallback without raw_user_meta_data in case column doesn't exist
        const { error: fallbackErr } = await supabase
          .from('users')
          .upsert(basePayload, { onConflict: 'id' });
        if (!fallbackErr) {
          supabaseSuccess = true;
          console.log('[CloudSync] Successfully saved base profile to Supabase:', userId);
        } else {
          console.warn('[CloudSync] Supabase upsert notice:', fallbackErr.message);
        }
      }
    }
  } catch (sbErr) {
    console.warn('[CloudSync] Supabase connection inactive, using resilient cloud layer:', sbErr?.message);
  }

  // 3. Sync to Vercel Serverless Sync API endpoint (/api/cloud-sync)
  try {
    const apiRes = await fetch('/api/cloud-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: email || userId,
        payload: fullPayload,
      }),
    });
    if (apiRes.ok) {
      console.log('[CloudSync] Successfully synced with /api/cloud-sync');
    }
  } catch {
    // Expected when running on Vite dev server without Vercel backend running
  }

  return fullPayload;
}

/**
 * Fetches user profile and training mesocycle from cloud by email or Google ID.
 * Looks up Supabase first, then /api/cloud-sync, then local resilient cache.
 */
export async function fetchCloudUserProfile(identifier) {
  if (!identifier) return null;
  const cleanId = normalizeIdentifier(identifier);

  // 1. Try Supabase lookup
  try {
    if (supabase && typeof supabase.from === 'function') {
      let query = supabase.from('users').select('*');
      if (cleanId.includes('@')) {
        query = query.eq('email', cleanId);
      } else {
        query = query.eq('id', cleanId);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        if (data.raw_user_meta_data && data.raw_user_meta_data.user) {
          console.log('[CloudSync] Found full profile in Supabase raw_user_meta_data');
          return data.raw_user_meta_data;
        }

        // Reconstruct from columns if raw_user_meta_data is not set
        const reconstructedUser = {
          id: data.id,
          name: data.full_name,
          email: data.email,
          fitnessLevel: data.fitness_level,
          goals: data.goals || [],
          age: data.age,
          height: data.height,
          weight: data.weight,
          onboardingCompleted: true,
        };
        const activePlan = getUserTrainingPlan(data.id, reconstructedUser);
        return { user: reconstructedUser, trainingPlan: activePlan };
      }
    }
  } catch (sbErr) {
    console.warn('[CloudSync] Supabase fetch non-blocking warning:', sbErr?.message);
  }

  // 2. Try Vercel Serverless Sync API
  try {
    const apiRes = await fetch(`/api/cloud-sync?identifier=${encodeURIComponent(cleanId)}`);
    if (apiRes.ok) {
      const cloudData = await apiRes.json();
      if (cloudData && cloudData.user) {
        console.log('[CloudSync] Found profile via /api/cloud-sync');
        return cloudData;
      }
    }
  } catch {
    // API not reachable in pure dev mode without Vercel CLI
  }

  // 3. Try Local Resilient Cache
  try {
    const cached = localStorage.getItem(`${CLOUD_CACHE_PREFIX}${cleanId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.user) {
        console.log('[CloudSync] Restored from local cloud cache');
        return parsed;
      }
    }

    // Check if current user in localStorage matches
    const localUserRaw = localStorage.getItem('user');
    if (localUserRaw) {
      const localUser = JSON.parse(localUserRaw);
      if (
        (localUser.email && normalizeIdentifier(localUser.email) === cleanId) ||
        localUser.id === cleanId
      ) {
        const localPlan = getUserTrainingPlan(localUser.id, localUser);
        return { user: localUser, trainingPlan: localPlan };
      }
    }
  } catch (e) {
    console.warn('[CloudSync] Error reading local fallback:', e);
  }

  return null;
}

/**
 * Hydrates the browser session from cloud data:
 * - Updates localStorage 'user'
 * - Updates training mesocycle plan in localStorage
 * - Broadcasts update to all components
 */
export function hydrateLocalSession(cloudData) {
  if (!cloudData || !cloudData.user) return false;

  const { user, trainingPlan } = cloudData;

  try {
    // Save user profile
    localStorage.setItem('user', JSON.stringify(user));

    // Save training plan
    if (trainingPlan) {
      saveUserTrainingPlan(user.id, trainingPlan);
    } else {
      // Auto-generate if missing
      getUserTrainingPlan(user.id, user);
    }

    // Trigger custom window event for instant UI reaction without reload
    window.dispatchEvent(new CustomEvent('atos_user_profile_hydrated', { detail: user }));
    console.log('[CloudSync] Session successfully hydrated for:', user.email || user.id);
    return true;
  } catch (err) {
    console.error('[CloudSync] Hydration failed:', err);
    return false;
  }
}

export default {
  saveCloudUserProfile,
  fetchCloudUserProfile,
  hydrateLocalSession,
  normalizeIdentifier,
};
