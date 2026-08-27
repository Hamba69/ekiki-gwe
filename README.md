# Ekiki Gwe

Ekiki Gwe is a lightweight, mobile-first party card game built with React and Next.js. It runs as a shared-device game: add everyone on the setup screen, pass the device between turns, and play immediately without creating or joining an online room.

## Quick start

Requires Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), add at least two players, and select **Start Game**.

## Production build

```bash
npm run build
npm start
```

The game does not require environment variables, Pusher, Redis, or other hosted services. Its UI and game flow live in [`ekiki-gwe.jsx`](ekiki-gwe.jsx), with reusable card-order and turn-state helpers in [`lib/room.js`](lib/room.js).

The original category, action, result, and player-avatar artwork lives in [`public/assets/game`](public/assets/game). These optimized WebP assets replace platform-dependent emoji glyphs with one consistent visual system.

Active games are saved locally in the browser so an accidental refresh can resume the current card and scores. To run the automated state-machine tests and production build together:

```bash
npm run check
```
