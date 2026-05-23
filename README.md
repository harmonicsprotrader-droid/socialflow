# RSS Publisher

A self-hosted RSS-to-social media publisher. Automatically posts new RSS feed items to Bluesky, Twitter/X, and Discord.

---

## Setup

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Install dependencies
Open a terminal in this folder and run:
```
npm install
```

### 3. Configure your credentials
Edit the `.env` file and fill in your keys:

```
TWITTER_API_KEY=your_consumer_key
TWITTER_API_SECRET=your_consumer_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_token_secret

BSKY_HANDLE=you.bsky.social
BSKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

**Twitter/X keys** — from developer.twitter.com → your app → Keys and Tokens

**Bluesky app password** — from bsky.app → Settings → App Passwords

**Discord webhook** — from your server → Settings → Integrations → Webhooks → New Webhook → Copy URL

### 4. Start the server
```
npm start
```

### 5. Open the dashboard
Go to http://localhost:3000 in your browser

---

## How to use

### Add a Platform
1. Click **Platforms** → **+ Add Platform**
2. Select the platform type (Bluesky, Twitter/X, Discord)
3. Fill in credentials if required
4. Click **Add Platform**

### Add an RSS Feed
1. Click **Feeds** → **+ Add Feed**
2. Enter the feed name and RSS URL
3. Set how often to check (e.g. every 30 minutes)
4. Set max items per check (e.g. 3)
5. Optionally add prefix/suffix text (e.g. "📰 New post:" or "#news")
6. Choose posting mode: immediate or queued
7. Check which platforms to post to
8. Click **Save Feed**

### That's it!
The server checks your feeds every minute and posts new items automatically.

---

## Supported Platforms

| Platform | Status |
|---|---|
| Bluesky | ✅ Full support |
| Twitter/X | ✅ Full support (requires API keys) |
| Discord | ✅ Full support (webhook) |
| Facebook | 🔲 Coming soon |
| Instagram | 🔲 Coming soon |
| TikTok | 🔲 Coming soon |
| YouTube | 🔲 Coming soon |

---

## Keep it running 24/7

To keep the server running even when you close your terminal, install PM2:
```
npm install -g pm2
pm2 start server.js --name rss-publisher
pm2 save
pm2 startup
```
