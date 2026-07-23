# PickleKoach — Program Preset Templates

Reference for the built-in program templates coaches can adopt when creating a program in the coach portal. Source of truth: `lib/koaches/program-templates.ts`, `lib/koaches/constants.ts`.

---

## How presets work

1. Coach picks a **program preset** (e.g. Open Play Ready).
2. Each preset is wired to a **skill rubric** (beginner, intermediate, or advanced).
3. On save, the program stores the rubric’s full skill list as `customSkillIds` so coaches can rename or tweak skills later without changing the preset definition.
4. **Session ratings** and **progress cards** use the program’s skill checklist (0–5 scale, before/after per session).

Coaches can also start from a **base rubric** or build a **fully custom** program — those paths are documented at the end.

---

## Skill rating scale (0–5)

Used for every skill in session ratings and progress cards.

### Default labels (all categories)

| Score | Label |
|------:|-------|
| 0 | Not introduced yet |
| 1 | Starting out |
| 2 | Learning |
| 3 | Consistent |
| 4 | Strong |
| 5 | Competition-ready |

### Category-specific score descriptions

#### Fundamentals

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Needs full coach guidance each rep |
| 2 | Understands basics, execution still inconsistent |
| 3 | Executes fundamentals in normal drills |
| 4 | Reliable fundamentals under game pace |
| 5 | Automatic fundamentals even under pressure |

#### Serve & Return

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Serve/return often misses or sits up |
| 2 | Gets ball in play with limited depth/placement |
| 3 | Consistently in play with usable depth |
| 4 | Intentional placement creates weak replies |
| 5 | Controls serve/return patterns strategically |

#### Third Shot

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Rarely attempts effective third-shot decision |
| 2 | Attempts drop/drive with mixed outcomes |
| 3 | Can execute chosen third shot with consistency |
| 4 | Uses drop/drive intentionally by ball quality |
| 5 | Third-shot choices consistently win transition |

#### Kitchen Game / Dinking

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Dinks/resets break down quickly |
| 2 | Sustains short dink/reset exchanges |
| 3 | Keeps control in medium rallies at kitchen |
| 4 | Moves opponents with placement and patience |
| 5 | Dictates kitchen exchanges with intent |

#### Volleys

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Volley timing/contact often unstable |
| 2 | Can block medium pace with variable control |
| 3 | Controls forehand/backhand volleys reliably |
| 4 | Blocks, punches, and put-aways with purpose |
| 5 | Executes advanced volley choices consistently |

#### Movement & Athleticism

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Footwork and recovery frequently late |
| 2 | Reaches position but balance varies |
| 3 | Moves and recovers well in standard patterns |
| 4 | Efficient transitions under faster tempo |
| 5 | Elite movement and court coverage consistency |

#### Game IQ & Strategy

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Limited tactical decision-making awareness |
| 2 | Recognizes obvious high/low percentage choices |
| 3 | Makes generally sound shot decisions |
| 4 | Adapts tactics to opponents and score |
| 5 | Advanced strategic control point-to-point |

#### Mental Game

| Score | Description |
|------:|-------------|
| 0 | Not introduced yet |
| 1 | Focus/confidence drops after errors |
| 2 | Recovers mentally with coach prompting |
| 3 | Maintains composure through normal pressure |
| 4 | Stays composed and communicates proactively |
| 5 | High resilience and leadership under pressure |

---

## Skill rubrics (base templates)

Presets attach to one of these rubrics. Each rubric defines which **categories** (and therefore which skills) are included.

### Beginner

| Field | Value |
|-------|-------|
| **ID** | `beginner` |
| **Name** | Beginner |
| **Subtitle** | 2.0 – 2.5 DUPR |
| **DUPR range** | 2.0 – 2.5 |
| **Categories** | Fundamentals, Serve & Return, Movement & Athleticism |
| **Skill count** | 12 |
| **Description** | Foundation rubric for new players. Covers grip, rules, serve & return basics, and court movement — the essentials before open play. |

### Intermediate

| Field | Value |
|-------|-------|
| **ID** | `intermediate` |
| **Name** | Intermediate |
| **Subtitle** | 3.0 – 3.5 DUPR |
| **DUPR range** | 3.0 – 3.5 |
| **Categories** | Third Shot, Kitchen Game / Dinking, Volleys, Movement & Athleticism |
| **Skill count** | 17 |
| **Description** | Core competitive skills rubric. Third shot, kitchen game, volleys, and athletic movement — the shots that separate recreational from solid intermediate play. |

### Advanced

| Field | Value |
|-------|-------|
| **ID** | `advanced` |
| **Name** | Advanced |
| **Subtitle** | 3.5+ DUPR |
| **DUPR range** | 3.5+ |
| **Categories** | All 8 categories |
| **Skill count** | 33 |
| **Description** | Full assessment across all 8 PCI / USA Pickleball categories including game IQ and mental game — for tournament-ready and competitive players. |

