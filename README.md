# Ekiki Gwe

Ekiki Gwe is a lightweight, mobile-first party card game built with React and Next.js. It runs as a shared-device game: add everyone on the setup screen, pass the device between turns, and play immediately without creating or joining an online room.

## Quick start

Requires Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), choose **Random** for all 180 cards or select one of the six 30-card category decks, add at least two players, and start the game.

## Production build

```bash
npm run build
npm start
```

The game does not require environment variables, Pusher, Redis, or other hosted services. Its UI and game flow live in [`ekiki-gwe.jsx`](ekiki-gwe.jsx), with reusable card-order and turn-state helpers in [`lib/room.js`](lib/room.js).

The original category, action, result, and player-avatar artwork lives in [`public/assets/game`](public/assets/game). These optimized WebP assets replace platform-dependent emoji glyphs with one consistent visual system.

Active games are saved locally in the browser so an accidental refresh can resume the current card and scores. To run the automated state-machine tests and production build together:

The selected deck is saved with the active game. **Play Again** keeps the same category and creates a fresh shuffle, while **Leave Game** returns to setup with the same players and category selected. **Exit Game** clears the active game and players and resets the deck to Random. The game menu also supports finishing early to view scores. Sound, vibration, and reduced-motion preferences are available in **Settings** and persist on the device.

```bash
npm run check
```
