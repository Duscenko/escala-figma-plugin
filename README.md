# Escala Figma plugin

Companion plugin for the [Escala Tokens configurator](https://escalatokens.com).
Imports the design tokens you build on the web into Figma — as Variables, Styles,
component stubs and icon components — and keeps them in sync.

**The web is the source of truth; this plugin is the bridge.** Systems are
authored in the configurator — that's where accent, neutrals, states, semantics,
typography, spacing and radius are decided — and the plugin's job is the one
thing the web can't do: write them into a Figma file. Nothing is generated here.

## Overview

The plugin opens on **Overview**: the system this file is connected to, read
from the last imported payload stored **inside this file** (`figma.root`'s
plugin data — see "Per-file vs per-user state" below; no network call). It
shows the project name, the accent ramp, typeface, semantic architecture, theme
list and when the last import ran, plus the three ways forward — **Edit on the
web** (`figma.openExternal`, https only), **Live Sync**, and **Import into this
file**.

A file with nothing connected shows the empty state instead: build the system on
escalatokens.com, or load a `tokens.json` you already have. Overview is
read-only by design — every control that changes a value lives on the web, so
the two can't disagree.

### "In this file"

Below the system card, a checklist of what this document actually **contains**:
Cover, Documentation, Components Overview, Icon library, plus the local variable and
collection counts. It comes from `reportFileAssets()` in the sandbox — page
names off `figma.root` and a variable count, no `loadAsync`, so it's cheap
enough to run on every open and after every import.

This exists because Overview described the SYSTEM but never the FILE, and those
two diverge in one very reachable state: **a file that has only ever Live-Synced
has variables but no pages**, since a sync refreshes variables and never builds
pages (see Live Sync below). There was no way to notice — reported as "the
plugin isn't showing me Cover / Documentation / the sample sheet when it syncs".

When a required page is missing the panel says so, names the cause, and offers
**Build them**, which imports exactly the missing pieces from the payload
already stored in this file (so it works straight from Overview with nothing
loaded in the Source step). Two deliberate details:

- It **ignores the Import scope checkboxes.** Those record what the last
  explicit import chose to write, and a file with missing pages is usually a
  file whose boxes are off — honouring them would make a button labelled
  "Build them" do nothing.
- **Icon library is listed but never counted as missing.** It's off by default
  and genuinely optional; nagging about it would train people to ignore the
  panel.

The list is re-read from the sandbox after every run rather than inferred from
the run's own summary — a phase can fail and the import still finish (see the
`phase` helper), so intent is not evidence.

## What it imports

Variables are split into **one Figma collection per category** (instead of one
big collection with name-prefixed groups). Color gets two collections —
primitives and semantics.

