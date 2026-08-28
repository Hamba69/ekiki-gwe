import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CARD_COUNT, applyGameAction, buildCardOrder, createEmptyScores } from "./lib/room.js";

// ─── SCC Orbit Compression: 6 categories × 30 = 180 cards ───────────────────
const ASSET_ROOT = "/assets/game";
const UI_ASSETS = {
  cardBack: `${ASSET_ROOT}/card-back.webp`,
  tap: `${ASSET_ROOT}/tap.webp`,
  success: `${ASSET_ROOT}/success.webp`,
  drink: `${ASSET_ROOT}/drink.webp`,
  trophy: `${ASSET_ROOT}/trophy.webp`,
  dice: `${ASSET_ROOT}/dice.webp`,
};

const CAT = {
  D:{ label:"Dare",    icon:`${ASSET_ROOT}/category-dare.webp`, color:"#FF6B35", bg:"linear-gradient(145deg,#FF6B35,#C0392B)" },
  T:{ label:"Truth",   icon:`${ASSET_ROOT}/category-truth.webp`, color:"#4ECDC4", bg:"linear-gradient(145deg,#4ECDC4,#1A6B75)" },
  S:{ label:"Group",   icon:`${ASSET_ROOT}/category-group.webp`, color:"#F5C518", bg:"linear-gradient(145deg,#F5C518,#C47A00)" },
  W:{ label:"Wild",    icon:`${ASSET_ROOT}/category-wild.webp`, color:"#FF4757", bg:"linear-gradient(145deg,#FF4757,#8E1ABA)" },
  X:{ label:"Spicy",   icon:`${ASSET_ROOT}/category-spicy.webp`, color:"#FF6B9D", bg:"linear-gradient(145deg,#FF6B9D,#8B0057)" },
  C:{ label:"Confess", icon:`${ASSET_ROOT}/category-confess.webp`, color:"#A29BFE", bg:"linear-gradient(145deg,#A29BFE,#4A3ABA)" },
};

