const router = require('express').Router();
const prisma = require('../db');
const { auth } = require('../middleware/auth');

// GET /api/catalog/cities
router.get('/cities', async (req, res, next) => {
  try {
    const { q, region } = req.query;
    const where = {};
    if (q) where.OR = [{ name: { contains: q } }, { country: { contains: q } }];
    if (region && region !== 'All') where.region = region;
    const cities = await prisma.city.findMany({ where, orderBy: { popularity: 'desc' } });
    res.json(cities);
  } catch (e) { next(e); }
});

// GET /api/catalog/activities?cityId=&type=&maxCost=&maxDuration=
router.get('/activities', async (req, res, next) => {
  try {
    const { cityId, type, maxCost, maxDuration } = req.query;
    const where = {};
    if (cityId) where.cityId = cityId;
    if (type && type !== 'all') where.type = type;
    if (maxCost) where.cost = { lte: Number(maxCost) };
    if (maxDuration) where.durationMin = { lte: Number(maxDuration) };
    const activities = await prisma.activity.findMany({ where, orderBy: { rating: 'desc' } });
    res.json(activities);
  } catch (e) { next(e); }
});

// POST /api/catalog/saved — toggle saved destination
router.post('/saved', auth, async (req, res, next) => {
  try {
    const { cityId } = req.body;
    const existing = await prisma.savedDestination.findUnique({ where: { userId_cityId: { userId: req.user.id, cityId } } });
    if (existing) {
      await prisma.savedDestination.delete({ where: { id: existing.id } });
      res.json({ saved: false });
    } else {
      await prisma.savedDestination.create({ data: { userId: req.user.id, cityId } });
      res.json({ saved: true });
    }
  } catch (e) { next(e); }
});

// GET /api/catalog/saved — list user's saved cities
router.get('/saved', auth, async (req, res, next) => {
  try {
    const saved = await prisma.savedDestination.findMany({
      where: { userId: req.user.id },
      include: { city: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(saved.map((s) => s.city));
  } catch (e) { next(e); }
});

module.exports = router;