| tokens.json section | Figma collection | Variables |
|---|---|---|
| `colors.primitive` | **Color Primitives** | COLOR variables grouped by family — `Accent/*`, `Neutral/*`, `State/{Error,Success,Warning,Info}/*`, plus any custom family. Legacy `brand-*`/`gray-*` keys still group into `Accent`/`Neutral`. **Variables only — no color paint styles** (legacy `<project>/Scale/*` and `<project>/Semantic/*` paint styles from older imports are removed). |
| `colors.primitiveAlpha` | **Color Primitives** | Alpha-twin COLOR variables (`#rrggbbaa`, Radix custom-palette architecture) under `<Family>/Alpha/*` — the overlay color that reproduces each solid step over `colors.background` |
| `colors.background` | **Color Primitives** | `Background` COLOR variable — the page background every ramp was generated against |
| `colors.themes` (light / dark / custom) + `colors.architecture` | **Color Semantics** | The system's semantic tier, **one collection**, always under this name. Its CONTENT is the architecture the user picked when the payload carries one — Astryx's `Accent/*`, `Background/*`, `Text/*`, `Icon/*`, `Status/*`, `Utility/*`, `Border/*`; Categorical's `Content/*`, `Action/*`, `Surface/*`, `Status/*`, `Border/*` with nested keys as `/` groups (`Action/primary/default`, never a `.` — Figma rejects dots in variable names) — and the flat role catalogue (`background/*`, `content/*`, `border/*`; v2 `bg/*`/`fg/*` still import) only when it doesn't. **One mode (column) per theme**, ordered by `colors.themeOrder`. Variables only — no paint styles. |
| `colors.panelBackground` | **Color Semantics** | `panel-background` STRING variable (`solid` / `translucent` / `page`) — Radix-style surface-1 treatment |
| `typography` | **Typography** | `size/*`, `weight/*`, `family`, `heading-family`, `line-height/*`, `letter-spacing/*`, plus v6 `role/{key}/{size,weight,family}` aliases (+ one text style per size **and** one per semantic role, bound to those variables) |
| `spacing` + `spacingRoles` | **Spacing** | Numeric steps land as `step/{key}` (`step/1` … `step/16`) because a variable name cannot start with a digit; padding is `padding/{top,right,bottom,left}`; roles are `role/{key}` aliases |
| `padding` | **Spacing** | `padding/{top,right,bottom,left}` FLOAT variables — per-side surface padding |
| `radius` + `radiusRoles` | **Radius** | `{key}` FLOAT primitives + `role/{key}` aliases |
| `stroke` + `strokeRoles` (or `borders.width`) | **Border** | Stroke steps (`none`/`sm`/`md`/`lg`) + `role/{divider,control,focus}` aliases. `borders.width` is the v5 fallback the configurator still emits as a copy of `stroke` |
| `opacity` | **Opacity** | `{key}` FLOAT variables (0–1 ratio) |
| `sizes` + `sizeRoles` | **Size** | `{key}` FLOAT primitives + `role/{compact,control,touch,hit,fab}` aliases |
| `grid` + `breakpointRoles` | **Grid** | `{key}` FLOAT variables (+ a column Grid Style); breakpoint roles alias `breakpoint-{step}` |
| `shadows` (+ `shadowsDark`) | — | Effect Styles (multi-layer drop shadows); a differing dark CSS becomes `… (Dark)` |
| `icons.library` | **Icons** | `library` STRING variable, **plus** the library's core UI glyphs (~95 across navigation, actions, communication, people, media, files, status, commerce, security, tech and layout) fetched from the Iconify API and generated as `icon/<library>/<name>` **variant sets — Size: Large 24 / Medium 20 / Small 16** — on "⬡ Icons", tinted with the `text/primary` variable so they re-theme. Works for Lucide, Heroicons, Phosphor, Radix and Material Symbols; needs network access to `api.iconify.design` (declared in the manifest) — without it, the import logs a warning and continues. Loose single-component icons from older imports upgrade in place to the Large variant. |
| `icons.custom` | — | Components on the "⬡ Icons" page (kept untinted — brand marks may be multicolor) |

> **The icon components are OFF by default.** They have their own "Icon
> library" tick in the import scope, unchecked. Generating them is 117 sets ×
> 3 sizes = 351 SVG components plus an Iconify network fetch — the second
> slowest phase after the old component catalogue, and it used to be forced on
> by the Components tick. The `icons.library` token still ships as a variable
> either way; the checkbox only controls generating the components.

The "⬡ Icons" page is laid out like the Components Overview boards: an editorial doc
panel (breadcrumb, intro, SPECS, FEATURES, insert hint) wrapped in a
Documentation-style board, a black title bar, and the glyphs inside framed
auto-layout cards — one card per library (switching families starts a new
card and keeps the old one intact) plus a Custom Icons card. Whenever the
plugin opens and after every import — even a failed one — the foundation
pages are promoted to the top of the page list: **⬡ Cover, ⬡ Documentation,
⬡ Components Overview, ⬡ Icons**.
| `copy` | **Copy** | `{key}` STRING variables, bound to stub text — *plugin-ready; not yet emitted by the configurator* |
| `atoms` | — | Read only to gate which component pages are generated. The Components Overview sheet is a fixed specimen and is not gated on it |

> **The theme columns and the semantic tokens mirror the payload — including
> what it no longer has.** Every import renames the default mode to the first
> theme/mode of the payload, then **removes any other mode of Color Semantics
> whose name the payload doesn't carry**, and likewise removes any variable in
> that collection this run didn't write. Without it, a theme deleted or renamed on the web kept its column
> forever, and a re-added theme landed in a fresh column Figma seeds by copying
> the default mode — which is what "Figma shows themes I don't have any more,
> and they repeat" was. Pruning runs *before* the missing modes are added, so a
> freed stale column also frees room under the plan's mode cap. Both prunes are
> scoped to the one collection this import fully owns and rewrites on every run; a
> variable Figma refuses to delete (still bound somewhere) is left in place
> rather than failing the import.

