# Vowel Movement

## What the Hell Is This

A web-based party game inspired by Wheel of Fortune, but with phrases your mother would slap you for saying. Players spin a wheel, guess letters, and try to solve filthy, absurd, or wildly inappropriate phrases.

Built for browsers. Built for degenerates.

---

## Core Concept

Take the classic letter-guessing game show format and fill it with:
- Vulgar phrases
- Inappropriate categories
- Dark humor
- Shit your friends say when drunk

Same addictive "guess the letter" gameplay, zero FCC compliance.

---

## Game Flow

1. **Spin the Wheel** - Player clicks/taps to spin
2. **Wheel Lands** - Could be points, lose a turn, bankrupt, or bonus
3. **Guess a Consonant** - If points, player picks a letter
4. **Reveal or Fail** - Letters revealed if correct, turn passes if wrong
5. **Buy a Vowel** - Spend points to reveal vowels (A, E, I, O, U)
6. **Solve It** - Player can attempt to guess the full phrase anytime
7. **Next Round** - New phrase, keep going until someone wins or everyone's crying

---

## The Wheel

Wedges include:
- Point values (100, 200, 300, 500, 1000, etc.)
- **Bankrupt** - Lose all your points, lose your turn
- **Lose a Turn** - Self explanatory
- **Free Spin** - Save it for later
- **Bonus Wedge** - Mystery bullshit (double points, steal points, etc.)

The wheel spin should feel satisfying - good acceleration, gradual slowdown, tension as it crawls to a stop.

---

## The Phrase Board

- Grid of boxes representing each letter
- Blank until revealed
- Spaces and punctuation shown from the start
- Classic flip/reveal animation when a letter is guessed correctly

---

## Categories

This is where the game lives or dies. Example categories:

- **Things You Shout During Sex**
- **Florida News Headlines**
- **Excuses for Being Late**
- **Things Your Dad Said Before He Left**
- **Drunk Texts at 2am**
- **Bad Tattoo Ideas**
- **Reasons You're Going to Hell**
- **What Not to Say at a Funeral**
- **Tinder Bios**
- **Before & After** (two phrases combined in a cursed way)
- **Workplace HR Violations**
- **Things Found in Your Browser History**

---

## Example Phrases

- EAT ASS LIVE FAST
- I THOUGHT IT WAS JUST A FART
- WALMART PARKING LOT MISTAKES
- MY THERAPIST QUIT
- TECHNICALLY NOT ILLEGAL
- YOUR MOM SAYS HI
- GASLIGHT GATEKEEP GIRLBOSS
- SIR THIS IS A WENDYS
- CRIPPLING STUDENT DEBT
- EMOTIONAL DAMAGE
- NOT MY PROUDEST FAP
- THATS WHAT SHE SAID
- SEND NUDES
- MOIST

---

## Players

**Single Player Mode:**
- Just you vs the phrases
- See how many you can solve
- Track high scores

**Multiplayer Mode (Future):**
- 2-4 players
- Take turns spinning
- First to X points wins
- Or set number of rounds, highest score wins

---

## Minimum Viable Product (V1)

Just get this shit working first:

1. A wheel that spins and lands on wedges
2. A phrase board that reveals letters
3. Keyboard/click input for guessing letters
4. Basic point tracking
5. Win state when phrase is solved
6. A bank of at least 50 phrases to start
7. Single player only

No accounts, no multiplayer, no leaderboards. Just the core loop.

---

## Future Shit (V2+)

- Multiplayer (local or online)
- User-submitted phrases (with moderation lol)
- Daily challenge phrase
- Leaderboards
- Sound effects (wheel clicks, buzzer, airhorn for wins)
- Unlockable wheel themes
- Drunk mode (wheel wobbles, letters scramble)
- Timed rounds
- Mobile optimization

---

## Tech Stack

- **Phaser 3** - Game framework
- **TypeScript** - Because we're not animals
- **Vite** - Build tooling
- Browser-based, no install needed

---

## Vibe

- Looks like a game show, plays like a game show
- UI should feel polished but irreverent
- Colors: Bold, loud, maybe neon trash aesthetic
- Sound: Satisfying clicks, buzzes, maybe a shitty airhorn

---

## Success Metrics

- People laugh
- People send it to their friends
- People submit phrase ideas
- Nobody sues us

---

## Open Questions

- How many phrases needed for launch? (50? 100?)
- Allow custom phrase packs?
- Age gate needed? (lol probably)
- Monetization ever? (ads, phrase packs, who knows)

---

## Summary

**Vowel Movement** = Wheel of Fortune + no filter.

Spin. Guess. Laugh. Repeat.