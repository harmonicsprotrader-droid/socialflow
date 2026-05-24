// ── server.js ──────────────────────────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const db = require('./db');
const { checkAllFeeds, checkFeed } = require('./rss-checker');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'socialflow-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// ── Auth middleware (bypass - no login required) ──────────────────────────────

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function requireAuth(req, res, next) {
  return next();
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: true });
});

// ── Stats ─────────────────────────────────────────────────────────────────────

app.get('/api/stats', requireAuth, (req, res) => {
  const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  res.json({
    totalFeeds: db.get('feeds').size().value(),
    activeFeeds: db.get('feeds').filter({ active: 1 }).size().value(),
    activePlatforms: db.get('platforms').filter({ active: 1 }).size().value(),
    totalPosted: db.get('posted_items').filter({ status: 'posted' }).size().value(),
    postedToday: db.get('posted_items').filter(i => i.posted_at >= startOfDay).size().value(),
  });
});

// ── Feeds ─────────────────────────────────────────────────────────────────────

app.get('/api/feeds', requireAuth, (req, res) => {
  const feeds = db.get('feeds').value().map(f => ({
    ...f,
    platform_count: db.get('feed_platforms').filter({ feed_id: f.id }).size().value(),
    posts_count: db.get('posted_items').filter({ feed_id: f.id }).size().value(),
  }));
  res.json(feeds);
});

app.post('/api/feeds', requireAuth, (req, res) => {
  const { name, url, check_interval, max_items, prefix, suffix, post_immediately } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });

  const id = db.get('_nextId.feeds').value();
  db.set('_nextId.feeds', id + 1).write();

  const feed = {
    id, name, url,
    check_interval: parseInt(check_interval) || 30,
    max_items: parseInt(max_items) || 3,
    max_per_day: 10,
    trickle: 'off',
    prefix: prefix || '',
    suffix: suffix || '',
    post_immediately: post_immediately ? 1 : 0,
    active: 1,
    last_checked: 0,
    filter_all: '', filter_any: '', filter_ignore: '',
    created_at: Math.floor(Date.now() / 1000)
  };

  db.get('feeds').push(feed).write();
  res.json(feed);
});

app.get('/api/feeds/:id', requireAuth, (req, res) => {
  const feed = db.get('feeds').find({ id: parseInt(req.params.id) }).value();
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  const platforms = db.get('feed_platforms')
    .filter({ feed_id: feed.id })
    .map(fp => db.get('platforms').find({ id: fp.platform_id }).value())
    .filter(Boolean)
    .value();
  res.json({ ...feed, platforms });
});

app.get('/api/feeds/:id/platforms', requireAuth, (req, res) => {
  const feedId = parseInt(req.params.id);
  const fps = db.get('feed_platforms').filter({ feed_id: feedId }).value();
  const platforms = fps.map(fp => db.get('platforms').find({ id: fp.platform_id }).value()).filter(Boolean);
  res.json(platforms);
});

app.put('/api/feeds/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const feed = db.get('feeds').find({ id }).value();
  if (!feed) return res.status(404).json({ error: 'Feed not found' });

  const updates = {};
  const fields = ['name','check_interval','max_items','max_per_day','trickle','prefix','suffix','post_immediately','active','filter_all','filter_any','filter_ignore'];
  fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  db.get('feeds').find({ id }).assign(updates).write();
  res.json(db.get('feeds').find({ id }).value());
});

app.delete('/api/feeds/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  db.get('feeds').remove({ id }).write();
  db.get('feed_platforms').remove({ feed_id: id }).write();
  res.json({ success: true });
});

app.post('/api/feeds/:id/check', requireAuth, async (req, res) => {
  const feed = db.get('feeds').find({ id: parseInt(req.params.id) }).value();
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  try {
    await checkFeed(feed);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Feed <-> Platform links ───────────────────────────────────────────────────

app.post('/api/feeds/:id/platforms', requireAuth, (req, res) => {
  const feed_id = parseInt(req.params.id);
  const { platform_id } = req.body;
  const exists = db.get('feed_platforms').find({ feed_id, platform_id: parseInt(platform_id) }).value();
  if (!exists) db.get('feed_platforms').push({ feed_id, platform_id: parseInt(platform_id) }).write();
  res.json({ success: true });
});

app.delete('/api/feeds/:id/platforms/:pid', requireAuth, (req, res) => {
  db.get('feed_platforms').remove({ feed_id: parseInt(req.params.id), platform_id: parseInt(req.params.pid) }).write();
  res.json({ success: true });
});

// ── Platforms ─────────────────────────────────────────────────────────────────

app.get('/api/platforms', requireAuth, (req, res) => {
  res.json(db.get('platforms').value());
});

app.post('/api/platforms', requireAuth, (req, res) => {
  const { name, type, config } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Name and type required' });

  const id = db.get('_nextId.platforms').value();
  db.set('_nextId.platforms', id + 1).write();

  const platform = {
    id, name, type,
    config: config ? JSON.stringify(config) : null,
    active: 1,
    created_at: Math.floor(Date.now() / 1000)
  };
  db.get('platforms').push(platform).write();
  res.json(platform);
});

app.put('/api/platforms/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const platform = db.get('platforms').find({ id }).value();
  if (!platform) return res.status(404).json({ error: 'Platform not found' });

  const { name, config, active } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (config !== undefined) updates.config = JSON.stringify(config);
  if (active !== undefined) updates.active = active ? 1 : 0;

  db.get('platforms').find({ id }).assign(updates).write();
  res.json(db.get('platforms').find({ id }).value());
});

app.delete('/api/platforms/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  db.get('platforms').remove({ id }).write();
  db.get('feed_platforms').remove({ platform_id: id }).write();
  res.json({ success: true });
});

// ── History ───────────────────────────────────────────────────────────────────

app.get('/api/history', requireAuth, (req, res) => {
  const items = db.get('posted_items').value().slice().reverse().slice(0, 100).map(i => ({
    ...i,
    feed_name: db.get('feeds').find({ id: i.feed_id }).value()?.name || 'Unknown'
  }));
  res.json(items);
});

// ── Manual trigger ────────────────────────────────────────────────────────────

app.post('/api/check-now', requireAuth, async (req, res) => {
  try {
    await checkAllFeeds();
    res.json({ success: true, message: 'Feed check complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Publish endpoint ──────────────────────────────────────────────────────────

app.post('/api/publish', requireAuth, async (req, res) => {
  const { content, platformIds } = req.body;
  if (!content || !platformIds || !platformIds.length) {
    return res.status(400).json({ error: 'Content and platformIds required' });
  }
  const { postItem } = require('./poster');
  const results = [];
  for (const pid of platformIds) {
    const platform = db.get('platforms').find({ id: parseInt(pid) }).value();
    if (!platform) continue;
    try {
      await postItem(platform, { title: content, url: '', imageUrl: null }, { prefix: '', suffix: '' });
      results.push({ platform: platform.type, status: 'posted' });
    } catch (err) {
      results.push({ platform: platform.type, status: 'failed', error: err.message });
    }
  }
  res.json({ results });
});

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── Catch-all -> index.html ───────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Cron: check feeds every 15 minutes ───────────────────────────────────────

cron.schedule('*/15 * * * *', async () => {
  console.log('[CRON] Running feed check...');
  try { await checkAllFeeds(); }
  catch (err) { console.error('[CRON] Error:', err.message); }
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] SocialFlow running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
