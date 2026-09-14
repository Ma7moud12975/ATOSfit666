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

      // If Supabase credentials exist, try upserting in background
      if (supabaseUrl && supabaseKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('users').upsert({
            id: payload.user.id,
            email: payload.user.email,
            full_name: payload.user.name,
            raw_user_meta_data: payload,
            last_login: new Date().toISOString()
          }, { onConflict: 'id' });
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

      // Check edge store
      if (edgeStore.has(key)) {
        return res.status(200).json(edgeStore.get(key));
      }

      // Try Supabase if available
      if (supabaseUrl && supabaseKey) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseKey);
          let query = supabase.from('users').select('raw_user_meta_data');
          if (key.includes('@')) {
            query = query.eq('email', key);
          } else {
            query = query.eq('id', key);
          }
          const { data, error } = await query.maybeSingle();
          if (!error && data?.raw_user_meta_data) {
            edgeStore.set(key, data.raw_user_meta_data);
            return res.status(200).json(data.raw_user_meta_data);
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
