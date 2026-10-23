const router = require('express').Router();
const prisma = require('../db');
const { auth } = require('../middleware/auth');

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// POST /api/auth/sync — sync Supabase Auth user into PostgreSQL User table
router.post('/sync', async (req, res, next) => {
  try {
    const { id, email, name, avatarUrl, role } = req.body;
    if (!id || !email) return res.status(400).json({ error: 'id and email required' });

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || undefined,
      },
      create: {
        id,
        email,
        name: name || email.split('@')[0],
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256',
        passwordHash: 'supabase-auth-managed',
        role: role || (email === 'admin@yatraverse.app' ? 'admin' : 'user'),
      },
    });
    res.json(safeUser(user));
  } catch (e) { next(e); }
});

// GET /api/auth/me — verify authenticated Supabase user profile
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(safeUser(user));
  } catch (e) { next(e); }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, email, avatarUrl, language, currency, persona } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (language) data.language = language;
    if (currency) data.currency = currency;
    if (persona !== undefined) data.persona = persona;
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json(safeUser(user));
  } catch (e) { next(e); }
});

// DELETE /api/auth/account
router.delete('/account', auth, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Account deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
