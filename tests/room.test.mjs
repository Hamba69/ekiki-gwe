import assert from "node:assert/strict";
import test from "node:test";

import { ALL } from "../data/cards.js";
import { CATEGORY_KEYS, FREE_CATEGORY_KEYS, getEligibleCardIndexes } from "../data/game.js";
import { applyGameAction, buildCardOrder, createEmptyScores } from "../lib/room.js";

const players = [
  { id: "p1", name: "Alice", avatar: "/alice.webp" },
  { id: "p2", name: "Bob", avatar: "/bob.webp" },
];

function createGame(selectedCategories = CATEGORY_KEYS) {
  const eligible = getEligibleCardIndexes(ALL, selectedCategories);
  return {
    players, phase: "play", selectedCategories, cardSeed: 12345,
    cardOrder: buildCardOrder(12345, eligible), cardIdx: 0, playerIdx: 0,
    scores: createEmptyScores(players), flipped: false, decided: false,
  };
}

test("the catalogue has 480 reachable cards across 11 categories", () => {
  assert.equal(ALL.length, 480);
  assert.equal(CATEGORY_KEYS.length, 11);
  assert.equal(FREE_CATEGORY_KEYS.length, 8);
  assert.deepEqual(new Set(ALL.map(card => card[0])), new Set(CATEGORY_KEYS));
  for (const key of CATEGORY_KEYS) {
    const expected = ["D", "T", "S", "W", "X", "C"].includes(key) ? 30 : 60;
    assert.equal(ALL.filter(card => card[0] === key).length, expected);
  }
});

test("Random / All shuffles all 480 cards exactly once", () => {
  const eligible = getEligibleCardIndexes(ALL, CATEGORY_KEYS);
  const first = buildCardOrder(12345, eligible);
  assert.deepEqual(first, buildCardOrder(12345, eligible));
  assert.equal(first.length, 480);
  assert.equal(new Set(first).size, 480);
  assert.deepEqual([...first].sort((a, b) => a - b), eligible);
});

test("a filtered subset contains only selected category indices", () => {
  const eligible = getEligibleCardIndexes(ALL, ["G", "M"]);
  const order = buildCardOrder(24680, eligible);
  assert.equal(order.length, 120);
  assert.deepEqual(new Set(order.map(index => ALL[index][0])), new Set(["G", "M"]));
  assert.deepEqual([...order].sort((a, b) => a - b), eligible);
});

test("a room can play only one selected category", () => {
  const game = createGame(["P"]);
  assert.equal(game.cardOrder.length, 60);
  assert.ok(game.cardOrder.every(index => ALL[index][0] === "P"));
});

test("buildCardOrder rejects an empty or missing pool", () => {
  assert.throws(() => buildCardOrder(1), /requires at least one/);
  assert.throws(() => buildCardOrder(1, []), /requires at least one/);
});

test("only the active player can complete the current turn", () => {
  const initial = createGame(["D"]);
  assert.deepEqual(applyGameAction(initial, "flip", "p2"), initial);
  const flipped = applyGameAction(initial, "flip", "p1");
  const decided = applyGameAction(flipped, "did", "p1");
  assert.equal(decided.scores.Alice.did, 1);
  const next = applyGameAction(decided, "next", "p1");
  assert.equal(next.cardIdx, 1);
  assert.equal(next.playerIdx, 1);
  assert.equal(next.flipped, false);
});

test("a filtered deck ends on its final card", () => {
  let game = createGame(["D"]);
  for (let index = 0; index < game.cardOrder.length; index += 1) {
    const active = game.players[game.playerIdx];
    game = applyGameAction(game, "flip", active.id);
    game = applyGameAction(game, "drank", active.id);
    game = applyGameAction(game, "next", active.id);
  }
  assert.equal(game.phase, "result");
  assert.equal(game.cardIdx, 29);
});

test("the active player can finish a game early", () => {
  const initial = createGame(["G"]);
  assert.deepEqual(applyGameAction(initial, "finish", "p2"), initial);
  assert.equal(applyGameAction(initial, "finish", "p1").phase, "result");
});
