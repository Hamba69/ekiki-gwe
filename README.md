# Ekiki Gwe

Ekiki Gwe is a lightweight, mobile-first party card game implemented in React. The UI and game logic live in `ekiki-gwe.jsx`. The app is migrated to Next.js and includes serverless API routes for a real-time multiplayer room system using Pusher and Vercel KV.

Key points
- UI/game root: [ekiki-gwe.jsx](ekiki-gwe.jsx)
- Serverless APIs: [pages/api/](pages/api/) — `create-room.js`, `join-room.js`, `start-game.js`, `game-action.js`
- Environment variables template: [.env.example](.env.example)

Prerequisites
- Node.js 18+ (LTS)
- npm
- A Pusher Channels app (free tier)
- Vercel account (for Vercel KV / serverless functions)

Quick start (local development)

```bash
# install deps
npm install

# run Next.js dev server
npm run dev

# visit http://localhost:3000
```

Build for production

```bash
npm run build
npm start
```

Environment variables
Copy [.env.example](.env.example) to `.env.local` and fill values (used by Vercel and local `vercel dev`):

```
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Deployment (Vercel)
1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. In Vercel Project Settings → Environment Variables, add the keys from `.env.local`.
4. Deploy → Vercel will build and expose `/api/*` serverless endpoints automatically.

Notes & caveats
- The app uses Pusher for real-time events and Vercel KV for server-side room state. Vercel's KV package warnings may appear; follow Vercel docs for the recommended storage integration for new projects.
- Rooms expire after 4 hours (TTL set in the API routes).
- All game content, CSS, and card data were preserved during the Next.js migration.

Contributing
- Fork → branch → open a PR. Keep changes focused and test with `npm run dev`.
- If adding features that change the room state shape, update the API routes in [pages/api/](pages/api/) and document changes here.

License
- This repository has no license file by default. Add a `LICENSE` file if you want to make the project open source (MIT recommended).

What's next
- I can create an initial commit for you, push this repo to GitHub, and help wire environment variables on Vercel. Would you like me to do that?
