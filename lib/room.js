export const CARD_COUNT = 180;

export function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(list, seed) {
  const copy = [...list];
  const random = mulberry32(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function buildCardOrder(seed) {
  return seededShuffle(Array.from({ length: CARD_COUNT }, (_, index) => index), seed);
}

export function createEmptyScores(players) {
  return players.reduce((scores, player) => {
    scores[player.name] = { did: 0, drank: 0 };
    return scores;
  }, {});
}

export function applyGameAction(room, action, playerId) {
  const next = JSON.parse(JSON.stringify(room));
  const activePlayer = next.players?.[next.playerIdx];

  if (!activePlayer || next.phase !== "play") {
    return next;
  }

  if (action === "flip") {
    if (playerId !== activePlayer.id || next.flipped) {
      return next;
    }
    next.flipped = true;
    return next;
  }

  if (action === "did" || action === "drank") {
    if (playerId !== activePlayer.id || !next.flipped || next.decided) {
      return next;
    }
    if (!next.scores[activePlayer.name]) {
      next.scores[activePlayer.name] = { did: 0, drank: 0 };
    }
    next.scores[activePlayer.name][action] += 1;
    next.decided = true;
    return next;
  }

  if (action === "next") {
    if (playerId !== activePlayer.id || !next.flipped || !next.decided) {
      return next;
    }
    if (next.cardIdx >= CARD_COUNT - 1) {
      next.phase = "result";
      return next;
    }
    next.cardIdx += 1;
    next.playerIdx = (next.playerIdx + 1) % next.players.length;
    next.flipped = false;
    next.decided = false;
    return next;
  }

  return next;
}