const ALL = [
  // ── DARE (30) ──
  ["D","Twerk for 10 seconds. No stopping."],
  ["D","Do: Whisper your filthiest fantasy into the ear of the person on your left. Or drink."],
  ["D","Do: Remove one piece of clothing and keep it off for the next 3 rounds. Or drink."],
  ["D","Do 20 push-ups or take a shot for every one you skip."],
  ["D","Speak in an accent chosen by the group for the next 3 rounds."],
  ["D","Do: Give the person across from you a slow, deliberate lap dance for 20 seconds. Or drink."],
  ["D","Text your ex 'I miss you.' No explanation allowed."],
  ["D","Do: Let someone of the group’s choosing write a dirty word on your body with their finger (or marker). Or drink."],
  ["D","Let the group read your last 5 voice notes aloud."],
  ["D","Eat something weird from the kitchen or take a drink."],
  ["D","Do: Describe in detail the last time you got off—what you were thinking about. Or drink."],
  ["D","Do: Kiss the neck of the person to your right for 10 full seconds. Or drink."],
  ["D","Do: Show everyone your best “fuck-me” eyes and hold the stare for 15 seconds. Or drink."],
  ["D","Do: Let the group vote on which body part someone gets to kiss (above the waist). Or drink."],
  ["D","Wear something embarrassing for the next 5 rounds."],
  ["D","Group changes your WhatsApp status for 10 minutes."],
  ["D","Strip tease. Clothes stay on… or don't."],
  ["D","Do: Send a dirty text to someone not in the room right now and show us the message. Or drink."],
  ["D","Do: Straddle someone’s lap for 30 seconds without using your hands. Or drink."],
  ["D","60-second motivational speech about absolutely nothing."],
  ["D","Do: Admit which person in this room you’d most want to fuck and why (be specific). Or drink."],
  ["D","Do: Take off your underwear and hand it to the person on your left (you can put outer clothes back on). Or drink."],
  ["D","Hold a plank for 45 seconds or take 2 shots."],
  ["D","Do: Lick whipped cream / ice / chocolate off someone’s finger or collarbone. Or drink."],
  ["D","Eat something from the fridge blindfolded."],
  ["D","Do: Demonstrate your favorite sex position using the person next to you as a prop (clothes on). Or drink."],
  ["D","Do: Let someone spank you three times as hard as they want. Or drink."],
  ["D","Do: Whisper three things you’d do to the hottest person here if you had them alone for an hour. Or drink."],
  ["D","Send a meme to your boss or teacher right now."],
  ["D","Act out your most embarrassing moment in 30 seconds."],
  // ── TRUTH (30) ──
  ["T","Most embarrassing thing you've done for someone you liked?"],
  ["T","Have you ever lied on a job application? What did you say?"],
  ["T","Who in this room would you sleep with if you absolutely had to?"],
  ["T","Biggest secret you've kept from your family?"],
  ["T","Have you ever cheated in a relationship? Give the details."],
  ["T","Most illegal thing you've ever done?"],
  ["T","Describe your dating history using only food names."],
  ["T","What's your body count? No rounding."],
  ["T","Have you faked sick to avoid someone in this room?"],
  ["T","Most money spent on something embarrassing?"],
  ["T","Ever sent a message to the wrong person? What was it?"],
  ["T","Most embarrassing bedroom failure?"],
  ["T","Name someone you secretly can't stand but pretend to like."],
  ["T","Have you ever stolen from someone? What was it?"],
  ["T","Worst thing you've ever said about someone behind their back?"],
  ["T","Have you ever been attracted to a close friend's partner?"],
  ["T","What habit would embarrass you most if people knew?"],
  ["T","Describe your worst date ever. Full, painful details."],
  ["T","Have you ever been blocked by someone? Why?"],
  ["T","A lie you told that seriously backfired on you?"],
  ["T","Most desperate thing you've done to impress someone?"],
  ["T","Have you ghosted someone you genuinely cared about? Why?"],
  ["T","Most questionable thing in your search history?"],
  ["T","If your bank statement was shown here, most embarrassing line?"],
  ["T","Have you talked badly about someone in this room to another person?"],
  ["T","A relationship red flag you ignored when you shouldn't have?"],
  ["T","Most childish thing you still secretly do?"],
  ["T","Something you did just for clout that you deeply regret?"],
  ["T","Worst advice you've ever given someone?"],
  ["T","If your ex described you to a stranger, what would they say?"],
  // ── GROUP (30) ──
  ["S","Everyone drink if you've ever cried over a crush."],
  ["S","Last person to stand up takes a shot."],
  ["S","Go around: everyone roasts the person to their left."],
  ["S","Whoever checks their phone in the next 2 minutes drinks double."],
  ["S","Everyone who's had a one-night stand takes a shot."],
  ["S","Group votes: biggest gossip in the room — that person drinks."],
  ["S","Everyone who's lied about their age — drink."],
  ["S","First person to laugh in the next 60 seconds drinks."],
  ["S","Group ranks everyone's rizz from 1–10. Lowest score drinks."],
  ["S","Everyone who's been blocked on social media drinks."],
  ["S","Go around: everyone finishes 'I never thought [name] would…'"],
  ["S","Group nominates the most dramatic person. They prove it with a story."],
  ["S","Everyone who slid into DMs and got left on read drinks."],
  ["S","Thumb war tournament. Loser of each round drinks."],
  ["S","Group picks two people to rap battle about each other. Losers drink."],
  ["S","Everyone who's pretended not to see someone in public drinks."],
  ["S","Rock-paper-scissors tournament. First one out drinks and answers a truth."],
  ["S","Group assigns everyone a spirit animal. Most offended drinks."],
  ["S","Everyone with battery below 30% drinks."],
  ["S","Agree on the most attractive person NOT in this room. Last to agree drinks."],
  ["S","Everyone who's drunk-texted an ex drinks."],
  ["S","Staring contest between 2 people the group picks. Loser drinks."],
  ["S","Everyone confesses what last made them cry. Most relatable assigns a drink."],
  ["S","Group guesses everyone's situationship status. Wrong guess = drink."],
  ["S","Everyone who's faked sick this month drinks."],
  ["S","Loudest laugh contest. Last one standing drinks."],
  ["S","Everyone whose most recent Google search is embarrassing drinks. Check now."],
  ["S","Group votes: most likely to be famous. That person gives an Oscar speech."],
  ["S","Anyone who's ever made a fake account drinks."],
  ["S","Kiss the person to your right on the cheek or take a shot."],
  // ── WILD (30) ──
  ["W","Remove one item of clothing or take 3 shots."],
  ["W","Group adds 5 things to your shopping cart. Right now."],
  ["W","Do: Remove your top/shirt for the next two rounds. Or drink."],
  ["W","Dirty dance with the person to your left for 30 seconds."],
  ["W","Open camera roll. Read the 10th photo's context out loud — dramatically."],
  ["W","Whoever last had sex: one minute of details. Go."],
  ["W","Call someone and confess a crush. Real or fake — group decides."],
  ["W","Do: Give a 15-second sensual neck massage to the person of your choice. Or drink."],
  ["W","Do: Show us the sexiest photo currently on your phone (or the hottest saved meme). Or drink."],
  ["W","Do: Role-play a one-minute dirty talk scene with the person across from you. Or drink."],
  ["W","Do: Let the group choose a body part for someone to slowly kiss or bite. Or drink."],
  ["W","Person single the longest explains exactly why. Honestly."],
  ["W","Everyone slap the table simultaneously. Last one slaps their own forehead."],
  ["W","Do: Describe your ideal threesome in explicit detail. Or drink."],
  ["W","Do: Grind on someone’s thigh for 20 seconds. Or drink."],
  ["W","Do: Take a body shot off the person of your choice. Or drink."],
  ["W","Do: Admit your biggest turn-on and biggest turn-off in bed. Or drink."],
  ["W","Do: Let someone blindfold you and feed you something while whispering something filthy. Or drink."],
  ["W","Person across scrolls your WhatsApp for 30 seconds."],
  ["W","Do: Kiss someone on the lips for at least 5 seconds (or longer if they agree). Or drink."],
  ["W","Do: Demonstrate how you like to be touched using your own hand on your body (over clothes). Or drink."],
  ["W","Show your most recently liked post. No hiding it."],
  ["W","Do: Tell the room the most embarrassing place you’ve ever had sex or almost had sex. Or drink."],
  ["W","Do: Let someone of the group’s choosing unbutton or unzip one item of your clothing. Or drink."],
  ["W","Read your most embarrassing saved message out loud."],
  ["W","Youngest must do whatever the oldest person says for 2 rounds."],
  ["W","Do: Sit on someone’s lap and whisper what you’d do if no one else was watching. Or drink."],
  ["W","Do: Show your “O-face” for 10 seconds. Or drink."],
  ["W","Group goes through your recent searches for 60 seconds."],
  ["W","Do: Rank the three people here you’d most want to see naked (politely or not). Or drink."],
  // ── SPICY (30) ──
  ["X","Describe your type physically — without 'tall, dark, and handsome.'"],
  ["X","Rate everyone in this room on attractiveness. Out loud. No skipping."],
  ["X","Who here would you least want to see naked? Be honest."],
  ["X","Do: Give a slow striptease of one clothing item while making eye contact with someone. Or drink."],
  ["X","Describe your last sexual experience using only movie titles."],
  ["X","Do you think about the same person every time? Who is it?"],
  ["X","Do: Let the group decide a daresome sexy dare for you that lasts the next round. Or drink."],
  ["X","Do: Trace a finger slowly down someone’s chest/stomach (with consent). Or drink."],
  ["X","Do: Read the last dirty message or fantasy you typed in your notes/phone out loud. Or drink."],
  ["X","Recreate your last flirty conversation word for word."],
  ["X","Wildest place you've done something you shouldn't have?"],
  ["X","Do: Act out your best “I’m about to ride you” facial expression and body language. Or drink."],
  ["X","Do: Choose someone and tell them exactly how you’d make them cum. Or drink."],
  ["X","Most risqué thing you've done in public?"],
  ["X","Have feelings for someone who doesn't know? Describe them."],
  ["X","Do: Switch shirts (or tops) with someone of the opposite gender/presentation for the next 3 rounds. Or drink."],
  ["X","Describe the bedroom energy of the person to your right."],
  ["X","Do: Let someone bite or suck on your neck/earlobe for 10 seconds. Or drink."],
  ["X","Do: Describe the kinkiest thing you’ve ever done or want to try. Or drink."],
  ["X","Rate your own bedroom performance 1–10 and justify it."],
  ["X","Do: Crawl across the floor to the person of your choice and look up at them seductively. Or drink."],
  ["X","Who here gives off the best bedroom energy — purely on vibes?"],
  ["X","Do: Let the group vote on a sexy nickname for you that you have to answer to for the rest of the game. Or drink."],
  ["X","Have you been caught in the act? Tell everything."],
  ["X","Do: Place someone’s hand on your body wherever you want it for 15 seconds. Or drink."],
  ["X","Do: Moan as realistically as you can for 10 seconds. Or drink."],
  ["X","Do: Tell everyone your favorite position and why it feels so good. Or drink."],
  ["X","Do: Give a 20-second sensual back or shoulder massage that gets progressively dirtier. Or drink."],
  ["X","Do: Pick someone and slowly remove one accessory or piece of jewelry from them with your mouth if possible. Or drink."],
  ["X","Do: End the round by kissing (or almost kissing) the person you’ve been eyeing the most tonight. Or drink."],
  // ── CONFESS (30) ──
  ["C","Most petty thing you've done to get back at someone?"],
  ["C","Something you did as a child your parents never found out?"],
  ["C","Confess a time you were unbelievably jealous and acted on it."],
  ["C","Most embarrassing thing currently on your phone?"],
  ["C","Last time you completely lost your temper — what triggered it?"],
  ["C","A compliment you've never forgotten and who gave it?"],
  ["C","Confess your most embarrassing drunk story."],
  ["C","Something you've always pretended to understand but never did?"],
  ["C","A time you were completely wrong but refused to admit it?"],
  ["C","Pettiest reason you've ever ended a friendship?"],
  ["C","Most dramatic thing you've done for attention?"],
  ["C","Biggest financial mistake you've made?"],
  ["C","A moment when jealousy surprised even yourself?"],
  ["C","Most embarrassing thing you've ever searched online?"],
  ["C","Meanest thought you've had about someone in this room?"],
  ["C","A rumor you spread that wasn't entirely true?"],
  ["C","A time you completely misread a situation and embarrassed yourself?"],
  ["C","Most inappropriate thing that's genuinely made you laugh?"],
  ["C","Last time you cried and exactly why?"],
  ["C","Something you've bought and actively hidden from your family?"],
  ["C","A time you blatantly used someone for their connections?"],
  ["C","Most shameless thing you've done for money?"],
  ["C","Confess your most regrettable situationship. All of it."],
  ["C","A boundary you know you crossed — and how?"],
  ["C","A habit so weird people would genuinely judge you for it?"],
  ["C","Most cowardly thing you've ever done?"],
  ["C","Biggest lie you've told to get out of trouble?"],
  ["C","Something you believed way too long that turned out to be false?"],
  ["C","A time you accidentally embarrassed someone you love?"],
  ["C","Most embarrassing social media moment you've had?"],
];