> **The order is the platform's order, and keeping it costs a rebuild.**
> Figma has **no reorder API** — a collection's `variableIds` is readonly, so a
> variable's position (and therefore its GROUP's position, which is just its
> first member's) is fixed at creation and never changes. Upserting kept
> existing variables where they were and appended the rest, so switching
> architecture pinned the handful of names two vocabularies share where the old
> system had put them: measured on the live `Jasdy` payload, going Astryx →
> Categorical left `Border/default`, `Border/strong` and `panel-background`
> stranded at the top and Figma showed `Border → panel-background → Content →
> Action → Surface → Status → Border` — the Border group first *and* last.
> So the import now plans the whole collection (names, order, values) before
> writing anything, compares that order against the collection's actual one,
> and on any mismatch **drops the variables and recreates them in order**. In
> order it does nothing, so a steady-state sync never churns.
>
> **A rebuild invalidates every binding in the file** — the variables the
> components and boards pointed at were deleted — so the import **escalates
> itself**: `semanticsRebuilt` (code.ts) switches Components, Cover and
> Documentation on for that run even when the caller (a Live Sync pass) asked
> for Variables + Styles only. That's what makes changing the architecture on
> the web recalibrate the whole file instead of leaving it painted in dead
> colours. Icons are deliberately not escalated: the phase costs 351 components
> plus a network fetch and skips existing sets anyway — re-run Import with the
> Icon library ticked when the icon tint needs to follow.
>
> **What this does NOT reorder: the theme columns.** Modes have no reorder API
> either, and the only way to reorder them is to delete and re-add — which
> silently drops any frame pinned to a mode with
> `setExplicitVariableModeForCollection`. Reordering themes on the web
> therefore doesn't reorder the columns here; new themes are appended on the
> right, removed ones are pruned.

> **One design system per Figma file.** Collection names are plain (no project
> prefix), so importing two different systems into the same file would merge their
> collections. Model appearance variants (light / dark / custom) as **themes**,
> which the plugin materializes as **modes (columns) inside Color Semantics** — not
> as separate systems. The first import into a file that still has the old single
> `<project>` collection removes it automatically — as it does the collections
> earlier builds created and this one doesn't: the per-architecture ones
> (`Astryx`, `Categorical Semantic`, `shadcn/ui`, `IBM Carbon`, `Contextual
> Vibrancy`, `Material Tonal`) and `Components`. See **One semantic tier** below.

## Components Overview

A single **"⬡ Components Overview"** page showing the tokens on real components — nine
elements, ~82 variants, every fill / stroke / radius / spacing / text bound to
the imported variables (semantics → primitives):

| Set | Variant axes on the sheet | Variants |
|---|---|---|
| Button | Color × Style × State | 36 |
| Badge | Style × Color | 18 |
| Status Badge | Status | 5 |
| Avatar | Size | 5 |
| Checkbox | Checked × State | 4 |
| Toggle (Switch) | On × State | 4 |
| Toast | Status | 4 |
| Input | State | 4 |
| Select | State | 2 |

**Every element sits inside its own board** — the same grammar the
"⬡ Documentation" chapters use: a rounded slab opened by a tinted section bar,
holding that element's handoff panel (breadcrumb, intro, SPECS bullets derived
from the real variant matrix, FEATURES chips, insert hint) and its component
set. Boards stack down the page, so it reads as a run of self-contained
specimens. Doc chrome is fixed light; the specimens are what re-theme.

> This replaced a layout where the panel, a black header bar and the set were
> loose siblings positioned absolutely on the page. Two things were wrong with
> it on a real import: nothing was *contained* — the parts floated on the
> canvas — and Figma draws a component set's own name label ABOVE its bounds,
> so that label collided with the header bar sitting directly on top of it.
> The board's section bar is the header now; there is no second bar.
>
> **Consequence worth knowing:** sets live inside `docs/…` boards, and
> `harvest()` deletes those boards on re-import to rebuild them. It therefore
> **rescues any component set out of a board before removing it** — dropping a
> board with the set still inside would delete the set and break every instance
> placed from it. If you change the board structure, keep that rescue.

