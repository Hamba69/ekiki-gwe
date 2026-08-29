# Ekiki Gwe

Ekiki Gwe is a lightweight, mobile-first party card game built with React and Next.js. It runs as a shared-device game: add everyone on the setup screen, pass the device between turns, and play immediately without creating or joining an online room.

## Quick start

Requires Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), add at least two players, then build a multi-category deck. The free game contains 300 cards across eight categories. The mock **After Hours** entitlement adds three 60-card categories, bringing **Random / All** to 480 cards.

## Production build

```bash
npm run build
npm start
```

The game does not require environment variables, Pusher, Redis, or other hosted services. Its UI and game flow live in [`ekiki-gwe.jsx`](ekiki-gwe.jsx), with reusable card-order and turn-state helpers in [`lib/room.js`](lib/room.js).

The category, action, result, and player-avatar artwork lives in [`public/assets/game`](public/assets/game). The five expansion glyphs are real transparent WebP assets created to match the original painterly, gold-edged visual system; the game does not use emoji icons.

Active games are saved locally in the browser so an accidental refresh resumes the exact category selection, shuffled order, current card, and scores. Version 1 saves are discarded because version 2 stores the selected categories and card order explicitly. To run the automated state-machine tests and production build together:

**Play Again** keeps the same category mix and creates a fresh shuffle. **Change decks** keeps the players but returns to Deck Select. **Exit Game** clears the active game and players. Sound, vibration, and reduced-motion preferences persist on the device.

Payments are intentionally not live. The After Hours boundary is isolated behind `purchaseAfterHours`; enter the preview code `AFTERHOURS` to exercise the local entitlement and Restore flow. Replace that function with a verified checkout/entitlement integration before charging customers.

```bash
npm run check
```
