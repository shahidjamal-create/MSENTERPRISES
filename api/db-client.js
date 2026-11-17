import { createClient } from '@supabase/supabase-js';
import { triggerRestore } from './db-wake.js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ms-enterprises.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_placeholder_key';

const supabase = createClient(
  url,
  key,
  {
    global: {
      fetch: async (fetchUrl, options) => {
        try {
          const res = await fetch(fetchUrl, options);
          if (!res.ok && res.status >= 500) triggerRestore();
          return res;
        } catch (err) {
          return new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 503 });
        }
      },
    },
  }
);

export default supabase;