> **Why this replaced a 58-component library.** The plugin used to generate the
> configurator's whole catalogue: 58 sets, **~1403 variants across 63 pages**
> (Button alone was Size × State × Color × Style × Icon = 864, built in one
> synchronous pass). That locked Figma up on every import — and because Live
> Sync re-ran the *same* full import on every token change, it locked up again
> on every edit. Escala is a token generator: the components exist to show what
> the tokens look like, not to be a component library, so the sheet mirrors the
> configurator's own Color preview panel instead.
>
> The sheet reuses the catalogue's specs and builders and only **filters** the
> variant matrix (`SAMPLE` + `sampleSpec` in `code.ts`), so there's no second
> rendering path to keep in sync — a fix to `buildButton` still lands here.
> Axes that collapse to one value (Size, Icon) are stripped so Figma's variant
> panel doesn't show single-option dropdowns. `CATALOG` and the 49 specs it
> references are kept in the file, unwired, for reference — don't wire them
> back up without re-measuring the freeze.

Unlike the old catalogue, the sheet is **not** gated on the payload's `atoms`:
it's a fixed specimen of the token system, not a selection of the user's
components, so an empty selection still gets a sheet. Sets that lived on the
previous generation's pages ("⬡ Components", "   ↳ Button"…) are harvested and
**moved** onto the sheet on re-import, so placed instances keep working. Those
now-empty pages are left in place — deleting a user's pages is destructive and
irreversible; remove them at your own pace.

## Cover page

The import (option "docs") rebuilds a "⬡ Cover" page — a single 1600×900 hero
frame that opens the file: project name set in the system's heading typeface,
color-family / theme / component stats, and a background painted with the
gradient assigned to **cover** in the configurator's Gradient foundation
(falling back to a brand gradient built from the accent ramp). The frame is
also set as the file thumbnail (best-effort, plan-dependent).

## Documentation boards

The same "docs" option rebuilds a "⬡ Documentation" page laid out as light
editorial spec-sheet **boards — one top-level frame per segment**, side by side
across the canvas so each chapter can be browsed, linked and presented
independently:

1. **Overview** — black brand bar (project + version), intro column
   (breadcrumb / title / description), primitive-palette facts, and an ink panel
   with variable/theme stats.
2. **Primitive Colors** — the raw ramps per family.
3. **The semantic colors** — one card per group of whatever `Color Semantics`
   actually holds: the architecture's own groups when the system is on one
   (`Astryx Semantics → Accent · Background · Text · Icon · Status · Utility ·
   Border`), otherwise the flat catalogue's **Brand Colors → Primary** ·
   **State Colors → Error / Success / Warning / Info** · **Foundation Colors →
   Background / Text / Icon / Border**. Each card shows a description, the
   token scale as a color strip, and a spec table
   `TOKEN NAMES | PRIMITIVES | HEX` for the first mode plus a black panel with
   the dark mode's primitives and hex values. Documenting the flat roles for a
   file whose collection holds a different vocabulary would be a spec sheet for
   tokens that aren't there.
4. **Typography**, **Spacing**, **Border Radius**, **Borders**, **Opacity**,
   **Shadows** and **Grid & Sizes** — one specimen board each.
5. **Gradients** — the configurator's named gradients as swatches, tagged with
   their surface assignment (`cover` / `avatar`).

Swatches and specimens are bound to the imported variables (switch the page's
variable mode to preview themes); the board chrome itself is fixed light so the
docs stay readable in every mode.

Every payload carries a `schemaVersion` (currently `4` — every primitive family
ships a real dark twin: `accent-dark-*`, `error-dark-*`, `warning-dark-*`,
`success-dark-*`, `info-dark-*` and their `*-a*` alpha twins, alongside the v3
readable semantic taxonomy `surface-*` / `action-*` / `status-*` / `icon-*` plus
`primitiveAlpha`, `background`, `panelBackground`, `padding` and the
non-breaking `gradients` / `gradientAssignments` maps); the plugin imports
forward-compatibly and logs a warning when the payload is newer than it supports.
Newer payloads may also carry `colors.semanticArchitecture` and a
`colors.architecture` projection (the configurator's Alias/Semantics picker) —
both additive, so the flat `colors.themes` shape always ships regardless of
which architecture is active and older plugin builds degrade gracefully.

### One semantic tier

**There is exactly one semantic collection in the file, it is always called
`Color Semantics`, and what's inside it is the contract the platform says the
system is on.** If the payload carries a `colors.architecture` projection
(Astryx — the default for every new system — shadcn/ui, Categorical, IBM
Carbon, Contextual Vibrancy, Material Tonal), that architecture ships verbatim:
its own groups, its own token keys, its own modes. Only a system with no
architecture gets the flat 39-role catalogue.

Earlier builds shipped **both**: the flat catalogue in `Color Semantics` *and*
the architecture in a collection named after itself. Two competing vocabularies
for one system, one of them labelled with a platform-side name a designer
opening the file has no way to decode. There is also no longer a `Components`
collection (one variable per component slot, each a 1:1 alias of the role
behind it): tracing a design system component by component is what semantic
roles exist to make unnecessary, and the tier carried no information of its own
while doubling the names to learn. **Components bind straight to the semantic
roles.**

What this costs, stated plainly — for **carbon / vibrancy / tonal** the columns
are now the architecture's own fixed modes (Carbon's four themes; light/dark
for the other two) instead of the user's theme list, because those three define
their modes as part of their contract. For **astryx / shadcn / categorical**
the projection resolves per user theme, so the columns are the user's themes,
unchanged.