---

## Full skill catalog

All skills live in the default catalog (`DEFAULT_SKILLS`). Rubrics include skills by **category**.

### Fundamentals (4 skills) — *Beginner rubric*

| Skill ID | Skill name |
|----------|------------|
| `fund-grip` | Grip & ready position |
| `fund-stance` | Stance and footwork basics |
| `fund-court` | Court awareness & positioning |
| `fund-rules` | Scoring & rules knowledge |

### Serve & Return (4 skills) — *Beginner rubric*

| Skill ID | Skill name |
|----------|------------|
| `serve-consistency` | Serve consistency (legal, in-court) |
| `serve-placement` | Serve placement (depth, direction) |
| `return-depth` | Return of serve depth |
| `return-placement` | Return of serve placement |

### Third Shot (4 skills) — *Intermediate rubric*

| Skill ID | Skill name |
|----------|------------|
| `third-drop-consistency` | Third shot drop consistency |
| `third-drop-placement` | Third shot drop placement |
| `third-drive` | Third shot drive (as change-up) |
| `third-transition` | Transition movement after third shot |

### Kitchen Game / Dinking (5 skills) — *Intermediate rubric*

| Skill ID | Skill name |
|----------|------------|
| `kitchen-dink-consistency` | Dinking consistency (cross-court and straight) |
| `kitchen-dink-placement` | Dink placement & control |
| `kitchen-positioning` | Kitchen line positioning |
| `kitchen-patience` | Patience in dink rallies |
| `kitchen-reset` | Reset ability (neutralizing fast balls) |

### Volleys (4 skills) — *Intermediate rubric*

| Skill ID | Skill name |
|----------|------------|
| `volley-fh` | Forehand volley control |
| `volley-bh` | Backhand volley control |
| `volley-speedup` | Speed-up / punch volley |
| `volley-overhead` | Overhead smash |

### Movement & Athleticism (4 skills) — *Beginner + Intermediate rubrics*

| Skill ID | Skill name |
|----------|------------|
| `move-split` | Split step timing |
| `move-transition` | Transition (baseline to kitchen) |
| `move-lateral` | Lateral movement & recovery |
| `move-partner` | Partner coordination (doubles) |

### Game IQ & Strategy (4 skills) — *Advanced rubric only*

| Skill ID | Skill name |
|----------|------------|
| `iq-selection` | Shot selection under pressure |
| `iq-stacking` | Stacking & switching (doubles) |
| `iq-targeting` | Identifying & targeting opponent weaknesses |
| `iq-strategy` | Serve & return strategy |

### Mental Game (4 skills) — *Advanced rubric only*

| Skill ID | Skill name |
|----------|------------|
| `mental-consistency` | Consistency under pressure |
| `mental-recovery` | Error recovery & reset mindset |
| `mental-closing` | Closing out tight games |
| `mental-communication` | Communication with partner |

---

## Program presets (5 templates)

### 1. Open Play Ready

| Field | Value |
|-------|-------|
| **ID** | `open-play-ready` |
| **Name** | Open Play Ready |
| **Tagline** | Join open play with confidence |
| **Icon** | `users` |
| **Rubric** | Beginner (`beginner`) |
| **Sessions** | 4 |
| **Bundle price** | ₱2,500 / person |
| **Target level** | 2.0 to 3.0 |
| **Skills tracked** | 12 (beginner rubric) |

**Description:** Get comfortable on the court and join open play confidently. Perfect for players who know the rules but need consistency.

**Skills included:**

- **Fundamentals:** Grip & ready position · Stance and footwork basics · Court awareness & positioning · Scoring & rules knowledge
- **Serve & Return:** Serve consistency (legal, in-court) · Serve placement (depth, direction) · Return of serve depth · Return of serve placement
- **Movement & Athleticism:** Split step timing · Transition (baseline to kitchen) · Lateral movement & recovery · Partner coordination (doubles)

---

### 2. First Paddle

| Field | Value |
|-------|-------|
| **ID** | `first-paddle` |
| **Name** | First Paddle |
| **Tagline** | Brand new to pickleball |
| **Icon** | `target` |
| **Rubric** | Beginner (`beginner`) |
| **Sessions** | 4 |
| **Bundle price** | ₱2,200 / person |
| **Target level** | 2.0 to 2.5 |
| **Skills tracked** | 12 (beginner rubric) |

**Description:** Gentle intro for absolute beginners. Learn scoring, grip, and your first rallies in a structured 4-session path.

**Skills included:** Same 12 skills as **Open Play Ready** (beginner rubric).

---

### 3. Tournament Ready

