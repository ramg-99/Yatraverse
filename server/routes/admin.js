const router = require('express').Router();
const prisma = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (_req, res, next) => {
  try {
    const [userCount, tripCount, cities, activities, stops] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.findMany({ select: { id: true, name: true } }),
      prisma.activity.findMany({ select: { id: true, name: true } }),
      prisma.stop.findMany({ select: { cityId: true } }),
    ]);

    // City frequency
    const cityCounts = {};
    stops.forEach((s) => { cityCounts[s.cityId] = (cityCounts[s.cityId] || 0) + 1; });
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([id, n]) => ({ city: cities.find((c) => c.id === id)?.name || id, n }));

    // Trips over time (group by month of createdAt)
    const allTrips = await prisma.trip.findMany({ select: { createdAt: true } });
    const monthMap = {};
    allTrips.forEach((t) => {
      const m = t.createdAt.toLocaleString('en', { month: 'short' });
      monthMap[m] = (monthMap[m] || 0) + 1;
    });
    const tripsOverTime = Object.entries(monthMap).map(([month, trips]) => ({ month, trips }));

    res.json({
      users: userCount,
      trips: tripCount,
      dau: Math.min(userCount, 3),
      mau: userCount,
      avgLength: 10,
      topCities,
      topActivities: activities.slice(0, 5).map((a) => a.name),
      tripsOverTime,
    });
  } catch (e) { next(e); }
});

// GET /api/admin/users
router.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isSuspended: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (e) { next(e); }
});

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', async (req, res, next) => {
  try {
    const { suspended } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isSuspended: suspended } });
    res.json({ id: user.id, isSuspended: user.isSuspended });
  } catch (e) { next(e); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
