# Lullaby — Baby Tracker 🌙

A beautiful, offline-capable PWA for tracking baby feeds, sleep, and diapers.

## Deploy to Vercel (free, 2 minutes)

### Option A — GitHub + Vercel (recommended)

1. Push this folder to a new GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Leave all settings as default → Deploy
4. Your app is live at `https://lullaby-xxx.vercel.app`

### Option B — Vercel CLI (no GitHub needed)

```bash
npm i -g vercel
cd lullaby
vercel --prod
```

## Features
- Feed tracking (breast, bottle, solid) with live timer
- Sleep tracking with live timer + awake window alert
- Diaper logging (pee/poop/both)
- Pump & notes logging
- Smart insights strip (last feed, awake time, sleep total, diapers)
- Multi-profile support (multiple babies)
- Full offline support via service worker
- PWA installable on iOS & Android home screen
- Data persists locally in localStorage

## File structure
```
lullaby/
├── public/
│   ├── index.html     ← entire app (React, no build step needed)
│   ├── manifest.json  ← PWA manifest
│   ├── sw.js          ← service worker (offline cache)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── vercel.json        ← Vercel routing config
```

## Add Firebase persistence (optional)
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Firestore + Auth
3. Replace `localStorage` calls with Firestore reads/writes