#### How a component finds its colour

Everything downstream — generated components, documentation boards, the icon
tint — asks for colours by FLAT ROLE NAME (`background-brand-solid`,
`content-primary`). `semLookupFor` (`code.ts`) is the single place that
translates, in this order:

1. **the architecture's own token for that role** — `ARCH_ROLE_MAP`, curated
   and exact (`background-brand-solid` → Astryx `Accent/solid`, or Categorical
   `Action/primary.default`);
2. **the flat name** (`semanticVarName`) plus any legacy aliases the caller
   passes — the whole story for a system with no architecture;
3. **the variable in the collection whose colour equals the role's colour** —
   the architecture is projected from the same ramps, so an unmapped role's
   tone is usually sitting there under another name. Binding to it re-themes
   correctly; a raw hex never does.

Measured on real payloads: **Categorical** — mapped roles resolve to the nested
contract Figma actually holds (`Action/primary.default`, `Content/on-action`,
`Status/critical.content`, `Border/strong`, …), not the pre-v51 flat keys
(`action/primary`, `status.critical-bg`). **Astryx** — 16/16 mapped roles
resolve, 16 bind by name, 14 by colour, 9 have no equivalent
(`content-tertiary`, `border-error`, `content-error/warning/success`…: Astryx
has no ink token for those, and mapping them onto its vivid `status.*` FILLS
would reintroduce the contrast bug the configurator's history documents fixing
twice). Those last ones paint the system's own value as a plain fill — right
colour, no variable — and the import logs the count rather than leaving it to
be found by clicking a layer.

`ARCH_ROLE_MAP` stays deliberately conservative: only unambiguous role pairs,
**never a text/ink role mapped to an architecture concept that's a FILL**.
Extending it means reading the target architecture's actual role table
(`semanticArchitectures.ts` in the web repo) first, not extrapolating from a
neighbouring entry. Its group/key targets are verifiable against that file —
all three curated maps were checked against it, every target exists.

Imports are idempotent: re-running updates existing variables/styles in place and
skips existing icon components so placed instances stay intact.

**Update now** — next to the interval dropdown — runs the same check on demand,
whether or not the timer is running, and restarts the interval from that moment
so it doesn't leave a redundant tick a second behind. It goes through the same
hash check: nothing published since the last check reads "Up to date" instead of
rewriting the file. The interval is a ceiling on staleness, not a queue to wait
in.

### Which JSON the import accepts

The configurator's Export wizard writes `<slug>.tokens.json` in **two different
shapes** under the same filename:

- **Escala JSON** — the payload this plugin is built for (`{ project, colors,
  typography, … }`, `schemaVersion`). Everything imports: variables, styles,
  components, docs.
