import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildCardOrder } from "./lib/room.js";

// ─── SCC Orbit Compression: 6 categories × 30 = 180 cards ───────────────────
const CAT = {
  D:{ label:"Dare",    emoji:"🎯", color:"#FF6B35", bg:"linear-gradient(145deg,#FF6B35,#C0392B)" },
  T:{ label:"Truth",   emoji:"💬", color:"#4ECDC4", bg:"linear-gradient(145deg,#4ECDC4,#1A6B75)" },
  S:{ label:"Group",   emoji:"🎉", color:"#F5C518", bg:"linear-gradient(145deg,#F5C518,#C47A00)" },
  W:{ label:"Wild",    emoji:"🔥", color:"#FF4757", bg:"linear-gradient(145deg,#FF4757,#8E1ABA)" },
  X:{ label:"Spicy",   emoji:"🌶️", color:"#FF6B9D", bg:"linear-gradient(145deg,#FF6B9D,#8B0057)" },
  C:{ label:"Confess", emoji:"🤫", color:"#A29BFE", bg:"linear-gradient(145deg,#A29BFE,#4A3ABA)" },
};

const ALL = [
  // ── DARE (30) ──
  ["D","Twerk for 10 seconds. No stopping."],
  ["D","Call someone you haven't spoken to in 6+ months. Pretend it's their birthday."],
  ["D","Let the group choose your phone wallpaper for the rest of the night."],
  ["D","Do 20 push-ups or take a shot for every one you skip."],
  ["D","Speak in an accent chosen by the group for the next 3 rounds."],
  ["D","Person to your right scrolls your gallery for 60 seconds."],
  ["D","Text your ex 'I miss you.' No explanation allowed."],
  ["D","Do your best impression of the person to your left."],
  ["D","Let the group read your last 5 voice notes aloud."],
  ["D","Eat something weird from the kitchen or take a drink."],
  ["D","Group posts anything to your Instagram story right now."],
  ["D","Full runway walk to a group-chosen song."],
  ["D","Let someone draw on your face with a marker. It stays for 3 rounds."],
  ["D","Send a moaning voice note to someone. No explanation."],
  ["D","Wear something embarrassing for the next 5 rounds."],
  ["D","Group changes your WhatsApp status for 10 minutes."],
  ["D","Strip tease. Clothes stay on… or don't."],
  ["D","Call a random contact and sing them a lullaby."],
  ["D","Group writes and sends a text from your phone to anyone."],
  ["D","60-second motivational speech about absolutely nothing."],
  ["D","Imitate a dog begging for food for 30 seconds."],
  ["D","Person across from you reads your most recent DM."],
  ["D","Hold a plank for 45 seconds or take 2 shots."],
  ["D","Group styles your hair however they want."],
  ["D","Eat something from the fridge blindfolded."],
  ["D","Narrate everything you do out loud for the next 2 rounds."],
  ["D","Group roasts your dating profile publicly."],
  ["D","Do the worm or take a shot for every second you fail."],
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
  ["W","Imitate every person in the room. Worst impression drinks."],
  ["W","Dirty dance with the person to your left for 30 seconds."],
  ["W","Open camera roll. Read the 10th photo's context out loud — dramatically."],
  ["W","Whoever last had sex: one minute of details. Go."],
  ["W","Call someone and confess a crush. Real or fake — group decides."],
  ["W","Drunkest person gives a TED Talk on a group-chosen topic."],
  ["W","Group arranges a 5-second kiss between two people they choose."],
  ["W","Best embarrassing celebrity impression. 30 seconds. Go."],
  ["W","Group takes full control of one story post on your account."],
  ["W","Person single the longest explains exactly why. Honestly."],
  ["W","Everyone slap the table simultaneously. Last one slaps their own forehead."],
  ["W","Show the last photo you took. Refuse = 3 shots."],
  ["W","Read your last tweet or caption in a dramatic Shakespearean voice."],
  ["W","Person to your right smells your neck and describes it to the group."],
  ["W","Group picks a song. You sing the full chorus. No backing out."],
  ["W","Describe your ideal night with someone in this room. Group picks who."],
  ["W","Person across scrolls your WhatsApp for 30 seconds."],
  ["W","Act out a dramatic breakup scene with whoever the group chooses."],
  ["W","Confess something done under the influence that nobody knows."],
  ["W","Show your most recently liked post. No hiding it."],
  ["W","Trade phones with the person to your left for 3 full minutes."],
  ["W","Group reenacts how they think you act when drunk."],
  ["W","Read your most embarrassing saved message out loud."],
  ["W","Youngest must do whatever the oldest person says for 2 rounds."],
  ["W","Describe the person to your right using only food. Most creative wins."],
  ["W","Call your mom or dad. Speaker on. Say 'I need to tell you something.'"],
  ["W","Group goes through your recent searches for 60 seconds."],
  ["W","Do your best slow-motion action scene using someone as a prop."],
  // ── SPICY (30) ──
  ["X","Describe your type physically — without 'tall, dark, and handsome.'"],
  ["X","Rate everyone in this room on attractiveness. Out loud. No skipping."],
  ["X","Who here would you least want to see naked? Be honest."],
  ["X","Read your most flirtatious text out loud with full dramatic energy."],
  ["X","Describe your last sexual experience using only movie titles."],
  ["X","Do you think about the same person every time? Who is it?"],
  ["X","Most unusual turn-on? Be specific."],
  ["X","Ever hooked up with someone significantly older or younger? How was it?"],
  ["X","Longest dry spell you've had, and what finally ended it?"],
  ["X","Recreate your last flirty conversation word for word."],
  ["X","Wildest place you've done something you shouldn't have?"],
  ["X","Seduce someone using only your voice. Demonstrate right now."],
  ["X","Who in the room do you think is the best kisser? Why?"],
  ["X","Most risqué thing you've done in public?"],
  ["X","Have feelings for someone who doesn't know? Describe them."],
  ["X","Something you did in bed that surprised even yourself?"],
  ["X","Describe the bedroom energy of the person to your right."],
  ["X","Something you wish your last partner did differently?"],
  ["X","Ever accidentally sent something explicit to the wrong person?"],
  ["X","Rate your own bedroom performance 1–10 and justify it."],
  ["X","A fantasy you've never told anyone?"],
  ["X","Who here gives off the best bedroom energy — purely on vibes?"],
  ["X","Describe your worst sexual experience in exactly 5 words."],
  ["X","Have you been caught in the act? Tell everything."],
  ["X","Something you'd only do after 3+ drinks?"],
  ["X","Louder or quieter in bed? Demonstrate the contrast right now."],
  ["X","Most romantic thing someone did that actually worked on you?"],
  ["X","If the group guessed your number, what would they say? Right?"],
  ["X","Who here would you most want stuck in an elevator with you?"],
  ["X","Rate each person here on how good they'd be at flirting. Out loud."],
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

const AVATARS = ["🦁", "🐯", "🦊", "🐸", "🦋", "🐙", "🎭", "🔥", "💀", "👾", "🌙", "⚡"];

function AvatarPicker({ value, onChange }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: ".5rem",
        width: "100%",
      }}
    >
      {AVATARS.map((avatar) => (
        <button
          key={avatar}
          type="button"
          onClick={() => onChange(avatar)}
          className="btn"
          style={{
            padding: ".7rem 0",
            fontSize: "1.3rem",
            borderRadius: 14,
            border: avatar === value ? "1.5px solid #F5C518" : "1.5px solid rgba(255,255,255,.12)",
            background: avatar === value ? "rgba(245,197,24,.16)" : "rgba(255,255,255,.05)",
            color: "#fff",
          }}
        >
          {avatar}
        </button>
      ))}
    </div>
  );
}

