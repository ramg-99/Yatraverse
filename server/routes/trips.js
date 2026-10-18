const router = require('express').Router();
const prisma = require('../db');
const { auth } = require('../middleware/auth');

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48);
}
function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

// GET /api/trips — user's own trips
router.get('/', auth, async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: { stops: { include: { city: true, stopActivities: { include: { activity: true } } } }, expenses: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(trips);
  } catch (e) { next(e); }
});

// GET /api/trips/share/:slug — public view by slug
router.get('/share/:slug', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { shareSlug: req.params.slug, isPublic: true },
      include: { stops: { include: { city: true, stopActivities: { include: { activity: true } } }, orderBy: { orderIndex: 'asc' } }, expenses: true },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found or private' });
    res.json(trip);
  } catch (e) { next(e); }
});

// GET /api/trips/:id — single trip
router.get('/:id', auth, async (req, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { stops: { include: { city: true, stopActivities: { include: { activity: true } } }, orderBy: { orderIndex: 'asc' } }, expenses: true },
    });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (e) { next(e); }
});

// POST /api/trips — create trip
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, coverUrl, budgetCap } = req.body;
    const trip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        name,
        description: description || '',
        startDate,
        endDate,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400',
        shareSlug: slugify(name) + '-' + uid().slice(-4),
        budgetCap: budgetCap || 200000,
      },
    });
    res.status(201).json(trip);
  } catch (e) { next(e); }
});

// PUT /api/trips/:id — update trip
router.put('/:id', auth, async (req, res, next) => {
  try {
    const existing = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });
    const { name, description, startDate, endDate, coverUrl, isPublic, budgetCap, notes } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (startDate !== undefined) data.startDate = startDate;
    if (endDate !== undefined) data.endDate = endDate;
    if (coverUrl !== undefined) data.coverUrl = coverUrl;
    if (isPublic !== undefined) data.isPublic = isPublic;
    if (budgetCap !== undefined) data.budgetCap = budgetCap;
    if (notes !== undefined) data.notes = notes;
    const trip = await prisma.trip.update({ where: { id: req.params.id }, data });
    res.json(trip);
  } catch (e) { next(e); }
});

// DELETE /api/trips/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const existing = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });
    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ message: 'Trip deleted' });
  } catch (e) { next(e); }
});

// POST /api/trips/:id/clone
router.post('/:id/clone', auth, async (req, res, next) => {
  try {
    const src = await prisma.trip.findFirst({
      where: { id: req.params.id, isPublic: true },
      include: { stops: { include: { stopActivities: true } } },
    });
    if (!src) return res.status(404).json({ error: 'Trip not found or private' });
    const newTrip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        name: `${src.name} (copy)`,
        description: src.description,
        startDate: src.startDate,
        endDate: src.endDate,
        coverUrl: src.coverUrl,
        shareSlug: slugify(src.name) + '-' + uid().slice(-4),
        budgetCap: src.budgetCap,
        isPublic: false,
        stops: {
          create: src.stops.map((s, i) => ({
            cityId: s.cityId,
            startDate: s.startDate,
            endDate: s.endDate,
            orderIndex: i,
            stopActivities: {
              create: s.stopActivities.map((sa) => ({
                activityId: sa.activityId,
                dayDate: sa.dayDate,
                startTime: sa.startTime,
                notes: sa.notes,
                costOverride: sa.costOverride,
                orderIndex: sa.orderIndex,
              })),
            },
          })),
        },
      },
    });
    res.status(201).json(newTrip);
  } catch (e) { next(e); }
});

// POST /api/trips/:id/stops — add stop
router.post('/:id/stops', auth, async (req, res, next) => {
  try {
    const { cityId, startDate, endDate } = req.body;
    const count = await prisma.stop.count({ where: { tripId: req.params.id } });
    const stop = await prisma.stop.create({ data: { tripId: req.params.id, cityId, startDate, endDate, orderIndex: count } });
    res.status(201).json(stop);
  } catch (e) { next(e); }
});

// PUT /api/trips/:id/stops/reorder
router.put('/:id/stops/reorder', auth, async (req, res, next) => {
  try {
    const { ids } = req.body; // ordered array of stop IDs
    await Promise.all(ids.map((id, index) => prisma.stop.update({ where: { id }, data: { orderIndex: index } })));
    res.json({ message: 'Reordered' });
  } catch (e) { next(e); }
});

// DELETE /api/trips/stops/:stopId
router.delete('/stops/:stopId', auth, async (req, res, next) => {
  try {
    await prisma.stop.delete({ where: { id: req.params.stopId } });
    res.json({ message: 'Stop removed' });
  } catch (e) { next(e); }
});

// POST /api/trips/stops/:stopId/activities — add activity to stop
router.post('/stops/:stopId/activities', auth, async (req, res, next) => {
  try {
    const { activityId, dayDate, startTime, costOverride, notes } = req.body;
    const count = await prisma.stopActivity.count({ where: { stopId: req.params.stopId } });
    const sa = await prisma.stopActivity.create({
      data: { stopId: req.params.stopId, activityId, dayDate, startTime, costOverride, notes, orderIndex: count },
    });
    res.status(201).json(sa);
  } catch (e) { next(e); }
});

// PUT /api/trips/stop-activities/:id — update time/cost/notes
router.put('/stop-activities/:id', auth, async (req, res, next) => {
  try {
    const { startTime, costOverride, notes, dayDate } = req.body;
    const data = {};
    if (startTime !== undefined) data.startTime = startTime;
    if (costOverride !== undefined) data.costOverride = costOverride;
    if (notes !== undefined) data.notes = notes;
    if (dayDate !== undefined) data.dayDate = dayDate;
    const sa = await prisma.stopActivity.update({ where: { id: req.params.id }, data });
    res.json(sa);
  } catch (e) { next(e); }
});

// DELETE /api/trips/stop-activities/:id
router.delete('/stop-activities/:id', auth, async (req, res, next) => {
  try {
    await prisma.stopActivity.delete({ where: { id: req.params.id } });
    res.json({ message: 'Removed' });
  } catch (e) { next(e); }
});

// POST /api/trips/:id/expenses — add expense
router.post('/:id/expenses', auth, async (req, res, next) => {
  try {
    const { category, amount, currency, notes, date } = req.body;
    const expense = await prisma.expense.create({
      data: { tripId: req.params.id, category, amount, currency: currency || 'INR', notes, date },
    });
    res.status(201).json(expense);
  } catch (e) { next(e); }
});

module.exports = router;