// Fisher-Yates — O(n), in-place
function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07070f;overflow-x:hidden}
.root{
  min-height:100vh;
  background:radial-gradient(ellipse at 25% 0%, #1a053a 0%, #07070f 55%);
  font-family:'Outfit',sans-serif;
  color:#fff;
  display:flex;flex-direction:column;align-items:center;
  padding:1.25rem 1rem 2rem;
  position:relative;
}
.logo{font-family:'Bebas Neue',sans-serif;letter-spacing:.15em;line-height:1}
/* Card flip */
.scene{width:min(300px,88vw);height:min(420px,76vw);perspective:1100px;cursor:pointer;flex-shrink:0;margin:0 auto}
.card-inner{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .65s cubic-bezier(.4,0,.2,1)}
.card-inner.flipped{transform:rotateY(180deg)}
.face{position:absolute;inset:0;border-radius:22px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.75rem 1.5rem}
.face-front{background:linear-gradient(145deg,#150430,#0b0520);border:1.5px solid rgba(245,197,24,.22);box-shadow:0 24px 60px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.05)}
.face-back{transform:rotateY(180deg);border:1.5px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(0,0,0,.5)}
/* Front decor */
.front-pattern{position:absolute;inset:0;border-radius:22px;overflow:hidden;opacity:.07;pointer-events:none}
.front-logo{font-family:'Bebas Neue',sans-serif;letter-spacing:.2em;font-size:1.5rem;color:rgba(245,197,24,.6);text-align:center;margin-bottom:.5rem}
.front-sub{font-size:.78rem;font-weight:600;letter-spacing:.18em;color:rgba(255,255,255,.35);text-transform:uppercase}
.tap-hint{margin-top:2.5rem;font-size:.75rem;letter-spacing:.12em;color:rgba(255,255,255,.3);text-transform:uppercase;animation:pulse 2.5s ease infinite}
/* Buttons */
.btn{font-family:'Outfit',sans-serif;font-weight:700;border-radius:50px;padding:.8rem 2rem;font-size:.95rem;cursor:pointer;transition:all .2s;border:none;letter-spacing:.04em;white-space:nowrap}
.btn-gold{background:linear-gradient(135deg,#F5C518,#E8900A);color:#07070f;box-shadow:0 4px 20px rgba(245,197,24,.35)}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(245,197,24,.55)}
.btn-gold:disabled{opacity:.3;cursor:not-allowed;transform:none;box-shadow:none}
.btn-red{background:transparent;color:#FF6B35;border:2px solid #FF6B35}
.btn-red:hover{background:rgba(255,107,53,.1);transform:translateY(-2px)}
.btn-ghost{background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.1)}
.btn-ghost:hover{background:rgba(255,255,255,.12)}
.btn-sm{padding:.55rem 1.3rem;font-size:.82rem}
.btn:focus-visible,.inp:focus-visible,.scene:focus-visible,.chip-x:focus-visible{outline:3px solid rgba(245,197,24,.8);outline-offset:3px}
/* Input */
.inp{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);border-radius:14px;padding:.7rem 1.1rem;color:#fff;font-family:'Outfit',sans-serif;font-size:1rem;outline:none;transition:border-color .2s}
.inp::placeholder{color:rgba(255,255,255,.3)}
.inp:focus{border-color:rgba(245,197,24,.5)}
/* Player chip */
.chip{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:50px;padding:.35rem .6rem .35rem 1rem;font-size:.875rem}
.chip-x{background:none;border:none;color:rgba(255,100,100,.6);cursor:pointer;font-size:1rem;line-height:1;padding:0 .2rem;transition:color .15s}
.chip-x:hover{color:rgba(255,80,80,1)}
/* Badge */
.badge{display:inline-flex;align-items:center;gap:.3rem;border-radius:50px;padding:.22rem .7rem;font-size:.75rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase}
/* Progress */
.prog{height:3px;background:rgba(255,255,255,.08);border-radius:2px;width:100%}
.prog-fill{height:100%;background:linear-gradient(90deg,#F5C518,#FF6B35);border-radius:2px;transition:width .5s ease}
/* Score row */
.score-row{display:flex;align-items:center;gap:.75rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.75rem 1rem}
/* Animations */
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes slide-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pop{0%{transform:scale(.85);opacity:0}65%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}100%}
.anim-up{animation:slide-up .38s ease forwards}
.anim-pop{animation:pop .42s ease forwards}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(245,197,24,.25);border-radius:2px}
`;

const AVATARS = [
  "avatar-lion",
  "avatar-leopard",
  "avatar-fox",
  "avatar-frog",
  "avatar-butterfly",
  "avatar-octopus",
  "avatar-jester",
  "avatar-fire",
  "avatar-moon",
  "avatar-lightning",
].map(name => `${ASSET_ROOT}/${name}.webp`);
const STORAGE_KEY = "ekiki-gwe:active-game:v1";

function isValidStoredGame(game) {
  if (!game || !["play", "result"].includes(game.phase)) return false;
  if (!Array.isArray(game.players) || game.players.length < 2 || game.players.length > 10) return false;
  if (!Number.isInteger(game.cardSeed) || !Number.isInteger(game.cardIdx) || game.cardIdx < 0 || game.cardIdx >= CARD_COUNT) return false;
  if (!Number.isInteger(game.playerIdx) || game.playerIdx < 0 || game.playerIdx >= game.players.length) return false;
  if (typeof game.flipped !== "boolean" || typeof game.decided !== "boolean" || !game.scores || typeof game.scores !== "object") return false;

  const ids = new Set();
  const names = new Set();
  for (const player of game.players) {
    if (!player || typeof player.id !== "string" || typeof player.name !== "string" || !player.id || !player.name) return false;
    if (ids.has(player.id) || names.has(player.name)) return false;
    ids.add(player.id);
    names.add(player.name);

    const score = game.scores[player.name];
    if (!score || !Number.isInteger(score.did) || score.did < 0 || !Number.isInteger(score.drank) || score.drank < 0) return false;
  }

  return true;
}

function GameIcon({ src, alt = "", size = 24, fit = "contain", style = {} }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      style={{ width: size, height: size, objectFit: fit, flexShrink: 0, ...style }}
    />
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ players, nameInput, setNameInput, addPlayer, removePlayer, startGame }) {
  const handleKey = e => { if (e.key === "Enter") addPlayer(); };
  return (
    <div className="root">
      <style jsx global>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>

        {/* Header */}
        <div style={{ textAlign: "center", paddingTop: "1rem" }}>
          <div className="logo" style={{ fontSize: "clamp(3rem,14vw,4.5rem)", background: "linear-gradient(135deg,#F5C518,#FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            EKIKI GWE
          </div>
          <div style={{ fontSize: ".82rem", letterSpacing: ".2em", color: "rgba(255,255,255,.35)", marginTop: ".3rem", textTransform: "uppercase" }}>
            The party game that exposes everyone
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
          {Object.entries(CAT).map(([k, v]) => (
            <div key={k} style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,.04)", borderRadius: 12, padding: ".5rem .25rem", border: `1px solid ${v.color}22` }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <GameIcon src={v.icon} alt={`${v.label} category`} size={32} />
              </div>
              <div style={{ fontSize: ".62rem", color: "rgba(255,255,255,.4)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: ".1rem" }}>{v.label}</div>
            </div>
          ))}
        </div>

        {/* Player add */}
        <div style={{ width: "100%", background: "rgba(255,255,255,.03)", border: "1.5px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "1.25rem" }}>
          <div style={{ fontSize: ".8rem", fontWeight: 700, letterSpacing: ".1em", color: "rgba(255,255,255,.4)", marginBottom: ".75rem", textTransform: "uppercase" }}>
            Add Players ({players.length}/10)
          </div>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <input
              className="inp"
              aria-label="Player name"
              placeholder="Enter name…"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={handleKey}
              maxLength={20}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-gold btn-sm"
              onClick={addPlayer}
              disabled={!nameInput.trim() || players.length >= 10}
            >Add</button>
          </div>

          {players.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: ".85rem" }}>
              {players.map(p => (
                <div key={p} className="chip">
                  <span>{p}</span>
                  <button type="button" className="chip-x" aria-label={`Remove ${p}`} onClick={() => removePlayer(p)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 180 cards note */}
        <div style={{ textAlign: "center", fontSize: ".78rem", color: "rgba(255,255,255,.25)", letterSpacing: ".05em" }}>
          180 cards · 6 categories · unlimited chaos
        </div>

        <button
          type="button"
          className="btn btn-gold"
          onClick={startGame}
          disabled={players.length < 2}
          style={{ width: "100%", fontSize: "1.1rem", padding: "1rem" }}
        >
          {players.length < 2 ? "Add at least 2 players" : (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}>
              <GameIcon src={UI_ASSETS.dice} size={24} />
              Start the Game
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Play Screen ──────────────────────────────────────────────────────────────
function PlayScreen({ card, catInfo, flipped, setFlipped, decided, handleDecision, nextTurn, currentPlayer, currentPlayerAvatar, cardIdx, total, isActivePlayer }) {
  const progress = ((cardIdx + 1) / total) * 100;
  const revealCard = () => {
    if (!decided && isActivePlayer) setFlipped(true);
  };

  const handleCardKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      revealCard();
    }
  };

  return (
    <div className="root">
      <style jsx global>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>

        {/* Top bar */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem" }}>
            <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,255,255,.35)", textTransform: "uppercase" }}>
              Card {cardIdx + 1} of {total}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
              {Object.entries(CAT).map(([k, v]) => (
                <div key={k} title={v.label} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: card?.cat === k ? v.color : "rgba(255,255,255,.15)",
                  transition: "background .3s"
                }} />
              ))}
            </div>
          </div>
          <div className="prog"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        {/* Player name */}
        <div className="anim-pop" key={currentPlayer} style={{ textAlign: "center" }}>
          <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".15em", color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: ".2rem" }}>It's your turn</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(245,197,24,.35)", background: "rgba(255,255,255,.08)", flexShrink: 0 }}>
              <GameIcon src={currentPlayerAvatar} alt={`${currentPlayer} avatar`} size={40} fit="cover" />
            </div>
            <div className="logo" style={{ fontSize: "clamp(1.8rem,9vw,2.6rem)", color: catInfo?.color }}>{currentPlayer}</div>
          </div>
        </div>

        {/* Card */}
        <div
          className="scene"
          role="button"
          tabIndex={0}
          aria-label={flipped ? `${catInfo?.label || "Game"} card: ${card?.text || ""}` : "Reveal the current card"}
          onClick={revealCard}
          onKeyDown={handleCardKeyDown}
        >
          <div className={`card-inner${flipped ? " flipped" : ""}`}>

            {/* Front */}
            <div className="face face-front">
              <svg className="front-pattern" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                {[...Array(6)].map((_, i) => (
                  <circle key={i} cx={50 + i * 42} cy={210} r={60 + i * 30} fill="none" stroke="#F5C518" strokeWidth="1" opacity=".4" />
                ))}
              </svg>
              <div className="front-logo">EKIKI GWE</div>
              <GameIcon src={UI_ASSETS.cardBack} alt="Face-down party card" size={78} style={{ margin: ".5rem 0" }} />
              <div className="front-sub">Tap to reveal</div>
              <div className="tap-hint" style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                <GameIcon src={UI_ASSETS.tap} size={18} />
                tap the card
              </div>
            </div>

            {/* Back */}
            <div className="face face-back" style={{ background: catInfo?.bg }}>
              <div className="badge" style={{ background: "rgba(0,0,0,.25)", color: "#fff", marginBottom: "1rem" }}>
                {catInfo?.icon ? <GameIcon src={catInfo.icon} size={24} /> : null}
                {catInfo?.label}
              </div>
              <div style={{
                fontSize: "clamp(.95rem,3.5vw,1.15rem)",
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.5,
                color: "#fff",
                textShadow: "0 2px 8px rgba(0,0,0,.4)"
              }}>
                {card?.text}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons — visible after flip */}
        {flipped && !decided && isActivePlayer && (
          <div className="anim-up" style={{ display: "flex", gap: ".75rem", width: "100%" }}>
            <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => handleDecision("did")}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".4rem" }}>
                <GameIcon src={UI_ASSETS.success} size={24} />
                I Did It
              </span>
            </button>
            <button className="btn btn-red" style={{ flex: 1 }} onClick={() => handleDecision("drank")}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".4rem" }}>
                <GameIcon src={UI_ASSETS.drink} size={24} />
                I'll Drink
              </span>
            </button>
          </div>
        )}

        {flipped && !decided && !isActivePlayer && (
          <div className="anim-up" style={{ width: "100%" }}>
            <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", padding: "1rem", textAlign: "center", color: "rgba(255,255,255,.78)" }}>
              Watching {currentPlayer}'s turn…
            </div>
          </div>
        )}

        {/* Next button — visible after decision */}
        {decided && isActivePlayer && (
          <div className="anim-up" style={{ width: "100%" }}>
            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={nextTurn}>
              Next Player →
            </button>
          </div>
        )}

        {decided && !isActivePlayer && (
          <div className="anim-up" style={{ width: "100%" }}>
            <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", padding: "1rem", textAlign: "center", color: "rgba(255,255,255,.78)" }}>
              Waiting for {currentPlayer} to advance the turn…
            </div>
          </div>
        )}

        {!flipped && (
          <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.2)", letterSpacing: ".05em" }}>
            Tap the card to reveal the challenge
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ scores, players, playerMeta = [], reset, onShareResults, shareStatus }) {
  const sorted = [...players].sort((a, b) => (scores[b]?.did || 0) - (scores[a]?.did || 0));
  const champion = sorted[0];
  const mostDrunk = [...players].sort((a, b) => (scores[b]?.drank || 0) - (scores[a]?.drank || 0))[0];

  const findAvatar = name => playerMeta.find(player => player.name === name)?.avatar || AVATARS[6];

  return (
    <div className="root">
      <style jsx global>{CSS}</style>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: ".5rem" }}>
            <GameIcon src={UI_ASSETS.trophy} alt="Celebration trophy" size={76} />
          </div>
          <div className="logo" style={{ fontSize: "clamp(2rem,10vw,3rem)", background: "linear-gradient(135deg,#F5C518,#FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Game Over
          </div>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.35)", letterSpacing: ".1em", marginTop: ".3rem", textTransform: "uppercase" }}>
            Ekiki Gwe — Final Scores
          </div>
        </div>

        {/* Champion & most drunk */}
        <div style={{ display: "flex", gap: ".75rem", width: "100%" }}>
          {[{ label: "Legend", icon: UI_ASSETS.success, name: champion, sub: `${scores[champion]?.did || 0} challenges done` },
            { label: "Most Hydrated", icon: UI_ASSETS.drink, name: mostDrunk, sub: `${scores[mostDrunk]?.drank || 0} drinks taken` }
          ].map(({ label, icon, name, sub }) => (
            <div key={label} style={{ flex: 1, background: "rgba(245,197,24,.06)", border: "1px solid rgba(245,197,24,.2)", borderRadius: 14, padding: ".85rem", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".3rem", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", color: "rgba(255,255,255,.4)", textTransform: "uppercase", marginBottom: ".45rem" }}>
                <GameIcon src={icon} size={22} />
                {label}
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: ".2rem" }}>
                <GameIcon src={findAvatar(name)} alt={`${name} avatar`} size={44} fit="cover" style={{ borderRadius: "50%", border: "1px solid rgba(245,197,24,.3)" }} />
              </div>
              <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "#F5C518" }}>{name}</div>
              <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.4)", marginTop: ".2rem" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Full leaderboard */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: ".5rem" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,255,255,.3)", textTransform: "uppercase", marginBottom: ".1rem" }}>
            Full Leaderboard
          </div>
          {sorted.map((p, i) => (
            <div key={p} className="score-row">
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#F5C518,#E8900A)" : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".85rem", fontWeight: 900, color: i === 0 ? "#07070f" : "rgba(255,255,255,.5)", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,.08)", flexShrink: 0 }}>
                <GameIcon src={findAvatar(p)} alt={`${p} avatar`} size={30} fit="cover" />
              </div>
              <div style={{ flex: 1, fontWeight: 700 }}>{p}</div>
              <div style={{ display: "flex", gap: ".6rem", fontSize: ".82rem" }}>
                <span title="Did it" style={{ color: "#4ECDC4", display: "inline-flex", alignItems: "center", gap: ".2rem" }}><GameIcon src={UI_ASSETS.success} size={18} /> {scores[p]?.did || 0}</span>
                <span title="Drank" style={{ color: "#FF6B35", display: "inline-flex", alignItems: "center", gap: ".2rem" }}><GameIcon src={UI_ASSETS.drink} size={18} /> {scores[p]?.drank || 0}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: ".75rem", width: "100%", marginTop: ".5rem" }}>
          <button className="btn btn-gold" style={{ flex: 1 }} onClick={reset}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: ".4rem" }}>
              <GameIcon src={UI_ASSETS.dice} size={24} />
              Play Again
            </span>
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onShareResults}>
            {shareStatus || "Share Results"}
          </button>
        </div>
        <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
          {shareStatus}
        </div>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function EkikiGwe() {
  const [screen, setScreen] = useState("setup");
  const [setupPlayers, setSetupPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [roomState, setRoomState] = useState(null);
  const [shareStatus, setShareStatus] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const savedGame = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (isValidStoredGame(savedGame)) {
        setRoomState({
          ...savedGame,
          players: savedGame.players.map((player, index) => ({
            ...player,
            avatar: AVATARS[index % AVATARS.length],
          })),
        });
        setScreen("game");
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore malformed or inaccessible storage and start a fresh game.
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    try {
      if (roomState) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roomState));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // The game remains usable if storage is blocked or unavailable.
    }
  }, [roomState, storageReady]);

  const orderedCards = useMemo(() => {
    if (roomState?.cardSeed == null) {
      return ALL.map(([cat, text], id) => ({ id, cat, text }));
    }

    return buildCardOrder(roomState.cardSeed).map(index => ({
      id: index,
      cat: ALL[index][0],
      text: ALL[index][1],
    }));
  }, [roomState?.cardSeed]);

  const players = roomState?.players || [];
  const currentPlayer = players[roomState?.playerIdx ?? 0] || null;
  const currentPlayerAvatar = currentPlayer?.avatar || AVATARS[0];
  const isActivePlayer = Boolean(roomState?.phase === "play");
  const card = orderedCards[roomState?.cardIdx ?? 0];
  const catInfo = card ? CAT[card.cat] : null;

  const resetAll = () => {
    setScreen("setup");
    setSetupPlayers([]);
    setNameInput("");
    setRoomState(null);
    setShareStatus("");
  };

  const addPlayer = () => {
    const name = nameInput.trim();
    if (!name || setupPlayers.length >= 10 || setupPlayers.includes(name)) {
      return;
    }
    setSetupPlayers([...setupPlayers, name]);
    setNameInput("");
  };

  const removePlayer = name => {
    setSetupPlayers(setupPlayers.filter(player => player !== name));
  };

  const startGame = () => {
    if (setupPlayers.length < 2) {
      return;
    }
    const gamePlayers = setupPlayers.map((name, index) => ({
      id: `player-${index + 1}`,
      name,
      avatar: AVATARS[index % AVATARS.length],
    }));
    setRoomState({
      code: "LOCAL",
      players: gamePlayers,
      phase: "play",
      cardSeed: Math.floor(Math.random() * 1000000000),
      cardIdx: 0,
      playerIdx: 0,
      scores: createEmptyScores(gamePlayers),
      flipped: false,
      decided: false,
    });
    setScreen("game");
  };

  const sendAction = action => {
    setRoomState(current => {
      const activePlayer = current?.players?.[current.playerIdx];
      return current ? applyGameAction(current, action, activePlayer?.id) : current;
    });
  };

  const shareResults = async () => {
    const leaderboard = [...players]
      .map(player => `${player.name}: Did ${roomState?.scores?.[player.name]?.did || 0} | Drank ${roomState?.scores?.[player.name]?.drank || 0}`)
      .join("\n");
    const text = `Ekiki Gwe results\n${leaderboard}`;
    const showStatus = status => {
      setShareStatus(status);
      window.setTimeout(() => setShareStatus(""), 1800);
    };

    try {
      if (navigator.share) {
        await navigator.share({ title: "Ekiki Gwe results", text });
        showStatus("Shared!");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showStatus("Copied!");
        return;
      }

      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand("copy");
      textArea.remove();
      if (!copied) throw new Error("Copy command was rejected");
      showStatus("Copied!");
    } catch (error) {
      if (error?.name !== "AbortError") showStatus("Share failed");
    }
  };

  if (screen === "setup") {
    return (
      <SetupScreen
        players={setupPlayers}
        nameInput={nameInput}
        setNameInput={setNameInput}
        addPlayer={addPlayer}
        removePlayer={removePlayer}
        startGame={startGame}
      />
    );
  }

  if (roomState?.phase === "play") {
    return (
      <PlayScreen
        card={card}
        catInfo={catInfo}
        flipped={roomState.flipped}
        setFlipped={() => sendAction("flip")}
        decided={roomState.decided}
        handleDecision={choice => sendAction(choice)}
        nextTurn={() => sendAction("next")}
        currentPlayer={currentPlayer?.name || ""}
        currentPlayerAvatar={currentPlayerAvatar}
        cardIdx={roomState.cardIdx}
        total={orderedCards.length}
        isActivePlayer={isActivePlayer}
      />
    );
  }

  return (
    <ResultScreen
      scores={roomState.scores || {}}
      players={players.map(player => player.name)}
      playerMeta={players}
      reset={resetAll}
      onShareResults={shareResults}
      shareStatus={shareStatus}
    />
  );
}
