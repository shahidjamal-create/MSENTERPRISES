// Shared request/response helpers for every serverless route.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function withApi(handler) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
      if (err?.code === '23505') {
        return res.status(409).json({ error: 'A record with the same unique value already exists.' });
      }
      if (err?.code === '23503') {
        return res.status(409).json({ error: 'This record is linked to other data and cannot be removed. Deactivate it instead.' });
      }
      console.error('API error:', err);
      return res.status(500).json({ error: 'Server error. Please try again in a moment.' });
    }
  };
}

// Unwraps a Supabase result or throws its error.
export function check(result) {
  if (result.error) throw result.error;
  return result.data;
}

export const readBody = (req) => (req.body && typeof req.body === 'object' ? req.body : {});

export function notAllowed() {
  throw new HttpError(405, 'Method not allowed');
}