| Field | Value |
|-------|-------|
| **ID** | `tournament-ready` |
| **Name** | Tournament Ready |
| **Tagline** | Compete with confidence |
| **Icon** | `trophy` |
| **Rubric** | Intermediate (`intermediate`) |
| **Sessions** | 12 |
| **Bundle price** | ₱7,000 / person |
| **Target level** | 3.0 to 3.5+ |
| **Skills tracked** | 17 (intermediate rubric) |

**Description:** Build real game skills, strategy, and mental readiness to compete. Third shots, dinking, and match play under pressure.

**Skills included:**

- **Third Shot:** Third shot drop consistency · Third shot drop placement · Third shot drive (as change-up) · Transition movement after third shot
- **Kitchen Game / Dinking:** Dinking consistency (cross-court and straight) · Dink placement & control · Kitchen line positioning · Patience in dink rallies · Reset ability (neutralizing fast balls)
- **Volleys:** Forehand volley control · Backhand volley control · Speed-up / punch volley · Overhead smash
- **Movement & Athleticism:** Split step timing · Transition (baseline to kitchen) · Lateral movement & recovery · Partner coordination (doubles)

---

### 4. Kitchen Mastery

| Field | Value |
|-------|-------|
| **ID** | `kitchen-mastery` |
| **Name** | Kitchen Mastery |
| **Tagline** | Own the NVZ |
| **Icon** | `kitchen` |
| **Rubric** | Intermediate (`intermediate`) |
| **Sessions** | 8 |
| **Bundle price** | ₱4,800 / person |
| **Target level** | 3.0 to 3.5 |
| **Skills tracked** | 17 (intermediate rubric) |

**Description:** 8 sessions focused on dinking, resets, and kitchen positioning. For players who rally well but lose points at the net.

**Skills included:** Same 17 skills as **Tournament Ready** (intermediate rubric).

---

### 5. Competitive Doubles

| Field | Value |
|-------|-------|
| **ID** | `competitive-doubles` |
| **Name** | Competitive Doubles |
| **Tagline** | Tournament doubles prep |
| **Icon** | `zap` |
| **Rubric** | Advanced (`advanced`) |
| **Sessions** | 12 |
| **Bundle price** | ₱9,000 / person |
| **Target level** | 3.5 to 4.5+ |
| **Skills tracked** | 33 (all categories) |

**Description:** Full advanced rubric with stacking, partner communication, and targeting weaknesses. For players chasing podiums.

**Skills included:** All 33 catalog skills across all 8 categories (Fundamentals · Serve & Return · Third Shot · Kitchen · Volleys · Movement · Game IQ · Mental Game). See [Full skill catalog](#full-skill-catalog) above.

---

## Quick comparison

| Preset | Rubric | Sessions | Price (₱) | Skills | Best for |
|--------|--------|----------|-----------|--------|----------|
| First Paddle | Beginner | 4 | 2,200 | 12 | Absolute beginners |
| Open Play Ready | Beginner | 4 | 2,500 | 12 | Ready for open play |
| Kitchen Mastery | Intermediate | 8 | 4,800 | 17 | Net game focus |
| Tournament Ready | Intermediate | 12 | 7,000 | 17 | Compete locally |
| Competitive Doubles | Advanced | 12 | 9,000 | 33 | Tournament doubles |

---

## Rubric-only defaults (not presets)

If a coach starts from a **base rubric** instead of a named preset, `draftFromRubric()` applies these defaults:

| Rubric | Default program name | Sessions | Price (₱) | Target level |
|--------|---------------------|----------|-----------|--------------|
| Beginner | Beginner Program | 4 | 2,500 | 2.0 – 2.5 |
| Intermediate | Intermediate Program | 8 | 5,000 | 3.0 – 3.5 |
| Advanced | Advanced Program | 12 | 8,000 | 3.5+ |

---

## Custom programs

| Field | Default |
|-------|---------|
| **Source** | `custom` |
| **Rubric ID** | `custom` |
| **Sessions** | 4 |
| **Price** | ₱3,000 |
| **Skills** | Coach picks from catalog, adds custom skills, or renames labels |

Custom programs start with **no skills selected**; the coach builds the checklist in the program create flow.

---

## DUPR level reference

Used elsewhere in the app for player/coach level labels (not preset-specific):

| DUPR | Label | Description |
|------|-------|-------------|
| 2.0 | Beginner | Just learning rules, basic strokes unreliable |
| 2.5 | Advanced Beginner | Basic consistency developing, limited strategy |
| 3.0 | Intermediate | Can rally, understands positioning, learning third shot |
| 3.5 | Solid Intermediate | Developing drops, dinking with control, basic strategy |
| 4.0 | Advanced Intermediate | Strong shot control, tactical awareness, resets |
| 4.5+ | Advanced / Expert | Tournament-level, elite strategy and consistency |

---

*Generated from PickleKoach codebase. Update this doc when changing `PROGRAM_PRESETS`, `SKILL_RUBRICS`, or `DEFAULT_SKILLS`.*
