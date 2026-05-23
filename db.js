// ── db.js ─────────────────────────────────────────────────────────────────────
// Uses lowdb — pure JavaScript, no compilation required.

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Set defaults
db.defaults({
  feeds: [],
  platforms: [],
  feed_platforms: [],
  posted_items: [],
  queue: [],
  _nextId: { feeds: 1, platforms: 1, posted_items: 1, queue: 1 }
}).write();

// ── Helper: get next ID ───────────────────────────────────────────────────────

function nextId(table) {
  const id = db.get(`_nextId.${table}`).value();
  db.set(`_nextId.${table}`, id + 1).write();
  return id;
}

// ── Compatibility layer — mimics better-sqlite3 API ──────────────────────────
// Exposes prepare(sql).run(...) and prepare(sql).get(...) and .all(...)
// so server.js and rss-checker.js need minimal changes.

const dbCompat = {
  // Execute raw SQL-like operation via custom method
  exec(sql) {
    // No-op for ALTER TABLE statements (lowdb doesn't need schema migrations)
  },

  prepare(sql) {
    return new Statement(sql);
  },

  // Direct query methods
  get(table) { return db.get(table); },
  write() { return db.write(); }
};

class Statement {
  constructor(sql) {
    this.sql = sql.trim();
  }

  run(...args) {
    const sql = this.sql;

    // INSERT INTO feeds
    if (/INSERT INTO feeds/i.test(sql)) {
      const id = nextId('feeds');
      const [name, url, check_interval, max_items, prefix, suffix, post_immediately] = args;
      const feed = {
        id, name, url,
        check_interval: check_interval || 30,
        max_items: max_items || 3,
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
      return { lastInsertRowid: id };
    }

    // UPDATE feeds
    if (/UPDATE feeds SET/i.test(sql)) {
      const id = args[args.length - 1];
      const feed = db.get('feeds').find({ id }).value();
      if (!feed) return {};

      // Parse field names from SQL
      const fields = ['name','check_interval','max_items','max_per_day','trickle',
        'prefix','suffix','post_immediately','active','filter_all','filter_any','filter_ignore'];
      const updates = {};
      fields.forEach((f, i) => { if (args[i] !== undefined) updates[f] = args[i]; });
      db.get('feeds').find({ id }).assign(updates).write();
      return {};
    }

    // DELETE FROM feeds
    if (/DELETE FROM feeds/i.test(sql)) {
      db.get('feeds').remove({ id: args[0] }).write();
      return {};
    }

    // INSERT INTO platforms
    if (/INSERT INTO platforms/i.test(sql)) {
      const id = nextId('platforms');
      const [name, type, config] = args;
      db.get('platforms').push({ id, name, type, config: config || null, active: 1, created_at: Math.floor(Date.now() / 1000) }).write();
      return { lastInsertRowid: id };
    }

    // DELETE FROM platforms
    if (/DELETE FROM platforms WHERE id/i.test(sql)) {
      db.get('platforms').remove({ id: args[0] }).write();
      return {};
    }

    // INSERT OR IGNORE INTO feed_platforms
    if (/INSERT.*INTO feed_platforms/i.test(sql)) {
      const [feed_id, platform_id] = args;
      const exists = db.get('feed_platforms').find({ feed_id, platform_id }).value();
      if (!exists) db.get('feed_platforms').push({ feed_id, platform_id }).write();
      return {};
    }

    // DELETE FROM feed_platforms
    if (/DELETE FROM feed_platforms WHERE feed_id = \? AND platform_id/i.test(sql)) {
      db.get('feed_platforms').remove({ feed_id: args[0], platform_id: args[1] }).write();
      return {};
    }
    if (/DELETE FROM feed_platforms WHERE feed_id/i.test(sql)) {
      db.get('feed_platforms').remove({ feed_id: args[0] }).write();
      return {};
    }
    if (/DELETE FROM feed_platforms WHERE platform_id/i.test(sql)) {
      db.get('feed_platforms').remove({ platform_id: args[0] }).write();
      return {};
    }

    // INSERT OR IGNORE INTO posted_items
    if (/INSERT.*INTO posted_items/i.test(sql)) {
      const [feed_id, item_guid, item_title, item_url, platform, status] = args;
      const exists = db.get('posted_items').find({ feed_id, item_guid, platform }).value();
      if (!exists) {
        const id = nextId('posted_items');
        db.get('posted_items').push({ id, feed_id, item_guid, item_title, item_url, platform, status: status || 'posted', posted_at: Math.floor(Date.now() / 1000) }).write();
      }
      return {};
    }

    // UPDATE feeds SET last_checked
    if (/UPDATE feeds SET last_checked/i.test(sql)) {
      db.get('feeds').find({ id: args[1] }).assign({ last_checked: args[0] }).write();
      return {};
    }

    // INSERT OR IGNORE INTO queue
    if (/INSERT.*INTO queue/i.test(sql)) {
      const id = nextId('queue');
      const [feed_id, platform_id, title, url, image_url, guid, scheduled_at] = args;
      const exists = db.get('queue').find({ feed_id, guid, platform_id }).value();
      if (!exists) db.get('queue').push({ id, feed_id, platform_id, title, url, image_url, guid, scheduled_at, posted: 0, created_at: Math.floor(Date.now() / 1000) }).write();
      return {};
    }

    // UPDATE queue SET posted
    if (/UPDATE queue SET posted/i.test(sql)) {
      db.get('queue').find({ id: args[1] }).assign({ posted: 1 }).write();
      return {};
    }

    return {};
  }

  get(...args) {
    const sql = this.sql;

    // SELECT active FROM feeds WHERE id
    if (/SELECT active FROM feeds WHERE id/i.test(sql)) {
      return db.get('feeds').find({ id: args[0] }).value();
    }

    // Stats queries
    if (/COUNT.*FROM feeds WHERE active = 1/i.test(sql)) return { count: db.get('feeds').filter({ active: 1 }).size().value() };
    if (/COUNT.*FROM feeds/i.test(sql)) return { count: db.get('feeds').size().value() };
    if (/COUNT.*FROM platforms WHERE active/i.test(sql)) return { count: db.get('platforms').filter({ active: 1 }).size().value() };
    if (/COUNT.*FROM posted_items WHERE status = .posted./i.test(sql)) return { count: db.get('posted_items').filter({ status: 'posted' }).size().value() };
    if (/COUNT.*FROM posted_items WHERE posted_at/i.test(sql)) {
      const startOfDay = Math.floor(new Date().setHours(0,0,0,0) / 1000);
      return { count: db.get('posted_items').filter(i => i.posted_at >= startOfDay).size().value() };
    }

    return null;
  }

  all(...args) {
    const sql = this.sql;

    // SELECT * FROM feeds
    if (/SELECT \* FROM feeds WHERE active = 1/i.test(sql)) {
      return db.get('feeds').filter({ active: 1 }).value();
    }
    if (/SELECT f\.\*, COUNT.*FROM feeds/i.test(sql) || /SELECT \* FROM feeds/i.test(sql)) {
      const feeds = db.get('feeds').value();
      return feeds.map(f => ({
        ...f,
        platform_count: db.get('feed_platforms').filter({ feed_id: f.id }).size().value(),
        posts_count: db.get('posted_items').filter({ feed_id: f.id }).size().value()
      }));
    }

    // SELECT platforms for a feed
    if (/SELECT p\.\* FROM platforms p.*WHERE fp\.feed_id = \?/i.test(sql)) {
      const feedId = args[0];
      const fps = db.get('feed_platforms').filter({ feed_id: feedId }).value();
      return fps.map(fp => db.get('platforms').find({ id: fp.platform_id }).value()).filter(Boolean);
    }

    // SELECT * FROM platforms
    if (/SELECT \* FROM platforms/i.test(sql)) {
      return db.get('platforms').value();
    }

    // History
    if (/SELECT pi\.\*, f\.name.*FROM posted_items/i.test(sql)) {
      const items = db.get('posted_items').value().slice().reverse().slice(0, 100);
      return items.map(i => ({
        ...i,
        feed_name: db.get('feeds').find({ id: i.feed_id })?.value()?.name || 'Unknown'
      }));
    }

    // Queue
    if (/SELECT q\.\*.*FROM queue/i.test(sql)) {
      const now = Math.floor(Date.now() / 1000);
      const items = db.get('queue').filter(q => !q.posted && q.scheduled_at <= now).value().slice(0, 5);
      return items.map(q => {
        const p = db.get('platforms').find({ id: q.platform_id }).value();
        const f = db.get('feeds').find({ id: q.feed_id }).value();
        return { ...q, platform_type: p?.type, platform_config: p?.config, prefix: f?.prefix || '', suffix: f?.suffix || '' };
      });
    }

    // Check already posted
    if (/SELECT id FROM posted_items WHERE feed_id/i.test(sql)) {
      return db.get('posted_items').filter({ feed_id: args[0], item_guid: args[1], platform: args[2] }).value();
    }

    return [];
  }
}

module.exports = dbCompat;
