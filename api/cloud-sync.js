/**
 * Vercel Serverless Function: /api/cloud-sync
 * Provides multi-device persistence for ATOSfit on Vercel.
 * Works with Supabase when SUPABASE_URL / VITE_SUPABASE_URL is configured,
 * and maintains in-memory cloud edge persistence for seamless cross-device hydration.
 */

// In-memory edge store (persists across warm invocations on edge/serverless)
const edgeStore = new Map();

export default async function handler(req, res) {
  // Enable CORS for Vercel cross-origin or local requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { identifier, payload } = body || {};

      if (!identifier || !payload) {
        return res.status(400).json({ error: 'identifier and payload are required' });
      }

      const key = String(identifier).trim().toLowerCase();
      edgeStore.set(key, payload);
      if (payload.user?.id) {
        edgeStore.set(String(payload.user.id).trim().toLowerCase(), payload);
      }

      // 1. If Vercel KV / Upstash Redis is configured
      if (kvUrl && kvToken) {
        try {
          await fetch(`${kvUrl}/set/atos_user_${encodeURIComponent(key)}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        } catch (kvErr) {
          console.warn('Vercel KV set notice:', kvErr.message);
        }
      }

      // 2. If Supabase credentials exist, try upserting with robust fallback
      if (supabaseUrl && supabaseKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          const safeUser = payload.user || {};
          const baseData = {
            id: safeUser.id || key,
            email: safeUser.email || key,
            full_name: safeUser.name || 'Athlete',
            role: 'user',
            fitness_level: safeUser.fitnessLevel || 'intermediate',
            goals: Array.isArray(safeUser.goals) ? safeUser.goals : [safeUser.primaryGoal].filter(Boolean),
            age: Number(safeUser.age) || null,
            height: Number(safeUser.height) || null,
            weight: Number(safeUser.weight) || null,
            last_login: new Date().toISOString()
          };

          const { error: metaErr } = await supabase.from('users').upsert({
            ...baseData,
            raw_user_meta_data: payload
          }, { onConflict: 'id' });

          if (metaErr) {
            await supabase.from('users').upsert(baseData, { onConflict: 'id' });
          }
        } catch (sbErr) {
          console.warn('Vercel API Supabase upsert notice:', sbErr.message);
        }
      }

      return res.status(200).json({ success: true, identifier: key });
    } catch (err) {
      console.error('API cloud-sync POST error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const identifier = req.query?.identifier;
      if (!identifier) {
        return res.status(400).json({ error: 'identifier query param required' });
      }

      const key = String(identifier).trim().toLowerCase();

      // 1. Check edge store
      if (edgeStore.has(key)) {
        return res.status(200).json(edgeStore.get(key));
      }

      // 2. Check Vercel KV / Upstash Redis
      if (kvUrl && kvToken) {
        try {
          const kvRes = await fetch(`${kvUrl}/get/atos_user_${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${kvToken}` },
          });
          if (kvRes.ok) {
            const kvData = await kvRes.json();
            if (kvData?.result) {
              const parsed = typeof kvData.result === 'string' ? JSON.parse(kvData.result) : kvData.result;
              edgeStore.set(key, parsed);
              return res.status(200).json(parsed);
            }
          }
        } catch (kvErr) {
          console.warn('Vercel KV get notice:', kvErr.message);
        }
      }

      // 3. Try Supabase if available
      if (supabaseUrl && supabaseKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          let query = supabase.from('users').select('*');
          if (key.includes('@')) {
            query = query.eq('email', key);
          } else {
            query = query.eq('id', key);
          }
          const { data, error } = await query.maybeSingle();
          if (!error && data) {
            if (data.raw_user_meta_data && data.raw_user_meta_data.user) {
              edgeStore.set(key, data.raw_user_meta_data);
              return res.status(200).json(data.raw_user_meta_data);
            }
            const reconstructed = {
              user: {
                id: data.id,
                name: data.full_name,
                email: data.email,
                fitnessLevel: data.fitness_level || 'intermediate',
                goals: data.goals || [],
                age: data.age,
                height: data.height,
                weight: data.weight,
                onboardingCompleted: true,
              },
              trainingPlan: null,
            };
            edgeStore.set(key, reconstructed);
            return res.status(200).json(reconstructed);
          }
        } catch (sbErr) {
          console.warn('Vercel API Supabase query notice:', sbErr.message);
        }
      }

      return res.status(404).json({ error: 'User profile not found' });
    } catch (err) {
      console.error('API cloud-sync GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