- **W3C DTCG** — the interoperable tree (`{ color: { accent: { 1: { $value } } },
  semantic: { light: { … } }, typography, spacing, … }`). The Source step
  **converts it** (`adaptTokens` / `fromW3C` in `ui.html`): `color.<family>.<tone>`
  → `primitive['<family>-<tone>']`, `semantic.<theme>.<role>` → `colors.themes`,
  with `{color.accent.9}` aliases resolved back to hex against the primitives in
  the same file. A W3C file carries **no `atoms` and no `style`**, so no
  components are generated — the Activity log says so, and names any collection
  the export left out. An unresolvable alias (a semantics-only export with
  aliases on, whose primitives aren't in the file) drops that role, and the log
  counts them.

Anything else fails with what the file *is* rather than which field it lacks —
the old `Missing "colors" field` named an Escala field the user had never
chosen to omit.

## Live Sync

The Live Sync tab polls a **project-scoped** URL from the configurator
(`https://www.escalatokens.com/api/tokens?project=<slug>`). Paste it from the
Figma sync screen — the field starts empty on purpose. A bare `/api/tokens`
URL (no `?project=`) is rejected by the server. Refresh happens only when the published
payload actually changes (content hash, derived from this file's own record).
Interval and import options survive closing the plugin in any file
(`clientStorage`); the URL and whether sync is running are remembered **per
file** instead (`figma.root`'s plugin data) — sync resumes on reopen only in
the file that started it. See "Per-file vs per-user state" below for why.

> **A sync refreshes VARIABLES and STYLES — never pages.** It used to post the
> same option set the Import button does, so every token edit rebuilt the
> component pages, wiped and regenerated the whole Documentation page, and
> re-ran the icon phase: minutes of frozen editor to produce identical nodes.
>
> That work is unnecessary because everything the plugin generates is
> **variable-bound** — fills and strokes via `setBoundVariableForPaint`, corner
> radii, padding / itemSpacing, and every text property. Updating the variables
> re-themes every instance already placed in the file, which is the entire
> point of importing them as variables. Styles ride along because they're cheap
> (no pages, no nodes) and text / shadow styles genuinely change with the
> tokens.
>
> What a sync deliberately does **not** pick up: newly added elements, and the
> two things that aren't variable-bound — the focus-ring drop shadow
> (`focusRing()`, a raw hex) and the Documentation page's own chrome (fixed
> light by design). Re-run **Import into Figma** for those.

The scoped URL syncs one design system. Paste it from the configurator
(`…/api/tokens?project=<name>`) — each system publishes to its own key, so
syncing one never picks up another's tokens.

### The sync bridge, precisely

There is no account or login system anywhere in this pipeline — not in the
configurator, not in the plugin. Durable save is GitHub (the editor snapshot
in `.escala/system.json`). `/api/tokens` is a **live-sync cache**: the
configurator `POST`s from the hosted origin with a per-slug publish claim; the
plugin `GET`s the scoped URL on a timer, unauthenticated. Anyone with the
scoped URL can read the payload — that's how the plugin can sync from inside
Figma's sandboxed iframe. It is not a backup.

**GitHub is a separate, one-way path and the plugin never touches it.** The
configurator has its own "Save to GitHub" flow (`src/lib/github.ts`,
`GitHubConnectView.tsx` in the web repo): the designer pastes a GitHub Personal
Access Token (kept in the browser's `localStorage` only, never sent to
`/api/tokens`), and the configurator pushes `tokens.json` + `variables.css` +
`README.md` straight to their repo via the GitHub REST API. That's it — a
backup/versioning export FROM the web app TO GitHub. Nothing pulls the other
way: this plugin's `manifest.json` only allowlists `escalatokens.com` (plus
`scalable-designs.vercel.app`, the configurator's prior address, kept for
installs still synced to that URL) and `api.iconify.design`, so it has no way
to reach `api.github.com` or `raw.githubusercontent.com` even if it wanted to.

So there are exactly two ways tokens get from the configurator into Figma:

1. **Live Sync** — the public `/api/tokens` URL above, polled automatically.
2. **A `tokens.json` file, dropped or pasted into the Source step** —
   downloaded manually from the configurator's Export view, or from wherever
   it ended up (including a GitHub repo, if "Save to GitHub" was used) — the
   plugin only ever reads a URL or a JSON blob, it doesn't know or care where
   that JSON came from.

If a setup can reach `escalatokens.com` from inside Figma, (1) is
the low-effort choice — no file to manage. If it can't (network policy, an
offline/air-gapped file, etc.), (2) with a repo as the source of truth is a
reasonable substitute, but it's a manual step on each side (commit tokens.json
on the web → pull/download it → drop it in the plugin) — there is currently no
automatic bridge from a GitHub repo to the plugin.

## Export

The Tokens tab's **Export from this file** card goes in the reverse direction
— Figma → JSON:

- **Figma variables** — serializes every **local variable collection** in the
  current file (collection → modes → variables with per-mode values) to
  `<file>.variables.json`. Colors export as hex (`#rrggbbaa` when alpha < 1);
  aliases resolve to their concrete value and record the target in `aliasOf`
  — including aliases into team-library variables, which are fetched by id.
  Works in **any file**, whether or not it was built by this plugin.
