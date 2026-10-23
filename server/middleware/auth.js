const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fwgrexnksolmvscjdcwa.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2kwhR8WLA_GeOCAEVfM8eQ_qukqBZAr';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired Supabase session' });
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.email === 'admin@yatraverse.app' ? 'admin' : (user.app_metadata?.role || 'user'),
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.email === 'admin@yatraverse.app' ? 'admin' : (user.app_metadata?.role || 'user'),
        };
      }
    } catch {
      // Proceed as guest
    }
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
  next();
}

module.exports = { auth, adminOnly, optionalAuth };