function ProfileForm({
  title,
  subtitle,
  nameInput,
  setNameInput,
  avatar,
  setAvatar,
  buttonLabel,
  onSubmit,
  note,
  disabled,
}) {
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(nameInput.trim(), avatar);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div className="logo" style={{ fontSize: "clamp(2.4rem,10vw,3.8rem)" }}>{title}</div>
        <div style={{ fontSize: ".82rem", letterSpacing: ".18em", color: "rgba(255,255,255,.35)", marginTop: ".35rem", textTransform: "uppercase" }}>
          {subtitle}
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,.03)", border: "1.5px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
          <input
            className="inp"
            placeholder="Enter name…"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            maxLength={20}
          />
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>

        {note ? (
          <div style={{ fontSize: ".77rem", lineHeight: 1.5, color: "rgba(255,255,255,.35)" }}>{note}</div>
        ) : null}

        <button className="btn btn-gold" type="submit" disabled={disabled || !nameInput.trim()} style={{ width: "100%", fontSize: "1.02rem", padding: "1rem" }}>
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}

function LandingScreen({ onCreate, onJoin }) {
  return (
    <div className="root">
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", textAlign: "center" }}>
        <div className="logo" style={{ fontSize: "clamp(3rem,14vw,4.5rem)", background: "linear-gradient(135deg,#F5C518,#FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          EKIKI GWE
        </div>
        <div style={{ fontSize: ".82rem", letterSpacing: ".2em", color: "rgba(255,255,255,.35)", textTransform: "uppercase" }}>
          The party game that exposes everyone
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: ".75rem", marginTop: "1rem" }}>
          <button className="btn btn-gold" style={{ width: "100%", fontSize: "1.05rem", padding: "1rem" }} onClick={onCreate}>
            Create Room
          </button>
          <button className="btn btn-ghost" style={{ width: "100%", fontSize: "1.05rem", padding: "1rem" }} onClick={onJoin}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

function JoinQrScanner({ active, onDetected, onError }) {
  const idRef = useRef(`qr-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (cancelled) {
          return;
        }

        const scanner = new Html5QrcodeScanner(
          idRef.current,
          { fps: 10, qrbox: 220, rememberLastUsedCamera: true },
          false
        );

        scannerRef.current = scanner;
        scanner.render(
          text => {
            const match = String(text).match(/\/join\/([A-Z0-9]{6})/i);
            onDetected((match ? match[1] : text).toString().trim().toUpperCase());
            scanner.clear().catch(() => {});
          },
          () => {}
        );
      } catch (error) {
        onError("Camera access was denied or unavailable. Use manual code entry instead.");
      }
    })();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [active, onDetected, onError]);

  return <div id={idRef.current} style={{ width: "100%" }} />;
}

function JoinRoomScreen({
  joinCode,
  setJoinCode,
  joinMode,
  setJoinMode,
  scanError,
  setScanError,
  onContinue,
  onBack,
}) {
  return (
    <div className="root">
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ textAlign: "center" }}>
          <div className="logo" style={{ fontSize: "clamp(2.3rem,10vw,3.4rem)" }}>Join Room</div>
          <div style={{ fontSize: ".82rem", letterSpacing: ".18em", color: "rgba(255,255,255,.35)", marginTop: ".3rem", textTransform: "uppercase" }}>
            Scan a QR code or enter a room code
          </div>
        </div>

        <div style={{ display: "flex", gap: ".65rem", width: "100%" }}>
          <button className={joinMode === "scan" ? "btn btn-gold" : "btn btn-ghost"} style={{ flex: 1 }} onClick={() => { setJoinMode("scan"); setScanError(""); }}>
            Scan QR
          </button>
          <button className={joinMode === "code" ? "btn btn-gold" : "btn btn-ghost"} style={{ flex: 1 }} onClick={() => setJoinMode("code") }>
            Enter Code
          </button>
        </div>

        <div style={{ width: "100%", background: "rgba(255,255,255,.03)", border: "1.5px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "1.1rem", display: "flex", flexDirection: "column", gap: ".9rem" }}>
          {joinMode === "scan" ? (
            <>
              <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.35)" }}>
                Point your camera at the lobby QR code.
              </div>
              <JoinQrScanner
                active
                onDetected={code => {
                  setJoinCode(code);
                  setScanError("");
                  onContinue(code);
                }}
                onError={message => setScanError(message)}
              />
              {scanError ? <div style={{ fontSize: ".8rem", color: "rgba(255,180,120,.95)", lineHeight: 1.5 }}>{scanError}</div> : null}
              <button className="btn btn-ghost" type="button" onClick={() => setJoinMode("code")}>Use manual code instead</button>
            </>
          ) : (
            <>
              <input
                className="inp"
                placeholder="Enter 6-character code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                maxLength={6}
                style={{ textAlign: "center", letterSpacing: ".22em", fontSize: "1.15rem" }}
              />
              <button className="btn btn-gold" type="button" onClick={() => onContinue(joinCode)} disabled={joinCode.trim().length !== 6}>
                Continue
              </button>
            </>
          )}
          <button className="btn btn-ghost" type="button" onClick={onBack}>Back</button>
        </div>
      </div>
    </div>
  );
}

function CreateRoomScreen({ nameInput, setNameInput, avatar, setAvatar, onCreate, onBack, busy }) {
  return (
    <div className="root">
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <ProfileForm
          title="Create Room"
          subtitle="Pick your name and avatar"
          nameInput={nameInput}
          setNameInput={setNameInput}
          avatar={avatar}
          setAvatar={setAvatar}
          buttonLabel={busy ? "Creating…" : "Create Room"}
          onSubmit={onCreate}
          note="The room code and QR link appear as soon as the room is created."
          disabled={busy}
        />
        <button className="btn btn-ghost" type="button" onClick={onBack} style={{ width: "100%", maxWidth: 420 }}>Back</button>
      </div>
    </div>
  );
}

function LobbyScreen({ roomState, roomUrl, isHost, onStartGame, onLeave }) {
  const players = roomState?.players || [];

  return (
    <div className="root">
      <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: ".76rem", fontWeight: 700, letterSpacing: ".15em", color: "rgba(255,255,255,.35)", textTransform: "uppercase" }}>
            Room Code
          </div>
          <div className="logo" style={{ fontSize: "clamp(2rem,9vw,3rem)", color: "#F5C518" }}>{roomState?.code}</div>
        </div>

        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: "1rem", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: ".9rem" }}>
          {roomUrl ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: ".6rem" }}>
              <QRCodeSVG value={roomUrl} size={190} bgColor="#ffffff" fgColor="#07070f" includeMargin />
            </div>
          ) : null}
          <div style={{ textAlign: "center", fontSize: ".8rem", color: "rgba(255,255,255,.35)", lineHeight: 1.5 }}>
            Share this QR or room code so others can join.
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: ".55rem" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,255,255,.3)", textTransform: "uppercase" }}>
            Players in Lobby
          </div>
          {players.map(player => (
            <div key={player.id} className="score-row">
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(245,197,24,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                {player.avatar}
              </div>
              <div style={{ flex: 1, fontWeight: 700 }}>{player.name}</div>
              {roomState?.hostId === player.id ? <div style={{ fontSize: ".72rem", color: "rgba(245,197,24,.8)", letterSpacing: ".1em", textTransform: "uppercase" }}>Host</div> : null}
            </div>
          ))}
        </div>

        {isHost ? (
          <button className="btn btn-gold" style={{ width: "100%", padding: "1rem" }} onClick={onStartGame} disabled={players.length < 2}>
            {players.length < 2 ? "Need at least 2 players" : "Start Game 🎲"}
          </button>
        ) : (
          <div style={{ width: "100%", textAlign: "center", fontSize: ".78rem", color: "rgba(255,255,255,.35)", letterSpacing: ".08em", textTransform: "uppercase" }} className="tap-hint">
            Waiting for host to start…
          </div>
        )}

        <button className="btn btn-ghost btn-sm" onClick={onLeave} style={{ width: "100%" }}>
          Leave Room
        </button>
      </div>
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────
function SetupScreen({ players, nameInput, setNameInput, addPlayer, removePlayer, startGame }) {
  const handleKey = e => { if (e.key === "Enter") addPlayer(); };
  return (
    <div className="root">
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
              <div style={{ fontSize: "1.1rem" }}>{v.emoji}</div>
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
              placeholder="Enter name…"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={handleKey}
              maxLength={20}
              style={{ flex: 1 }}
            />
            <button
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
                  <button className="chip-x" onClick={() => removePlayer(p)}>×</button>
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
          className="btn btn-gold"
          onClick={startGame}
          disabled={players.length < 2}
          style={{ width: "100%", fontSize: "1.1rem", padding: "1rem" }}
        >
          {players.length < 2 ? "Add at least 2 players" : "Start the Game 🎲"}
        </button>
      </div>
    </div>
  );
}

// ─── Play Screen ──────────────────────────────────────────────────────────────
function PlayScreen({ card, catInfo, flipped, setFlipped, decided, handleDecision, nextTurn, currentPlayer, currentPlayerAvatar, cardIdx, total, isActivePlayer }) {
  const progress = ((cardIdx + 1) / total) * 100;
  return (
    <div className="root">
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
            <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.08)", fontSize: "1.05rem" }}>
              {currentPlayerAvatar}
            </div>
            <div className="logo" style={{ fontSize: "clamp(1.8rem,9vw,2.6rem)", color: catInfo?.color }}>{currentPlayer}</div>
          </div>
        </div>

        {/* Card */}
        <div className="scene" onClick={() => !decided && isActivePlayer && setFlipped(true)}>
          <div className={`card-inner${flipped ? " flipped" : ""}`}>

            {/* Front */}
            <div className="face face-front">
              <svg className="front-pattern" viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                {[...Array(6)].map((_, i) => (
                  <circle key={i} cx={50 + i * 42} cy={210} r={60 + i * 30} fill="none" stroke="#F5C518" strokeWidth="1" opacity=".4" />
                ))}
              </svg>
              <div className="front-logo">EKIKI GWE</div>
              <div style={{ fontSize: "3rem", margin: ".5rem 0" }}>🎴</div>
              <div className="front-sub">Tap to reveal</div>
              <div className="tap-hint">👆 tap the card</div>
            </div>

            {/* Back */}
            <div className="face face-back" style={{ background: catInfo?.bg }}>
              <div className="badge" style={{ background: "rgba(0,0,0,.25)", color: "#fff", marginBottom: "1rem" }}>
                {catInfo?.emoji} {catInfo?.label}
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
              ✅ I Did It
            </button>
            <button className="btn btn-red" style={{ flex: 1 }} onClick={() => handleDecision("drank")}>
              🥃 I'll Drink
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
function ResultScreen({ scores, players, playerMeta = [], reset, onShareResults }) {
  const sorted = [...players].sort((a, b) => (scores[b]?.did || 0) - (scores[a]?.did || 0));
  const champion = sorted[0];
  const mostDrunk = [...players].sort((a, b) => (scores[b]?.drank || 0) - (scores[a]?.drank || 0))[0];

  const findAvatar = name => playerMeta.find(player => player.name === name)?.avatar || "🎭";

  return (
    <div className="root">
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: ".5rem" }}>🏆</div>
          <div className="logo" style={{ fontSize: "clamp(2rem,10vw,3rem)", background: "linear-gradient(135deg,#F5C518,#FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Game Over
          </div>
          <div style={{ fontSize: ".8rem", color: "rgba(255,255,255,.35)", letterSpacing: ".1em", marginTop: ".3rem", textTransform: "uppercase" }}>
            Ekiki Gwe — Final Scores
          </div>
        </div>

        {/* Champion & most drunk */}
        <div style={{ display: "flex", gap: ".75rem", width: "100%" }}>
          {[{ label: "Legend 🎯", name: champion, sub: `${scores[champion]?.did || 0} challenges done` },
            { label: "Most Hydrated 🥃", name: mostDrunk, sub: `${scores[mostDrunk]?.drank || 0} drinks taken` }
          ].map(({ label, name, sub }) => (
            <div key={label} style={{ flex: 1, background: "rgba(245,197,24,.06)", border: "1px solid rgba(245,197,24,.2)", borderRadius: 14, padding: ".85rem", textAlign: "center" }}>
              <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", color: "rgba(255,255,255,.4)", textTransform: "uppercase", marginBottom: ".3rem" }}>{label}</div>
              <div style={{ fontSize: "1.2rem", marginBottom: ".15rem" }}>{findAvatar(name)}</div>
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
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", flexShrink: 0 }}>
                {findAvatar(p)}
              </div>
              <div style={{ flex: 1, fontWeight: 700 }}>{p}</div>
              <div style={{ display: "flex", gap: ".6rem", fontSize: ".82rem" }}>
                <span title="Did it" style={{ color: "#4ECDC4" }}>✅ {scores[p]?.did || 0}</span>
                <span title="Drank" style={{ color: "#FF6B35" }}>🥃 {scores[p]?.drank || 0}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: ".75rem", width: "100%", marginTop: ".5rem" }}>
          <button className="btn btn-gold" style={{ flex: 1 }} onClick={reset}>
            Play Again 🎲
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onShareResults}>
            Share Results
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function EkikiGwe({ initialJoinCode = "" }) {
  const [screen, setScreen] = useState("landing");
  const [joinMode, setJoinMode] = useState("code");
  const [joinCode, setJoinCode] = useState(initialJoinCode.toUpperCase());
  const [scanError, setScanError] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [roomCode, setRoomCode] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [roomState, setRoomState] = useState(null);
  const [localPlayerId, setLocalPlayerId] = useState("");
  const [actionBusy, setActionBusy] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (initialJoinCode) {
      setJoinCode(String(initialJoinCode).toUpperCase());
      setJoinMode("code");
      setScreen("join-profile");
    }
  }, [initialJoinCode]);

  useEffect(() => {
    return () => {
      if (channelRef.current && pusherRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current.unsubscribe(channelRef.current.name);
        pusherRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!roomCode) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      const { default: Pusher } = await import("pusher-js");
      if (cancelled) {
        return;
      }

      if (channelRef.current && pusherRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current.unsubscribe(channelRef.current.name);
        pusherRef.current.disconnect();
      }

      const client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });

      const channel = client.subscribe(`room-${roomCode}`);
      const syncRoom = payload => {
        const nextRoomState = payload?.roomState || payload;
        if (nextRoomState) {
          setRoomState(nextRoomState);
          setScreen("room");
        }
      };

      channel.bind("player-joined", syncRoom);
      channel.bind("game-started", syncRoom);
      channel.bind("game-state", syncRoom);

      pusherRef.current = client;
      channelRef.current = channel;
    })().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [roomCode]);

  useEffect(() => {
    if (initialJoinCode) {
      setRoomCode(String(initialJoinCode).toUpperCase());
    }
  }, [initialJoinCode]);

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
  const currentPlayerAvatar = currentPlayer?.avatar || "🎴";
  const viewer = players.find(player => player.id === localPlayerId) || null;
  const isHost = Boolean(roomState && viewer && roomState.hostId === viewer.id);
  const isActivePlayer = Boolean(viewer && currentPlayer && viewer.id === currentPlayer.id);
  const card = orderedCards[roomState?.cardIdx ?? 0];
  const catInfo = card ? CAT[card.cat] : null;

  const disconnectRoom = () => {
    if (channelRef.current && pusherRef.current) {
      channelRef.current.unbind_all();
      pusherRef.current.unsubscribe(channelRef.current.name);
      pusherRef.current.disconnect();
    }
    channelRef.current = null;
    pusherRef.current = null;
  };

  const resetAll = () => {
    disconnectRoom();
    setScreen("landing");
    setJoinMode("code");
    setJoinCode("");
    setScanError("");
    setNameInput("");
    setAvatar(AVATARS[0]);
    setRoomCode("");
    setRoomUrl("");
    setRoomState(null);
    setLocalPlayerId("");
    setActionBusy("");
    setShareStatus("");
  };

  const createRoom = async (playerName, playerAvatar) => {
    const response = await fetch("/api/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, avatar: playerAvatar }),
    });

    if (!response.ok) {
      throw new Error((await response.json().catch(() => ({})))?.error || "Could not create room");
    }

    const data = await response.json();
    const createdPlayer = data.roomState.players[data.roomState.players.length - 1];
    setRoomCode(data.code);
    setRoomUrl(data.roomUrl);
    setRoomState(data.roomState);
    setLocalPlayerId(createdPlayer?.id || data.roomState.hostId);
    setScreen("room");
  };

  const joinRoom = async (code, playerName, playerAvatar) => {
    const response = await fetch("/api/join-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name: playerName, avatar: playerAvatar }),
    });

    if (!response.ok) {
      throw new Error((await response.json().catch(() => ({})))?.error || "Could not join room");
    }

    const data = await response.json();
    const joinedPlayer = data.roomState.players[data.roomState.players.length - 1];
    setRoomCode(code);
    setRoomUrl(data.roomUrl);
    setRoomState(data.roomState);
    setLocalPlayerId(joinedPlayer?.id || "");
    setScreen("room");
  };

  const sendAction = async action => {
    if (!roomCode || !localPlayerId) {
      return;
    }

    setActionBusy(action);
    try {
      await fetch("/api/game-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: roomCode, action, playerId: localPlayerId }),
      });
    } finally {
      setActionBusy("");
    }
  };

  const startGame = async () => {
    if (!roomCode || !localPlayerId || !isHost) {
      return;
    }

    setActionBusy("start");
    try {
      await fetch("/api/start-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: roomCode, hostId: localPlayerId }),
      });
    } finally {
      setActionBusy("");
    }
  };

  const shareResults = async () => {
    const leaderboard = [...players]
      .map(player => `${player.avatar} ${player.name}: ✅ ${roomState?.scores?.[player.name]?.did || 0} | 🥃 ${roomState?.scores?.[player.name]?.drank || 0}`)
      .join("\n");
    const text = `Ekiki Gwe results for room ${roomCode}\n${leaderboard}\nPlay the next round at ${roomUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/join/${roomCode}`}`;

    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("Copied!");
      window.setTimeout(() => setShareStatus(""), 1800);
    } catch {
      setShareStatus("Copy failed");
      window.setTimeout(() => setShareStatus(""), 1800);
    }
  };

  if (screen === "landing") {
    return <LandingScreen onCreate={() => setScreen("create-room")} onJoin={() => setScreen(initialJoinCode ? "join-profile" : "join-room")} />;
  }

  if (screen === "create-room") {
    return (
      <CreateRoomScreen
        nameInput={nameInput}
        setNameInput={setNameInput}
        avatar={avatar}
        setAvatar={setAvatar}
        busy={actionBusy === "create"}
        onBack={() => setScreen("landing")}
        onCreate={async (playerName, playerAvatar) => {
          setActionBusy("create");
          try {
            await createRoom(playerName, playerAvatar);
          } finally {
            setActionBusy("");
          }
        }}
      />
    );
  }

  if (screen === "join-room") {
    return (
      <JoinRoomScreen
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        joinMode={joinMode}
        setJoinMode={setJoinMode}
        scanError={scanError}
        setScanError={setScanError}
        onBack={() => setScreen("landing")}
        onContinue={code => {
          const normalized = String(code || "").trim().toUpperCase();
          if (normalized.length === 6) {
            setJoinCode(normalized);
            setScanError("");
            setScreen("join-profile");
          }
        }}
      />
    );
  }

  if (screen === "join-profile") {
    return (
      <div className="root">
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <ProfileForm
            title="Join Room"
            subtitle={`Room ${joinCode || roomCode}`}
            nameInput={nameInput}
            setNameInput={setNameInput}
            avatar={avatar}
            setAvatar={setAvatar}
            buttonLabel={actionBusy === "join" ? "Joining…" : "Join Room"}
            onSubmit={async (playerName, playerAvatar) => {
              const normalized = String(joinCode || roomCode || "").trim().toUpperCase();
              if (normalized.length !== 6) {
                return;
              }
              setActionBusy("join");
              try {
                await joinRoom(normalized, playerName, playerAvatar);
              } finally {
                setActionBusy("");
              }
            }}
            note={joinCode ? `You are joining room ${joinCode}.` : "Enter a room code first."}
            disabled={actionBusy === "join"}
          />
          <button className="btn btn-ghost" type="button" onClick={() => setScreen("join-room")} style={{ width: "100%", maxWidth: 420 }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return <LandingScreen onCreate={() => setScreen("create-room")} onJoin={() => setScreen("join-room")} />;
  }

  if (roomState.phase === "lobby") {
    return (
      <LobbyScreen
        roomState={roomState}
        roomUrl={roomUrl}
        isHost={isHost}
        onStartGame={startGame}
        onLeave={resetAll}
      />
    );
  }

  if (roomState.phase === "play") {
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