- **tokens.json** — downloads the configurator payload as
  `<project>.tokens.json`: the tokens loaded in this session, or otherwise the
  last payload the plugin imported into **this file** (persisted in the file
  itself, so it survives closing the plugin — but not switching to another
  file, on purpose). Import that file in the configurator to sync manually
  when Live Sync isn't available, or hand it to a teammate.

## Development

```bash
npm install
npm run build     # esbuild → dist/
npm run watch
```

Load in Figma: **Plugins → Development → Import plugin from manifest…**

The web repo bundles this plugin for download with `npm run bundle:plugin`
(run it after every plugin change so the zip the configurator serves stays current).

## Publishing checklist (Figma Community)

Code requirements — already in place:

- [x] `documentAccess: "dynamic-page"` (required for new plugins)
- [x] `networkAccess.allowedDomains` declared with reasoning
- [x] No deprecated sync APIs (`getLocalVariables`, `figma.currentPage = …`)
- [x] UI follows the editor theme (`themeColors: true`)
- [x] No console noise; errors surface in the plugin log

To do in the publish flow (Figma → Plugins → Publish):

- [ ] Icon 128×128 px
- [ ] Cover art 1920×960 px
- [ ] Name, tagline (≤ 60 chars), description (what it does, how to use, link to configurator)
- [ ] Tags: design tokens, design system, variables, sync
- [ ] Support contact
- [ ] Playground file showing an imported token set
- [ ] Figma replaces the manifest `id` with an assigned one automatically

## QA pass before each release

1. Empty file → default import → exactly **three** pages: ⬡ Cover,
   ⬡ Documentation, ⬡ Components Overview. No "❖ Category" / "   ↳ Component" pages, no
   ⬡ Icons (that tick is off by default)
2. Re-import same tokens → no duplicates, values updated in place
2b. Variables-only file (sync into a fresh file, never imported) → Overview's
   "In this file" flags Cover / Documentation / Components Overview as missing;
   **Build them** creates exactly those three and the flag clears — even with
   the Components Overview and Documentation scope boxes unticked
3. Tokens with custom themes → one mode per theme; on Starter plan the mode
   limit is logged and skipped gracefully
4. Token font not installed → falls back to Inter without failing
4b. System on Astryx (the default) → import → **one** collection named
   `Color Semantics`, holding Astryx's own groups (Accent · Background · Text ·
   Icon · Status · Utility · Border), no `Astryx` collection and no
   `Components` collection anywhere; the log reads "Semantic tokens — Astryx
   architecture (…)" plus a "Removed …" line for each of those on a file
   imported by an older build. The Button's solid fill matches the web
   preview's and is bound to `Accent/solid`. Switch the file's mode to another
   theme → the sheet re-themes. Re-import a system on Flat → the collection
   holds the flat `background/*`·`content/*`·`border/*` roles instead, same
   name.
5. Live Sync: start → change a colour on the web → the Log shows **only**
   Variables and Styles (no page rebuild) and the Components Overview re-themes;
   stop/reopen plugin → sync resumes; bad URL → error counter, timer keeps
   running
5b. Live Sync running → change the **semantic architecture** on the web → the
   next check logs `↻ "Color Semantics" rebuilt in the platform's order` and
   `↻ Recalibrating: Components, Cover, Documentation`, the groups come back in
   the platform's order, and the sheet's fills are bound to the NEW variables
   (click a Button fill → it shows a variable, not a raw hex). Sync again with
   nothing changed → no rebuild line, no page work
5c. **Update now** with sync stopped → one check runs; with sync running →
   check runs immediately and the next automatic one is a full interval later
6. Live Sync started in file A → open a brand-new file B → Overview shows "No
   system connected," Live Sync is Not active, URL field is the plain default
   (not file A's project) — B must never auto-sync from A's connection
7. "Reset this file" → click once (arms, red "Click again to confirm"), wait
   4s → disarms back to normal; click twice within the window → stops any
   running sync, Overview returns to the empty state, URL resets to default —
   and file A (or any other open file) is unaffected
8. Editor light theme → UI readable (no dark-on-dark / white-on-white)
9. **During a full import, Figma stays usable** — scroll, switch pages, open
   menus. A frozen editor is a release blocker, not a nitpick (see below).
10. Progress bar advances through every phase and disappears on completion;
    offline mid-import → the phase fails, the run still finishes and reports.

## Per-file vs per-user state

`figma.clientStorage` is scoped to **the user, across every file** they open
with the plugin — it's Figma's own semantics, not a bug. It's the right tool
for a genuine preference (check interval, import scope, whether the guided
walkthrough was completed) but the WRONG tool for "what system is this file
running": a brand-new empty file used to inherit whatever was last imported
anywhere else, so Overview could show a system, an accent ramp and a "last
import" time that had never touched that file. Export "from this file" had the
identical bug one click over. Worse, a fresh file with Live Sync's `autoStart`
already on could fetch its first real payload, hash-compare it against a
STALE hash left over from a different file, decide "up to date — no changes,"
and silently import nothing at all.

Fixed by moving anything that describes THIS file's own state — the last
imported tokens, when that import happened — off `clientStorage` and onto
`figma.root.getPluginData`/`setPluginData` (`FILE_TOKENS_KEY` in `code.ts`),
which lives **inside the .fig document itself** and is therefore naturally
scoped to one file. `lastHash` (the Live Sync dedupe check) is no longer
persisted on its own at all — it's derived client-side from that same
per-file record on load, so it can never drift from what the file actually
has. `setPluginData` caps a single entry at 100KB; an unusually large system
that exceeds it logs a warning and degrades to "won't be remembered after the
file is closed," never a wrong answer.

**Follow-up bug, same root cause: the sync CONNECTION was still user-scoped.**
`FILE_TOKENS_KEY` fixed "what's imported into this file," but the URL and
`autoStart` flag were left in `clientStorage` under the reasoning above — "a
sync URL/interval is something someone sets once and reasonably expects in
every file." That reasoning was wrong for the URL specifically: it names
*which design system* this file talks to, which is exactly the kind of
per-file identity `FILE_TOKENS_KEY` already existed to protect. In practice,
opening a brand-new file would immediately resume Live Sync against whatever
project a *different* file had last synced, because `autoStart && url` were
read from the same global blob on every boot — the new file never made that
choice, it just inherited it.

Fixed the same way: `url`/`autoStart` moved to their own file-scoped record
(`FILE_SYNC_KEY` in `code.ts`, written by `saveFileSync()` in `ui.html` on
every start/stop/URL change). A file with no record at all — including every
brand-new file — shows the plain default URL and never auto-resumes; Live
Sync only resumes in the exact file that started it. `clientStorage` now only
holds genuine cross-file preferences: interval, import scope, guide-seen.

**The user also needs a clean way out**, independent of this fix: **Overview →
Live Sync card → "Reset this file"** (two clicks — Figma plugin UIs can't use
`alert`/`confirm`, so the button arms itself instead of popping a dialog)
clears both `FILE_TOKENS_KEY` and `FILE_SYNC_KEY` for the current document,
stopping any running sync first. It only ever touches the current file —
`clientStorage` preferences and every other file's connection are untouched.

**Rule when adding new persisted state:** ask "does this describe the FILE, or
the USER's preferences across every file?" before picking a storage API. A
value that *identifies* something (which system, which URL) almost always
belongs to the file; a value that's purely about how the tool behaves (how
often, which phases) belongs to the user. Get it backwards and the failure
mode is silent and confusing — a value that's simply true about the wrong
file.

## Staying responsive

Plugin code runs on **Figma's own thread**: a long synchronous stretch freezes
the whole editor — no scrolling, no page switching, not even closing Figma. The
import builds thousands of nodes, so it explicitly hands the thread back
(`yieldToUI()`, a real `setTimeout(0)` macrotask — `await`-ing a resolved
promise only drains microtasks and never lets the host paint) after every
component set, every documentation board, and every few icons, plus between
phases.

Two rules follow from this, and both are load-bearing:

- **Never add a long synchronous loop to an import phase without a yield.**
- **Never `fetch` without a timeout.** The sandbox has no `AbortController`, so
  `fetchWithTimeout` races the request against a timer; the UI side uses a real
  `AbortController` in `fetchJson`. A hung request used to stall the import
  forever, and because the UI only clears `importInFlight` on `done`/`error`,
  that also silently disabled Live Sync for the rest of the session.

The UI additionally runs a 30s stall watchdog: any log or progress message from
the sandbox counts as proof of life, and if nothing arrives it surfaces a Reset
that releases `importInFlight` so sync can resume. It's an escape hatch, not a
cancel — a running sandbox job can't be interrupted.
