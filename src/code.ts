// ─── Types ───────────────────────────────────────────────────────────────────

interface ColorScale { [key: string]: string }

interface DesignTokens {
  schemaVersion?: number                     // tokens.json contract version (configurator: TOKEN_SCHEMA_VERSION)
  project: string
  colors: {
    primitive: ColorScale
    // Alpha twins of the light-appearance primitives (#rrggbbaa), derived
    // against colors.background (Radix custom-palette architecture). Same
    // prefixed keys as `primitive` (accent-1 … accent-12).
    primitiveAlpha?: ColorScale
    // The page background every ramp was generated against and every alpha
    // twin composites over.
    background?: string
    semantic: Record<string, string>
    semanticDark?: Record<string, string>   // dark-mode values, same keys as semantic
    themes?: Record<string, Record<string, string>>  // full multi-theme map (light/dark/custom)
    themeOrder?: string[]                    // column (mode) order for the themes above
    // Radix-style panel treatment for surface-1 (cards, panels, sections).
    panelBackground?: 'solid' | 'translucent' | 'page'
    // The user's CHOSEN reading of the token system (Alias/Semantics picker) —
    // additive, alongside `semantic`/`themes` above, which stay the flat 39-role
    // catalogue that reading projects FROM. Absent entirely for 'flat' (the
    // configurator's projectArchitecture returns null for it).
    //
    // Read in TWO places, for two different jobs:
    //  - normalizeArchitecture ships the architecture's own groups/keys/modes
    //    as the CONTENT of "Color Semantics", so Figma shows the contract the
    //    user picked and nothing else. All six kinds.
    //  - ARCH_ROLE_MAP translates the flat role a generated component asks for
    //    ('background-brand-solid') into the architecture's own token
    //    ('Accent/solid'), so the component layer binds to the collection that
    //    actually exists. Curated kinds only; anything it doesn't cover falls
    //    back to matching the role's colour (see semIndex in importSample).
    //
    // Typed loosely (`unknown` + an index signature) rather than as a union on
    // purpose: the six kinds carry four genuinely different payload shapes —
    // curated/carbon `tokens[group][key][mode]`, vibrancy's mode-FIRST
    // `tokens[mode][group][key]` of raw CSS, and tonal's `{ palettes, scheme }`
    // with no `.tokens` at all — and every read is guarded by `kind`.
    architecture?: { kind: string; tokens?: unknown; [key: string]: unknown }
  }
  typography: {
    fontFamily: string
    headingFontFamily?: string               // separate heading typeface
    sizes: Record<string, string>
    weights: Record<string, number>
    lineHeights?: Record<string, string>     // px or unitless ratio
    letterSpacings?: Record<string, string>  // px or em
    // v6: semantic type roles. Each aliases a family + size + weight primitive
    // (desktop / mobile). The plugin materializes desktop as role/{key}/*
    // variables and one text style per role.
    roles?: Record<string, {
      desktop: { family: string; size: string; weight: string }
      mobile?: { family: string; size: string; weight: string }
    }>
  }
  spacing: Record<string, string>
  // v6: role → primitive step (inset-surface → "5"). Aliases in the same
  // collection, nested under role/.
  spacingRoles?: Record<string, string>
  // Per-side surface padding (top/right/bottom/left) for padded surfaces
  // (cards, tiles, panels).
  padding?: Record<string, string>
  // Named gradients (slug → CSS gradient string) and which one drives each
  // preview surface (cover art, avatars). Emitted by the configurator's
  // gradient foundation; the cover page and docs render them.
  gradients?: Record<string, string>
  // The dark appearance, keyed by the SAME slugs. Always complete: the
  // configurator resolves a gradient with no dark override to its light CSS,
  // so a value equal to `gradients[slug]` means "no dark variant", not "no
  // value" — which is why importStyles only creates a second paint style when
  // the two actually differ.
  gradientsDark?: Record<string, string>
  gradientAssignments?: { cover?: string | null; avatar?: string | null }
  radius: Record<string, string>
  radiusRoles?: Record<string, string>
  // v6 stroke primitives (none/sm/md/lg). `borders.width` is the v5 name the
  // configurator now also emits as a copy, so an older plugin still creates
  // the Border collection.
  stroke?: Record<string, string>
  strokeRoles?: Record<string, string>
  borders?: {
    width: Record<string, string>            // e.g. { default: "1px", thick: "2px" }
  }
  opacity?: Record<string, string>           // "0"–"100" → "0%"–"100%"
  shadows?: Record<string, string>           // xs–2xl → CSS box-shadow strings
  // Dark twin of the elevation ramp (same keys as `shadows`). Paint styles have
  // no modes, so a differing dark CSS becomes a second effect style.
  shadowsDark?: Record<string, string>
  grid?: Record<string, string>              // columns/gutter/margin/container/breakpoint-*
  gridFrame?: {
    desktop?: { columns?: string; gutter?: string; margin?: string; container?: string }
    mobile?: { columns?: string; gutter?: string; margin?: string; container?: string }
  }
  breakpointRoles?: Record<string, string>
  sizes?: Record<string, string>             // component heights xs–2xl
  sizeRoles?: Record<string, string>
  icons?: {
    library?: string
    name?: string
    package?: string
    prefix?: string                           // Iconify collection prefix (newer payloads)
    custom?: { name: string; svg: string }[]
  }
  copy?: Record<string, string>              // flat map, "/" hierarchy: "card/title" → "Card title"
  style: string | null
  atoms: string[]
  components?: string[]                      // alias for atoms (forward compat)
}

interface ImportOptions {
  importVariables: boolean
  importStyles: boolean
  /** The '⬡ Components Overview' specimen sheet (was the 58-component catalogue). */
  importComponents: boolean
  /** Icon components. Optional and default-OFF: it used to ride on
   *  `importComponents`, which meant 351 SVG components + an Iconify fetch
   *  every time anyone wanted the sample sheet. */
  importIcons?: boolean
  /** Cover and Documentation used to be one combined flag (importDocs) since
   *  every caller always wanted both together. Overview's "In this file"
   *  checklist now lets each be toggled independently, so they get their own
   *  flags; importDocs is kept as the fallback for callers (the Import
   *  panel's single "Documentation" scope card) that still send one flag for
   *  both — see the 'import' handler below. */
  importDocs?: boolean
  importCover?: boolean
  importDocumentation?: boolean
}

// ─── Color helpers ───────────────────────────────────────────────────────────

// Normalize a hex color to 6 lowercase digits ("#FFF" → "ffffff", drops alpha)
// so primitive↔semantic matching never fails on formatting differences.
function normHex(hex: string): string {
  let h = hex.trim().toLowerCase().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return h.slice(0, 6)
}

function hexToRgb(hex: string): RGB {
  const clean = normHex(hex)
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return { r, g, b }
}

// Parse a hex color that may carry alpha (#rrggbbaa) into RGBA. Alpha
// defaults to 1 when the value is a plain 6-digit hex.
function hexToRgba(hex: string): RGBA {
  const h = hex.trim().toLowerCase().replace('#', '')
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1
  return { ...hexToRgb(hex), a }
}

// RGB back to a 6-digit hex, so a resolved architecture colour can be matched
// against the primByHex index the semantic layer already builds.
function rgbaToHex(c: RGB): string {
  const ch = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0')
  return `${ch(c.r)}${ch(c.g)}${ch(c.b)}`
}

// 8-digit `rrggbbaa` — the shape `colors.primitiveAlpha` ships and `hexToRgba`
// round-trips exactly. Lets a TRANSLUCENT architecture colour be matched
// against an alpha-twin primitive the same way `rgbaToHex` matches an opaque
// one against `primByHex`.
function rgbaToHex8(c: RGBA): string {
  const ch = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0')
  return `${rgbaToHex(c)}${ch(c.a)}`
}

function pxToFloat(val: string): number {
  return parseFloat(val.replace('px', '').replace('rem', '')) || 0
}

function weightKeyFromStyle(style: string): string {
  if (style === 'Bold') return 'bold'
  if (style === 'Semi Bold') return 'semibold'
  if (style === 'Medium') return 'medium'
  return 'regular'
}

function nearestTypeSizeKey(sizes: Record<string, string> | undefined, px: number): string | undefined {
  if (!sizes || !px) return undefined
  let best: string | undefined
  let bestD = Infinity
  for (const [key, val] of Object.entries(sizes)) {
    const d = Math.abs(pxToFloat(val) - px)
    if (d < bestD) { bestD = d; best = key }
  }
  return best
}

/** Bind every typography field a generated text node can carry. Missing
 *  variables are skipped — a layer with only family bound used to be the
 *  common case and is what "texts aren't tied" was. */
function bindAllTextFields(
  t: TextNode,
  typo: Map<string, Variable>,
  opts: { sizeKey?: string; roleKey?: string; weightKey?: string; heading?: boolean },
) {
  const family = opts.roleKey
    ? (typo.get(`role/${opts.roleKey}/family`) ?? (opts.heading ? typo.get('heading-family') : undefined) ?? typo.get('family'))
    : (opts.heading ? (typo.get('heading-family') ?? typo.get('family')) : typo.get('family'))
  if (family) { try { t.setBoundVariable('fontFamily', family) } catch {} }

  const sizeVar = (opts.roleKey ? typo.get(`role/${opts.roleKey}/size`) : undefined)
    ?? (opts.sizeKey ? typo.get(`size/${opts.sizeKey}`) : undefined)
  if (sizeVar) { try { t.setBoundVariable('fontSize', sizeVar) } catch {} }

  const weightVar = (opts.roleKey ? typo.get(`role/${opts.roleKey}/weight`) : undefined)
    ?? (opts.weightKey ? typo.get(`weight/${opts.weightKey}`) : undefined)
    ?? typo.get('weight/regular')
  if (weightVar) { try { t.setBoundVariable('fontWeight', weightVar) } catch {} }

  const lh = opts.sizeKey ? typo.get(`line-height/${opts.sizeKey}`) : undefined
  if (lh) { try { t.setBoundVariable('lineHeight', lh) } catch {} }
  const ls = opts.sizeKey ? typo.get(`letter-spacing/${opts.sizeKey}`) : undefined
  if (ls) { try { t.setBoundVariable('letterSpacing', ls) } catch {} }
}

async function typoVarMap(): Promise<Map<string, Variable>> {
  const m = new Map<string, Variable>()
  const cols = await figma.variables.getLocalVariableCollectionsAsync()
  const col = cols.find((c) => c.name === COLLECTIONS.typography)
  if (!col) return m
  for (const v of await figma.variables.getLocalVariablesAsync()) {
    if (v.variableCollectionId === col.id) m.set(v.name, v)
  }
  return m
}

function log(msg: string) {
  figma.ui.postMessage({ type: 'log', message: msg })
}

// ─── Staying responsive ──────────────────────────────────────────────────────
// Plugin code runs on Figma's OWN thread, so a long synchronous run freezes the
// entire editor — the user can't scroll, switch pages, or even close Figma, and
// the OS eventually offers to kill it. Building a component set or a docs board
// is exactly that kind of run.
//
// `await`-ing an already-resolved promise is NOT enough: that only drains the
// microtask queue and comes straight back without ever letting the host paint.
// A real macrotask is what hands the thread back, so this is `setTimeout(0)`
// and must stay that way.
function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// Progress for the UI's bar. `total: 0` means "indeterminate" — a phase that
// can't count its work up front still reports that it's alive, which is the
// whole point: silence is indistinguishable from a hang.
function progress(phase: string, done: number, total: number, label?: string) {
  figma.ui.postMessage({ type: 'progress', phase, done, total, label })
}

// `fetch` with no timeout waits forever on a hung connection, and since the
// import awaits it, the whole run stalls with no 'done'/'error' ever posted —
// the UI would sit on "Importing…" until the plugin is force-closed. Figma's
// sandbox has no AbortController, so the race IS the timeout: the request is
// abandoned (it may still land, harmlessly) and the caller gets a real error.
// `FetchResponse`, not the DOM's `Response`: the sandbox has no DOM lib.
function fetchWithTimeout(url: string, ms = 15000): Promise<FetchResponse> {
  return Promise.race([
    fetch(url),
    new Promise<FetchResponse>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${Math.round(ms / 1000)}s`)), ms)),
  ])
}

// Highest tokens.json contract version this plugin understands. The configurator
// stamps each payload with `schemaVersion`; a newer one still imports (the parse
// is forward-compatible) but we surface a heads-up to update the plugin.
// v2: primitive color families renamed brand→accent, gray→neutral.
// v3: semantic keys renamed to the readable taxonomy (surface-*, action-*,
//     status-*, icon-*, text-on-brand-*) + primitiveAlpha / background /
//     panelBackground / padding fields.
// v4: every primitive family ships a real dark twin (accent-dark-*, error-dark-*,
//     warning-dark-*, success-dark-*, info-dark-*, plus their *-a* alpha twins) —
//     previously only neutral-dark existed. Additive (new keys in the same
//     `colors.primitive`/`primitiveAlpha` maps); see PRIMITIVE_GROUPS/FAMILY_ORDER
//     below for how they're grouped.
// v5: `opacity` REMOVED from the payload — a standalone 0–100% transparency
//     scale duplicated what `colors.primitiveAlpha` already covers. Purely a
//     REMOVAL, so nothing here had to change: the import is guarded
//     (`if (tokens.opacity)`, see importVariables) and an older configurator's
//     payload still carrying the field keeps importing its Opacity collection.
// v6: additive layout + type roles — typography.roles, spacingRoles,
//     radiusRoles, sizeRoles, stroke, strokeRoles, breakpointRoles, gridFrame.
//     Also reads `borders.width` as a fallback copy of `stroke`.
// v7: semantic colours in `colors.architecture.tokens` may be TRANSLUCENT
//     (8-digit `#rrggbbaa`) — the 16 roles backed by an alpha primitive
//     (ghost washes, status tints, surface.selected, focus halos, the scrim,
//     border.rim-highlight). Already handled: `archValueRgba` routes hex
//     through `hexToRgba`, whose regex has always accepted the 8-digit form,
//     and Figma COLOR variables carry alpha natively — so these import as
//     genuinely translucent variables rather than being flattened. The
//     `{family.tone}` fallback path DID need fixing (see `primitiveRefHex`):
//     it looked only in `colors.primitive`, where no alpha key has ever
//     existed. `colors.primitive` and `colors.themes` stay fully opaque.
const SUPPORTED_SCHEMA_VERSION = 7

function checkSchema(tokens: DesignTokens) {
  const v = tokens.schemaVersion
  if (typeof v === 'number' && v > SUPPORTED_SCHEMA_VERSION) {
    log(`⚠ Token schema v${v} is newer than this plugin supports (v${SUPPORTED_SCHEMA_VERSION}) — update the plugin if anything looks off.`)
  }
}

// ─── Variables ───────────────────────────────────────────────────────────────

// Variable collection names — one per token category. Plain names (no project
// prefix): a Figma file holds a SINGLE design system; appearance variants are
// modeled as themes (modes) inside "Color Semantics", not as separate systems.
const COLLECTIONS = {
  primitives: 'Color Primitives',
  semantics:  'Color Semantics',
  typography: 'Typography',
  spacing:    'Spacing',
  radius:     'Radius',
  border:     'Border',
  opacity:    'Opacity',
  size:       'Size',
  grid:       'Grid',
  icons:      'Icons',
  copy:       'Copy',
} as const

const PLUGIN_COLLECTION_NAMES = new Set<string>(Object.values(COLLECTIONS))

// Styles used to be prefixed with the project name (`Jasdy/Type/…`). That
// folder is what "Jasdy is still inherited" looks like after a switch — the
// collection may be gone and the leftover still sits in the Styles panel.
// New writes use these roots with no project folder.
const PLUGIN_STYLE_ROOTS = new Set(['Type', 'Shadow', 'Gradient', 'Grid'])
const INHERITED_STYLE_FOLDERS = ['Type', 'Shadow', 'Gradient', 'Grid', 'Scale', 'Semantic'] as const
const DOCS_REV = 6
const FILE_DOCS_REV_KEY = 'sd-docs-rev'
// One-time sweep: files created before primitives defaulted to hidden-from-
// publishing (see upsertVarIn) never get that default applied retroactively —
// only NEWLY created variables are hidden, so an existing file's primitives
// stay exactly as visible as they were. This key gates ONE forced pass over
// every existing "Color Primitives" variable so upgrading the plugin doesn't
// leave old files behind. After it runs once, the file is on its own: further
// syncs never touch hiddenFromPublishing again, so a user who manually
// re-exposes a ramp keeps that choice forever.
const FILE_PRIMITIVES_HIDDEN_KEY = 'sd-primitives-hidden-v1'

/** Sidebar order in Figma's Variables panel. Figma has no reorder API — a
 *  collection's position is its creation order — so we create Color Semantics
 *  first, Color Primitives second, then the rest A–Z. Existing files that
 *  still have Primitives above Semantics get the other plugin collections
 *  dropped and recreated (Semantics itself is kept, so color bindings survive). */
function collectionPanelOrder(tokens: DesignTokens): string[] {
  const rest: { name: string; include: boolean }[] = [
    { name: COLLECTIONS.border, include: !!(tokens.stroke || tokens.borders?.width) },
    { name: COLLECTIONS.copy, include: !!tokens.copy },
    { name: COLLECTIONS.grid, include: !!tokens.grid },
    { name: COLLECTIONS.icons, include: !!tokens.icons?.library },
    { name: COLLECTIONS.opacity, include: !!tokens.opacity },
    { name: COLLECTIONS.radius, include: true },
    { name: COLLECTIONS.size, include: !!tokens.sizes },
    { name: COLLECTIONS.spacing, include: true },
    { name: COLLECTIONS.typography, include: true },
  ]
  rest.sort((a, b) => a.name.localeCompare(b.name))
  return [
    COLLECTIONS.semantics,
    COLLECTIONS.primitives,
    ...rest.filter((r) => r.include).map((r) => r.name),
  ]
}

// Group a semantic key by its first segment so Figma nests it: bg-accent-solid →
// "bg/accent-solid", text-primary → "text/primary". camelCase legacy keys are
// kebab-cased first; single-word keys (primary, surface) stay flat.
function semanticVarName(key: string): string {
  const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase()
  const dash = kebab.indexOf('-')
  return dash === -1 ? kebab : `${kebab.slice(0, dash)}/${kebab.slice(dash + 1)}`
}

// Figma variable names cannot contain `.` and cannot start with a digit —
// `createVariable("Content/link.default")` throws, which used to abort the
// Color Semantics write loop after the handful of simple Content keys, so
// Action / Surface / Status / Border never landed. Dots become nested groups
// (`Action/primary.default` → `Action/primary/default`); a leading digit
// (spacing step `1`) nests under `step/`.
function figmaVarName(name: string): string {
  const slashed = name.replace(/\./g, '/')
  const first = slashed.split('/')[0]
  return /^\d/.test(first) ? `step/${slashed}` : slashed
}

function archFigmaName(groupLabel: string, key: string): string {
  return figmaVarName(`${groupLabel}/${key}`)
}

// Targeted scopes so each semantic group shows up in the picker it belongs to
// (Content in text color, Border in stroke, Action/Surface in fills) instead
// of the default ALL_SCOPES dumping every token into every picker.
function scopesForSemantic(name: string): VariableScope[] {
  const group = name.split('/')[0].toLowerCase()
  switch (group) {
    case 'content':
    case 'text':
      return ['TEXT_FILL']
    case 'border':
    case 'outlines':
    case 'separators':
      return ['STROKE_COLOR']
    case 'action':
    case 'accent':
    case 'surface':
    case 'background':
    case 'base':
    case 'card':
    case 'popover':
    case 'primary':
    case 'secondary':
    case 'muted':
    case 'layer':
    case 'field':
    case 'core':
    case 'surfaces':
    case 'backgrounds':
    case 'fills':
    case 'materials':
      return ['FRAME_FILL', 'SHAPE_FILL']
    case 'status':
    case 'icon':
    case 'support':
    case 'destructive':
      return ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR']
    default:
      return ['ALL_FILLS', 'STROKE_COLOR']
  }
}

function scopesForCollection(collName: string, varName: string): VariableScope[] | undefined {
  switch (collName) {
    case COLLECTIONS.spacing: return ['GAP', 'WIDTH_HEIGHT']
    case COLLECTIONS.radius:  return ['CORNER_RADIUS']
    case COLLECTIONS.border:  return ['STROKE_FLOAT']
    case COLLECTIONS.size:    return ['WIDTH_HEIGHT']
    case COLLECTIONS.opacity: return ['OPACITY']
    case COLLECTIONS.grid:    return ['WIDTH_HEIGHT']
    case COLLECTIONS.typography: {
      if (varName.startsWith('size/') || varName.endsWith('/size')) return ['FONT_SIZE']
      if (varName.startsWith('weight/') || varName.endsWith('/weight')) return ['FONT_WEIGHT']
      if (varName.startsWith('line-height/')) return ['LINE_HEIGHT']
      if (varName.startsWith('letter-spacing/')) return ['LETTER_SPACING']
      if (varName === 'family' || varName === 'heading-family' || varName.endsWith('/family')) return ['FONT_FAMILY']
      return undefined
    }
    default: return undefined
  }
}

// Map a primitive color family to its Figma group path. Accepts the current
// vocabulary (accent/neutral) and the legacy one (brand/gray); the four state
// roles nest under "State/*"; any other family (custom colors) is Title-cased.
// Every family's dark twin (schema v4: accent-dark, error-dark, warning-dark,
// success-dark, info-dark — neutral-dark predates v4) sits alongside its light
// sibling with a " Dark" suffix, same pattern as Neutral/Neutral Dark.
const PRIMITIVE_GROUPS: Record<string, string> = {
  accent: 'Accent', brand: 'Accent',
  'accent-dark': 'Accent Dark', 'brand-dark': 'Accent Dark',
  neutral: 'Neutral', gray: 'Neutral',
  'neutral-dark': 'Neutral Dark', 'gray-dark': 'Neutral Dark',
  error: 'State/Error', 'error-dark': 'State/Error Dark',
  success: 'State/Success', 'success-dark': 'State/Success Dark',
  warning: 'State/Warning', 'warning-dark': 'State/Warning Dark',
  info: 'State/Info', 'info-dark': 'State/Info Dark',
}

// Variable creation priority — lower = appears first in Figma's groups panel.
// Custom families (any key not listed) default to 99 and are sorted last,
// alphabetically among themselves. Each dark twin sorts immediately after its
// light counterpart.
const FAMILY_ORDER: Record<string, number> = {
  accent: 0, brand: 0,
  'accent-dark': 1, 'brand-dark': 1,
  neutral: 2, gray: 2,
  'neutral-dark': 3, 'gray-dark': 3,
  error: 4, 'error-dark': 5,
  success: 6, 'success-dark': 7,
  warning: 8, 'warning-dark': 9,
  info: 10, 'info-dark': 11,
  // The fixed black/white opacity ladder — sorts right after the state
  // colors, ahead of any custom family (which defaults to 99).
  'black-a': 12, 'white-a': 13,
}

// Turn a flat primitive key into a grouped Figma variable name:
// "accent-1" → "Accent/01", "error-500" → "State/Error/500", "teal-3" → "Teal/03".
// Splits on the LAST "-" so hundreds-based tone labels (accent-500) are preserved.
// Single-digit tones are zero-padded (1→01…9→09) so Figma's alphabetical panel
// sort matches numeric order instead of lexicographic (1, 10, 11, 12, 2…).
function primitiveVarName(key: string): string {
  const dash = key.lastIndexOf('-')
  if (dash === -1) return key
  const family = key.slice(0, dash)
  const tone = key.slice(dash + 1)
  // Theme-namespaced families ("ocean/accent") nest under the theme group,
  // resolving each segment through PRIMITIVE_GROUPS (else Title Case).
  const group = PRIMITIVE_GROUPS[family]
    ?? family
      .split('/')
      .map((seg) => PRIMITIVE_GROUPS[seg] ?? (seg.charAt(0).toUpperCase() + seg.slice(1)))
      .join('/')
  const paddedTone = /^\d$/.test(tone) ? `0${tone}` : tone
  return `${group}/${paddedTone}`
}

// Alpha-twin variable name — same grouping as the solid primitive with an
// "Alpha" segment before the tone: "accent-1" → "Accent/Alpha/01",
// "error-500" → "State/Error/Alpha/500".
//
// `black-a`/`white-a` (the fixed opacity ladder — CLAUDE.md's "THE ALPHA
// LAYER") are a DIFFERENT kind of key and must not fall through to the same
// path: they already carry their own "-a" marker (`black-a-5`), so running
// them through `primitiveVarName` + an inserted "/Alpha/" segment produced
// "Black-a/Alpha/05" — the marker duplicated, once in the family name and
// once in the folder. Named explicitly instead: "Black Alpha/05".
function primitiveAlphaVarName(key: string): string {
  const neutralLadder = /^(black|white)-a-\d+$/.exec(key)
  if (neutralLadder) {
    const dash = key.lastIndexOf('-')
    const tone = key.slice(dash + 1)
    const paddedTone = /^\d$/.test(tone) ? `0${tone}` : tone
    return `${neutralLadder[1] === 'black' ? 'Black' : 'White'} Alpha/${paddedTone}`
  }
  const solid = primitiveVarName(key)
  const slash = solid.lastIndexOf('/')
  if (slash === -1) return `Alpha/${solid}`
  return `${solid.slice(0, slash)}/Alpha/${solid.slice(slash + 1)}`
}

// ── Architecture-aware semantic resolution ──────────────────────────────────
// tokens.colors.semantic/.themes is always the FLAT 39-role catalogue — the
// underlying editing model every Alias/Semantics architecture projects FROM,
// no longer even offered as a picker choice on the web (Astryx replaced it as
// the default). For any system on a non-flat architecture, what the web
// preview actually shows for a role can be a DIFFERENT colour than flat's
// static per-role tone — verified end-to-end on a real export (default
// Astryx system, accent #0EA5E9): the web's Button solid fill measured
// `rgb(14, 165, 233)` = `#0ea5e9`, while flat's `background-brand-solid`
// carried `#61b8ed` — a different tone, and its ink flips white ↔ near-black
// between the two. Importing flat verbatim silently painted Figma a
// different system than the one on screen.
//
// tokens.colors.architecture (additive, absent for 'flat' — see the
// DesignTokens.colors comment) carries the user's CHOSEN reading. Astryx,
// shadcn and Categorical all resolve through the web's projectCurated() into
// the same shape — `{ kind, tokens: { group: { key: { themeKey: value } } } }`.
// The configurator may ship a `{family.tone}` ref or (usual case) the hex
// `resolveCuratedForExport` already looked up. Both resolve here: refs against
// colors.primitive, hex literals as-is. Categorical keys nest with `/`
// (`action.primary.default` → Figma `Action/primary/default`).
//
// Vibrancy and Tonal are deliberately NOT covered — different reasons, both
// worth keeping straight before "simply" extending this:
//  - Vibrancy's tokens are mostly raw alpha-composited `rgb(r g b / a)` CSS
//    strings, not `{family.tone}` refs at all.
//  - Tonal's `scheme` refs LOOK like `{family.tone}` (e.g. `{primary.40}`)
//    but resolve against a SEPARATE 0–100 M3 palette
//    (colors.architecture.palettes), not colors.primitive — and Tonal ships
//    no `.tokens` field at all (`{ kind, palettes, scheme }`). A resolver
//    that doesn't know this could silently match nothing, or worse, collide
//    with an unrelated colors.primitive key.
// Both keep today's flat-only behaviour for every role, unchanged.
//
// Mapping only exists for UNAMBIGUOUS matches — anything uncertain is left on
// its flat default (the existing, already-shipped behaviour; always safe).
// One rule enforced throughout: never map a text/ink role to an architecture
// concept that's a FILL. Astryx/shadcn's `status.error` etc. is a vivid
// fill/icon tone, not text-safe — using it for `content-error` would
// reintroduce the exact "vivid colour as literal text on a tint of itself"
// contrast bug the web repo's own history documents fixing twice (see that
// repo's CLAUDE.md). That's why content-error/-success/-warning map for
// Categorical (which has real solved `status.*.content` ink roles) but not for
// Astryx or shadcn (which only have the fill).
//
// Categorical keys are nested (`primary.default`, `critical.surface`). The
// Figma variable name is `{Group}/{key with dots turned into /}`:
// `Action/primary/default`, `Status/critical/content`. Dots cannot stay —
// `createVariable` rejects them and used to abort the rest of the import.
const ARCH_ROLE_MAP: Record<'astryx' | 'shadcn' | 'categorical', Record<string, [string, string]>> = {
  astryx: {
    'background-primary':         ['background', 'body'],
    'background-secondary':       ['background', 'surface'],
    'background-tertiary':        ['background', 'muted'],
    'background-brand-primary':   ['accent', 'muted'],
    'background-brand-solid':     ['accent', 'solid'],
    'background-inverse':         ['background', 'inverted'],
    'background-error-solid':     ['status', 'error'],
    'background-error-primary':   ['status', 'error-muted'],
    'background-success-solid':   ['status', 'success'],
    'background-success-primary': ['status', 'success-muted'],
    'background-warning-solid':   ['status', 'warning'],
    'background-warning-primary': ['status', 'warning-muted'],
    'border-primary':             ['border', 'default'],
    'content-primary':            ['text', 'primary'],
    'content-secondary':          ['text', 'secondary'],
    'content-disabled':           ['text', 'disabled'],
    'content-brand':              ['text', 'accent'],
    'content-on-brand':           ['accent', 'on-solid'],
  },
  categorical: {
    'background-primary':           ['surface', 'page'],
    'background-secondary':         ['surface', 'layer-1'],
    'background-tertiary':          ['surface', 'layer-2'],
    'background-active':            ['surface', 'selected'],
    'background-disabled':          ['action', 'disabled'],
    'background-overlay':           ['surface', 'overlay'],
    // Not an ALL_ROLES key — inverted surfaces (tooltips, snackbars) bind here
    // so they don't share background-overlay's scrim token.
    'background-inverse':           ['surface', 'inverse'],
    'background-brand-primary':     ['surface', 'accent'],
    'background-input':             ['surface', 'input'],
    'background-brand-secondary':   ['action', 'secondary.accent'],
    'background-brand-solid':       ['action', 'primary.default'],
    'background-brand-solid-hover': ['action', 'primary.hover'],
    'background-error-primary':     ['status', 'critical.surface'],
    'background-error-solid':       ['status', 'critical.surface-solid'],
    'background-success-primary':   ['status', 'success.surface'],
    'background-warning-primary':   ['status', 'warning.surface'],
    'border-primary':               ['border', 'default'],
    'border-secondary':             ['border', 'subtle'],
    'border-strong':                ['border', 'strong'],
    'border-focus':                 ['border', 'focus'],
    'border-brand':                 ['border', 'accent'],
    'border-error':                 ['border', 'critical'],
    'content-primary':              ['content', 'primary'],
    'content-secondary':            ['content', 'secondary'],
    'content-tertiary':             ['content', 'subtle'],
    'content-inverse':              ['content', 'inverse'],
    // Not an ALL_ROLES key — button label ink is content.on-action, not inverse.
    'content-on-brand':             ['content', 'on-action'],
    'status-on-solid':              ['status', 'critical.on-solid'],
    'content-brand':                ['content', 'accent'],
    'content-brand-hover':          ['content', 'link.hover'],
    'content-disabled':             ['content', 'disabled'],
    'content-error':                ['status', 'critical.content'],
    'content-success':              ['status', 'success.content'],
    'content-warning':              ['status', 'warning.content'],
  },
  shadcn: {
    'background-primary':      ['base', 'background'],
    'background-secondary':    ['card', 'fill'],
    'background-tertiary':     ['muted', 'fill'],
    'background-brand-solid':  ['primary', 'fill'],
    'background-error-solid':  ['destructive', 'fill'],
    'border-primary':          ['border', 'default'],
    'content-primary':         ['base', 'foreground'],
    'content-on-brand':        ['primary', 'foreground'],
  },
}

type ArchTokens = Record<string, Record<string, Record<string, string>>>

const ARCH_REF_RE = /^\{([a-z0-9-]+)\.(\d+)\}$/

/** One architecture ref-node (e.g. tokens.accent.solid — a per-theme
 *  {family.tone} map), resolved against this theme. Falls back to the node's
 *  first available theme key, mirroring the flat loop's own baseHex fallback
 *  a few lines below ("no mode reads as empty") — a theme name the node
 *  doesn't carry (e.g. Vibrancy/Tonal columns don't grow with new themes,
 *  though this function is never called for those two) still gets a value. */
function archRefHex(node: Record<string, string> | undefined, themeKey: string, tokens: DesignTokens): string | undefined {
  if (!node) return undefined
  const raw = (node[themeKey] ?? Object.values(node)[0] ?? '').trim()
  if (!raw) return undefined
  const m = ARCH_REF_RE.exec(raw)
  // Alpha families included — see primitiveRefHex. Takes the whole payload
  // rather than just `colors.primitive` because an alpha ref resolves out of
  // a different map.
  if (m) return primitiveRefHex(tokens, m[1], m[2])
  // tokens.json ships resolved hex (resolveCuratedForExport), not `{family.tone}`.
  if (/^#?[0-9a-f]{6}([0-9a-f]{2})?$/i.test(raw)) return raw.startsWith('#') ? raw : `#${raw}`
  return undefined
}

// ── One semantic lookup, whatever the collection holds ───────────────────────
// Everything downstream of importVariables — the generated components, the
// documentation boards, the icon tint — asks for colours by FLAT ROLE NAME
// ('background-brand-solid', 'content-primary'). What's actually in "Color
// Semantics" is the flat catalogue only for a system with no architecture;
// otherwise it's the architecture's own vocabulary ('Accent/solid',
// 'Action/primary/default', 'Text/primary'). This is the single place that translates, so no caller has
// to know which of the two it's looking at.
//
// Resolution order, per role:
//   1. the architecture's own token for it (ARCH_ROLE_MAP — curated, exact);
//   2. the flat name (`semanticVarName`), plus any legacy aliases the caller
//      passes — this is the whole story for a flat system;
//   3. the variable in the collection whose COLOUR equals the role's colour.
// Step 3 is what keeps the component layer bound for the ~two thirds of roles
// ARCH_ROLE_MAP deliberately leaves unmapped (see its comment): the
// architecture is projected from the same ramp, so the tone a role resolves to
// is almost always sitting in the collection under some other name. Binding to
// that variable re-themes correctly, which a raw hex never does.

/** The variable name inside "Color Semantics" that carries a flat role under
 *  this architecture — 'background-brand-solid' → 'Accent/solid'. */
function archVarNameFor(tokens: DesignTokens, roleKey: string): string | undefined {
  const kind = tokens.colors.architecture?.kind
  if (!kind || !(kind in ARCH_ROLE_MAP)) return undefined
  const hit = ARCH_ROLE_MAP[kind as keyof typeof ARCH_ROLE_MAP][roleKey]
  if (!hit) return undefined
  const group = ARCH_GROUPS[kind]?.find(([k]) => k === hit[0])
  const label = group ? group[1] : hit[0].charAt(0).toUpperCase() + hit[0].slice(1)
  return archFigmaName(label, hit[1])
}

/** The hex the architecture resolves a flat role to, for one theme. The same
 *  value importVariables writes into the variable, so a component's unbound
 *  fallback colour can't disagree with the variable it failed to bind to. */
function archHexFor(tokens: DesignTokens, roleKey: string, theme: string): string | undefined {
  const kind = tokens.colors.architecture?.kind
  if (!kind || !(kind in ARCH_ROLE_MAP)) return undefined
  const hit = ARCH_ROLE_MAP[kind as keyof typeof ARCH_ROLE_MAP][roleKey]
  if (!hit) return undefined
  const t = tokens.colors.architecture?.tokens as ArchTokens | undefined
  return archRefHex(t?.[hit[0]]?.[hit[1]], theme, tokens)
}

/** A variable's colour in one mode, following aliases to their target's own
 *  default mode (a semantic variable usually aliases a primitive). */
function resolveVarRgb(
  v: Variable,
  modeId: string,
  byId: Map<string, Variable>,
  defaultModeOf: Map<string, string>,
  depth = 0,
): RGB | undefined {
  const val = v.valuesByMode[modeId]
  if (val === undefined || val === null || typeof val !== 'object') return undefined
  if ('type' in val && (val as VariableAlias).type === 'VARIABLE_ALIAS') {
    if (depth >= 4) return undefined
    const target = byId.get((val as VariableAlias).id)
    if (!target) return undefined
    const mid = defaultModeOf.get(target.variableCollectionId)
    return mid ? resolveVarRgb(target, mid, byId, defaultModeOf, depth + 1) : undefined
  }
  return 'r' in val ? (val as RGB) : undefined
}

interface SemLookup {
  /** The semantics variable for a flat role, trying extra legacy names too. */
  varFor(roleKey: string, ...extraNames: string[]): Variable | undefined
  /** The colour that role resolves to in the first theme. */
  hexFor(roleKey: string): string | undefined
}

function semLookupFor(tokens: DesignTokens, allVars: Variable[], allCols: VariableCollection[]): SemLookup {
  const col = allCols.find((c) => c.name === COLLECTIONS.semantics)
  const byName = new Map<string, Variable>()
  const byHex = new Map<string, Variable>()
  if (col) {
    const byId = new Map(allVars.map((v) => [v.id, v] as const))
    const defaultModeOf = new Map(allCols.map((c) => [c.id, c.defaultModeId] as const))
    for (const v of allVars) {
      if (v.variableCollectionId !== col.id) continue
      if (!byName.has(v.name)) byName.set(v.name, v)
      if (v.resolvedType !== 'COLOR') continue
      const rgb = resolveVarRgb(v, col.defaultModeId, byId, defaultModeOf)
      if (!rgb) continue
      const hex = normHex(rgbaToHex(rgb))
      if (!byHex.has(hex)) byHex.set(hex, v)
    }
  }

  const themes = tokens.colors.themes && Object.keys(tokens.colors.themes).length > 0
    ? tokens.colors.themes
    : { light: tokens.colors.semantic || {} }
  const themeOrder = (tokens.colors.themeOrder ?? []).filter((t) => themes[t])
  const firstTheme = themeOrder[0] ?? Object.keys(themes)[0] ?? 'light'

  const hexFor = (roleKey: string): string | undefined =>
    archHexFor(tokens, roleKey, firstTheme) || themes[firstTheme]?.[roleKey] || tokens.colors.semantic?.[roleKey]

  return {
    hexFor,
    varFor(roleKey: string, ...extraNames: string[]): Variable | undefined {
      const archName = archVarNameFor(tokens, roleKey)
      const names = archName ? [archName, semanticVarName(roleKey), ...extraNames] : [semanticVarName(roleKey), ...extraNames]
      for (const n of names) { const v = byName.get(n); if (v) return v }
      const hex = hexFor(roleKey)
      return hex ? byHex.get(normHex(hex)) : undefined
    },
  }
}

// ─── Documentation chrome — variable lookups ─────────────────────────────────
// The editorial chrome (Components Overview panels, the ⬡ Documentation
// boards, ⬡ Icons) used to paint its ink/borders/surfaces from fixed hex —
// "chrome must stay readable in every mode" was the reasoning, and it's still
// correct, but it doesn't require staying UNBOUND: it requires staying pinned
// to ONE mode (see docModePin below). Everything the chrome paints with — text,
// hairlines, the board/card surfaces, the accent used on chips — now binds to
// the same "Color Semantics" roles the components themselves bind to, so
// selecting a layer in Figma shows a real token name (Content/primary,
// Border/default, Surface/page…) instead of a flat, unnamed fill, and editing
// that role in the configurator moves the docs along with everything else.
interface DocChromeVars {
  text?: Variable          // headings, strong labels — content-primary
  secondary?: Variable     // breadcrumbs, meta labels — content-secondary
  muted?: Variable         // body copy, descriptions, hints — content-tertiary
  border?: Variable        // hairlines, panel/card strokes — border-default
  borderStrong?: Variable  // the SPECS/FEATURES divider chip's outline — border-strong
  board?: Variable         // the outer rounded slab — background-primary (Surface/page)
  card?: Variable          // inner cards / swatch chips — background-tertiary (Surface/layer-2)
  accentText?: Variable    // FEATURES chip label ink — content-brand (Content/accent)
  accentBorder?: Variable  // FEATURES chip outline — border-brand (Border/accent)
}
function docChromeVarsFrom(sem: SemLookup): DocChromeVars {
  return {
    text:         sem.varFor('content-primary',    'Content/primary', 'content/primary', 'text/primary', 'text'),
    secondary:    sem.varFor('content-secondary',  'Content/secondary', 'content/secondary', 'text/secondary'),
    muted:        sem.varFor('content-tertiary',   'Content/subtle', 'content/subtle', 'Content/tertiary', 'content/tertiary', 'text/tertiary', 'Content/secondary', 'content/secondary'),
    border:       sem.varFor('border-default',     'Border/default', 'border/default', 'border/primary', 'border'),
    borderStrong: sem.varFor('border-strong',      'Border/strong', 'border/strong'),
    board:        sem.varFor('background-primary', 'Surface/page', 'surface/page', 'background/primary', 'surface/0'),
    card:         sem.varFor('background-tertiary','Surface/layer-2', 'surface/layer-2', 'background/tertiary', 'surface/2'),
    accentText:   sem.varFor('content-brand',      'Content/accent', 'content/accent', 'Content/brand', 'content/brand', 'text/brand-secondary'),
    accentBorder: sem.varFor('border-brand',       'Border/accent', 'border/accent', 'border/brand'),
  }
}

// The doc chrome is always painted as a LIGHT editorial surface, on purpose —
// it's the one thing on these pages that must stay readable no matter which
// mode the rest of the file happens to be sitting in. Binding its fills to
// real semantic variables (above) would otherwise let an ambient dark mode
// paint white boards with near-white "Content/primary" text. The fix is the
// same one Figma ships for exactly this: pin the board's OWN resolved mode to
// the system's first theme, so every bound chrome fill resolves against that
// theme regardless of what mode the page or file is in.
function docModePin(tokens: DesignTokens, allCols: VariableCollection[]): { collection: VariableCollection; modeId: string } | undefined {
  const collection = allCols.find((c) => c.name === COLLECTIONS.semantics)
  if (!collection) return undefined
  const firstTheme = (tokens.colors.themeOrder ?? ['light'])[0] ?? 'light'
  const mode = collection.modes.find((m) => m.name.toLowerCase() === firstTheme.toLowerCase()) ?? collection.modes[0]
  return mode ? { collection, modeId: mode.modeId } : undefined
}
function pinToLightMode(node: SceneNode | PageNode, pin: { collection: VariableCollection; modeId: string } | undefined) {
  if (!pin) return
  try { node.setExplicitVariableModeForCollection(pin.collection, pin.modeId) } catch {}
}

// ── Architecture labels ──────────────────────────────────────────────────────
// The architecture the user picked IS their semantic contract, so it ships
// verbatim — its own groups, its own token keys, its own modes — but it ships
// INSIDE "Color Semantics" (see that section in importVariables for why it is
// no longer a collection of its own). These labels are only for the import log
// and the docs; a Figma collection is never named after them any more.
const ARCH_LABEL: Record<string, string> = {
  astryx:      'Astryx',
  shadcn:      'shadcn/ui',
  categorical: 'Categorical Semantic',
  vibrancy:    'Contextual Vibrancy',
  carbon:      'IBM Carbon',
  tonal:       'Material Tonal',
}

// Collections earlier versions of this plugin created and this one no longer
// does: the per-architecture ones (merged into "Color Semantics") and
// "Components" (the per-component alias tier, dropped — components bind
// straight to the semantic roles). Removed by exact name on every import.
const LEGACY_COLLECTIONS: string[] = [...Object.values(ARCH_LABEL), 'Components']

// Group labels and ORDER, mirroring each architecture's own sidebar on the web
// (the META tables in buildArchitectureView). Order matters: Figma lists
// groups in creation order, so emitting in this order makes the Figma panel
// read like the configurator's group list rather than alphabetically.
const ARCH_GROUPS: Record<string, [string, string][]> = {
  astryx: [
    ['accent', 'Accent'], ['background', 'Background'], ['text', 'Text'],
    ['icon', 'Icon'], ['status', 'Status'], ['utility', 'Utility'], ['border', 'Border'],
  ],
  shadcn: [
    ['base', 'Base'], ['card', 'Card'], ['popover', 'Popover'], ['primary', 'Primary'],
    ['secondary', 'Secondary'], ['muted', 'Muted'], ['accent', 'Accent'],
    ['destructive', 'Destructive'], ['border', 'Border'], ['chart', 'Chart'], ['sidebar', 'Sidebar'],
  ],
  categorical: [
    ['content', 'Content'], ['action', 'Action'], ['surface', 'Surface'],
    ['status', 'Status'], ['border', 'Border'],
  ],
  carbon: [
    ['layer', 'Layer'], ['field', 'Field'], ['text', 'Text'], ['icon', 'Icon'],
    ['border', 'Border'], ['link', 'Link'], ['interactive', 'Interactive'],
    ['support', 'Support'], ['utility', 'Utility'],
  ],
  tonal: [
    ['core', 'Core'], ['secondary', 'Secondary'], ['tertiary', 'Tertiary'],
    ['error', 'Error'], ['surfaces', 'Surfaces'], ['outlines', 'Outlines'],
  ],
  vibrancy: [
    ['labels', 'Labels'], ['backgrounds', 'Backgrounds'], ['fills', 'Fills'],
    ['separators', 'Separators'], ['materials', 'Materials'],
  ],
}

/** Carbon's four themes ARE its contract — never the user's themes. */
const CARBON_MODES: [string, string][] = [
  ['white', 'White'], ['g10', 'Gray 10'], ['g90', 'Gray 90'], ['g100', 'Gray 100'],
]

/** Vibrancy and Tonal have no per-theme concept — light/dark by construction. */
const LIGHT_DARK_MODES: [string, string][] = [['light', 'Light'], ['dark', 'Dark']]

/** One architecture flattened into the shape the emit loop writes: ordered
 *  modes, ordered groups, and each token's raw per-mode value (a `{fam.tone}`
 *  ref, a literal hex, or a `rgb(r g b / a)` string — `archValueRgba` resolves
 *  all three). */
type ArchNorm = {
  modes: [string, string][]
  groups: { label: string; tokens: { key: string; byMode: Record<string, string> }[] }[]
}

/** Groups in the architecture's own order, with any group the payload carries
 *  but the table doesn't know about appended (so a new group on the web shows
 *  up here instead of silently vanishing). */
function archGroupOrder(kind: string, present: string[]): [string, string][] {
  const known = ARCH_GROUPS[kind] ?? []
  const seen = new Set(known.map(([k]) => k))
  const extra: [string, string][] = present
    .filter((k) => !seen.has(k))
    .map((k) => [k, k.charAt(0).toUpperCase() + k.slice(1)])
  return [...known.filter(([k]) => present.includes(k)), ...extra]
}

/**
 * Normalize any architecture payload into `ArchNorm`.
 *
 * Four genuinely different shapes arrive here, which is why this can't be one
 * loop (all four verified against the configurator's semanticArchitectures.ts):
 *   astryx/shadcn/categorical/carbon — `tokens[group][key][mode] = ref`
 *   tonal                            — `scheme[group][key] = { light, dark }`,
 *                                      refs resolving against `palettes`
 *   vibrancy                         — `tokens[mode][group][key] = cssColor`
 *                                      (mode FIRST, and raw CSS, not refs)
 */
function normalizeArchitecture(
  arch: { kind: string; tokens?: unknown; [key: string]: unknown },
  themeNames: string[],
): ArchNorm | null {
  const kind = arch.kind

  if (kind === 'tonal') {
    const scheme = arch.scheme as Record<string, Record<string, { light: string; dark: string }>> | undefined
    if (!scheme) return null
    return {
      modes: LIGHT_DARK_MODES,
      groups: archGroupOrder(kind, Object.keys(scheme)).map(([key, label]) => ({
        label,
        tokens: Object.entries(scheme[key] ?? {}).map(([k, v]) => ({
          key: k,
          byMode: { light: v.light, dark: v.dark },
        })),
      })),
    }
  }

  if (kind === 'vibrancy') {
    const t = arch.tokens as Record<string, Record<string, Record<string, string>>> | undefined
    if (!t || !t.light) return null
    // Mode-first: every group lives inside each mode, so the group list comes
    // from one mode and the values are gathered across both. `channels`,
    // `tint` and `labelFallbacks` are deliberately not groups — the web shows
    // fallbacks as a badge on the label row, and the other two are export-only
    // plumbing (see buildArchitectureView's vibrancy branch).
    const groupKeys = ARCH_GROUPS[kind].map(([k]) => k).filter((g) => t.light[g])
    return {
      modes: LIGHT_DARK_MODES,
      groups: archGroupOrder(kind, groupKeys).map(([key, label]) => ({
        label,
        tokens: Object.keys(t.light[key] ?? {}).map((k) => ({
          key: k,
          byMode: { light: t.light[key]?.[k] ?? '', dark: t.dark?.[key]?.[k] ?? '' },
        })),
      })),
    }
  }

  const t = arch.tokens as ArchTokens | undefined
  if (!t) return null

  // Carbon's modes are part of its contract; everyone else resolves against
  // the user's themes, in the configurator's own column order.
  let modes: [string, string][]
  if (kind === 'carbon') {
    modes = CARBON_MODES
  } else {
    const present = new Set<string>()
    for (const group of Object.values(t)) {
      for (const node of Object.values(group)) Object.keys(node).forEach((m) => present.add(m))
    }
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
    const ordered = themeNames.filter((m) => present.has(m))
    const extra = [...present].filter((m) => !ordered.includes(m))
    modes = [...ordered, ...extra].map((m) => [m, cap(m)] as [string, string])
  }
  if (modes.length === 0) return null

  return {
    modes,
    groups: archGroupOrder(kind, Object.keys(t)).map(([key, label]) => ({
      label,
      tokens: Object.entries(t[key] ?? {}).map(([k, byMode]) => ({ key: k, byMode })),
    })),
  }
}

/** `rgb(R G B / A)` — Vibrancy's alpha layers, the one value form that isn't a
 *  ref or a hex. projectVibrancy emits the space-separated CSS Color 4 syntax;
 *  the legacy `rgba(r, g, b, a)` comma form is accepted too so a hand-edited
 *  or older payload doesn't silently drop the token. */
const RGB_FN_RE = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i

/**
 * One architecture value → an RGBA Figma can store.
 *
 * `lookup` is what makes a ref resolvable and differs per architecture: the
 * shared `colors.primitive` map for the curated kinds and Carbon, but Tonal's
 * OWN 0–100 palettes (`architecture.palettes`) — its `{primary.40}` looks like
 * a primitive ref and is not one. Returns undefined rather than guessing when
 * nothing resolves, so an unresolvable token is skipped instead of shipped as
 * a wrong colour.
 */
/**
 * Resolve a `{family.tone}` ref against the payload's primitive maps.
 *
 * Solid families live in `colors.primitive` under `accent-9`. ALPHA families
 * are addressed in refs with an `-a` suffix (`{accent-a.3}`, `{black-a.8}`)
 * and live in `colors.primitiveAlpha` — but under TWO different key shapes,
 * because the two kinds of alpha primitive were added at different times and
 * the earlier one is a shipped contract this must not rename:
 *
 *   • a family's alpha TWIN is keyed by the bare family (`accent-3`), since
 *     the `primitiveAlpha` bucket already disambiguates it from the solid;
 *   • `black-a`/`white-a` (the fixed opacity ladder) carry the `-a` in the
 *     key itself (`black-a-1`), having no solid counterpart to collide with.
 *
 * Both are tried. In practice the configurator resolves every ref to hex
 * before export (`resolveCuratedForExport`), so this is the fallback path for
 * a symbolic payload — but it used to look ONLY in `colors.primitive`, where
 * no alpha key has ever existed, so every alpha-backed role would have
 * resolved `undefined` and been skipped as unresolvable.
 */
function primitiveRefHex(tokens: DesignTokens, fam: string, tone: string): string | undefined {
  const solid = tokens.colors.primitive[`${fam}-${tone}`]
  if (solid) return solid
  const alpha = tokens.colors.primitiveAlpha
  if (!alpha) return undefined
  return alpha[`${fam}-${tone}`] ?? (fam.endsWith('-a') ? alpha[`${fam.slice(0, -2)}-${tone}`] : undefined)
}

function archValueRgba(raw: string, lookup: (family: string, tone: string) => string | undefined): RGBA | undefined {
  const val = (raw ?? '').trim()
  if (!val) return undefined

  const ref = ARCH_REF_RE.exec(val)
  if (ref) {
    const hex = lookup(ref[1], ref[2])
    return hex ? hexToRgba(hex) : undefined
  }

  const fn = RGB_FN_RE.exec(val)
  if (fn) {
    return {
      r: Number(fn[1]) / 255,
      g: Number(fn[2]) / 255,
      b: Number(fn[3]) / 255,
      a: fn[4] === undefined ? 1 : Number(fn[4]),
    }
  }

  // A literal the configurator resolved for us — `{chart.N}` series colours
  // and Carbon's `{visited.N}` both land here as plain hex.
  if (/^#?[0-9a-f]{6}([0-9a-f]{2})?$/i.test(val)) return hexToRgba(val)

  return undefined
}

// Set by importVariables when it had to recreate the semantic variables (a
// changed architecture, a reordered or resized token set — see the order check
// there). Every binding in the file pointed at the OLD variable objects, so the
// import handler reads this and redraws the components and boards that would
// otherwise be left bound to nothing. Reset at the top of every run.
let semanticsRebuilt = false
let foundationsRebuilt = false

async function importVariables(tokens: DesignTokens): Promise<number> {
  let count = 0
  semanticsRebuilt = false
  foundationsRebuilt = false
  // A leftover collection / Documentation board named after a PREVIOUS system
  // (e.g. "Jasdy") is not cleaned by the current-project sweep below. Detect
  // the rename here so the import handler also rebuilds Cover + Docs.
  const previousProject = readFileTokens()?.tokens.project
  if (previousProject && tokens.project && previousProject !== tokens.project) {
    foundationsRebuilt = true
    log(`↻ System changed "${previousProject}" → "${tokens.project}" — leftover collections and docs will follow the new name`)
  }

  // Fetch collections + variables once; both lists are mutated as we create more.
  const existingCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const allVars = await figma.variables.getLocalVariablesAsync()

  function findOrCreateCollection(name: string): VariableCollection {
    let c = existingCollections.find((col) => col.name === name)
    if (!c) {
      c = figma.variables.createVariableCollection(name)
      existingCollections.push(c)
      log(`Created collection "${name}"`)
    }
    return c
  }

  // Color Semantics first, Color Primitives second. Figma lists collections
  // in creation order and offers no move API, so this has to happen before
  // any findOrCreate below fills them.
  const panelOrder = collectionPanelOrder(tokens)
  const namesNow = existingCollections.map((c) => c.name)
  const semIdx = namesNow.indexOf(COLLECTIONS.semantics)
  const primIdx = namesNow.indexOf(COLLECTIONS.primitives)
  if (semIdx !== -1 && primIdx !== -1 && primIdx < semIdx) {
    for (const c of [...existingCollections]) {
      if (c.name === COLLECTIONS.semantics || !PLUGIN_COLLECTION_NAMES.has(c.name)) continue
      try {
        c.remove()
        const i = existingCollections.indexOf(c)
        if (i !== -1) existingCollections.splice(i, 1)
        foundationsRebuilt = true
      } catch {
        log(`⚠ Could not restack "${c.name}" in the Variables panel`)
      }
    }
    if (foundationsRebuilt) {
      log(`↻ Variables panel restacked — "${COLLECTIONS.semantics}" stays first, "${COLLECTIONS.primitives}" is recreated below it`)
      const fresh = await figma.variables.getLocalVariablesAsync()
      allVars.length = 0
      allVars.push(...fresh)
    }
  }
  for (const name of panelOrder) findOrCreateCollection(name)

  // Per-collection variable cache keyed by name — looking variables up per token
  // froze on big files.
  function cacheFor(collection: VariableCollection): Map<string, Variable> {
    const m = new Map<string, Variable>()
    for (const v of allVars) {
      if (v.variableCollectionId === collection.id) m.set(v.name, v)
    }
    return m
  }

  function upsertVarIn(
    collection: VariableCollection,
    cache: Map<string, Variable>,
    name: string,
    type: VariableResolvedDataType,
    scopes?: VariableScope[],
  ): Variable {
    const safe = figmaVarName(name)
    const found = cache.get(safe)
    if (found) {
      if (scopes) { try { found.scopes = scopes } catch { /* plan may reject a scope */ } }
      return found
    }
    let created: Variable
    try {
      created = figma.variables.createVariable(safe, collection, type)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      log(`⚠ Could not create variable "${safe}" in "${collection.name}": ${msg}`)
      throw e
    }
    count++
    if (scopes) { try { created.scopes = scopes } catch { /* plan may reject a scope */ } }
    // Primitives exist to be consumed THROUGH Color Semantics, not picked
    // directly — a designer applying "Accent 7" instead of "Content/accent"
    // is exactly the drift the semantic layer exists to prevent. New primitive
    // variables are hidden from publishing by default, so a file consuming
    // this as a library only surfaces the semantic layer in its variable
    // picker; Color Semantics itself is never touched here and stays fully
    // visible. This runs ONLY on first creation — a re-import/sync must never
    // re-hide a ramp the user has since exposed manually via Figma's own
    // "show hidden variables" toggle, or a manual override would get silently
    // reverted on the next sync.
    if (collection.name === COLLECTIONS.primitives) {
      try { created.hiddenFromPublishing = true } catch { /* plan may reject this */ }
    }
    cache.set(safe, created)
    allVars.push(created)
    return created
  }

  // Single-mode collections resolve the same everywhere — write the default mode.
  function setDefault(collection: VariableCollection, v: Variable, value: VariableValue) {
    v.setValueForMode(collection.defaultModeId, value)
  }

  // Theme columns (modes) the CURRENT payload no longer names are stale: they
  // keep whatever theme lived in that column before, so the file goes on
  // showing themes the platform doesn't have any more — and a theme that gets
  // re-added lands in a fresh column that Figma seeds from the default mode,
  // which is why the same values appear twice. These collections' modes are
  // written by this import and by nothing else, so they mirror the payload
  // exactly: anything not in `wanted` goes. Runs BEFORE the missing modes are
  // added, so freeing a stale column also frees room under the plan's
  // mode-per-collection cap.
  function pruneModes(col: VariableCollection, wanted: Set<string>, collLabel: string) {
    // The default mode is never a candidate: callers rename it to the payload's
    // first theme just above, and it's the id they then write that theme into —
    // if the rename was refused, dropping it here would invalidate that id
    // mid-import. Leaving a wrongly-named default column is the mild failure.
    const stale = col.modes.filter((m) => m.modeId !== col.defaultModeId && !wanted.has(m.name))
    const removed: string[] = []
    for (const m of stale) {
      try { col.removeMode(m.modeId); removed.push(m.name) }
      catch (e) { /* in use or last mode — leave it rather than fail the import */ }
    }
    if (removed.length > 0) {
      log(`Removed ${removed.length} stale ${collLabel} theme column${removed.length > 1 ? 's' : ''} (${removed.join(', ')}) — not in the system any more`)
    }
  }

  // Same reasoning one level down, for the ROLES themselves. The web's role
  // catalogue is not frozen (`semanticRoles.ts` has been renamed wholesale
  // once already, see the plugin README), and a role that disappears leaves a
  // variable behind that no longer exists in the system — it keeps its old
  // group heading, so the Variables panel shows groups the platform doesn't
  // have. Only ever called on collections this import fully owns and writes on
  // every run, with the complete set of names this run produced.
  function pruneVars(cache: Map<string, Variable>, written: Set<string>, collLabel: string) {
    const removed: string[] = []
    for (const [name, v] of cache) {
      if (written.has(name)) continue
      try {
        v.remove()
        cache.delete(name)
        const i = allVars.indexOf(v)
        if (i !== -1) allVars.splice(i, 1)
        removed.push(name)
      } catch (e) { /* still bound somewhere — leave it rather than fail the import */ }
    }
    if (removed.length > 0) {
      log(`Removed ${removed.length} stale ${collLabel} token${removed.length > 1 ? 's' : ''} (${removed.slice(0, 6).join(', ')}${removed.length > 6 ? `, +${removed.length - 6} more` : ''}) — not in the system any more`)
    }
  }

  // Emit a single-mode collection from a flat token map. Returns undefined (and
  // creates nothing) when there are no entries.
  function emitCollection(
    collName: string,
    entries: [string, string][] | undefined,
    type: VariableResolvedDataType,
    transform: (val: string) => VariableValue,
    nameOf: (key: string) => string = (k) => k,
  ) {
    if (!entries || entries.length === 0) return
    const col = findOrCreateCollection(collName)
    const cache = cacheFor(col)
    for (const [key, val] of entries) {
      const varName = nameOf(key)
      setDefault(col, upsertVarIn(col, cache, varName, type, scopesForCollection(collName, figmaVarName(varName))), transform(val))
    }
  }

  // Semantic layout roles alias a primitive in the SAME collection
  // (`role/control` → `md`). Returns how many aliases were written.
  function emitRoleAliases(
    collName: string,
    roles: Record<string, string> | undefined,
    primitiveNameOf: (step: string) => string,
  ): number {
    if (!roles) return 0
    const col = findOrCreateCollection(collName)
    const cache = cacheFor(col)
    let n = 0
    for (const [role, step] of Object.entries(roles)) {
      if (typeof step !== 'string' || !step) continue
      const prim = cache.get(figmaVarName(primitiveNameOf(step)))
      if (!prim) continue
      const v = upsertVarIn(col, cache, `role/${role}`, 'FLOAT', scopesForCollection(collName, `role/${role}`))
      setDefault(col, v, figma.variables.createVariableAlias(prim))
      n++
    }
    return n
  }

  // ── Color Primitives — the raw scale, single mode ──────────────────────────
  // Supports both numeric keys (old: 1–12) and prefixed string keys
  // (new: brand-1…12, gray-1…12, error-1…12, etc.)
  const primCol = findOrCreateCollection(COLLECTIONS.primitives)
  const primCache = cacheFor(primCol)

  // Migrate existing variables from old non-padded names (Accent/1) to
  // zero-padded (Accent/01) so re-imports keep bindings intact and the
  // panel sort is corrected without orphaning old variables.
  for (const [name, v] of Array.from(primCache.entries())) {
    const slash = name.lastIndexOf('/')
    if (slash === -1) continue
    const seg = name.slice(slash + 1)
    if (/^\d$/.test(seg)) {
      const newName = `${name.slice(0, slash)}/0${seg}`
      if (!primCache.has(newName)) {
        v.name = newName
        primCache.delete(name)
        primCache.set(newName, v)
      }
    }
  }

  // Sort by family priority (FAMILY_ORDER) then tone numerically so Figma
  // creates groups in the right order: Accent → Neutral → State/* → custom.
  Object.entries(tokens.colors.primitive)
    .sort(([a], [b]) => {
      const aDash = a.lastIndexOf('-'), bDash = b.lastIndexOf('-')
      const aFam  = aDash === -1 ? a : a.slice(0, aDash)
      const bFam  = bDash === -1 ? b : b.slice(0, bDash)
      const aOrd  = FAMILY_ORDER[aFam] ?? 99
      const bOrd  = FAMILY_ORDER[bFam] ?? 99
      if (aOrd !== bOrd) return aOrd - bOrd
      if (aFam !== bFam) return aFam.localeCompare(bFam)
      const aTone = parseInt(a.slice(aDash + 1), 10) || 0
      const bTone = parseInt(b.slice(bDash + 1), 10) || 0
      return aTone - bTone
    })
    .forEach(([key, hex]) => {
      if (!hex) return
      setDefault(primCol, upsertVarIn(primCol, primCache, primitiveVarName(key), 'COLOR'), { ...hexToRgb(hex), a: 1 })
    })
  log(`✓ Primitive scale (${Object.keys(tokens.colors.primitive).length} tones)`)

  // ── Alpha twins — overlay colors (#rrggbbaa) that reproduce each solid step
  // when composited over the page background. Grouped under "<Family>/Alpha/*"
  // inside Color Primitives, in the same family order as the solids.
  if (tokens.colors.primitiveAlpha && Object.keys(tokens.colors.primitiveAlpha).length > 0) {
    Object.entries(tokens.colors.primitiveAlpha)
      .sort(([a], [b]) => {
        const aDash = a.lastIndexOf('-'), bDash = b.lastIndexOf('-')
        const aFam  = aDash === -1 ? a : a.slice(0, aDash)
        const bFam  = bDash === -1 ? b : b.slice(0, bDash)
        const aOrd  = FAMILY_ORDER[aFam] ?? 99
        const bOrd  = FAMILY_ORDER[bFam] ?? 99
        if (aOrd !== bOrd) return aOrd - bOrd
        if (aFam !== bFam) return aFam.localeCompare(bFam)
        const aTone = parseInt(a.slice(aDash + 1), 10) || 0
        const bTone = parseInt(b.slice(bDash + 1), 10) || 0
        return aTone - bTone
      })
      .forEach(([key, hex]) => {
        if (!hex) return
        setDefault(primCol, upsertVarIn(primCol, primCache, primitiveAlphaVarName(key), 'COLOR'), hexToRgba(hex))
      })
    log(`✓ Alpha twins (${Object.keys(tokens.colors.primitiveAlpha).length} tones)`)
  }

  // ── Page background — the canvas color every ramp was generated against ────
  if (tokens.colors.background) {
    setDefault(primCol, upsertVarIn(primCol, primCache, 'Background', 'COLOR'), { ...hexToRgb(tokens.colors.background), a: 1 })
  }

  // One-time forced sweep for files imported before primitives defaulted to
  // hidden — see FILE_PRIMITIVES_HIDDEN_KEY. `primCache` holds every variable
  // in "Color Primitives" at this point, old and new alike, so this is the one
  // place that can reach variables the create-time default in upsertVarIn
  // never touched.
  if (figma.root.getPluginData(FILE_PRIMITIVES_HIDDEN_KEY) !== '1') {
    let hidden = 0
    for (const v of primCache.values()) {
      if (!v.hiddenFromPublishing) {
        try { v.hiddenFromPublishing = true; hidden++ } catch { /* plan may reject this */ }
      }
    }
    try { figma.root.setPluginData(FILE_PRIMITIVES_HIDDEN_KEY, '1') } catch { /* best-effort */ }
    if (hidden > 0) log(`✓ Hid ${hidden} primitive${hidden > 1 ? 's' : ''} from publishing — consume "${COLLECTIONS.semantics}" instead; toggle a variable's eye icon in Figma to expose it again`)
  }

  // Hex → primitive variable, so semantic tokens can alias (link to) the
  // primitive instead of duplicating the raw color. Keyed by lowercase hex;
  // first family wins when two primitives share a hex.
  const primByHex = new Map<string, Variable>()
  for (const [key, hex] of Object.entries(tokens.colors.primitive)) {
    if (!hex) continue
    const v = primCache.get(primitiveVarName(key))
    const norm = normHex(hex)
    if (v && !primByHex.has(norm)) primByHex.set(norm, v)
  }

  // Same index for the ALPHA twins, keyed by the full 8-digit `rrggbbaa`. The
  // alpha-backed semantic roles (`surface.overlay`, `status.*.surface`,
  // `action.ghost.*`, `border.ring.*`, `border.rim-highlight`) resolve to a
  // translucent hex that `colors.primitiveAlpha` also carries verbatim — both
  // come from the same `generateAlphaScale` over the same page background — so
  // a byte match here lets those roles ALIAS their primitive instead of
  // shipping a detached raw fill. Covers light, dark and custom-theme families
  // alike (every `*-a-*` / `*-dark-a-*` / `black-a-*` / `white-a-*` key is
  // indexed), so per-theme repointing is handled by the value already being
  // theme-resolved. First family wins on a shared hex, as with `primByHex`.
  const primAlphaByHex = new Map<string, Variable>()
  for (const [key, hex] of Object.entries(tokens.colors.primitiveAlpha ?? {})) {
    if (!hex) continue
    const v = primCache.get(primitiveAlphaVarName(key))
    const norm = rgbaToHex8(hexToRgba(hex))
    if (v && !primAlphaByHex.has(norm)) primAlphaByHex.set(norm, v)
  }

  // ── Color Semantics — the ONE semantic tier, one mode per theme ───────────
  // Its NAME is always "Color Semantics"; its CONTENT is whatever the platform
  // says the system's contract is — the chosen architecture's own groups and
  // keys when the payload carries one (Astryx, shadcn/ui, Categorical, Carbon,
  // Vibrancy, Tonal), otherwise the flat role catalogue.
  //
  // This used to be TWO collections: the flat catalogue in "Color Semantics"
  // plus the architecture in a collection named after itself ("Astryx",
  // "Categorical Semantic"…). That put two competing semantic vocabularies for
  // the same system in one file, and named one of them after a platform-side
  // label a designer opening the file has no way to decode — reported as "en
  // vez de llamarse Astryx se debería llamar Color Semantics […] la otra es la
  // falsa". Both were always the same system read two ways, so shipping only
  // the reading the user picked loses no information.
  //
  // What the merge does cost, stated plainly: for carbon / vibrancy / tonal the
  // COLUMNS are now the architecture's own fixed modes (Carbon's four themes;
  // light/dark for the other two) instead of the user's theme list, because
  // those three define their modes as part of their contract. Mirroring the
  // platform means mirroring that too. For astryx / shadcn / categorical the
  // architecture resolves per user theme, so the columns are the user's themes
  // exactly as before.
  const semCol = findOrCreateCollection(COLLECTIONS.semantics)
  const semCache = cacheFor(semCol)
  const themes: Record<string, Record<string, string>> =
    tokens.colors.themes && Object.keys(tokens.colors.themes).length > 0
      ? tokens.colors.themes
      : {
          light: tokens.colors.semantic || {},
          ...(tokens.colors.semanticDark ? { dark: tokens.colors.semanticDark } : {}),
        }
  // Column order: honor the configurator's themeOrder, then append any theme not
  // listed there. Each theme becomes one variable-collection mode (a column).
  const ordered = (tokens.colors.themeOrder ?? []).filter((t) => themes[t])
  const themeNames = [...ordered, ...Object.keys(themes).filter((t) => !ordered.includes(t))]
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const arch = tokens.colors.architecture
  const norm = arch ? normalizeArchitecture(arch, themeNames) : null
  if (arch && !norm) {
    // A payload shape this build doesn't know. Say so rather than shipping a
    // file that silently claims to be on an architecture it never wrote.
    log(`⚠ "${arch.kind}" architecture present but its token payload couldn't be read — falling back to the flat role catalogue`)
  }

  // Modes: the architecture's own when there is one, else one per user theme.
  const modeSpec: [string, string][] = norm ? norm.modes : themeNames.map((t) => [t, cap(t)] as [string, string])
  const modeIdOf: Record<string, string> = {}
  const skippedModes: string[] = []
  try { semCol.renameMode(semCol.defaultModeId, modeSpec[0][1]) } catch (e) { /* not allowed */ }
  pruneModes(semCol, new Set(modeSpec.map(([, label]) => label)), COLLECTIONS.semantics)
  modeIdOf[modeSpec[0][0]] = semCol.defaultModeId
  for (const [key, label] of modeSpec.slice(1)) {
    const found = semCol.modes.find((m) => m.name === label)
    if (found) { modeIdOf[key] = found.modeId; continue }
    try { modeIdOf[key] = semCol.addMode(label) } catch (e) { skippedModes.push(label) }
  }
  const allModeIds = Object.values(modeIdOf)
  // Adding modes fails once the file's plan mode cap is hit (Figma Free allows 1
  // mode per collection, Professional up to 4). Surface it as one clear line so
  // the user knows the missing columns are a plan limit, not a bug.
  if (skippedModes.length > 0) {
    log(`⚠ ${skippedModes.length} theme column${skippedModes.length > 1 ? 's' : ''} skipped (${skippedModes.join(', ')}) — your Figma plan's mode-per-collection limit was reached. Upgrade the plan to add more theme columns.`)
  }

  // ── The plan: which variables, in which order, holding what ──────────────
  // Built in full BEFORE anything is written, because ORDER is the one thing
  // that can't be fixed afterwards: Figma has no reorder API (a collection's
  // `variableIds` is readonly), so where a variable sits in the panel — and
  // therefore where its GROUP sits, since a group's position is its first
  // member's — is decided by creation order and never changes again.
  //
  // That's what made the groups drift out of the platform's order. `upsert`
  // reuses a variable that already exists, keeping its old position, and only
  // appends the new ones: switch architecture and the handful of names the two
  // vocabularies share (`Border/default`, `Status/error`…) stay pinned where
  // the OLD system put them, dragging their group to the top while everything
  // else lands after it. Comparing the planned order against the collection's
  // actual order catches exactly that, and the only fix Figma allows is to
  // recreate the variables in order.
  interface SemPlanEntry {
    name: string
    type: VariableResolvedDataType
    values: [string, VariableValue][]
  }
  const plan: SemPlanEntry[] = []
  let aliasedCount = 0
  let rawCount = 0
  let unresolvedCount = 0
  // Alias to the primitive when one carries this exact colour: an opaque value
  // against `primByHex`, a translucent one against `primAlphaByHex` (the
  // alpha-backed roles — `surface.overlay`, `status.*.surface`,
  // `action.ghost.*`, `border.ring.*`, `border.rim-highlight`). A translucent
  // value with no alpha twin (a hand-authored rgba) still falls through to
  // raw. Decided here so the plan holds the final value and the write loop
  // stays dumb.
  const valueFor = (rgba: RGBA): VariableValue => {
    const prim = rgba.a === 1
      ? primByHex.get(normHex(rgbaToHex(rgba)))
      : primAlphaByHex.get(rgbaToHex8(rgba))
    if (prim) { aliasedCount++; return figma.variables.createVariableAlias(prim) }
    rawCount++
    return rgba
  }

  if (norm && arch) {
    // ── The architecture, verbatim: its groups, its keys, its modes ─────────
    // Group and key order come straight from normalizeArchitecture, which
    // mirrors the configurator's own sidebar (ARCH_GROUPS) — so the panel
    // reads like the platform's semantics screen, top to bottom.
    //
    // Tonal's refs resolve against its OWN 0–100 palettes, never
    // colors.primitive — see archValueRgba.
    const palettes = arch.palettes as Record<string, Record<string, string>> | undefined
    const lookup = arch.kind === 'tonal'
      ? (fam: string, tone: string) => palettes?.[fam]?.[tone]
      : (fam: string, tone: string) => primitiveRefHex(tokens, fam, tone)

    for (const group of norm.groups) {
      for (const tok of group.tokens) {
        // Resolve every mode BEFORE planning the variable: a token nothing
        // resolves for (an unknown ref form) is skipped rather than created
        // empty, which in Figma reads as transparent black.
        const resolved: [string, RGBA | undefined][] = []
        let base: RGBA | undefined
        for (const [modeKey] of norm.modes) {
          const mid = modeIdOf[modeKey]
          if (!mid) continue
          const rgba = archValueRgba(tok.byMode[modeKey] ?? '', lookup)
          if (rgba && !base) base = rgba
          resolved.push([mid, rgba])
        }
        if (!base) { unresolvedCount++; continue }
        // No mode reads as empty: a token that doesn't carry every mode (a
        // theme added after the projection was built) falls back to its first
        // resolved value instead of leaving that column transparent black.
        plan.push({
          name: archFigmaName(group.label, tok.key),
          type: 'COLOR',
          values: resolved.map(([mid, rgba]) => [mid, valueFor(rgba ?? base!)]),
        })
      }
    }
  } else {
    // ── Flat role catalogue — grouped by first segment (background/content/
    // border…), one value per theme mode. Role order is the payload's own key
    // order (the configurator's ALL_ROLES), so the groups land in its order
    // too. Roles missing in a theme fall back to the first theme's value so no
    // mode reads as empty.
    const roleKeys = new Set<string>()
    for (const t of themeNames) Object.keys(themes[t]).forEach((k) => roleKeys.add(k))
    for (const key of roleKeys) {
      const baseHex =
        themes[themeNames[0]][key] ||
        themeNames.map((t) => themes[t][key]).find(Boolean)
      if (!baseHex) continue
      const values: [string, VariableValue][] = []
      for (const t of themeNames) {
        const mid = modeIdOf[t]
        if (!mid) continue
        values.push([mid, valueFor({ ...hexToRgb(themes[t][key] || baseHex), a: 1 })])
      }
      plan.push({ name: semanticVarName(key), type: 'COLOR', values })
    }
  }

  // Radix-style panel treatment for surface-1 — shipped as a STRING variable so
  // designers (and future imports) can read how raised surfaces should render.
  if (tokens.colors.panelBackground) {
    const pb = tokens.colors.panelBackground
    plan.push({ name: 'panel-background', type: 'STRING', values: allModeIds.map((mid) => [mid, pb] as [string, VariableValue]) })
  }

  // ── Order check ───────────────────────────────────────────────────────────
  // Anything other than an exact match — a reordered group, a token added in
  // the middle, a whole vocabulary swapped — is repaired the only way Figma
  // allows: drop the collection's variables and recreate them in order. The
  // import then rebuilds the components and boards that pointed at them (see
  // `semanticsRebuilt` in the import handler), so nothing is left bound to a
  // variable that no longer exists.
  const desired = plan.map((e) => e.name)
  const byId = new Map(allVars.map((v) => [v.id, v] as const))
  const currentVars = semCol.variableIds
    .map((id) => byId.get(id))
    .filter((v): v is Variable => v !== undefined)
  const currentNames = currentVars.map((v) => v.name)
  if (currentNames.length > 0 && currentNames.join(' ') !== desired.join(' ')) {
    let dropped = 0
    let stuck = 0
    // By object, not by name: two variables can carry the same name (the cache
    // keeps the first), and removing by name would strand the twin — out of
    // order and invisible to the prune that follows.
    for (const v of currentVars) {
      try {
        v.remove()
        dropped++
        const i = allVars.indexOf(v)
        if (i !== -1) allVars.splice(i, 1)
      } catch (e) { stuck++ }
    }
    semCache.clear()
    semanticsRebuilt = true
    log(`↻ "${COLLECTIONS.semantics}" rebuilt in the platform's order (${dropped} token${dropped === 1 ? '' : 's'} recreated${stuck > 0 ? `, ${stuck} could not be removed and stay where they were` : ''}) — Figma has no reorder API, so recreating them is the only way the groups can follow the system`)
  }

  for (const entry of plan) {
    const scopes = entry.type === 'COLOR' ? scopesForSemantic(entry.name) : undefined
    const v = upsertVarIn(semCol, semCache, entry.name, entry.type, scopes)
    for (const [mid, value] of entry.values) v.setValueForMode(mid, value)
  }

  if (norm && arch) {
    log(`✓ Semantic tokens — ${ARCH_LABEL[arch.kind] ?? arch.kind} architecture (${plan.length} tokens · ${norm.groups.length} groups × ${allModeIds.length} mode${allModeIds.length > 1 ? 's' : ''} — ${aliasedCount} linked to primitives${unresolvedCount > 0 ? `, ${unresolvedCount} unresolved` : ''})`)
  } else {
    log(`✓ Semantic tokens (${plan.length} roles × ${allModeIds.length} theme${allModeIds.length > 1 ? 's' : ''} — ${aliasedCount} linked to primitives${rawCount > 0 ? `, ${rawCount} raw` : ''})`)
  }

  pruneVars(semCache, new Set(desired), COLLECTIONS.semantics)


  // ── Collections this plugin used to create and no longer does ─────────────
  // The per-architecture collections (now merged into "Color Semantics" above)
  // and "Components" (the per-component alias tier — see importSample). Both
  // are removed by exact name, so nothing a user made by hand is touched.
  for (const stale of existingCollections.filter((c) => LEGACY_COLLECTIONS.indexOf(c.name) !== -1)) {
    const staleName = stale.name
    try {
      stale.remove()
      // Drop it from the cached list too — findOrCreateCollection reads this
      // array, and a removed collection object would resolve as a live one.
      existingCollections.splice(existingCollections.indexOf(stale), 1)
      log(`Removed "${staleName}" — merged into "${COLLECTIONS.semantics}"`)
    } catch (e) { /* still referenced — leave it rather than fail the import */ }
  }

  // ── Typography — one collection, mixed types (size/weight FLOAT, family STRING) ─
  const typoCol = findOrCreateCollection(COLLECTIONS.typography)
  const typoCache = cacheFor(typoCol)
  function typoVar(name: string, type: VariableResolvedDataType, value: VariableValue) {
    setDefault(typoCol, upsertVarIn(typoCol, typoCache, name, type, scopesForCollection(COLLECTIONS.typography, name)), value)
  }
  Object.entries(tokens.typography.sizes).forEach(([key, val]) => typoVar(`size/${key}`, 'FLOAT', pxToFloat(val)))
  Object.entries(tokens.typography.weights).forEach(([key, val]) => typoVar(`weight/${key}`, 'FLOAT', val))
  typoVar('family', 'STRING', tokens.typography.fontFamily)
  // Separate heading font family when it differs from the body font
  if (tokens.typography.headingFontFamily &&
      tokens.typography.headingFontFamily !== tokens.typography.fontFamily) {
    typoVar('heading-family', 'STRING', tokens.typography.headingFontFamily)
  }
  if (tokens.typography.lineHeights) {
    Object.entries(tokens.typography.lineHeights).forEach(([key, val]) => typoVar(`line-height/${key}`, 'FLOAT', pxToFloat(val)))
  }
  if (tokens.typography.letterSpacings) {
    Object.entries(tokens.typography.letterSpacings).forEach(([key, val]) => typoVar(`letter-spacing/${key}`, 'FLOAT', pxToFloat(val)))
  }
  const typeRoles = tokens.typography.roles
  if (typeRoles) {
    let roleCount = 0
    for (const [key, modes] of Object.entries(typeRoles)) {
      const d = modes?.desktop
      if (!d) continue
      const sizePrim = typoCache.get(figmaVarName(`size/${d.size}`))
      const weightPrim = typoCache.get(figmaVarName(`weight/${d.weight}`))
      const familyName = d.family === 'display' && typoCache.get('heading-family')
        ? 'heading-family'
        : 'family'
      const familyPrim = typoCache.get(figmaVarName(familyName))
      if (sizePrim) {
        typoVar(`role/${key}/size`, 'FLOAT', figma.variables.createVariableAlias(sizePrim))
        roleCount++
      }
      if (weightPrim) {
        typoVar(`role/${key}/weight`, 'FLOAT', figma.variables.createVariableAlias(weightPrim))
      }
      if (familyPrim) {
        typoVar(`role/${key}/family`, 'STRING', figma.variables.createVariableAlias(familyPrim))
      }
    }
    if (roleCount > 0) log(`✓ Typography roles (${roleCount} aliased to size/weight/family)`)
  }
  log(`✓ Typography tokens`)

  // ── Remaining single-mode categories ───────────────────────────────────────
  emitCollection(COLLECTIONS.spacing, Object.entries(tokens.spacing), 'FLOAT', pxToFloat)
  const spacingRoleCount = emitRoleAliases(COLLECTIONS.spacing, tokens.spacingRoles, (s) => s)
  log(`✓ Spacing tokens (${Object.keys(tokens.spacing).length} steps${spacingRoleCount ? ` · ${spacingRoleCount} roles` : ''})`)

  // Per-side surface padding nests inside Spacing as "padding/top…left".
  if (tokens.padding && Object.keys(tokens.padding).length > 0) {
    emitCollection(COLLECTIONS.spacing, Object.entries(tokens.padding), 'FLOAT', pxToFloat, (k) => `padding/${k}`)
    log(`✓ Surface padding tokens (${Object.keys(tokens.padding).length} sides)`)
  }

  emitCollection(COLLECTIONS.radius, Object.entries(tokens.radius), 'FLOAT', pxToFloat)
  const radiusRoleCount = emitRoleAliases(COLLECTIONS.radius, tokens.radiusRoles, (s) => s)
  log(`✓ Radius tokens${radiusRoleCount ? ` · ${radiusRoleCount} roles` : ''}`)

  const strokeFromV6 = tokens.stroke && Object.keys(tokens.stroke).length > 0
  const strokeMap = strokeFromV6 ? tokens.stroke : tokens.borders?.width
  if (strokeMap) {
    const nameOf = strokeFromV6 ? (k: string) => k : (k: string) => `width/${k}`
    emitCollection(COLLECTIONS.border, Object.entries(strokeMap), 'FLOAT', pxToFloat, nameOf)
    const strokeRoleCount = emitRoleAliases(COLLECTIONS.border, tokens.strokeRoles, (s) => s)
    log(`✓ Border width tokens (${Object.keys(strokeMap).length}${strokeRoleCount ? ` · ${strokeRoleCount} roles` : ''})`)
  }

  if (tokens.opacity) {
    emitCollection(COLLECTIONS.opacity, Object.entries(tokens.opacity), 'FLOAT', (v) => (parseFloat(v) || 0) / 100)
    log(`✓ Opacity tokens (${Object.keys(tokens.opacity).length})`)
  }

  if (tokens.sizes) {
    emitCollection(COLLECTIONS.size, Object.entries(tokens.sizes), 'FLOAT', pxToFloat)
    const sizeRoleCount = emitRoleAliases(COLLECTIONS.size, tokens.sizeRoles, (s) => s)
    log(`✓ Size tokens (${Object.keys(tokens.sizes).length}${sizeRoleCount ? ` · ${sizeRoleCount} roles` : ''})`)
  }

  if (tokens.grid) {
    emitCollection(COLLECTIONS.grid, Object.entries(tokens.grid), 'FLOAT', pxToFloat)
    const bpRoleCount = emitRoleAliases(COLLECTIONS.grid, tokens.breakpointRoles, (s) => `breakpoint-${s}`)
    log(`✓ Grid tokens (${Object.keys(tokens.grid).length}${bpRoleCount ? ` · ${bpRoleCount} breakpoint roles` : ''})`)
  }

  if (tokens.icons?.library) {
    emitCollection(COLLECTIONS.icons, [['library', tokens.icons.name || tokens.icons.library]], 'STRING', (v) => v)
  }

  if (tokens.copy) {
    emitCollection(COLLECTIONS.copy, Object.entries(tokens.copy), 'STRING', (v) => v)
    log(`✓ Copy tokens (${Object.keys(tokens.copy).length} strings)`)
  }

  // ── Migration: drop leftover project-named collections ────────────────────
  // Older plugin builds named the one collection after `tokens.project`
  // ("Jasdy", …). Today's collections have plain names (Color Semantics, …).
  // The sweep used to only delete a collection named after THIS payload's
  // project — switching systems left the previous name behind forever, and
  // Export then dumped it as if it were still the synced system.
  const protectedNames = new Set<string>([...Object.values(COLLECTIONS), ...Object.values(ARCH_LABEL)])
  for (const leftoverName of leftoverProjectNames(tokens.project || '')) {
    if (protectedNames.has(leftoverName)) continue
    const leftover = existingCollections.find((c) => c.name === leftoverName)
    if (!leftover) continue
    try {
      leftover.remove()
      existingCollections.splice(existingCollections.indexOf(leftover), 1)
      log(`✓ Removed leftover "${leftoverName}" collection — this file now holds "${tokens.project || 'untitled'}"`)
    } catch (e) { /* still referenced — leave it rather than fail the import */ }
  }
  log(`ℹ One design system per file — add variants as themes (modes) in "Color Semantics".`)

  return count
}

// Parse a CSS box-shadow list ("0 1px 2px rgba(…), 0 1px 3px …") into Figma effects.
function parseBoxShadow(css: string): DropShadowEffect[] {
  // Split on top-level commas only (rgba() contains commas too)
  const layers: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of css) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) { layers.push(cur); cur = '' } else { cur += ch }
  }
  if (cur.trim()) layers.push(cur)

  const effects: DropShadowEffect[] = []
  for (const layer of layers) {
    let rest = layer.trim()
    if (!rest || /^none$/i.test(rest)) continue
    if (/\binset\b/i.test(rest)) continue // inner shadows aren't in the elevation ramp

    let color = { r: 0, g: 0, b: 0, a: 0.1 }
    const rgbaComma = rest.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i)
    const rgbaSpace = rest.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i)
    const hexC = rest.match(/#([0-9a-fA-F]{3,8})\b/)
    if (rgbaComma) {
      color = { r: Number(rgbaComma[1]) / 255, g: Number(rgbaComma[2]) / 255, b: Number(rgbaComma[3]) / 255, a: rgbaComma[4] === undefined ? 1 : Number(rgbaComma[4]) }
      rest = rest.replace(rgbaComma[0], '')
    } else if (rgbaSpace) {
      color = { r: Number(rgbaSpace[1]) / 255, g: Number(rgbaSpace[2]) / 255, b: Number(rgbaSpace[3]) / 255, a: rgbaSpace[4] === undefined ? 1 : Number(rgbaSpace[4]) }
      rest = rest.replace(rgbaSpace[0], '')
    } else if (hexC) {
      color = hexToRgba('#' + hexC[1])
      rest = rest.replace(hexC[0], '')
    }

    const nums = rest.trim().split(/\s+/).map(pxToFloat).filter((n) => !Number.isNaN(n))
    if (nums.length < 3) continue
    const [x, y, blur, spread = 0] = nums
    effects.push({
      type: 'DROP_SHADOW',
      color,
      offset: { x, y },
      radius: blur,
      spread,
      visible: true,
      blendMode: 'NORMAL',
    })
  }
  return effects
}

// Parse a configurator gradient ("linear-gradient(135deg, #aabbcc 0%, …)" or
// "radial-gradient(circle at 30% 30%, …)") into a Figma GradientPaint. Stops
// are the 6/8-digit hex + percent pairs gradientToCss emits; anything else
// returns null and callers fall back to a solid.
function parseCssGradient(css: string): GradientPaint | null {
  const m = css.trim().match(/^(linear|radial)-gradient\((.*)\)$/)
  if (!m) return null
  const radial = m[1] === 'radial'
  let body = m[2].trim()
  let angle = 180 // CSS default: to bottom
  if (radial) {
    body = body.replace(/^circle\s+at\s+[^,]+,\s*/, '')
  } else {
    const am = body.match(/^(-?\d+(?:\.\d+)?)deg\s*,\s*/)
    if (am) { angle = parseFloat(am[1]); body = body.slice(am[0].length) }
  }
  const gradientStops: ColorStop[] = []
  for (const part of body.split(',')) {
    const sm = part.trim().match(/^(#[0-9a-fA-F]{3,8})\s+(-?\d+(?:\.\d+)?)%$/)
    if (!sm) return null
    gradientStops.push({
      color: hexToRgba(sm[1]),
      position: Math.max(0, Math.min(1, parseFloat(sm[2]) / 100)),
    })
  }
  if (gradientStops.length < 2) return null

  if (radial) {
    // circle at 30% 30% — center the handles there, radius reaching the far edge
    const cx = 0.3, cy = 0.3, r = 0.9
    return {
      type: 'GRADIENT_RADIAL',
      gradientStops,
      gradientTransform: [[r, 0, cx - r / 2], [0, r, cy - r / 2]],
    }
  }
  // CSS angles run clockwise from "up"; rotate the unit gradient axis around
  // the shape's center so 0deg = bottom→top, 90deg = left→right.
  const rad = ((angle - 90) * Math.PI) / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  return {
    type: 'GRADIENT_LINEAR',
    gradientStops,
    gradientTransform: [
      [cos, sin, 0.5 - 0.5 * cos - 0.5 * sin],
      [-sin, cos, 0.5 + 0.5 * sin - 0.5 * cos],
    ],
  }
}

// Resolve the gradient assigned to a preview surface ("cover" / "avatar") into
// a Figma paint, or null when the payload carries none.
function assignedGradient(tokens: DesignTokens, surface: 'cover' | 'avatar'): GradientPaint | null {
  const slug = tokens.gradientAssignments?.[surface]
  if (!slug) return null
  const css = tokens.gradients?.[slug]
  return css ? parseCssGradient(css) : null
}

// ─── Color Styles ────────────────────────────────────────────────────────────

async function importStyles(tokens: DesignTokens): Promise<number> {
  let count = 0
  const fontFamily = tokens.typography.fontFamily || 'Inter'
  const headingFamily = tokens.typography.headingFontFamily || fontFamily

  const textByName = new Map(
    (await figma.getLocalTextStylesAsync()).map((s) => [s.name, s] as const),
  )

  // ── Color paint styles are NOT generated — colors live in the variable
  // system only (Color Primitives / Color Semantics). Clean up the paint
  // styles older plugin versions created so re-imports converge on
  // variables-only.
  const stalePaints = (await figma.getLocalPaintStylesAsync()).filter((s) => {
    const parts = s.name.split('/')
    return parts.length >= 2 && (parts[1] === 'Scale' || parts[1] === 'Semantic')
  })
  if (stalePaints.length > 0) {
    for (const s of stalePaints) { try { s.remove() } catch {} }
    log(`✓ Removed ${stalePaints.length} legacy color paint styles (colors are variables-only now)`)
  }

  // Drop every project-prefixed leftover (`Jasdy/Type/…`, `Escala/Shadow/…`).
  // New styles live at Type/ Shadow/ Gradient/ Grid/ with no project folder,
  // so a previous system's name cannot keep showing up in the panel.
  const inheritedDropped = await removeInheritedStyles()
  if (inheritedDropped > 0) {
    log(`✓ Removed ${inheritedDropped} inherited style${inheritedDropped === 1 ? '' : 's'} prefixed with a previous project name`)
  }

  // ── Gradient paint styles ─────────────────────────────────────────────────
  // The one colour foundation that CANNOT be a variable: Figma has no gradient
  // variable type, so a paint style is the only way to ship a gradient as
  // something a designer can actually apply and re-bind.
  //
  // They were parsed already — painted onto the Cover page and drawn as
  // swatches on the Documentation board — but never created as STYLES, so the
  // system's gradients arrived as pictures of themselves and couldn't be used
  // on anything. Reported as "los gradientes como style no se están
  // exportando". The variables-only rule above is about SOLID colours (which
  // do have a variable type) and deliberately doesn't reach here.
  const gradients = tokens.gradients ?? {}
  if (Object.keys(gradients).length > 0) {
    const paintByName = new Map(
      (await figma.getLocalPaintStylesAsync()).map((s) => [s.name, s] as const),
    )
    const upsertPaint = (name: string, paint: GradientPaint) => {
      const existing = paintByName.get(name)
      const style = existing ?? figma.createPaintStyle()
      if (!existing) { count++; paintByName.set(name, style) }
      style.name = name
      style.paints = [paint]
    }

    const assigned = tokens.gradientAssignments ?? {}
    let made = 0
    let darkMade = 0
    const unparsed: string[] = []
    for (const [slug, css] of Object.entries(gradients)) {
      const paint = parseCssGradient(css)
      // parseCssGradient returns null for a form it doesn't handle (conic, a
      // colour-stop syntax it can't read). Name them in the log rather than
      // dropping them silently — the same gradient still paints the Cover.
      if (!paint) { unparsed.push(slug); continue }
      upsertPaint(`Gradient/${slug}`, paint)
      made++

      // Dark variants get their own style: a paint style has no modes, so a
      // light/dark pair can't live in one. Only when it genuinely differs —
      // see the gradientsDark type comment.
      const darkCss = tokens.gradientsDark?.[slug]
      if (darkCss && darkCss !== css) {
        const darkPaint = parseCssGradient(darkCss)
        if (darkPaint) { upsertPaint(`Gradient/${slug} (Dark)`, darkPaint); darkMade++ }
      }
    }
    // Which gradient drives which surface is part of the contract, and the
    // style list alone doesn't say it.
    const tags = (['cover', 'avatar'] as const)
      .filter((s) => assigned[s])
      .map((s) => `${s} → ${assigned[s]}`)
    if (made > 0) {
      log(`✓ Gradient paint styles (${made}${darkMade > 0 ? ` + ${darkMade} dark` : ''})${tags.length ? ` — ${tags.join(', ')}` : ''}`)
    }
    if (unparsed.length > 0) {
      log(`⚠ ${unparsed.length} gradient${unparsed.length > 1 ? 's' : ''} couldn't be converted to a Figma paint (${unparsed.join(', ')}) — unsupported CSS gradient form`)
    }
  }

  // Typography variables — text styles bind to the same variables the stubs
  // use (family / heading-family / size / line-height / letter-spacing), so
  // styles and variables can never drift apart.
  const typoVars = new Map<string, Variable>()
  {
    const cols = await figma.variables.getLocalVariableCollectionsAsync()
    const typoCol = cols.find((c) => c.name === COLLECTIONS.typography)
    if (typoCol) {
      for (const v of await figma.variables.getLocalVariablesAsync()) {
        if (v.variableCollectionId === typoCol.id) typoVars.set(v.name, v)
      }
    }
  }
  function bindTextStyle(ts: TextStyle, field: VariableBindableTextField, v: Variable | undefined) {
    if (!v) return
    try { ts.setBoundVariable(field, v) } catch {}
  }

  // ── Text styles: one per typography size ────────────────────────────────
  // Preload fonts needed for text style creation (body + heading families)
  const loadedFamilies = new Set<string>()
  for (const family of new Set([fontFamily, headingFamily])) {
    let ok = false
    for (const style of ['Regular', 'Medium', 'Semi Bold', 'Bold'] as const) {
      try { await figma.loadFontAsync({ family, style }); ok = true } catch {}
    }
    if (ok) loadedFamilies.add(family)
    else {
      try { await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }) } catch {}
      log(`⚠ Font "${family}" is not available in this file — text styles fall back to Inter and won't match the Typography "family" variable ("${family}"). Install/enable the font and re-import.`)
    }
  }

  // Weight map: find the weight value for each key. Size keys (text-sm,
  // display-xl…) don't exist in the weight map — display sizes read as
  // headings, so they default to semibold.
  const weightMap = tokens.typography.weights ?? {}
  function resolvedStyle(weightKey: string): string {
    const val = weightMap[weightKey]
      ?? (weightKey.startsWith('display') ? (weightMap.semibold ?? 600) : 400)
    if (val >= 700) return 'Bold'
    if (val >= 600) return 'Semi Bold'
    if (val >= 500) return 'Medium'
    return 'Regular'
  }

  for (const [sizeKey, sizeVal] of Object.entries(tokens.typography.sizes)) {
    const sizePx = pxToFloat(sizeVal)
    if (!sizePx) continue

    const styleName = `Type/size/${sizeKey}`
    const existing  = textByName.get(styleName)
    const ts        = existing ?? figma.createTextStyle()
    if (!existing) { count++; textByName.set(styleName, ts) }
    ts.name = styleName

    // Font family — display/heading sizes use the heading typeface (matching
    // the "heading-family" variable), everything else the body family
    // (matching "family"). Falls back to Inter only when the font isn't
    // available (warned above).
    const isHeading = /^(display|heading)/.test(sizeKey)
    const wantedFamily = isHeading ? headingFamily : fontFamily
    const fontStyle = resolvedStyle(sizeKey)
    try {
      ts.fontName = { family: loadedFamilies.has(wantedFamily) ? wantedFamily : 'Inter', style: fontStyle }
    } catch {
      ts.fontName = { family: 'Inter', style: fontStyle }
    }

    ts.fontSize = sizePx

    // Line height — use matching key if available, else AUTO
    const lhVal = tokens.typography.lineHeights?.[sizeKey]
    ts.lineHeight = lhVal
      ? { value: pxToFloat(lhVal), unit: 'PIXELS' }
      : { unit: 'AUTO' }

    // Letter spacing — use matching key if available, else 0
    const lsVal = tokens.typography.letterSpacings?.[sizeKey]
    ts.letterSpacing = lsVal
      ? { value: pxToFloat(lsVal), unit: 'PIXELS' }
      : { value: 0, unit: 'PIXELS' }

    // Bind the style to the Typography variables so both stay in lockstep:
    // family (or heading-family), size/<key>, line-height/<key>,
    // letter-spacing/<key>. Values above remain as fallbacks.
    bindTextStyle(ts, 'fontFamily',
      (isHeading ? typoVars.get('heading-family') : undefined) ?? typoVars.get('family'))
    bindTextStyle(ts, 'fontSize', typoVars.get(`size/${sizeKey}`))
    bindTextStyle(ts, 'fontWeight', typoVars.get(`weight/${isHeading ? 'semibold' : 'regular'}`) ?? typoVars.get('weight/regular'))
    bindTextStyle(ts, 'lineHeight', typoVars.get(`line-height/${sizeKey}`))
    bindTextStyle(ts, 'letterSpacing', typoVars.get(`letter-spacing/${sizeKey}`))
  }

  if (Object.keys(tokens.typography.sizes).length > 0) {
    log(`✓ Text styles (${Object.keys(tokens.typography.sizes).length} sizes)`)
  }

  // Semantic type roles — one style per role, bound to role/{key}/* so the
  // style tracks the alias (heading-lg → display-md / semibold), not a raw px.
  const typeRoles = tokens.typography.roles
  if (typeRoles) {
    let roleStyles = 0
    for (const [key, modes] of Object.entries(typeRoles)) {
      const d = modes?.desktop
      if (!d) continue
      const sizeVal = tokens.typography.sizes[d.size]
      const sizePx = sizeVal ? pxToFloat(sizeVal) : 0
      if (!sizePx) continue
      const styleName = `Type/${key}`
      const existing = textByName.get(styleName)
      const ts = existing ?? figma.createTextStyle()
      if (!existing) { count++; textByName.set(styleName, ts) }
      ts.name = styleName
      const isHeading = d.family === 'display'
      const wantedFamily = isHeading ? headingFamily : fontFamily
      const fontStyle = resolvedStyle(d.weight)
      try {
        ts.fontName = { family: loadedFamilies.has(wantedFamily) ? wantedFamily : 'Inter', style: fontStyle }
      } catch {
        ts.fontName = { family: 'Inter', style: fontStyle }
      }
      ts.fontSize = sizePx
      const lhVal = tokens.typography.lineHeights?.[d.size]
      ts.lineHeight = lhVal
        ? { value: pxToFloat(lhVal), unit: 'PIXELS' }
        : { unit: 'AUTO' }
      const lsVal = tokens.typography.letterSpacings?.[d.size]
      ts.letterSpacing = lsVal
        ? { value: pxToFloat(lsVal), unit: 'PIXELS' }
        : { value: 0, unit: 'PIXELS' }
      bindTextStyle(ts, 'fontFamily',
        typoVars.get(`role/${key}/family`)
          ?? (isHeading ? typoVars.get('heading-family') : undefined)
          ?? typoVars.get('family'))
      bindTextStyle(ts, 'fontSize', typoVars.get(`role/${key}/size`) ?? typoVars.get(`size/${d.size}`))
      bindTextStyle(ts, 'fontWeight', typoVars.get(`role/${key}/weight`) ?? typoVars.get(`weight/${d.weight}`))
      bindTextStyle(ts, 'lineHeight', typoVars.get(`line-height/${d.size}`))
      bindTextStyle(ts, 'letterSpacing', typoVars.get(`letter-spacing/${d.size}`))
      roleStyles++
    }
    if (roleStyles > 0) log(`✓ Text styles (${roleStyles} semantic roles)`)
  }

  // ── Effect styles: shadows ──────────────────────────────────────────────
  if (tokens.shadows && Object.keys(tokens.shadows).length > 0) {
    const effectByName = new Map(
      (await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s] as const),
    )
    const upsertEffect = (name: string, css: string): boolean => {
      const effects = parseBoxShadow(css)
      if (effects.length === 0) return false
      const existing = effectByName.get(name)
      const style = existing ?? figma.createEffectStyle()
      if (!existing) { count++; effectByName.set(name, style) }
      style.name = name
      style.effects = effects
      return true
    }
    let made = 0
    let darkMade = 0
    const unparsed: string[] = []
    for (const [key, css] of Object.entries(tokens.shadows)) {
      if (upsertEffect(`Shadow/${key}`, css)) made++
      else unparsed.push(key)
      const darkCss = tokens.shadowsDark?.[key]
      if (darkCss && darkCss !== css) {
        if (upsertEffect(`Shadow/${key} (Dark)`, darkCss)) darkMade++
      }
    }
    if (made > 0) {
      log(`✓ Shadow effect styles (${made}${darkMade > 0 ? ` + ${darkMade} dark` : ''})`)
    }
    if (unparsed.length > 0) {
      log(`⚠ ${unparsed.length} shadow${unparsed.length > 1 ? 's' : ''} couldn't be converted to a Figma effect (${unparsed.join(', ')}) — unsupported CSS box-shadow form`)
    }
  }

  // ── Grid style: column grid from grid tokens ────────────────────────────
  if (tokens.grid?.columns) {
    const name = `Grid/${tokens.grid.columns} columns`
    const gridByName = new Map(
      (await figma.getLocalGridStylesAsync()).map((s) => [s.name, s] as const),
    )
    const existing = gridByName.get(name)
    const style = existing ?? figma.createGridStyle()
    if (!existing) count++
    style.name = name
    style.layoutGrids = [{
      pattern: 'COLUMNS',
      alignment: 'STRETCH',
      count: parseInt(tokens.grid.columns) || 12,
      gutterSize: pxToFloat(tokens.grid.gutter ?? '24px'),
      offset: pxToFloat(tokens.grid.margin ?? '32px'),
    }]
    log(`✓ Grid style (${name})`)
  }

  return count
}

// ─── Components ──────────────────────────────────────────────────────────────
// Real Figma COMPONENT SETS with the universal variant matrix per atom —
// Button: Color × Style × State, Input: State, Checkbox/Toggle: Checked × State,
// Badge: Style × Color, Avatar/Spinner: Size, Toast: Status, Divider:
// Orientation. Every fill / stroke / radius / padding / font is bound to the
// imported variables (component tokens → semantics → primitives), editable text
// is exposed as component TEXT properties, and re-imports rebuild each variant
// IN PLACE so placed instances update live.

// ─── Documentation chrome — shared fixed-light editorial helpers ────────────
// Used by the component pages AND the Icons page. The chrome never re-themes;
// the specimens inside it are what respond to variable modes.
const DOC = {
  // Figma page fill — charcoal, so the light boards read as slabs (matches
  // the ⬡ Documentation canvas). Not a token: chrome must stay readable in
  // every variable mode.
  page: '#1E1E1E',
  canvas: '#1E1E1E',
  card: '#FFFFFF', ink: '#0F0F10',
  text: '#111114', muted: '#6E6E76', border: '#E9E9EC', faint: '#FAFAFB',
  // Light board on the charcoal page — white is the most readable surface
  // for specimens and editorial chrome.
  board: '#FFFFFF', bar: '#E6E6F7', barText: '#26262E',
}
const PANEL_W = 380
const PANEL_PAD = 32
const PANEL_INNER = PANEL_W - PANEL_PAD * 2
type DocFontStyle = 'Regular' | 'Medium' | 'Semi Bold' | 'Bold'

function docChrome(
  fontFor: (style: DocFontStyle) => FontName,
  typo?: Map<string, Variable>,
  sizes?: Record<string, string>,
  chrome?: DocChromeVars,
  modePin?: { collection: VariableCollection; modeId: string },
) {
  const docSolid = (hex: string, opacity = 1, v?: Variable): SolidPaint => {
    let paint: SolidPaint = { type: 'SOLID', color: hexToRgb(hex), opacity }
    if (v?.resolvedType === 'COLOR') paint = figma.variables.setBoundVariableForPaint(paint, 'color', v)
    return paint
  }
  function docText(chars: string, size: number, style: DocFontStyle, hex: string, opacity = 1, v?: Variable): TextNode {
    const t = figma.createText()
    t.fontName = fontFor(style)
    t.characters = chars
    t.fontSize = size
    t.fills = [docSolid(hex, opacity, v)]
    if (typo && typo.size > 0) {
      bindAllTextFields(t, typo, {
        sizeKey: nearestTypeSizeKey(sizes, size),
        weightKey: weightKeyFromStyle(style),
        heading: size >= 20 && (style === 'Semi Bold' || style === 'Bold'),
      })
    }
    return t
  }
  function docFrame(name: string, dir: 'VERTICAL' | 'HORIZONTAL', gapPx: number): FrameNode {
    const f = figma.createFrame()
    f.name = name
    f.layoutMode = dir
    f.primaryAxisSizingMode = 'AUTO'
    f.counterAxisSizingMode = 'AUTO'
    f.itemSpacing = gapPx
    f.fills = []
    return f
  }
  function wrapText(t: TextNode, w: number): TextNode {
    t.resize(w, t.height)
    t.textAutoResize = 'HEIGHT'
    return t
  }
  function docDivider(label: string): FrameNode {
    const r = docFrame(`divider-${label.toLowerCase()}`, 'HORIZONTAL', 10)
    r.primaryAxisSizingMode = 'FIXED'
    r.counterAxisSizingMode = 'FIXED'
    r.resize(PANEL_INNER, 20)
    r.counterAxisAlignItems = 'CENTER'
    const chipF = docFrame('chip', 'HORIZONTAL', 0)
    chipF.paddingLeft = 8; chipF.paddingRight = 8
    chipF.paddingTop = 3; chipF.paddingBottom = 3
    // A stroke, not text — bind it to the border role that actually means
    // "strong outline" rather than reusing the text ink at reduced opacity.
    chipF.strokes = [docSolid(DOC.text, 0.8, chrome?.borderStrong)]
    chipF.strokeWeight = 1
    chipF.cornerRadius = 4
    const t = docText(label, 9, 'Medium', DOC.text, 1, chrome?.text)
    t.letterSpacing = { value: 1, unit: 'PIXELS' }
    chipF.appendChild(t)
    r.appendChild(chipF)
    const line = figma.createFrame()
    line.name = 'line'
    line.resize(10, 1)
    line.fills = [docSolid(DOC.border, 1, chrome?.border)]
    r.appendChild(line)
    line.layoutSizingHorizontal = 'FILL'
    line.layoutSizingVertical = 'FIXED'
    return r
  }
  function docBullet(parent: FrameNode, title: string, desc: string) {
    const b = docFrame(`spec-${title.toLowerCase().replace(/\s+/g, '-')}`, 'VERTICAL', 4)
    b.appendChild(docText(title, 12, 'Medium', DOC.text, 1, chrome?.text))
    b.appendChild(wrapText(docText(desc, 11, 'Regular', DOC.muted, 1, chrome?.muted), PANEL_INNER))
    parent.appendChild(b)
  }
  // Documentation-style board: rounded surface slab opened by a tinted section
  // bar (label left, project right) — the same grammar as the "⬡ Documentation"
  // chapter boards, so every generated page reads as one system. The name must
  // start with "docs/" so re-imports clean and rebuild it.
  function docBoard(name: string, barLabel: string, project: string, contentW: number): FrameNode {
    const b = docFrame(name, 'VERTICAL', 24)
    b.fills = [docSolid(DOC.board, 1, chrome?.board)]
    b.cornerRadius = 24
    b.paddingTop = 48; b.paddingBottom = 48
    b.paddingLeft = 48; b.paddingRight = 48
    // Pinned to the system's first theme so the bound fills above always read
    // as a light editorial board, no matter which mode the file is sitting in.
    pinToLightMode(b, modePin)
    const bar = docFrame(`§ ${barLabel}`, 'HORIZONTAL', 8)
    bar.fills = [docSolid(DOC.bar)]
    bar.cornerRadius = 12
    bar.primaryAxisSizingMode = 'FIXED'
    bar.counterAxisSizingMode = 'FIXED'
    bar.resize(contentW, 56)
    bar.primaryAxisAlignItems = 'SPACE_BETWEEN'
    bar.counterAxisAlignItems = 'CENTER'
    bar.paddingLeft = 24; bar.paddingRight = 24
    bar.appendChild(docText(barLabel, 12, 'Medium', DOC.barText, 1, chrome?.text))
    bar.appendChild(docText(`⬡ ${project}`, 12, 'Semi Bold', DOC.barText, 1, chrome?.text))
    b.appendChild(bar)
    return b
  }
  return { docSolid, docText, docFrame, wrapText, docDivider, docBullet, docBoard }
}

// Builds the '⬡ Components Overview' sheet — a fixed specimen of the token system (see the
// SAMPLE list below for what ships and why). Named `importSample` since it no
// longer generates the component catalogue.
async function importSample(tokens: DesignTokens): Promise<number> {
  // `atoms` no longer decides WHAT gets built — the sheet is a fixed specimen,
  // so an empty selection still gets a sheet rather than nothing. It's still
  // read here because `atomSet` gates which component PAGES are generated.
  const atoms: string[] = tokens.atoms ?? tokens.components ?? []

  // ── Variable lookup (cached once) ──────────────────────────────────────────
  const allVars = await figma.variables.getLocalVariablesAsync()
  const allCols = await figma.variables.getLocalVariableCollectionsAsync()
  const colNameById = new Map(allCols.map((c) => [c.id, c.name] as const))
  const varsByCollection = new Map<string, Map<string, Variable>>()
  for (const v of allVars) {
    const cname = colNameById.get(v.variableCollectionId)
    if (!cname) continue
    let m = varsByCollection.get(cname)
    if (!m) { m = new Map(); varsByCollection.set(cname, m) }
    if (!m.has(v.name)) m.set(v.name, v)
  }
  const findVar = (coll: string, name: string) => varsByCollection.get(coll)?.get(name)
  function bestVar(coll: string, ...names: string[]): Variable | undefined {
    for (const n of names) { const v = findVar(coll, n); if (v) return v }
    return undefined
  }

  // ── Semantic palette — token PAIRS (variable + hex fallback) ──────────────
  //
  // hexKeys/varNames used to carry a taxonomy ('action-primary', 'text/primary',
  // 'icon-*', 'status-*'…) that predates the schema this plugin currently
  // supports — verified against a live escalatokens.com/api/tokens payload,
  // `tokens.colors.semantic` ships exactly 39 'content-*'/'background-*'/
  // 'border-*' keys (semanticRoles.ts's ALL_ROLES) and NONE of the old names.
  // hexOf() silently returns '' on a miss, so every one of these fell straight
  // to its hardcoded fallback for any current export — every generated
  // component rendered in these fixed colors instead of the user's actual
  // theme, and (since bestVar found nothing either) wasn't even bound to a
  // variable. Below: the CURRENT key first (both as the Figma variable name
  // importVariables actually creates — semanticVarName() turns 'content-
  // primary' into 'content/primary' — and as the hexOf lookup key), old names
  // kept as trailing fallbacks for a pre-rename tokens.json.
  //
  // The old taxonomy was more fine-grained than the current one in three
  // places the new roles don't cover:
  //  - icon-*: no dedicated icon family exists any more; icons alias the
  //    matching content-* role (Radix convention — icon and text share a tint).
  //  - status-*: collapses onto background-{error,warning,success}-{primary,
  //    solid}; there's no third "muted" tier, so *Muted reuses *Subtle's key.
  //  - *Info: dropped entirely — no content-info / background-info-* role
  //    exists in the current catalogue. iconInfo/statusInfo*/textInfo are left
  //    on their old-only keys (honest miss-and-fallback beats guessing a hue).
  const sem = tokens.colors.semantic
  const S = COLLECTIONS.semantics
  const hexOf = (...keys: string[]) => { for (const k of keys) if (sem[k]) return sem[k]; return '' }

  interface Pair { v?: Variable; hex: string }
  const P = (v: Variable | undefined, hex: string): Pair => ({ v, hex })

  // Both halves of a Pair go through semLookup, so a component binds to the
  // variable that exists in this file (flat name, or the architecture's own
  // token, or the one carrying that colour) and falls back to the hex that
  // variable actually holds. hexKeys[0] is the current role name; the rest are
  // pre-rename aliases, passed on as extra name candidates.
  const semLookup = semLookupFor(tokens, allVars, allCols)
  const unboundRoles: string[] = []
  const pair = (varNames: string[], hexKeys: string[], fallback: string): Pair => {
    const role = hexKeys[0]
    const hex = semLookup.hexFor(role) || hexOf(...hexKeys) || fallback
    const v = semLookup.varFor(role, ...varNames) ?? bestVar(S, ...varNames)
    if (!v && unboundRoles.indexOf(role) === -1) unboundRoles.push(role)
    return P(v, hex)
  }

  const p = {
    surface0:       pair(['Surface/page', 'background/primary', 'surface/0', 'bg/primary', 'surface'], ['background-primary', 'surface-0', 'bg-primary', 'surface'], '#0f0f0f'),
    surfaceInput:   pair(['Surface/input', 'surface/input', 'background/primary', 'surface/0'], ['background-input', 'background-primary', 'surface-0'], '#0f0f0f'),
    surface1:       pair(['Surface/layer-1', 'background/secondary', 'surface/1', 'bg/secondary'], ['background-secondary', 'surface-1', 'bg-secondary'], '#181818'),
    surface2:       pair(['Surface/layer-2', 'background/tertiary', 'surface/2', 'bg/tertiary'], ['background-tertiary', 'surface-2', 'bg-tertiary'], '#202020'),
    surface3:       pair(['background/quaternary', 'surface/3'], ['background-quaternary', 'surface-3'], '#282828'),
    surface0Hover:  pair(['background/primary-hover', 'surface/0-hover', 'surface/1', 'bg/secondary'], ['background-primary-hover', 'surface-0-hover', 'surface-1'], '#181818'),
    surface1Hover:  pair(['background/secondary-hover', 'surface/1-hover', 'surface/2', 'bg/tertiary'], ['background-secondary-hover', 'surface-1-hover', 'surface-2'], '#202020'),
    surfaceSelected:pair(['Surface/selected', 'background/active', 'surface/selected', 'surface/3'], ['background-active', 'surface-selected', 'surface-3'], '#2e2e2e'),
    surfaceInv:     pair(['Surface/inverse', 'surface/inverse', 'background/overlay', 'bg/inverse'], ['background-inverse', 'background-overlay', 'surface-inverse', 'bg-inverse'], '#f5f5f5'),
    surfaceInvMuted:pair(['background/overlay', 'surface/inverse-muted', 'surface/inverse', 'bg/inverse'], ['background-overlay', 'surface-inverse-muted', 'surface-inverse'], '#3a3a3a'),
    surfaceOverlay: pair(['background/overlay', 'surface/overlay', 'surface/inverse'], ['background-overlay', 'surface-overlay', 'surface-inverse'], '#0a0a0a'),
    brandSubtle:    pair(['background/brand-primary', 'surface/brand-subtle', 'bg/accent-subtle'], ['background-brand-primary', 'surface-brand-subtle', 'bg-accent-subtle'], '#1c2340'),
    brandMuted:     pair(['background/brand-secondary', 'surface/brand-muted', 'surface/brand-subtle', 'bg/accent-subtle'], ['background-brand-secondary', 'surface-brand-muted', 'surface-brand-subtle'], '#243056'),
    action:         pair(['Action/primary/default', 'Action/primary.default', 'action/primary/default', 'action/primary.default', 'background/brand-solid', 'action/primary', 'bg/accent-solid', 'primary'], ['background-brand-solid', 'action-primary', 'bg-accent-solid', 'primary'], '#3B82F6'),
    actionHover:    pair(['Action/primary/hover', 'Action/primary.hover', 'action/primary/hover', 'action/primary.hover', 'background/brand-solid-hover', 'action/primary-hover', 'bg/accent-solid_hover'], ['background-brand-solid-hover', 'action-primary-hover'], '#2f6fe0'),
    actionDisabled: pair(['background/disabled', 'action/disabled'], ['background-disabled', 'action-disabled'], '#2a2a2a'),
    actionDisabledSubtle: pair(['background/disabled-subtle', 'action/disabled-subtle'], ['background-disabled-subtle', 'action-disabled-subtle'], '#222222'),
    textPrimary:    pair(['content/primary', 'text/primary', 'text'], ['content-primary', 'text-primary', 'text'], '#f5f5f5'),
    textSecondary:  pair(['content/secondary', 'text/secondary'], ['content-secondary', 'text-secondary'], '#c9c9c9'),
    textTertiary:   pair(['content/tertiary', 'text/tertiary'], ['content-tertiary', 'text-tertiary'], '#9a9a9a'),
    textQuaternary: pair(['content/quaternary', 'text/quaternary', 'text/tertiary'], ['content-quaternary', 'text-quaternary', 'text-tertiary'], '#8a8a8a'),
    // No dedicated placeholder role in the current catalogue — quaternary is
    // its lightest/weakest content tier, the closest match by intent.
    textPlaceholder:pair(['content/quaternary', 'text/placeholder', 'text/quaternary'], ['content-quaternary', 'text-placeholder', 'text-quaternary'], '#7a7a7a'),
    textDisabled:   pair(['content/disabled', 'text/disabled'], ['content-disabled', 'text-disabled'], '#6a6a6a'),
    textOnBrand:    pair(['Content/on-action', 'content/on-action', 'content/inverse', 'text/on-brand', 'text/primary_on-brand', 'text/white'], ['content-on-brand', 'content-inverse', 'text-on-brand', 'text-white'], '#ffffff'),
    textOnInverse:  pair(['content/inverse', 'text/on-inverse', 'text/white'], ['content-inverse', 'text-on-inverse', 'text-white'], '#0f0f0f'),
    textBrand:      pair(['content/brand', 'text/brand-secondary', 'text/brand', 'text/accent-primary'], ['content-brand', 'text-brand-secondary', 'text-brand'], '#8ab4ff'),
    borderDefault:  pair(['border/primary', 'border/default', 'border'], ['border-primary', 'border-default', 'border'], '#333333'),
    // Control stroke — categorical `Border/strong` (WCAG 1.4.11). Flat catalogue
    // still has `border-strong`; content/primary is a last-resort darker ink.
    borderStrong:   pair(['Border/strong', 'border/strong', 'content/primary', 'border/secondary'], ['border-strong', 'content-primary', 'border-secondary'], '#454545'),
    borderFocus:    pair(['Border/focus', 'border/focus', 'border/brand', 'border/accent'], ['border-focus', 'border-brand'], '#3B82F6'),
    borderSubtle:   pair(['border/tertiary', 'border/subtle', 'border/default', 'border'], ['border-tertiary', 'border-subtle', 'border-default'], '#2a2a2a'),
    borderBrand:    pair(['border/brand', 'border/accent'], ['border-brand'], '#3B82F6'),
    borderDisabled: pair(['border/disabled'], ['border-disabled'], '#2e2e2e'),
    borderError:    pair(['border/error'], ['border-error'], '#f04438'),
    // Icon roles — no icon-* family exists any more; alias the matching
    // content-* role (Radix convention: icon and text share their tint).
    iconPrimary:    pair(['content/primary', 'icon/primary', 'fg/primary', 'text/primary'], ['content-primary', 'icon-primary', 'fg-primary', 'text-primary'], '#f5f5f5'),
    iconSecondary:  pair(['content/secondary', 'icon/secondary', 'fg/secondary', 'text/secondary'], ['content-secondary', 'icon-secondary', 'fg-secondary', 'text-secondary'], '#c9c9c9'),
    iconTertiary:   pair(['content/tertiary', 'icon/tertiary', 'fg/tertiary', 'text/tertiary'], ['content-tertiary', 'icon-tertiary', 'fg-tertiary', 'text-tertiary'], '#9a9a9a'),
    iconQuaternary: pair(['content/quaternary', 'icon/quaternary', 'text/placeholder'], ['content-quaternary', 'icon-quaternary', 'text-placeholder'], '#8a8a8a'),
    iconDisabled:   pair(['content/disabled', 'icon/disabled', 'text/disabled'], ['content-disabled', 'icon-disabled', 'text-disabled'], '#6a6a6a'),
    iconOnInverse:  pair(['content/inverse', 'icon/on-inverse', 'text/on-inverse'], ['content-inverse', 'icon-on-inverse', 'text-on-inverse'], '#0f0f0f'),
    iconBrand:      pair(['content/brand', 'icon/brand', 'text/brand-secondary', 'text/brand'], ['content-brand', 'icon-brand', 'text-brand-secondary'], '#8ab4ff'),
    iconError:      pair(['content/error', 'icon/error', 'text/error'], ['content-error', 'icon-error', 'text-error'], '#f97066'),
    iconWarning:    pair(['content/warning', 'icon/warning', 'text/warning'], ['content-warning', 'icon-warning', 'text-warning'], '#fdb022'),
    iconSuccess:    pair(['content/success', 'icon/success', 'text/success'], ['content-success', 'icon-success', 'text-success'], '#47cd89'),
    // No content-info role exists — left on its old-only keys (see file banner).
    iconInfo:       pair(['icon/info', 'text/info'], ['icon-info', 'text-info'], '#53b1fd'),
    statusError:        pair(['Status/critical/surface-solid', 'Status/critical.surface-solid', 'status/critical/surface-solid', 'status/critical.surface-solid', 'background/error-solid', 'status/error'], ['background-error-solid', 'status-error'], '#d92d20'),
    statusErrorOn:      pair(['Status/critical/on-solid', 'Status/critical.on-solid', 'status/critical/on-solid', 'status/critical.on-solid', 'Content/on-action', 'content/inverse'], ['status-on-solid', 'content-on-brand', 'content-inverse'], '#ffffff'),
    statusErrorSubtle:  pair(['Status/critical/surface', 'Status/critical.surface', 'status/critical/surface', 'status/critical.surface', 'background/error-primary', 'status/error-subtle'], ['background-error-primary', 'status-error-subtle'], '#2a1513'),
    // No third "muted" tier — reuses Subtle's key, same as *Subtle above.
    statusErrorMuted:   pair(['background/error-primary', 'status/error-muted', 'status/error-subtle'], ['background-error-primary', 'status-error-muted', 'status-error-subtle'], '#3a1d1a'),
    statusWarning:      pair(['background/warning-solid', 'status/warning'], ['background-warning-solid', 'status-warning'], '#dc6803'),
    statusWarningSubtle:pair(['Status/warning.surface', 'status/warning.surface', 'background/warning-primary', 'status/warning-subtle'], ['background-warning-primary', 'status-warning-subtle'], '#2a2013'),
    statusWarningMuted: pair(['background/warning-primary', 'status/warning-muted', 'status/warning-subtle'], ['background-warning-primary', 'status-warning-muted', 'status-warning-subtle'], '#3a2d1a'),
    statusSuccess:      pair(['background/success-solid', 'status/success'], ['background-success-solid', 'status-success'], '#079455'),
    statusSuccessSubtle:pair(['Status/success.surface', 'status/success.surface', 'background/success-primary', 'status/success-subtle'], ['background-success-primary', 'status-success-subtle'], '#132a1e'),
    statusSuccessMuted: pair(['background/success-primary', 'status/success-muted', 'status/success-subtle'], ['background-success-primary', 'status-success-muted', 'status-success-subtle'], '#1a3a2a'),
    // No background-info-* role exists — left on its old-only keys (see file banner).
    statusInfo:         pair(['status/info'], ['status-info'], '#1570ef'),
    statusInfoSubtle:   pair(['status/info-subtle'], ['status-info-subtle'], '#131c2a'),
    statusInfoMuted:    pair(['status/info-muted', 'status/info-subtle'], ['status-info-muted', 'status-info-subtle'], '#1a2a3a'),
    textError:      pair(['Status/critical/content', 'Status/critical.content', 'status/critical/content', 'status/critical.content', 'content/error', 'text/error'], ['content-error', 'text-error'], '#f97066'),
    textWarning:    pair(['Status/warning.content', 'status/warning.content', 'content/warning', 'text/warning'], ['content-warning', 'text-warning'], '#fdb022'),
    textSuccess:    pair(['Status/success.content', 'status/success.content', 'content/success', 'text/success'], ['content-success', 'text-success'], '#47cd89'),
    // No content-info role exists — left on its old-only keys (see file banner).
    textInfo:       pair(['text/info'], ['text-info'], '#53b1fd'),
  }

  // Roles with nothing to bind to. On a flat system this should be empty; on an
  // architecture it's the roles that contract simply doesn't have (Astryx has
  // no border-error, no text tertiary…), which ARCH_ROLE_MAP won't invent and
  // no variable in the collection carries the colour of. Those paint the flat
  // catalogue's value as a plain fill — right colour, no variable — so say so
  // once instead of leaving it to be discovered by clicking a layer.
  if (unboundRoles.length > 0) {
    log(`ℹ ${unboundRoles.length} component role${unboundRoles.length > 1 ? 's have' : ' has'} no token in "${COLLECTIONS.semantics}" (${unboundRoles.slice(0, 6).join(', ')}${unboundRoles.length > 6 ? `, +${unboundRoles.length - 6} more` : ''}) — painted from the system's value, unbound`)
  }

  // Typography / radius variables
  const T = COLLECTIONS.typography
  const sizeXs   = bestVar(T, 'size/text-xs', 'size/xs')
  const sizeSm   = bestVar(T, 'size/text-sm', 'size/sm')
  const sizeMd   = bestVar(T, 'size/text-md', 'size/base', 'size/md')
  const sizeLg   = bestVar(T, 'size/text-lg', 'size/lg')
  const wRegular = bestVar(T, 'weight/regular')
  const wMedium  = bestVar(T, 'weight/medium')
  const wSemibold= bestVar(T, 'weight/semibold', 'weight/semi-bold')
  const familyVar= findVar(T, 'family')
  const radSm    = bestVar(COLLECTIONS.radius, 'sm')
  const radMd    = bestVar(COLLECTIONS.radius, 'md')
  const radLg    = bestVar(COLLECTIONS.radius, 'lg')
  const radiusXs = pxToFloat(tokens.radius?.xs ?? '4px')
  const radiusSm = pxToFloat(tokens.radius?.sm ?? '4px')
  const radiusMd = pxToFloat(tokens.radius?.md ?? '8px')
  const radiusLg = pxToFloat(tokens.radius?.lg ?? '12px')
  const radiusXl = pxToFloat(tokens.radius?.xl ?? '16px')

  // Semantic radius roles (Radius Semantics — RADIUS_ROLES). Components bind to
  // the ROLE the design system assigns them, not a raw primitive step, so
  // re-aliasing `radius.action` in the editor moves every button/input/tab at
  // once. `emitRoleAliases` writes these only when the payload carries
  // `radiusRoles`, so each falls back to the primitive it used to hardcode for
  // an older export that has no semantic layer yet.
  const radControl   = findVar(COLLECTIONS.radius, 'role/control')   ?? radSm
  const radAction    = findVar(COLLECTIONS.radius, 'role/action')    ?? radMd
  const radContainer = findVar(COLLECTIONS.radius, 'role/container') ?? radLg
  const radOverlay   = findVar(COLLECTIONS.radius, 'role/overlay')   ?? radLg
  const radPill      = findVar(COLLECTIONS.radius, 'role/pill')
  const radiusControl   = radiusXs
  const radiusContainer = radiusLg
  const radiusOverlay   = radiusXl

  // ── Generic helpers ────────────────────────────────────────────────────────
  function fillOf(v: Variable | undefined, hex: string, opacity = 1): SolidPaint {
    let paint: SolidPaint = { type: 'SOLID', color: hexToRgb(hex), opacity }
    if (v?.resolvedType === 'COLOR') paint = figma.variables.setBoundVariableForPaint(paint, 'color', v)
    return paint
  }
  const fillP = (pr: Pair, opacity = 1): SolidPaint => fillOf(pr.v, pr.hex, opacity)
  function tryBind(node: SceneNode, field: string, v: Variable | undefined) {
    if (!v) return
    try {
      ;(node as unknown as { setBoundVariable(f: string, v: Variable): void }).setBoundVariable(field, v)
    } catch {}
  }
  type Box = FrameNode | ComponentNode
  function bindRadius(node: Box, v: Variable | undefined, fallback: number) {
    node.cornerRadius = fallback
    if (v?.resolvedType === 'FLOAT') {
      tryBind(node, 'topLeftRadius', v); tryBind(node, 'topRightRadius', v)
      tryBind(node, 'bottomLeftRadius', v); tryBind(node, 'bottomRightRadius', v)
    }
  }

  const spacingCol  = allCols.find((c) => c.name === COLLECTIONS.spacing)
  const spacingVars = varsByCollection.get(COLLECTIONS.spacing)
  function closestSpacing(px: number): Variable | undefined {
    if (!spacingCol || !spacingVars) return undefined
    let best: Variable | undefined, diff = Infinity
    for (const v of spacingVars.values()) {
      if (v.resolvedType !== 'FLOAT') continue
      const val = v.valuesByMode[spacingCol.defaultModeId]
      if (typeof val === 'number' && Math.abs(val - px) < diff) { diff = Math.abs(val - px); best = v }
    }
    return best
  }
  function pad(node: Box, t: number, r: number, b: number, l: number) {
    node.paddingTop = t; node.paddingRight = r; node.paddingBottom = b; node.paddingLeft = l
    tryBind(node, 'paddingTop', closestSpacing(t)); tryBind(node, 'paddingRight', closestSpacing(r))
    tryBind(node, 'paddingBottom', closestSpacing(b)); tryBind(node, 'paddingLeft', closestSpacing(l))
  }
  function gap(node: Box, px: number) {
    node.itemSpacing = px
    tryBind(node, 'itemSpacing', closestSpacing(px))
  }
  function borderWidthVar(): Variable | undefined {
    return bestVar(COLLECTIONS.border, 'width/default', 'width/sm', 'width/1')
  }
  // Universal focus ring: 3px halo in the component's accent color.
  function focusRing(node: Box, hex: string) {
    node.effects = [{
      type: 'DROP_SHADOW',
      color: { ...hexToRgb(hex), a: 0.3 },
      offset: { x: 0, y: 0 },
      radius: 0,
      spread: 3,
      visible: true,
      blendMode: 'NORMAL',
    }]
  }

  // ── Fonts ──────────────────────────────────────────────────────────────────
  const fontFamily = tokens.typography?.fontFamily || 'Inter'
  const loaded = new Set<string>()
  for (const style of ['Regular', 'Medium', 'Semi Bold', 'Bold'] as const) {
    try { await figma.loadFontAsync({ family: fontFamily, style }); loaded.add(style) } catch {
      try { await figma.loadFontAsync({ family: 'Inter', style }) } catch {}
    }
  }
  const fontFor = (style: 'Regular' | 'Medium' | 'Semi Bold' | 'Bold'): FontName =>
    loaded.has(style) ? { family: fontFamily, style } : { family: 'Inter', style }

  interface TxtOpts {
    style?: 'Regular' | 'Medium' | 'Semi Bold' | 'Bold'
    size?: number
    sizeVar?: Variable
    weightVar?: Variable
    colorP?: Pair
    opacity?: number
    /** Semantic text role (Type Semantics — TYPE_ROLES: 'button', 'label',
     *  'body-md', 'heading-sm', 'caption', …). When the payload carries
     *  `typography.roles`, the node binds fontFamily/fontSize/fontWeight to
     *  `role/<key>/*` — re-aliasing the role in the editor then moves every
     *  component using it. Falls back to `sizeVar`/`weightVar`/`family` for an
     *  older export with no semantic type layer. */
    roleKey?: string
  }
  function txt(chars: string, o: TxtOpts = {}): TextNode {
    const t = figma.createText()
    t.fontName = fontFor(o.style ?? 'Regular')
    t.characters = chars
    t.fontSize = o.size ?? 14
    t.fills = [fillP(o.colorP ?? p.textPrimary, o.opacity ?? 1)]
    if (familyVar?.resolvedType === 'STRING') tryBind(t, 'fontFamily', familyVar)
    if (o.sizeVar) {
      tryBind(t, 'fontSize', o.sizeVar)
      const lh = findVar(T, o.sizeVar.name.replace('size/', 'line-height/'))
      if (lh) tryBind(t, 'lineHeight', lh)
      const ls = findVar(T, o.sizeVar.name.replace('size/', 'letter-spacing/'))
      if (ls) tryBind(t, 'letterSpacing', ls)
    }
    tryBind(t, 'fontWeight', o.weightVar
      ?? (o.style === 'Semi Bold' || o.style === 'Bold' ? wSemibold : o.style === 'Medium' ? wMedium : wRegular))
    // Semantic type role — bound LAST so it wins over the primitive bindings
    // above whenever the role variables exist. line-height / letter-spacing
    // key off the primitive step the role resolves to (roles alias a step, so
    // there is no `line-height/role-*`), read from the payload.
    if (o.roleKey) {
      const rFamily = findVar(T, `role/${o.roleKey}/family`)
      if (rFamily?.resolvedType === 'STRING') tryBind(t, 'fontFamily', rFamily)
      const rSize = findVar(T, `role/${o.roleKey}/size`)
      if (rSize) {
        tryBind(t, 'fontSize', rSize)
        const step = tokens.typography.roles?.[o.roleKey]?.desktop?.size
        if (step) {
          const lh = findVar(T, `line-height/${step}`)
          if (lh) tryBind(t, 'lineHeight', lh)
          const ls = findVar(T, `letter-spacing/${step}`)
          if (ls) tryBind(t, 'letterSpacing', ls)
        }
      }
      const rWeight = findVar(T, `role/${o.roleKey}/weight`)
      if (rWeight) tryBind(t, 'fontWeight', rWeight)
    }
    return t
  }

  function row(name: string, gapPx: number): FrameNode {
    const f = figma.createFrame()
    f.name = name
    f.layoutMode = 'HORIZONTAL'
    f.primaryAxisSizingMode = 'AUTO'
    f.counterAxisSizingMode = 'AUTO'
    f.counterAxisAlignItems = 'CENTER'
    f.fills = []
    gap(f, gapPx)
    return f
  }
  function col(name: string, gapPx: number): FrameNode {
    const f = figma.createFrame()
    f.name = name
    f.layoutMode = 'VERTICAL'
    f.primaryAxisSizingMode = 'AUTO'
    f.counterAxisSizingMode = 'AUTO'
    f.fills = []
    gap(f, gapPx)
    return f
  }
  // Mini spinner (loading states): two stacked arcs in the given color.
  function miniSpinner(size: number, colorPr: Pair): FrameNode {
    const f = figma.createFrame()
    f.name = 'spinner'
    f.fills = []
    f.resize(size, size)
    const ring = figma.createEllipse()
    ring.resize(size, size)
    ring.fills = [fillP(colorPr, 0.25)]
    ring.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 0.7 }
    const arc = figma.createEllipse()
    arc.resize(size, size)
    arc.fills = [fillP(colorPr)]
    arc.arcData = { startingAngle: -Math.PI / 2, endingAngle: 0, innerRadius: 0.7 }
    f.appendChild(ring); f.appendChild(arc)
    ring.x = 0; ring.y = 0; arc.x = 0; arc.y = 0
    return f
  }

  // ── No component-token tier ───────────────────────────────────────────────
  // There used to be a third tier here: a "Components" collection holding one
  // variable per component slot (button/bg, input/border, card/radius…), each
  // an alias to the semantic role behind it, and every generated component
  // bound to those instead of to the role directly.
  //
  // Dropped deliberately. Tracing a design system component by component is
  // the thing semantic roles exist to make unnecessary: the tier carried no
  // information of its own — every entry was a 1:1 alias — while doubling the
  // number of names a designer has to learn, and it re-stated in the file a
  // decision ("a Button's fill is the brand action colour") that already lives
  // in the role vocabulary the platform publishes. Components now bind
  // straight to the semantic variables in "Color Semantics", by role.
  //
  // `atomSet` below still gates which component PAGES get built; it just no
  // longer gates a token tier.
  const atomSet = new Set(atoms)

  // ── Variant matrix definitions ─────────────────────────────────────────────
  // Every editable text collects here; resolved to a SET-level TEXT property
  // (or a component property for single components) after nodes exist. A
  // boolean `def` makes it a BOOLEAN property bound to the node's visibility.
  interface PendingProp { node: SceneNode; prop: string; def: string | boolean }

  interface VariantDef {
    props: Record<string, string>
    build: (c: ComponentNode, out: PendingProp[]) => void
  }
  interface AtomSpec {
    cols: number                       // grid columns inside the set
    variants: VariantDef[]
    description: string
  }

  const STATES = ['Default', 'Hover', 'Pressed', 'Focused', 'Loading', 'Disabled'] as const
  type BtnState = typeof STATES[number]

  // Button color axes — Brand / Danger / Success, mirroring the universal matrix.
  interface BtnColor { solid: Pair; hover: Pair; on: Pair; soft: Pair; softText: Pair; line: Pair; text: Pair; ringHex: string }
  const BTN_COLORS: Record<string, BtnColor> = {
    Brand: {
      solid: p.action, hover: p.actionHover,
      on: p.textOnBrand, soft: p.brandSubtle, softText: p.textBrand,
      line: p.borderBrand, text: p.textBrand, ringHex: p.action.hex,
    },
    Danger: {
      solid: p.statusError, hover: p.statusError, on: p.statusErrorOn,
      soft: p.statusErrorSubtle, softText: p.textError, line: p.borderError,
      text: p.textError, ringHex: p.statusError.hex,
    },
    Success: {
      solid: p.statusSuccess, hover: p.statusSuccess, on: p.textOnBrand,
      soft: p.statusSuccessSubtle, softText: p.textSuccess, line: p.statusSuccess,
      text: p.textSuccess, ringHex: p.statusSuccess.hex,
    },
  }
  const BTN_STYLES = ['Solid', 'Outline', 'Soft', 'Ghost'] as const

  // Button size axis — mirrors the configurator's Size values (MD, SM, LG, XL).
  const BTN_SIZE_KEYS = ['MD', 'SM', 'LG', 'XL'] as const
  const BTN_SIZES: Record<string, { padV: number; padH: number; f: number; fv?: Variable; gap: number }> = {
    SM: { padV: 8,  padH: 12, f: 13, fv: sizeSm, gap: 6 },
    MD: { padV: 10, padH: 16, f: 14, fv: sizeSm, gap: 8 },
    LG: { padV: 12, padH: 20, f: 15, fv: sizeMd, gap: 8 },
    XL: { padV: 14, padH: 24, f: 16, fv: sizeMd, gap: 10 },
  }

  const BTN_ICON_POS = ['None', 'Leading', 'Trailing'] as const

  function buildButton(c: ComponentNode, out: PendingProp[], color: string, style: string, state: BtnState, size = 'MD', iconPos: string = 'Leading') {
    const k = BTN_COLORS[color]
    const sz = BTN_SIZES[size] ?? BTN_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    pad(c, sz.padV, sz.padH, sz.padV, sz.padH); gap(c, sz.gap)
    bindRadius(c, radAction, radiusMd)

    const disabled = state === 'Disabled'
    const hoverish = state === 'Hover' || state === 'Pressed'
    const dim = state === 'Pressed' ? 0.88 : 1

    let textP: Pair
    if (disabled) {
      textP = p.textDisabled
      if (style === 'Solid' || style === 'Soft') c.fills = [fillP(p.actionDisabled)]
      else c.fills = []
      if (style === 'Outline') {
        c.strokes = [fillP(p.borderDisabled)]
        c.strokeWeight = 1
        tryBind(c, 'strokeWeight', borderWidthVar())
      }
    } else if (style === 'Solid') {
      textP = k.on
      c.fills = [fillP(hoverish ? k.hover : k.solid, dim)]
    } else if (style === 'Outline') {
      textP = k.text
      c.fills = hoverish ? [fillP(k.soft, 0.6 * dim)] : []
      c.strokes = [fillP(k.line)]
      c.strokeWeight = 1
      tryBind(c, 'strokeWeight', borderWidthVar())
    } else if (style === 'Soft') {
      textP = k.softText
      c.fills = [fillP(k.soft, hoverish ? 0.8 * dim : 1)]
    } else { // Ghost
      textP = k.text
      c.fills = hoverish ? [fillP(k.soft, 0.5 * dim)] : []
    }
    if (state === 'Focused') focusRing(c, k.ringHex)

    const makeIcon = () => {
      const icon = txt('+', { style: 'Medium', size: sz.f, sizeVar: sz.fv, weightVar: wMedium, colorP: textP })
      icon.name = 'icon'
      return icon
    }

    if (state === 'Loading') {
      c.appendChild(miniSpinner(sz.f, textP))
    } else if (iconPos === 'Leading') {
      c.appendChild(makeIcon())
    }
    const label = txt('Button', {
      roleKey: 'button',
      style: 'Medium', size: sz.f, sizeVar: sz.fv, weightVar: wMedium,
      colorP: textP, opacity: state === 'Loading' ? 0.75 : 1,
    })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Button' })
    if (iconPos === 'Trailing' && state !== 'Loading') {
      const icon = makeIcon()
      icon.name = 'icon-trailing'
      c.appendChild(icon)
    }
  }

  // ── Input [Text] — full field anatomy (label / description / box / helper) ──
  // Mirrors the reference sheet: context variants with their exact inner layout
  // (leading icon, clear, eye toggle, kbd hint + Search button, country flag +
  // dial prefix, https:// prefix + copy), 7 interaction states, 3 sizes.
  const INPUT_STATES = ['Default', 'Hover', 'Focused', 'Filled', 'Error', 'Loading', 'Disabled'] as const
  const INPUT_TYPES = ['Default', 'Icon Leading', 'Icon Trailing', 'E-Mail', 'Password', 'Search', 'Phone Number', 'Website'] as const
  const INPUT_TYPE_META: Record<string, { label: string; text: string; lead?: string; trail?: string }> = {
    'Default':       { label: 'Default Input',   text: 'Placeholder Text..' },
    'Icon Leading':  { label: 'Default Input',   text: 'Placeholder Text..', lead: '★' },
    'Icon Trailing': { label: 'Default Input',   text: 'Placeholder Text..', trail: '★' },
    'E-Mail':        { label: 'E-Mail Address',  text: 'hi@createui.co',    lead: '✉' },
    'Password':      { label: 'Password',        text: '••••••••••••',      lead: '🔒' },
    'Search':        { label: 'Search',          text: 'Search anything..', lead: '🔍' },
    'Phone Number':  { label: 'Phone Number',    text: '171 39200 12',      lead: '🇩🇪' },
    'Website':       { label: 'Website Address', text: 'createui.co',       lead: '🌐' },
  }
  const INPUT_SIZE_KEYS = ['MD', 'SM', 'XS'] as const
  const INPUT_SIZES: Record<string, { h: number; f: number; fv?: Variable; label: number; meta: number; padX: number }> = {
    MD: { h: 40, f: 14, fv: sizeSm, label: 13,   meta: 12,   padX: 12 },
    SM: { h: 36, f: 13,             label: 12.5, meta: 11.5, padX: 10 },
    XS: { h: 32, f: 12, fv: sizeXs, label: 12,   meta: 11,   padX: 10 },
  }

  // Small filled circle with a glyph — clear buttons, error dots, helper icons.
  function circleGlyph(d: number, glyph: string, bg: Pair, fg: Pair): FrameNode {
    const f = row('icon-circle', 0)
    f.primaryAxisSizingMode = 'FIXED'
    f.counterAxisSizingMode = 'FIXED'
    f.primaryAxisAlignItems = 'CENTER'
    f.counterAxisAlignItems = 'CENTER'
    f.cornerRadius = 9999
    f.fills = [fillP(bg)]
    f.appendChild(txt(glyph, { style: 'Bold', size: Math.round(d * 0.58), colorP: fg }))
    f.resize(d, d)
    return f
  }

  function buildInputField(c: ComponentNode, out: PendingProp[], sizeKey: string, type: string, state: string) {
    const s = INPUT_SIZES[sizeKey]
    const meta = INPUT_TYPE_META[type]
    const disabled = state === 'Disabled'
    const error = state === 'Error'
    const focused = state === 'Focused'
    const loading = state === 'Loading'
    const filled = state === 'Filled' || focused

    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.resize(260, 100)
    gap(c, 6)
    c.fills = []
    c.paddingTop = 0; c.paddingRight = 0; c.paddingBottom = 0; c.paddingLeft = 0

    const labelP = disabled ? p.textDisabled : error ? p.textError : p.textPrimary
    const metaP = disabled ? p.textDisabled : error ? p.textError : p.textTertiary
    const iconP = disabled ? p.textDisabled : p.textTertiary

    // Label row — "Label * (Optional) ⓘ"
    const labelRow = row('label-row', 4)
    const label = txt(meta.label, { style: 'Medium', size: s.label, weightVar: wMedium, colorP: labelP })
    label.name = 'label'
    labelRow.appendChild(label)
    labelRow.appendChild(txt('*', { style: 'Medium', size: s.label, weightVar: wMedium, colorP: p.textError }))
    labelRow.appendChild(txt('(Optional)', { size: s.meta, colorP: metaP }))
    labelRow.appendChild(txt('ⓘ', { size: s.meta, colorP: metaP }))
    c.appendChild(labelRow)
    out.push({ node: labelRow, prop: 'Show Label', def: true })

    // Description line
    const desc = txt('Description or any kind of additional text.', { size: s.meta, colorP: metaP })
    desc.name = 'description'
    c.appendChild(desc)
    desc.layoutSizingHorizontal = 'FILL'
    desc.textAutoResize = 'HEIGHT'
    out.push({ node: desc, prop: 'Description', def: 'Description or any kind of additional text.' })
    out.push({ node: desc, prop: 'Show Description', def: true })

    // The input box itself — fixed height, fills the field width
    const box = row('input', 8)
    box.name = 'input'
    box.counterAxisSizingMode = 'FIXED'
    box.resize(236, s.h)
    c.appendChild(box)
    box.layoutSizingHorizontal = 'FILL'
    box.counterAxisAlignItems = 'CENTER'
    box.paddingLeft = s.padX; box.paddingRight = s.padX
    tryBind(box, 'paddingLeft', closestSpacing(s.padX)); tryBind(box, 'paddingRight', closestSpacing(s.padX))
    bindRadius(box, radAction, radiusMd)
    box.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surfaceInput)]
    const border =
      disabled ? p.borderDisabled :
      error ? p.borderError :
      focused || loading ? p.borderFocus :
      state === 'Hover' ? p.borderStrong :
      p.borderStrong
    box.strokes = [fillP(border)]
    box.strokeWeight = focused ? 1.5 : 1
    if (!focused) tryBind(box, 'strokeWeight', borderWidthVar())
    if (focused) focusRing(box, p.borderFocus.hex)

    const boxDivider = () => {
      const d = figma.createFrame()
      d.name = 'divider'
      d.fills = [fillP(disabled ? p.borderDisabled : p.borderDefault)]
      return d
    }
    const fixDivider = (d: FrameNode) => { d.layoutSizingHorizontal = 'FIXED'; d.layoutSizingVertical = 'FIXED'; d.resize(1, s.h - 14) }

    // Leading — icon / flag + dial / protocol prefix
    if (meta.lead) {
      const lead = txt(meta.lead, { size: s.f, colorP: iconP })
      lead.name = 'icon-leading'
      box.appendChild(lead)
    }
    if (type === 'Phone Number') {
      box.appendChild(txt('▾', { size: Math.round(s.f * 0.75), colorP: iconP }))
      const d = boxDivider(); box.appendChild(d); fixDivider(d)
      box.appendChild(txt('+49', { size: s.f, colorP: disabled ? p.textDisabled : p.textTertiary }))
    }
    if (type === 'Website') {
      box.appendChild(txt('https://', { size: s.f, colorP: disabled ? p.textDisabled : p.textTertiary }))
      const d = boxDivider(); box.appendChild(d); fixDivider(d)
    }

    // Value / placeholder (+ caret when focused)
    const contentP = disabled ? p.textDisabled : filled ? p.textPrimary : p.textPlaceholder
    const content = txt(meta.text, { roleKey: 'placeholder', size: s.f, sizeVar: s.fv, colorP: contentP })
    content.name = filled ? 'value' : 'placeholder'
    const valueWrap = row('value', 2)
    valueWrap.appendChild(content)
    if (focused) {
      const caret = figma.createFrame()
      caret.name = 'caret'
      caret.fills = [fillP(p.borderBrand)]
      caret.cornerRadius = 1
      valueWrap.appendChild(caret)
      caret.layoutSizingHorizontal = 'FIXED'
      caret.layoutSizingVertical = 'FIXED'
      caret.resize(1.5, s.f + 4)
    }
    box.appendChild(valueWrap)
    valueWrap.layoutSizingHorizontal = 'FILL'

    // Trailing — state dot / type-specific controls
    if (error) {
      box.appendChild(circleGlyph(14, '!', p.statusError, p.textOnBrand))
    } else if (!loading) {
      if (type === 'E-Mail' && (state === 'Hover' || focused)) {
        box.appendChild(circleGlyph(14, '✕', p.surface3, p.textSecondary))
      } else if (type === 'Password') {
        const eye = txt('👁', { size: s.f, colorP: iconP })
        eye.name = 'icon-eye'
        box.appendChild(eye)
      } else if (type === 'Phone Number') {
        box.appendChild(txt('ⓘ', { size: s.meta, colorP: iconP }))
      }
    }
    if (meta.trail) {
      const trail = txt(meta.trail, { size: s.f, colorP: iconP })
      trail.name = 'icon-trailing'
      box.appendChild(trail)
    }
    if (type === 'Website') {
      const d = boxDivider(); box.appendChild(d); fixDivider(d)
      box.appendChild(txt('⧉', { size: s.f, colorP: iconP }))
    }
    if (type === 'Search') {
      if (!error) {
        const kbd = row('kbd', 2)
        kbd.paddingLeft = 5; kbd.paddingRight = 5; kbd.paddingTop = 2; kbd.paddingBottom = 2
        kbd.strokes = [fillP(disabled ? p.borderDisabled : p.borderDefault)]
        kbd.strokeWeight = 1
        kbd.cornerRadius = 4
        kbd.appendChild(txt('⌘ 1', { size: Math.round(s.meta * 0.9), colorP: iconP }))
        box.appendChild(kbd)
      }
      if (loading) box.appendChild(miniSpinner(s.f, p.textBrand))
      const btnMuted = disabled || error || loading
      const btn = row('search-button', 4)
      btn.counterAxisSizingMode = 'FIXED'
      btn.primaryAxisAlignItems = 'CENTER'
      btn.paddingLeft = 10; btn.paddingRight = 10
      btn.fills = [fillP(btnMuted ? p.actionDisabledSubtle : p.surface3)]
      bindRadius(btn, radControl, radiusControl)
      btn.appendChild(txt('Search', {
        style: 'Medium', size: s.f - 1, weightVar: wMedium,
        colorP: btnMuted ? p.textDisabled : p.textSecondary,
      }))
      btn.resize(btn.width, s.h - 12)
      box.appendChild(btn)
    } else if (loading) {
      box.appendChild(miniSpinner(s.f, p.textBrand))
    }

    // Helper row — "ⓘ Helper hint text for you."
    const helperRow = row('helper-row', 6)
    helperRow.appendChild(circleGlyph(s.meta + 2, '!', error ? p.statusError : p.surface3, error ? p.textOnBrand : p.textSecondary))
    const helper = txt('Helper hint text for you.', { size: s.meta, colorP: error ? p.textError : metaP })
    helper.name = 'helper'
    helperRow.appendChild(helper)
    c.appendChild(helperRow)
    out.push({ node: helper, prop: 'Helper Text', def: 'Helper hint text for you.' })
    out.push({ node: helperRow, prop: 'Show Helper', def: true })
  }

  // Select trigger keeps the previous single-box layout (shares input tokens).
  // Select size axis — mirrors the configurator (MD, SM, LG).
  const SELECT_SIZES: Record<string, { h: number; padV: number; f: number; fv?: Variable }> = {
    SM: { h: 36, padV: 8,  f: 13, fv: sizeSm },
    MD: { h: 40, padV: 10, f: 14, fv: sizeSm },
    LG: { h: 44, padV: 12, f: 15, fv: sizeMd },
  }
  function buildSelectTrigger(c: ComponentNode, out: PendingProp[], state: string, size = 'MD') {
    const sz = SELECT_SIZES[size] ?? SELECT_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.counterAxisAlignItems = 'CENTER'
    c.primaryAxisAlignItems = 'SPACE_BETWEEN'
    c.resize(240, sz.h)
    pad(c, sz.padV, 12, sz.padV, 12); gap(c, 8)
    bindRadius(c, radAction, radiusMd)

    const disabled = state === 'Disabled'
    c.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surfaceInput)]
    const border =
      disabled          ? p.borderDisabled :
      state === 'Error' ? p.borderError :
      state === 'Focused' ? p.borderFocus :
      p.borderStrong
    c.strokes = [fillP(border)]
    c.strokeWeight = state === 'Focused' ? 1.5 : 1
    if (state !== 'Focused') tryBind(c, 'strokeWeight', borderWidthVar())
    if (state === 'Focused') focusRing(c, p.borderFocus.hex)

    const content = txt('Placeholder…', {
      size: sz.f, sizeVar: sz.fv,
      colorP: disabled ? p.textDisabled : p.textPlaceholder,
    })
    content.name = 'placeholder'
    c.appendChild(content)
    out.push({ node: content, prop: 'Placeholder', def: 'Placeholder…' })

    const ch = txt('▾', { size: 12, colorP: disabled ? p.textDisabled : p.textTertiary })
    ch.name = 'chevron'
    c.appendChild(ch)
  }

  // Checkbox / Radio / Toggle size axes — mirror the configurator (MD, SM).
  const CHECK_SIZES: Record<string, { d: number; check: number; f: number; fv?: Variable }> = {
    MD: { d: 18, check: 11, f: 14, fv: sizeSm },
    SM: { d: 15, check: 9,  f: 13, fv: sizeSm },
  }
  function buildCheckbox(c: ComponentNode, out: PendingProp[], checked: boolean, state: string, size = 'MD') {
    const sz = CHECK_SIZES[size] ?? CHECK_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 8)
    c.fills = []
    const disabled = state === 'Disabled'
    const box = figma.createFrame()
    box.name = 'box'
    box.layoutMode = 'HORIZONTAL'
    box.primaryAxisSizingMode = 'FIXED'
    box.counterAxisSizingMode = 'FIXED'
    box.primaryAxisAlignItems = 'CENTER'
    box.counterAxisAlignItems = 'CENTER'
    bindRadius(box, radControl, radiusControl)
    if (checked) {
      box.fills = [fillP(disabled ? p.actionDisabled : state === 'Hover' ? p.actionHover : p.action)]
      const check = txt('✓', { style: 'Bold', size: sz.check, colorP: disabled ? p.textDisabled : p.textOnBrand })
      check.name = 'check'
      box.appendChild(check)
    } else {
      box.fills = [fillP(p.surface0)]
      box.strokes = [fillP(disabled ? p.borderDisabled : state === 'Hover' ? p.borderStrong : p.borderDefault)]
      box.strokeWeight = 1
      tryBind(box, 'strokeWeight', borderWidthVar())
    }
    if (state === 'Focused') focusRing(box, p.action.hex)
    c.appendChild(box)
    box.resize(sz.d, sz.d)
    const label = txt('Label', { roleKey: 'label', size: sz.f, sizeVar: sz.fv, colorP: disabled ? p.textDisabled : p.textPrimary })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Label' })
  }

  const TOGGLE_SIZES: Record<string, { w: number; h: number; knob: number; f: number; fv?: Variable }> = {
    MD: { w: 40, h: 22, knob: 18, f: 14, fv: sizeSm },
    SM: { w: 34, h: 18, knob: 14, f: 13, fv: sizeSm },
  }
  function buildToggle(c: ComponentNode, out: PendingProp[], on: boolean, state: string, size = 'MD') {
    const sz = TOGGLE_SIZES[size] ?? TOGGLE_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 10)
    c.fills = []
    const disabled = state === 'Disabled'
    const track = figma.createFrame()
    track.name = 'track'
    track.layoutMode = 'HORIZONTAL'
    track.primaryAxisSizingMode = 'FIXED'
    track.counterAxisSizingMode = 'FIXED'
    track.primaryAxisAlignItems = on ? 'MAX' : 'MIN'
    track.counterAxisAlignItems = 'CENTER'
    track.resize(sz.w, sz.h)
    track.paddingLeft = 2; track.paddingRight = 2
    track.fills = [fillP(
      disabled ? p.actionDisabled
      : on ? (state === 'Hover' ? p.actionHover : p.action)
      : (state === 'Hover' ? p.borderStrong : p.surface3),
    )]
    bindRadius(track, radPill, 9999)
    const knob = figma.createFrame()
    knob.name = 'knob'
    knob.resize(sz.knob, sz.knob)
    knob.cornerRadius = 9999
    knob.fills = [fillP(p.textOnBrand, disabled ? 0.6 : 1)]
    track.appendChild(knob)
    knob.layoutSizingHorizontal = 'FIXED'
    knob.layoutSizingVertical = 'FIXED'
    if (state === 'Focused') focusRing(track, p.action.hex)
    c.appendChild(track)
    const label = txt('Option', { roleKey: 'label', size: sz.f, sizeVar: sz.fv, colorP: disabled ? p.textDisabled : p.textPrimary })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Option' })
  }

  // Badge — universal Style × Color matrix over the semantic status roles.
  interface BadgeColor { solid: Pair; on: Pair; soft: Pair; text: Pair; line: Pair }
  const BADGE_COLORS: Record<string, BadgeColor> = {
    Neutral: { solid: p.surfaceInv, on: p.textOnInverse, soft: p.surface2, text: p.textSecondary, line: p.borderStrong },
    Brand:   { solid: p.action, on: p.textOnBrand, soft: p.brandSubtle, text: p.textBrand, line: p.borderBrand },
    Success: { solid: p.statusSuccess, on: p.textOnBrand, soft: p.statusSuccessSubtle, text: p.textSuccess, line: p.statusSuccess },
    Warning: { solid: p.statusWarning, on: p.textOnBrand, soft: p.statusWarningSubtle, text: p.textWarning, line: p.statusWarning },
    Error:   { solid: p.statusError, on: p.textOnBrand, soft: p.statusErrorSubtle, text: p.textError, line: p.borderError },
    Info:    { solid: p.statusInfo, on: p.textOnBrand, soft: p.statusInfoSubtle, text: p.textInfo, line: p.statusInfo },
  }
  // Badge size axis — mirrors the configurator (MD, SM, LG).
  const BADGE_SIZES: Record<string, { padV: number; padH: number; f: number; fv?: Variable }> = {
    SM: { padV: 2, padH: 8,  f: 11, fv: sizeXs },
    MD: { padV: 3, padH: 10, f: 12, fv: sizeXs },
    LG: { padV: 4, padH: 12, f: 13, fv: sizeSm },
  }
  const BADGE_ICON_POS = ['None', 'Leading', 'Trailing'] as const

  function buildBadge(c: ComponentNode, out: PendingProp[], style: string, color: string, size = 'MD', iconPos: string = 'None') {
    const k = BADGE_COLORS[color]
    const sz = BADGE_SIZES[size] ?? BADGE_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, Math.round(sz.padH * 0.4))
    pad(c, sz.padV, sz.padH, sz.padV, sz.padH)
    bindRadius(c, radPill, 9999)
    let textP: Pair
    if (style === 'Solid') { c.fills = [fillP(k.solid)]; textP = k.on }
    else if (style === 'Soft') { c.fills = [fillP(k.soft)]; textP = k.text }
    else { // Outline
      c.fills = []
      c.strokes = [fillP(k.line)]
      c.strokeWeight = 1
      tryBind(c, 'strokeWeight', borderWidthVar())
      textP = k.text
    }
    const makeIcon = (name: string) => {
      const icon = txt('●', { size: Math.round(sz.f * 0.7), colorP: textP })
      icon.name = name
      return icon
    }
    if (iconPos === 'Leading') c.appendChild(makeIcon('icon-leading'))
    const label = txt('Badge', { roleKey: 'label', style: 'Medium', size: sz.f, sizeVar: sz.fv, weightVar: wMedium, colorP: textP })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Badge' })
    if (iconPos === 'Trailing') c.appendChild(makeIcon('icon-trailing'))
  }

  const AVATAR_SIZES: Record<string, { d: number; f: number; sv?: Variable }> = {
    XS: { d: 24, f: 10, sv: sizeXs }, SM: { d: 32, f: 12, sv: sizeXs },
    MD: { d: 40, f: 14, sv: sizeSm }, LG: { d: 48, f: 16, sv: sizeMd },
    XL: { d: 56, f: 18, sv: sizeLg },
  }
  function buildAvatar(c: ComponentNode, out: PendingProp[], size: string) {
    const s = AVATAR_SIZES[size]
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    c.resize(s.d, s.d)
    c.fills = [fillP(p.action, 0.9)]
    bindRadius(c, radPill, 9999)
    const initials = txt('AV', { roleKey: 'label', style: 'Medium', size: s.f, sizeVar: s.sv, weightVar: wMedium, colorP: p.textOnBrand })
    c.appendChild(initials)
    out.push({ node: initials, prop: 'Initials', def: 'AV' })
  }

  const TOAST_STATUS: Record<string, Pair> = {
    Success: p.statusSuccess, Error: p.statusError,
    Warning: p.statusWarning, Info: p.statusInfo,
  }
  function buildToast(c: ComponentNode, out: PendingProp[], status: string) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    c.resize(320, 10)
    pad(c, 12, 16, 12, 14); gap(c, 10)
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    bindRadius(c, radContainer, radiusContainer)
    const dot = figma.createFrame()
    dot.name = 'status-dot'
    dot.resize(8, 8)
    dot.cornerRadius = 9999
    dot.fills = [fillP(TOAST_STATUS[status] ?? p.statusSuccess)]
    c.appendChild(dot)
    dot.layoutSizingHorizontal = 'FIXED'
    dot.layoutSizingVertical = 'FIXED'
    const message = txt('Changes saved successfully', { roleKey: 'body-sm', size: 14, sizeVar: sizeSm, colorP: p.textPrimary })
    c.appendChild(message)
    message.layoutSizingHorizontal = 'FILL'
    out.push({ node: message, prop: 'Message', def: 'Changes saved successfully' })
    const action = txt('Undo', { roleKey: 'label', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textBrand })
    c.appendChild(action)
    out.push({ node: action, prop: 'Action', def: 'Undo' })
    // The early resize (dummy height) pins the counter axis — re-assert hug
    // now that the children exist so the height wraps the content.
    c.layoutSizingVertical = 'HUG'
  }

  // ── Alerts (Feedback) — status-tinted banner + inline alert ────────────────
  const ALERT_STATUS: Record<string, { solid: Pair; subtle: Pair; text: Pair; glyph: string }> = {
    Neutral: { solid: p.surfaceInv,    subtle: p.surface2,            text: p.textSecondary, glyph: 'ⓘ' },
    Info:    { solid: p.statusInfo,    subtle: p.statusInfoSubtle,    text: p.textInfo,      glyph: 'ⓘ' },
    Success: { solid: p.statusSuccess, subtle: p.statusSuccessSubtle, text: p.textSuccess,   glyph: '✓' },
    Warning: { solid: p.statusWarning, subtle: p.statusWarningSubtle, text: p.textWarning,   glyph: '⚠' },
    Error:   { solid: p.statusError,   subtle: p.statusErrorSubtle,   text: p.textError,     glyph: '✕' },
  }

  function buildAlertBanner(c: ComponentNode, out: PendingProp[], status: string, style: string) {
    const k = ALERT_STATUS[status] ?? ALERT_STATUS.Info
    const solid = style === 'Solid'
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'MIN'
    c.resize(520, 10)
    pad(c, 14, 16, 14, 16); gap(c, 12)
    bindRadius(c, radContainer, radiusContainer)
    if (solid) {
      c.fills = [fillP(k.solid)]
    } else {
      c.fills = [fillP(k.subtle)]
      c.strokes = [fillP(k.solid, 0.45)]
      c.strokeWeight = 1
      tryBind(c, 'strokeWeight', borderWidthVar())
    }
    const onP = solid ? (status === 'Neutral' ? p.textOnInverse : p.textOnBrand) : k.text

    const icon = txt(k.glyph, { style: 'Medium', size: 14, weightVar: wMedium, colorP: onP })
    icon.name = 'icon-status'
    c.appendChild(icon)

    const body = col('content', 2)
    const title = txt('Alert banner title', {
      style: 'Semi Bold', size: 14, sizeVar: sizeSm, weightVar: wSemibold,
      colorP: solid ? onP : p.textPrimary,
    })
    body.appendChild(title)
    out.push({ node: title, prop: 'Title', def: 'Alert banner title' })
    const message = txt('Short supporting message that explains what happened.', {
      size: 13, sizeVar: sizeSm, opacity: solid ? 0.85 : 1,
      colorP: solid ? onP : p.textSecondary,
    })
    body.appendChild(message)
    message.layoutSizingHorizontal = 'FILL'
    message.textAutoResize = 'HEIGHT'
    out.push({ node: message, prop: 'Message', def: 'Short supporting message that explains what happened.' })
    c.appendChild(body)
    body.layoutSizingHorizontal = 'FILL'

    const action = txt('Learn more', { roleKey: 'label', style: 'Medium', size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: onP })
    action.name = 'action'
    action.textDecoration = 'UNDERLINE'
    c.appendChild(action)
    out.push({ node: action, prop: 'Action', def: 'Learn more' })

    const close = txt('✕', { size: 12, colorP: onP, opacity: solid ? 0.8 : 0.7 })
    close.name = 'icon-close'
    c.appendChild(close)
    out.push({ node: close, prop: 'Show Close', def: true })
    // The early resize (dummy height) pins the counter axis — re-assert hug
    // now that the children exist so the banner wraps its content.
    c.layoutSizingVertical = 'HUG'
  }

  function buildInlineAlert(c: ComponentNode, out: PendingProp[], status: string) {
    const k = ALERT_STATUS[status] ?? ALERT_STATUS.Info
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    c.resize(380, 10)
    pad(c, 10, 12, 10, 12); gap(c, 10)
    bindRadius(c, radContainer, radiusContainer)
    c.fills = [fillP(k.subtle)]
    c.strokes = [fillP(k.solid, 0.4)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())

    const icon = txt(k.glyph, { style: 'Medium', size: 13, weightVar: wMedium, colorP: k.text })
    icon.name = 'icon-status'
    c.appendChild(icon)
    const message = txt('A short inline alert message.', { roleKey: 'body-sm', size: 13, sizeVar: sizeSm, colorP: p.textSecondary })
    c.appendChild(message)
    message.layoutSizingHorizontal = 'FILL'
    out.push({ node: message, prop: 'Message', def: 'A short inline alert message.' })
    const close = txt('✕', { size: 11, colorP: k.text, opacity: 0.7 })
    close.name = 'icon-close'
    c.appendChild(close)
    out.push({ node: close, prop: 'Show Close', def: true })
    // The early resize (dummy height) pins the counter axis — re-assert hug
    // now that the children exist so the alert wraps its content.
    c.layoutSizingVertical = 'HUG'
  }

  const SPINNER_SIZES: Record<string, number> = { SM: 16, MD: 24, LG: 32 }
  function buildSpinner(c: ComponentNode, _out: PendingProp[], size: string) {
    const d = SPINNER_SIZES[size]
    c.layoutMode = 'NONE'
    c.resize(d, d)
    c.fills = []
    const sp = miniSpinner(d, p.action)
    c.appendChild(sp)
    sp.x = 0; sp.y = 0
  }

  function buildDivider(c: ComponentNode, _out: PendingProp[], orientation: string) {
    c.layoutMode = 'NONE'
    if (orientation === 'Vertical') c.resize(1, 240)
    else c.resize(240, 1)
    c.fills = [fillP(p.borderDefault)]
  }

  function buildTooltip(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    pad(c, 6, 10, 6, 10)
    c.fills = [fillP(p.surfaceInv)]
    bindRadius(c, radControl, radiusControl)
    const label = txt('Tooltip text', { roleKey: 'caption', style: 'Medium', size: 12, sizeVar: sizeXs, weightVar: wMedium, colorP: p.textOnInverse })
    c.appendChild(label)
    out.push({ node: label, prop: 'Content', def: 'Tooltip text' })
  }

  function buildCard(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.resize(280, 10)
    pad(c, 20, 20, 20, 20); gap(c, 8)
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    bindRadius(c, radContainer, radiusContainer)
    const title = txt('Card title', { roleKey: 'heading-sm', style: 'Semi Bold', size: 16, sizeVar: sizeMd, weightVar: wSemibold, colorP: p.textPrimary })
    c.appendChild(title)
    out.push({ node: title, prop: 'Title', def: 'Card title' })
    const desc = txt('Supporting description that explains the card content.', { roleKey: 'body-md', size: 14, sizeVar: sizeSm, colorP: p.textTertiary })
    c.appendChild(desc)
    desc.layoutSizingHorizontal = 'FILL'
    desc.textAutoResize = 'HEIGHT'
    out.push({ node: desc, prop: 'Description', def: 'Supporting description that explains the card content.' })
  }

  function buildModal(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.resize(360, 10)
    pad(c, 24, 24, 24, 24); gap(c, 12)
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    bindRadius(c, radOverlay, radiusOverlay)
    const title = txt('Modal title', { roleKey: 'heading-md', style: 'Semi Bold', size: 18, sizeVar: sizeLg, weightVar: wSemibold, colorP: p.textPrimary })
    c.appendChild(title)
    out.push({ node: title, prop: 'Title', def: 'Modal title' })
    const body = txt('Body content explaining what this dialog does and what happens next.', { roleKey: 'body-md', size: 14, sizeVar: sizeSm, colorP: p.textTertiary })
    c.appendChild(body)
    body.layoutSizingHorizontal = 'FILL'
    body.textAutoResize = 'HEIGHT'
    out.push({ node: body, prop: 'Body', def: 'Body content explaining what this dialog does and what happens next.' })
    const footer = row('footer', 8)
    footer.primaryAxisAlignItems = 'MAX'
    const secondary = row('button-secondary', 8)
    pad(secondary, 8, 14, 8, 14)
    secondary.strokes = [fillP(p.borderDefault)]
    secondary.strokeWeight = 1
    bindRadius(secondary, radAction, radiusMd)
    secondary.appendChild(txt('Cancel', { roleKey: 'button', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary }))
    footer.appendChild(secondary)
    const primary = row('button-primary', 8)
    pad(primary, 8, 14, 8, 14)
    primary.fills = [fillP(p.action)]
    bindRadius(primary, radAction, radiusMd)
    primary.appendChild(txt('Confirm', { roleKey: 'button', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textOnBrand }))
    footer.appendChild(primary)
    c.appendChild(footer)
    footer.layoutSizingHorizontal = 'FILL'
  }

  function buildTabs(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 4)
    c.fills = []
    const labels = ['Overview', 'Details', 'Settings'] as const
    labels.forEach((name, i) => {
      const active = i === 0
      const tab = col(`tab-${name.toLowerCase()}`, 6)
      tab.counterAxisAlignItems = 'CENTER'
      pad(tab, 8, 12, 0, 12)
      tab.appendChild(txt(name, {
        style: active ? 'Medium' : 'Regular',
        size: 14, sizeVar: sizeSm,
        weightVar: active ? wMedium : wRegular,
        colorP: active ? p.textPrimary : p.textTertiary,
      }))
      const underline = figma.createFrame()
      underline.name = 'indicator'
      underline.resize(10, 2)
      underline.fills = active ? [fillP(p.action)] : []
      tab.appendChild(underline)
      underline.layoutSizingHorizontal = 'FILL'
      underline.layoutSizingVertical = 'FIXED'
      c.appendChild(tab)
    })
  }

  function buildBreadcrumb(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 8)
    c.fills = []
    const parts: [string, boolean][] = [['Home', false], ['Library', false], ['Current page', true]]
    parts.forEach(([name, last], i) => {
      if (i > 0) c.appendChild(txt('/', { size: 12, sizeVar: sizeXs, colorP: p.textPlaceholder }))
      c.appendChild(txt(name, {
        style: last ? 'Medium' : 'Regular',
        size: 14, sizeVar: sizeSm,
        weightVar: last ? wMedium : wRegular,
        colorP: last ? p.textPrimary : p.textTertiary,
      }))
    })
  }

  function buildProgress(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'MIN'
    c.resize(240, 8)
    c.fills = [fillP(p.surface3)]
    bindRadius(c, radPill, 9999)
    const bar = figma.createFrame()
    bar.name = 'bar'
    bar.resize(144, 8)
    bar.fills = [fillP(p.action)]
    bar.cornerRadius = 9999
    c.appendChild(bar)
    bar.layoutSizingHorizontal = 'FIXED'
    bar.layoutSizingVertical = 'FILL'
  }

  // ── Extended builders: button family ───────────────────────────────────────
  // Close button size axis — mirrors the configurator (MD, SM).
  const CLOSE_SIZES: Record<string, { d: number; f: number }> = {
    MD: { d: 32, f: 14 },
    SM: { d: 24, f: 12 },
  }
  function buildCloseButton(c: ComponentNode, _out: PendingProp[], state: string, size = 'MD') {
    const sz = CLOSE_SIZES[size] ?? CLOSE_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    c.resize(sz.d, sz.d)
    bindRadius(c, radControl, radiusControl)
    const disabled = state === 'Disabled'
    const hoverish = state === 'Hover' || state === 'Pressed'
    c.fills = hoverish ? [fillP(p.surface2, state === 'Pressed' ? 1 : 0.8)] : []
    if (state === 'Focused') focusRing(c, p.action.hex)
    const icon = txt('✕', { style: 'Medium', size: sz.f, weightVar: wMedium, colorP: disabled ? p.textDisabled : p.textSecondary })
    icon.name = 'icon'
    c.appendChild(icon)
  }

  // FAB size axis — mirrors the configurator (MD, LG).
  const FAB_SIZES: Record<string, { d: number; f: number }> = {
    MD: { d: 48, f: 20 }, LG: { d: 56, f: 24 },
  }
  function buildFab(c: ComponentNode, _out: PendingProp[], size: string, state: string) {
    const s = FAB_SIZES[size]
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    c.resize(s.d, s.d)
    c.cornerRadius = 9999
    c.fills = [fillP(state === 'Hover' ? p.actionHover : p.action)]
    c.effects = [{
      type: 'DROP_SHADOW', color: { ...hexToRgb(p.action.hex), a: 0.35 },
      offset: { x: 0, y: 4 }, radius: 12, spread: 0, visible: true, blendMode: 'NORMAL',
    }]
    const icon = txt('+', { style: 'Medium', size: s.f, weightVar: wMedium, colorP: p.textOnBrand })
    icon.name = 'icon'
    c.appendChild(icon)
  }

  // Button group size axis — mirrors the configurator (MD, SM, LG).
  const BTNGROUP_SIZES: Record<string, { padV: number; padH: number; f: number; fv?: Variable }> = {
    SM: { padV: 6,  padH: 12, f: 13, fv: sizeSm },
    MD: { padV: 8,  padH: 16, f: 14, fv: sizeSm },
    LG: { padV: 10, padH: 20, f: 15, fv: sizeMd },
  }
  function buildButtonGroup(c: ComponentNode, _out: PendingProp[], size = 'MD') {
    const sz = BTNGROUP_SIZES[size] ?? BTNGROUP_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.fills = []
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    bindRadius(c, radAction, radiusMd)
    c.clipsContent = true
    ;['Day', 'Week', 'Month'].forEach((label, i) => {
      const seg = row(`segment-${label.toLowerCase()}`, 8)
      pad(seg, sz.padV, sz.padH, sz.padV, sz.padH)
      seg.fills = i === 0 ? [fillP(p.surface2)] : []
      if (i > 0) {
        seg.strokes = [fillP(p.borderDefault)]
        seg.strokeWeight = 0
        seg.strokeLeftWeight = 1
      }
      seg.appendChild(txt(label, {
        style: i === 0 ? 'Medium' : 'Regular', size: sz.f, sizeVar: sz.fv,
        weightVar: i === 0 ? wMedium : wRegular,
        colorP: i === 0 ? p.textPrimary : p.textSecondary,
      }))
      c.appendChild(seg)
    })
  }

  // Social button size axis — mirrors the configurator (MD, LG).
  const SOCIAL_SIZES: Record<string, { padV: number; padH: number; f: number; fv?: Variable }> = {
    MD: { padV: 10, padH: 16, f: 14, fv: sizeSm },
    LG: { padV: 12, padH: 20, f: 15, fv: sizeMd },
  }
  function buildSocial(c: ComponentNode, out: PendingProp[], provider: string, state: string, size = 'MD') {
    const sz = SOCIAL_SIZES[size] ?? SOCIAL_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    pad(c, sz.padV, sz.padH, sz.padV, sz.padH); gap(c, 10)
    bindRadius(c, radAction, radiusMd)
    c.fills = state === 'Hover' ? [fillP(p.surface1)] : [fillP(p.surface0)]
    c.strokes = [fillP(state === 'Hover' ? p.borderStrong : p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    const icon = txt(provider.charAt(0), { style: 'Bold', size: sz.f, colorP: p.textPrimary })
    icon.name = 'provider-icon'
    c.appendChild(icon)
    const label = txt(`Continue with ${provider}`, { roleKey: 'button', style: 'Medium', size: sz.f, sizeVar: sz.fv, weightVar: wMedium, colorP: p.textPrimary })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: `Continue with ${provider}` })
  }

  function buildTextLink(c: ComponentNode, out: PendingProp[], state: string) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 4)
    c.fills = []
    const colorP = state === 'Disabled' ? p.textDisabled : p.textBrand
    const label = txt('Learn more', { roleKey: 'label', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP })
    if (state === 'Hover') label.textDecoration = 'UNDERLINE'
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Learn more' })
    const arrow = txt('→', { style: 'Medium', size: 14, weightVar: wMedium, colorP })
    arrow.name = 'icon'
    c.appendChild(arrow)
  }

  function buildStoreBadge(c: ComponentNode, _out: PendingProp[], store: string) {
    const apple = store === 'App Store'
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    pad(c, 8, 16, 8, 14); gap(c, 8)
    c.fills = [fillP(p.surfaceInv)]
    c.strokes = [fillP(p.borderStrong)]
    c.strokeWeight = 1
    bindRadius(c, radAction, radiusMd)
    const icon = txt(apple ? '' : '▶', { size: 18, colorP: p.textOnInverse })
    icon.name = 'store-icon'
    c.appendChild(icon)
    const lines = col('labels', 0)
    lines.appendChild(txt(apple ? 'Download on the' : 'GET IT ON', { size: 8, colorP: p.textOnInverse, opacity: 0.8 }))
    lines.appendChild(txt(apple ? 'App Store' : 'Google Play', { style: 'Semi Bold', size: 14, weightVar: wSemibold, colorP: p.textOnInverse }))
    c.appendChild(lines)
  }

  // ── Extended builders: form controls ───────────────────────────────────────
  function checkBoxSquare(checked: boolean): FrameNode {
    const box = figma.createFrame()
    box.name = 'box'
    box.layoutMode = 'HORIZONTAL'
    box.primaryAxisSizingMode = 'FIXED'
    box.counterAxisSizingMode = 'FIXED'
    box.primaryAxisAlignItems = 'CENTER'
    box.counterAxisAlignItems = 'CENTER'
    bindRadius(box, radControl, radiusControl)
    if (checked) {
      box.fills = [fillP(p.action)]
      box.appendChild(txt('✓', { style: 'Bold', size: 11, colorP: p.textOnBrand }))
    } else {
      box.fills = [fillP(p.surface0)]
      box.strokes = [fillP(p.borderDefault)]
      box.strokeWeight = 1
      tryBind(box, 'strokeWeight', borderWidthVar())
    }
    box.resize(18, 18)
    return box
  }

  function buildCheckboxGroup(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 12)
    c.fills = []
    const legend = txt('Group label', { roleKey: 'label', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary })
    c.appendChild(legend)
    out.push({ node: legend, prop: 'Legend', def: 'Group label' })
    const options: [string, boolean][] = [['Option one', true], ['Option two', false], ['Option three', false]]
    for (const [label, checked] of options) {
      const r = row(`option-${label.toLowerCase().replace(/\s+/g, '-')}`, 8)
      r.counterAxisAlignItems = 'CENTER'
      r.appendChild(checkBoxSquare(checked))
      r.appendChild(txt(label, { roleKey: 'label', size: 14, sizeVar: sizeSm, colorP: p.textPrimary }))
      c.appendChild(r)
    }
  }

  function radioCircle(selected: boolean, disabled = false, d = 18): FrameNode {
    const o = figma.createFrame()
    o.name = 'radio'
    o.layoutMode = 'HORIZONTAL'
    o.primaryAxisSizingMode = 'FIXED'
    o.counterAxisSizingMode = 'FIXED'
    o.primaryAxisAlignItems = 'CENTER'
    o.counterAxisAlignItems = 'CENTER'
    o.cornerRadius = 9999
    o.fills = [fillP(p.surface0)]
    o.strokes = [fillP(disabled ? p.borderDisabled : selected ? p.action : p.borderDefault)]
    o.strokeWeight = selected ? 2 : 1
    if (selected) {
      const dot = figma.createFrame()
      dot.name = 'dot'
      dot.cornerRadius = 9999
      const dd = Math.round(d * 0.44)
      dot.resize(dd, dd)
      dot.fills = [fillP(disabled ? p.actionDisabled : p.action)]
      o.appendChild(dot)
      dot.layoutSizingHorizontal = 'FIXED'
      dot.layoutSizingVertical = 'FIXED'
    }
    o.resize(d, d)
    return o
  }

  function buildRadio(c: ComponentNode, out: PendingProp[], selected: boolean, state: string, size = 'MD') {
    const sz = CHECK_SIZES[size] ?? CHECK_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 8)
    c.fills = []
    const disabled = state === 'Disabled'
    const o = radioCircle(selected, disabled, sz.d)
    if (state === 'Hover' && !selected) o.strokes = [fillP(p.borderStrong)]
    if (state === 'Focused') focusRing(o, p.action.hex)
    c.appendChild(o)
    const label = txt('Label', { roleKey: 'label', size: sz.f, sizeVar: sz.fv, colorP: disabled ? p.textDisabled : p.textPrimary })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Label' })
  }

  function buildRadioGroup(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 12)
    c.fills = []
    const legend = txt('Group label', { roleKey: 'label', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary })
    c.appendChild(legend)
    out.push({ node: legend, prop: 'Legend', def: 'Group label' })
    const options: [string, boolean][] = [['Option one', true], ['Option two', false], ['Option three', false]]
    for (const [label, selected] of options) {
      const r = row(`option-${label.toLowerCase().replace(/\s+/g, '-')}`, 8)
      r.counterAxisAlignItems = 'CENTER'
      r.appendChild(radioCircle(selected))
      r.appendChild(txt(label, { roleKey: 'label', size: 14, sizeVar: sizeSm, colorP: p.textPrimary }))
      c.appendChild(r)
    }
  }

  function buildTextArea(c: ComponentNode, out: PendingProp[], state: string) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.resize(240, 96)
    pad(c, 10, 12, 10, 12)
    const disabled = state === 'Disabled'
    c.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surfaceInput)]
    const border =
      disabled          ? p.borderDisabled :
      state === 'Error' ? p.borderError :
      state === 'Focused' ? p.borderFocus :
      p.borderStrong
    c.strokes = [fillP(border)]
    c.strokeWeight = state === 'Focused' ? 1.5 : 1
    if (state !== 'Focused') tryBind(c, 'strokeWeight', borderWidthVar())
    if (state === 'Focused') focusRing(c, p.borderFocus.hex)
    if (state === 'Error') focusRing(c, p.statusError.hex)
    bindRadius(c, radAction, radiusMd)
    const content = txt('Placeholder…', { roleKey: 'placeholder', size: 14, sizeVar: sizeSm, colorP: disabled ? p.textDisabled : p.textPlaceholder })
    content.name = 'placeholder'
    c.appendChild(content)
    content.layoutSizingHorizontal = 'FILL'
    content.textAutoResize = 'HEIGHT'
    out.push({ node: content, prop: 'Placeholder', def: 'Placeholder…' })
  }

  // OTP size axis — mirrors the configurator (MD, SM, LG).
  const OTP_SIZES: Record<string, { w: number; h: number; f: number }> = {
    SM: { w: 32, h: 40, f: 16 },
    MD: { w: 40, h: 48, f: 18 },
    LG: { w: 48, h: 56, f: 20 },
  }
  function buildOtp(c: ComponentNode, _out: PendingProp[], state: string, size = 'MD') {
    const sz = OTP_SIZES[size] ?? OTP_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 8)
    c.fills = []
    const digits = ['1', '2', '3', '4']
    digits.forEach((d, i) => {
      const cell = figma.createFrame()
      cell.name = `digit-${i + 1}`
      cell.layoutMode = 'HORIZONTAL'
      cell.primaryAxisSizingMode = 'FIXED'
      cell.counterAxisSizingMode = 'FIXED'
      cell.primaryAxisAlignItems = 'CENTER'
      cell.counterAxisAlignItems = 'CENTER'
      cell.fills = [fillP(p.surface0)]
      const active = state === 'Focused' && i === 0
      cell.strokes = [fillP(active ? p.borderBrand : p.borderDefault)]
      cell.strokeWeight = active ? 1.5 : 1
      if (!active) tryBind(cell, 'strokeWeight', borderWidthVar())
      if (active) focusRing(cell, p.borderBrand.hex)
      bindRadius(cell, radAction, radiusMd)
      if (state === 'Filled') {
        cell.appendChild(txt(d, { style: 'Medium', size: sz.f, weightVar: wMedium, colorP: p.textPrimary }))
      }
      cell.resize(sz.w, sz.h)
      c.appendChild(cell)
    })
  }

  function buildStepperInput(c: ComponentNode, out: PendingProp[], state: string) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    c.fills = []
    c.strokes = [fillP(state === 'Disabled' ? p.borderDisabled : p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    bindRadius(c, radAction, radiusMd)
    c.clipsContent = true
    const disabled = state === 'Disabled'
    const stepBtn = (label: string, name: string) => {
      const b = row(name, 0)
      b.primaryAxisAlignItems = 'CENTER'
      b.counterAxisAlignItems = 'CENTER'
      pad(b, 8, 12, 8, 12)
      b.fills = [fillP(p.surface1)]
      b.appendChild(txt(label, { style: 'Medium', size: 14, weightVar: wMedium, colorP: disabled ? p.textDisabled : p.textSecondary }))
      return b
    }
    c.appendChild(stepBtn('−', 'decrement'))
    const value = row('value', 0)
    value.primaryAxisAlignItems = 'CENTER'
    pad(value, 8, 16, 8, 16)
    value.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surface0)]
    value.strokes = [fillP(state === 'Disabled' ? p.borderDisabled : p.borderDefault)]
    value.strokeWeight = 0
    value.strokeLeftWeight = 1
    value.strokeRightWeight = 1
    const vtxt = txt('10', { roleKey: 'placeholder', size: 14, sizeVar: sizeSm, colorP: disabled ? p.textDisabled : p.textPrimary })
    value.appendChild(vtxt)
    c.appendChild(value)
    out.push({ node: vtxt, prop: 'Value', def: '10' })
    c.appendChild(stepBtn('+', 'increment'))
  }

  function buildTagInput(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    c.resize(260, 44)
    pad(c, 8, 12, 8, 8); gap(c, 6)
    c.fills = [fillP(p.surface0)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    bindRadius(c, radAction, radiusMd)
    for (const t of ['Design', 'Tokens']) {
      const tag = row(`tag-${t.toLowerCase()}`, 4)
      tag.counterAxisAlignItems = 'CENTER'
      pad(tag, 2, 6, 2, 8)
      tag.fills = [fillP(p.surface2)]
      bindRadius(tag, radControl, radiusControl)
      tag.appendChild(txt(t, { roleKey: 'label', size: 12, sizeVar: sizeXs, colorP: p.textSecondary }))
      tag.appendChild(txt('✕', { size: 10, colorP: p.textTertiary }))
      c.appendChild(tag)
    }
    const placeholder = txt('Add tag…', { roleKey: 'placeholder', size: 14, sizeVar: sizeSm, colorP: p.textPlaceholder })
    placeholder.name = 'placeholder'
    c.appendChild(placeholder)
    out.push({ node: placeholder, prop: 'Placeholder', def: 'Add tag…' })
    // The early resize pins the counter axis — re-assert hug so the field
    // height wraps the chips row.
    c.layoutSizingVertical = 'HUG'
  }

  function buildFileUpload(c: ComponentNode, out: PendingProp[], state: string) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.counterAxisAlignItems = 'CENTER'
    c.resize(280, 10)
    pad(c, 24, 24, 24, 24); gap(c, 10)
    c.fills = [fillP(p.surface0)]
    c.strokes = [fillP(state === 'Hover' ? p.borderBrand : p.borderDefault)]
    c.strokeWeight = 1
    c.dashPattern = [6, 6]
    bindRadius(c, radContainer, radiusContainer)
    const iconWrap = figma.createFrame()
    iconWrap.name = 'icon'
    iconWrap.layoutMode = 'HORIZONTAL'
    iconWrap.primaryAxisSizingMode = 'FIXED'
    iconWrap.counterAxisSizingMode = 'FIXED'
    iconWrap.primaryAxisAlignItems = 'CENTER'
    iconWrap.counterAxisAlignItems = 'CENTER'
    iconWrap.cornerRadius = 9999
    iconWrap.fills = [fillP(p.surface2)]
    iconWrap.appendChild(txt('↑', { style: 'Medium', size: 16, weightVar: wMedium, colorP: p.textSecondary }))
    iconWrap.resize(40, 40)
    c.appendChild(iconWrap)
    const title = row('title', 4)
    title.appendChild(txt('Click to upload', { roleKey: 'label', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textBrand }))
    title.appendChild(txt('or drag and drop', { roleKey: 'body-sm', size: 14, sizeVar: sizeSm, colorP: p.textSecondary }))
    c.appendChild(title)
    const hint = txt('SVG, PNG or JPG (max. 800×400px)', { roleKey: 'caption', size: 12, sizeVar: sizeXs, colorP: p.textTertiary })
    c.appendChild(hint)
    out.push({ node: hint, prop: 'Hint', def: 'SVG, PNG or JPG (max. 800×400px)' })
  }

  // Segmented control size axis — mirrors the configurator (MD, SM).
  const SEGMENTED_SIZES: Record<string, { padV: number; padH: number; f: number }> = {
    MD: { padV: 6, padH: 14, f: 13 },
    SM: { padV: 4, padH: 10, f: 12 },
  }
  function buildSegmented(c: ComponentNode, _out: PendingProp[], size = 'MD') {
    const sz = SEGMENTED_SIZES[size] ?? SEGMENTED_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.paddingTop = 2; c.paddingBottom = 2
    c.paddingLeft = 2; c.paddingRight = 2
    c.itemSpacing = 2
    c.fills = [fillP(p.surface2)]
    bindRadius(c, radAction, radiusMd)
    ;['List', 'Board', 'Timeline'].forEach((label, i) => {
      const active = i === 0
      const seg = row(`segment-${label.toLowerCase()}`, 8)
      seg.paddingTop = sz.padV; seg.paddingBottom = sz.padV
      seg.paddingLeft = sz.padH; seg.paddingRight = sz.padH
      if (active) {
        seg.fills = [fillP(p.surface0)]
        seg.strokes = [fillP(p.borderDefault, 0.7)]
        seg.strokeWeight = 1
        bindRadius(seg, radControl, radiusControl)
      }
      seg.appendChild(txt(label, {
        style: active ? 'Medium' : 'Regular', size: sz.f, sizeVar: sizeSm,
        weightVar: active ? wMedium : wRegular,
        colorP: active ? p.textPrimary : p.textSecondary,
      }))
      c.appendChild(seg)
    })
  }

  function buildSlider(c: ComponentNode, _out: PendingProp[], state: string) {
    c.layoutMode = 'NONE'
    c.resize(240, 20)
    c.fills = []
    const disabled = state === 'Disabled'
    const track = figma.createFrame()
    track.name = 'track'
    track.resize(240, 6)
    track.cornerRadius = 9999
    track.fills = [fillP(p.surface3)]
    c.appendChild(track)
    track.x = 0; track.y = 7
    const fillBar = figma.createFrame()
    fillBar.name = 'fill'
    fillBar.resize(144, 6)
    fillBar.cornerRadius = 9999
    fillBar.fills = [fillP(disabled ? p.actionDisabled : p.action)]
    c.appendChild(fillBar)
    fillBar.x = 0; fillBar.y = 7
    const knob = figma.createFrame()
    knob.name = 'knob'
    knob.resize(18, 18)
    knob.cornerRadius = 9999
    knob.fills = [fillP(p.textOnBrand)]
    knob.strokes = [fillP(disabled ? p.actionDisabled : p.action)]
    knob.strokeWeight = 2
    if (state === 'Hover') focusRing(knob, p.action.hex)
    c.appendChild(knob)
    knob.x = 135; knob.y = 1
  }

  function switchTrack(on: boolean): FrameNode {
    const track = figma.createFrame()
    track.name = 'track'
    track.layoutMode = 'HORIZONTAL'
    track.primaryAxisSizingMode = 'FIXED'
    track.counterAxisSizingMode = 'FIXED'
    track.primaryAxisAlignItems = on ? 'MAX' : 'MIN'
    track.counterAxisAlignItems = 'CENTER'
    track.resize(40, 22)
    track.paddingLeft = 2; track.paddingRight = 2
    track.fills = [fillP(on ? p.action : p.surface3)]
    track.cornerRadius = 9999
    const knob = figma.createFrame()
    knob.name = 'knob'
    knob.resize(18, 18)
    knob.cornerRadius = 9999
    knob.fills = [fillP(p.textOnBrand)]
    track.appendChild(knob)
    knob.layoutSizingHorizontal = 'FIXED'
    knob.layoutSizingVertical = 'FIXED'
    return track
  }

  function buildSwitchGroup(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 12)
    c.fills = []
    const legend = txt('Notification settings', { roleKey: 'label', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary })
    c.appendChild(legend)
    out.push({ node: legend, prop: 'Legend', def: 'Notification settings' })
    const options: [string, boolean][] = [['Email alerts', true], ['Push notifications', false], ['Weekly digest', false]]
    for (const [label, on] of options) {
      const r = row(`option-${label.toLowerCase().replace(/\s+/g, '-')}`, 10)
      r.counterAxisAlignItems = 'CENTER'
      r.appendChild(switchTrack(on))
      r.appendChild(txt(label, { roleKey: 'label', size: 14, sizeVar: sizeSm, colorP: p.textPrimary }))
      c.appendChild(r)
    }
  }

  // ── Extended builders: indicators ──────────────────────────────────────────
  // Chip size axis — mirrors the configurator (MD, SM).
  const CHIP_SIZES: Record<string, { padV: number; padH: number; f: number; rm: number }> = {
    SM: { padV: 2, padH: 8,  f: 11, rm: 9 },
    MD: { padV: 4, padH: 10, f: 12, rm: 10 },
  }
  function buildChip(c: ComponentNode, out: PendingProp[], selected: boolean, state: string, size = 'MD') {
    const sz = CHIP_SIZES[size] ?? CHIP_SIZES.MD
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    pad(c, sz.padV, sz.padH, sz.padV, sz.padH + 2); gap(c, 6)
    bindRadius(c, radPill, 9999)
    const disabled = state === 'Disabled'
    if (selected) {
      c.fills = [fillP(p.brandSubtle, state === 'Hover' ? 0.85 : 1)]
      c.strokes = [fillP(p.borderBrand)]
      c.strokeWeight = 1
    } else {
      c.fills = [fillP(state === 'Hover' ? p.surface3 : p.surface2)]
    }
    const colorP = disabled ? p.textDisabled : selected ? p.textBrand : p.textSecondary
    const label = txt('Chip', { roleKey: 'label', style: 'Medium', size: sz.f, sizeVar: sizeXs, weightVar: wMedium, colorP })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Chip' })
    const remove = txt('✕', { size: sz.rm, colorP, opacity: 0.8 })
    remove.name = 'remove'
    c.appendChild(remove)
  }

  function buildStatusBadge(c: ComponentNode, out: PendingProp[], status: string) {
    const k = BADGE_COLORS[status] ?? BADGE_COLORS.Neutral
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    pad(c, 3, 10, 3, 8); gap(c, 6)
    bindRadius(c, radPill, 9999)
    c.fills = [fillP(k.soft)]
    const dot = figma.createFrame()
    dot.name = 'dot'
    dot.resize(6, 6)
    dot.cornerRadius = 9999
    dot.fills = [fillP(k.solid)]
    c.appendChild(dot)
    dot.layoutSizingHorizontal = 'FIXED'
    dot.layoutSizingVertical = 'FIXED'
    const label = txt(status, { roleKey: 'label', style: 'Medium', size: 12, sizeVar: sizeXs, weightVar: wMedium, colorP: k.text })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: status })
  }

  function buildStepIndicator(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 8)
    c.fills = []
    const steps: [string, 'done' | 'current' | 'next'][] = [['Account', 'done'], ['Profile', 'current'], ['Review', 'next']]
    steps.forEach(([label, kind], i) => {
      if (i > 0) {
        const connector = figma.createFrame()
        connector.name = 'connector'
        connector.resize(32, 2)
        connector.fills = [fillP(kind === 'next' ? p.borderDefault : p.action)]
        c.appendChild(connector)
        connector.layoutSizingHorizontal = 'FIXED'
        connector.layoutSizingVertical = 'FIXED'
      }
      const step = row(`step-${label.toLowerCase()}`, 8)
      step.counterAxisAlignItems = 'CENTER'
      const circle = figma.createFrame()
      circle.name = 'indicator'
      circle.layoutMode = 'HORIZONTAL'
      circle.primaryAxisSizingMode = 'FIXED'
      circle.counterAxisSizingMode = 'FIXED'
      circle.primaryAxisAlignItems = 'CENTER'
      circle.counterAxisAlignItems = 'CENTER'
      circle.cornerRadius = 9999
      if (kind === 'done') {
        circle.fills = [fillP(p.action)]
        circle.appendChild(txt('✓', { style: 'Bold', size: 12, colorP: p.textOnBrand }))
      } else if (kind === 'current') {
        circle.fills = [fillP(p.brandSubtle)]
        circle.strokes = [fillP(p.action)]
        circle.strokeWeight = 2
        circle.appendChild(txt(String(i + 1), { style: 'Medium', size: 12, weightVar: wMedium, colorP: p.textBrand }))
      } else {
        circle.fills = []
        circle.strokes = [fillP(p.borderDefault)]
        circle.strokeWeight = 1
        circle.appendChild(txt(String(i + 1), { style: 'Medium', size: 12, weightVar: wMedium, colorP: p.textTertiary }))
      }
      circle.resize(28, 28)
      step.appendChild(circle)
      step.appendChild(txt(label, {
        style: kind === 'current' ? 'Medium' : 'Regular', size: 13, sizeVar: sizeSm,
        weightVar: kind === 'current' ? wMedium : wRegular,
        colorP: kind === 'next' ? p.textTertiary : p.textPrimary,
      }))
      c.appendChild(step)
    })
  }

  // ── Catalogue parity builders (configurator componentCatalogue.ts) ─────────

  // Combobox — type-ahead select. Closed = search input + chevron; Open adds
  // the floating results panel with the first row highlighted.
  function buildCombobox(c: ComponentNode, out: PendingProp[], state: string) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 6)
    c.fills = []
    const open = state === 'Open'

    const trigger = row('trigger', 8)
    trigger.primaryAxisSizingMode = 'FIXED'
    trigger.counterAxisSizingMode = 'FIXED'
    trigger.primaryAxisAlignItems = 'SPACE_BETWEEN'
    trigger.fills = [fillP(p.surface0)]
    trigger.strokes = [fillP(open ? p.borderBrand : p.borderDefault)]
    trigger.strokeWeight = open ? 1.5 : 1
    if (!open) tryBind(trigger, 'strokeWeight', borderWidthVar())
    bindRadius(trigger, radAction, radiusMd)
    pad(trigger, 10, 12, 10, 12)
    if (open) focusRing(trigger, p.borderBrand.hex)
    const lead = row('lead', 8)
    lead.appendChild(txt('🔍', { size: 12, colorP: p.iconQuaternary }))
    const query = txt(open ? 'ber' : 'Search options…', {
      size: 14, sizeVar: sizeSm,
      colorP: open ? p.textPrimary : p.textPlaceholder,
    })
    query.name = 'query'
    lead.appendChild(query)
    trigger.appendChild(lead)
    trigger.appendChild(txt('▾', { size: 12, colorP: p.iconTertiary }))
    c.appendChild(trigger)
    trigger.resize(260, 40)
    out.push({ node: query, prop: 'Query', def: query.characters })

    if (open) {
      const panel = col('listbox', 2)
      panel.fills = [fillP(p.surface1)]
      panel.strokes = [fillP(p.borderDefault)]
      panel.strokeWeight = 1
      bindRadius(panel, radOverlay, radiusOverlay)
      pad(panel, 6, 6, 6, 6)
      panel.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 4 }, radius: 16, spread: 0, visible: true, blendMode: 'NORMAL' }]
      const options: [string, boolean][] = [['Berlin', true], ['Bern', false], ['Beirut', false]]
      for (const [label, active] of options) {
        const opt = row(`option-${label.toLowerCase()}`, 8)
        opt.primaryAxisSizingMode = 'FIXED'
        opt.fills = active ? [fillP(p.surfaceSelected)] : []
        bindRadius(opt, radControl, radiusControl)
        pad(opt, 8, 10, 8, 10)
        opt.appendChild(txt(label, { roleKey: 'label', size: 13, sizeVar: sizeSm, colorP: p.textPrimary }))
        panel.appendChild(opt)
        opt.layoutSizingHorizontal = 'FILL'
      }
      c.appendChild(panel)
      panel.layoutSizingHorizontal = 'FILL'
    }
  }

  // Input Group — input with attached add-ons sharing one border.
  function buildInputGroup(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    c.itemSpacing = 0
    c.fills = [fillP(p.surface0)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    tryBind(c, 'strokeWeight', borderWidthVar())
    bindRadius(c, radAction, radiusMd)
    c.clipsContent = true

    // Segments share the group's outer border; each hugs to the same 40px
    // height via identical vertical padding (no FILL — the group hugs too).
    const prefix = row('prefix', 0)
    prefix.counterAxisSizingMode = 'FIXED'
    prefix.counterAxisAlignItems = 'CENTER'
    prefix.fills = [fillP(p.surface2)]
    pad(prefix, 10, 12, 10, 12)
    prefix.appendChild(txt('https://', { roleKey: 'body-sm', size: 14, sizeVar: sizeSm, colorP: p.textTertiary }))
    c.appendChild(prefix)
    prefix.resize(prefix.width, 40)

    const field = row('field', 0)
    field.primaryAxisSizingMode = 'FIXED'
    field.counterAxisSizingMode = 'FIXED'
    pad(field, 10, 12, 10, 12)
    const value = txt('createui.co', { roleKey: 'placeholder', size: 14, sizeVar: sizeSm, colorP: p.textPrimary })
    value.name = 'value'
    field.appendChild(value)
    c.appendChild(field)
    field.resize(180, 40)
    out.push({ node: value, prop: 'Value', def: 'createui.co' })

    const suffix = row('suffix', 6)
    suffix.counterAxisSizingMode = 'FIXED'
    suffix.counterAxisAlignItems = 'CENTER'
    suffix.fills = [fillP(p.action)]
    pad(suffix, 10, 14, 10, 14)
    const go = txt('Copy', { roleKey: 'button', style: 'Medium', size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textOnBrand })
    suffix.appendChild(go)
    c.appendChild(suffix)
    suffix.resize(suffix.width, 40)
  }

  // Dropzone — dashed drag-and-drop target with active-drag and error states.
  function buildDropzone(c: ComponentNode, out: PendingProp[], state: string) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 8)
    pad(c, 28, 24, 28, 24)
    const dragging = state === 'Dragging'
    const error = state === 'Error'
    c.fills = [fillP(dragging ? p.brandSubtle : error ? p.statusErrorSubtle : p.surface1)]
    c.strokes = [fillP(dragging ? p.borderBrand : error ? p.borderError : p.borderStrong)]
    c.strokeWeight = dragging ? 1.5 : 1
    c.dashPattern = [6, 6]
    bindRadius(c, radContainer, radiusContainer)

    c.appendChild(txt(error ? '⚠' : '⤒', { size: 20, colorP: error ? p.iconError : dragging ? p.iconBrand : p.iconTertiary }))
    const title = txt(
      dragging ? 'Drop files to upload' : error ? 'File type not accepted' : 'Drag & drop or click to browse',
      { style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: error ? p.textError : p.textPrimary },
    )
    title.name = 'title'
    c.appendChild(title)
    const hint = txt(error ? 'PNG, JPG or PDF only — max 10 MB' : 'PNG, JPG or PDF up to 10 MB', {
      size: 12, sizeVar: sizeXs, colorP: p.textTertiary,
    })
    hint.name = 'hint'
    c.appendChild(hint)
    c.resize(320, 140)
    out.push({ node: title, prop: 'Title', def: title.characters })
    out.push({ node: hint, prop: 'Hint', def: hint.characters })
  }

  // Field — the form-row composition: label + control slot + hint.
  function buildField(c: ComponentNode, out: PendingProp[], state: string) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 6)
    c.fills = []
    const error = state === 'Error'

    const labelRow = row('label-row', 4)
    const label = txt('Label', { roleKey: 'label', style: 'Medium', size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary })
    labelRow.appendChild(label)
    labelRow.appendChild(txt('*', { style: 'Medium', size: 13, weightVar: wMedium, colorP: p.textError }))
    c.appendChild(labelRow)
    out.push({ node: label, prop: 'Label', def: 'Label' })

    const box = row('control', 8)
    box.primaryAxisSizingMode = 'FIXED'
    box.counterAxisSizingMode = 'FIXED'
    box.fills = [fillP(p.surface0)]
    box.strokes = [fillP(error ? p.borderError : p.borderDefault)]
    box.strokeWeight = 1
    if (!error) tryBind(box, 'strokeWeight', borderWidthVar())
    bindRadius(box, radAction, radiusMd)
    pad(box, 10, 12, 10, 12)
    box.appendChild(txt('Placeholder Text..', { roleKey: 'placeholder', size: 14, sizeVar: sizeSm, colorP: p.textPlaceholder }))
    c.appendChild(box)
    box.resize(260, 40)

    const hint = txt(error ? 'This field is required.' : 'Helper text goes here.', {
      size: 12, sizeVar: sizeXs, colorP: error ? p.textError : p.textTertiary,
    })
    hint.name = error ? 'error' : 'hint'
    c.appendChild(hint)
    out.push({ node: hint, prop: error ? 'Error' : 'Hint', def: hint.characters })
  }

  // Label — standalone form label with optional required marker.
  function buildLabel(c: ComponentNode, out: PendingProp[], required: boolean) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 4)
    c.fills = []
    const label = txt('Label', { roleKey: 'label', style: 'Medium', size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary })
    c.appendChild(label)
    out.push({ node: label, prop: 'Label', def: 'Label' })
    if (required) c.appendChild(txt('*', { style: 'Medium', size: 13, weightVar: wMedium, colorP: p.textError }))
    else {
      const hint = txt('(optional)', { roleKey: 'caption', size: 12, sizeVar: sizeXs, colorP: p.textPlaceholder })
      hint.name = 'hint'
      c.appendChild(hint)
    }
  }

  // Password Strength — segmented meter + caption scored Weak/Fair/Strong.
  function buildPasswordStrength(c: ComponentNode, out: PendingProp[], strength: string) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 6)
    c.fills = []
    const score = strength === 'Weak' ? 1 : strength === 'Fair' ? 2 : 4
    const tone = strength === 'Weak' ? p.statusError : strength === 'Fair' ? p.statusWarning : p.statusSuccess

    const meter = row('meter', 4)
    for (let i = 0; i < 4; i++) {
      const seg = figma.createFrame()
      seg.name = `segment-${i + 1}`
      seg.resize(56, 4)
      seg.cornerRadius = 999
      seg.fills = [fillP(i < score ? tone : p.surface3)]
      meter.appendChild(seg)
      seg.layoutSizingHorizontal = 'FIXED'
      seg.layoutSizingVertical = 'FIXED'
    }
    c.appendChild(meter)
    const caption = txt(
      strength === 'Weak' ? 'Weak — add more characters' : strength === 'Fair' ? 'Fair — add a symbol or number' : 'Strong password',
      { size: 12, sizeVar: sizeXs, colorP: strength === 'Weak' ? p.textError : strength === 'Fair' ? p.textWarning : p.textSuccess },
    )
    caption.name = 'caption'
    c.appendChild(caption)
    out.push({ node: caption, prop: 'Caption', def: caption.characters })
  }

  // Rating — 5-star row; interactive variant adds the count label.
  function buildRating(c: ComponentNode, out: PendingProp[], interactive: boolean) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 6)
    c.fills = []
    const stars = row('stars', 2)
    for (let i = 0; i < 5; i++) {
      stars.appendChild(txt(i < 4 ? '★' : '☆', {
        size: interactive ? 18 : 15,
        colorP: i < 4 ? p.statusWarning : p.iconDisabled,
      }))
    }
    c.appendChild(stars)
    if (interactive) {
      const count = txt('4.0 · 128 reviews', { roleKey: 'caption', size: 12, sizeVar: sizeXs, colorP: p.textTertiary })
      count.name = 'count'
      c.appendChild(count)
      out.push({ node: count, prop: 'Count', def: '4.0 · 128 reviews' })
    }
  }

  // File Format — document glyph with a colored format plate.
  const FILE_FORMATS: Record<string, Pair> = {
    PDF: p.statusError, PNG: p.statusInfo, SVG: p.statusSuccess, ZIP: p.statusWarning,
  }
  function buildFileFormat(c: ComponentNode, _out: PendingProp[], format: string) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    c.itemSpacing = -8
    c.fills = []
    const sheet = figma.createFrame()
    sheet.name = 'sheet'
    sheet.resize(34, 42)
    sheet.fills = [fillP(p.surface1)]
    sheet.strokes = [fillP(p.borderStrong)]
    sheet.strokeWeight = 1
    sheet.topLeftRadius = 4; sheet.topRightRadius = 10
    sheet.bottomLeftRadius = 4; sheet.bottomRightRadius = 4
    c.appendChild(sheet)
    sheet.layoutSizingHorizontal = 'FIXED'
    sheet.layoutSizingVertical = 'FIXED'
    const plate = row('plate', 0)
    plate.primaryAxisAlignItems = 'CENTER'
    plate.fills = [fillP(FILE_FORMATS[format] ?? p.statusInfo)]
    plate.cornerRadius = 4
    pad(plate, 2, 6, 2, 6)
    plate.appendChild(txt(format, { style: 'Bold', size: 9, colorP: p.textOnBrand }))
    c.appendChild(plate)
  }

  // Accordion — stacked disclosure rows, first panel expanded.
  function buildAccordion(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.itemSpacing = 0
    c.fills = []
    const rows: [string, boolean][] = [
      ['Is there a free trial available?', true],
      ['Can I change my plan later?', false],
      ['How does billing work?', false],
    ]
    rows.forEach(([q, openRow], i) => {
      const item = col(`item-${i + 1}`, 0)
      const head = row('header', 12)
      head.primaryAxisSizingMode = 'FIXED'
      head.primaryAxisAlignItems = 'SPACE_BETWEEN'
      pad(head, 14, 4, 14, 4)
      head.appendChild(txt(q, { roleKey: 'label', style: 'Medium', size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textPrimary }))
      head.appendChild(txt(openRow ? '▴' : '▾', { size: 12, colorP: p.iconTertiary }))
      item.appendChild(head)
      head.layoutSizingHorizontal = 'FILL'
      if (openRow) {
        const body = col('panel', 0)
        pad(body, 0, 4, 14, 4)
        const bodyText = txt('Yes — every plan starts with a 30-day free trial. No credit card required until it ends.', {
          size: 13, sizeVar: sizeSm, colorP: p.textTertiary,
        })
        body.appendChild(bodyText)
        item.appendChild(body)
        body.layoutSizingHorizontal = 'FILL'
        bodyText.layoutSizingHorizontal = 'FILL'
        bodyText.textAutoResize = 'HEIGHT'
        out.push({ node: bodyText, prop: 'Content', def: bodyText.characters })
      }
      if (i < rows.length - 1) {
        const rule = figma.createFrame()
        rule.name = 'divider'
        rule.resize(100, 1)
        rule.fills = [fillP(p.borderSubtle)]
        item.appendChild(rule)
        rule.layoutSizingHorizontal = 'FILL'
        rule.layoutSizingVertical = 'FIXED'
      }
      c.appendChild(item)
      item.layoutSizingHorizontal = 'FILL'
    })
    c.resize(360, c.height)
  }

  // Aspect Ratio — placeholder media locked to a ratio, labelled.
  function buildAspectRatio(c: ComponentNode, _out: PendingProp[], ratio: string) {
    const dims: Record<string, [number, number]> = { '16:9': [288, 162], '4:3': [240, 180], '1:1': [200, 200] }
    const [w, h] = dims[ratio] ?? [288, 162]
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    c.fills = [fillP(p.surface2)]
    c.strokes = [fillP(p.borderSubtle)]
    c.strokeWeight = 1
    bindRadius(c, radContainer, radiusContainer)
    const tag = row('ratio', 0)
    tag.fills = [fillP(p.surfaceInv, 0.85)]
    tag.cornerRadius = 999
    pad(tag, 4, 10, 4, 10)
    tag.appendChild(txt(ratio, { style: 'Medium', size: 12, weightVar: wMedium, colorP: p.textOnInverse }))
    c.appendChild(tag)
    c.resize(w, h)
  }

  // Popover — anchored floating panel: title, body and one action.
  function buildPopover(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    gap(c, 8)
    pad(c, 16, 16, 16, 16)
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    bindRadius(c, radOverlay, radiusOverlay)
    c.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.14 }, offset: { x: 0, y: 6 }, radius: 24, spread: -4, visible: true, blendMode: 'NORMAL' }]
    const title = txt('Share this view', { roleKey: 'heading-sm', style: 'Semi Bold', size: 14, sizeVar: sizeSm, weightVar: wSemibold, colorP: p.textPrimary })
    c.appendChild(title)
    out.push({ node: title, prop: 'Title', def: 'Share this view' })
    const body = txt('Anyone with the link can see the current filters and sorting.', { roleKey: 'body-sm', size: 13, sizeVar: sizeSm, colorP: p.textTertiary })
    c.appendChild(body)
    body.layoutSizingHorizontal = 'FILL'
    body.textAutoResize = 'HEIGHT'
    out.push({ node: body, prop: 'Body', def: body.characters })
    const action = row('action', 6)
    action.fills = [fillP(p.action)]
    bindRadius(action, radAction, radiusMd)
    pad(action, 8, 14, 8, 14)
    action.appendChild(txt('Copy link', { roleKey: 'button', style: 'Medium', size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textOnBrand }))
    c.appendChild(action)
    c.resize(260, c.height)
  }

  // Info Tooltip — the ⓘ affordance + tooltip bubble pairing.
  function buildInfoTooltip(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 8)
    c.fills = []
    c.appendChild(txt('ⓘ', { size: 14, colorP: p.iconQuaternary }))
    const bubble = row('bubble', 0)
    bubble.fills = [fillP(p.surfaceInv)]
    bindRadius(bubble, radControl, radiusControl)
    pad(bubble, 6, 10, 6, 10)
    const tip = txt('Shown on hover and focus', { roleKey: 'caption', size: 12, sizeVar: sizeXs, colorP: p.textOnInverse })
    bubble.appendChild(tip)
    c.appendChild(bubble)
    out.push({ node: tip, prop: 'Content', def: 'Shown on hover and focus' })
  }

  // Scroll Area — bounded panel with rows and a custom scrollbar.
  function buildScrollArea(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.itemSpacing = 4
    pad(c, 8, 6, 8, 8)
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    bindRadius(c, radContainer, radiusContainer)
    c.clipsContent = true
    const list = col('content', 2)
    list.primaryAxisSizingMode = 'FIXED'
    for (const label of ['Getting started', 'Foundations', 'Components', 'Patterns', 'Releases']) {
      const rowF = row(`row-${label.toLowerCase().replace(/\s+/g, '-')}`, 8)
      rowF.primaryAxisSizingMode = 'FIXED'
      pad(rowF, 7, 10, 7, 10)
      bindRadius(rowF, radControl, radiusControl)
      rowF.appendChild(txt(label, { roleKey: 'body-sm', size: 13, sizeVar: sizeSm, colorP: p.textSecondary }))
      list.appendChild(rowF)
      rowF.layoutSizingHorizontal = 'FILL'
    }
    c.appendChild(list)
    list.layoutSizingHorizontal = 'FILL'
    list.layoutSizingVertical = 'FILL'
    const track = figma.createFrame()
    track.name = 'scrollbar'
    track.layoutMode = 'VERTICAL'
    track.primaryAxisSizingMode = 'FIXED'
    track.counterAxisSizingMode = 'FIXED'
    track.fills = []
    const thumb = figma.createFrame()
    thumb.name = 'thumb'
    thumb.resize(4, 48)
    thumb.cornerRadius = 999
    thumb.fills = [fillP(p.borderStrong)]
    track.appendChild(thumb)
    thumb.layoutSizingHorizontal = 'FIXED'
    thumb.layoutSizingVertical = 'FIXED'
    c.appendChild(track)
    track.resize(4, 120)
    c.resize(240, 148)
  }

  // Pagination — prev/next arrows, numbered pages, overflow ellipsis.
  function buildPagination(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    gap(c, 4)
    c.fills = []
    function pageBtn(label: string, kind: 'current' | 'page' | 'ellipsis' | 'arrow') {
      const b = row(`page-${label}`, 0)
      b.primaryAxisSizingMode = 'FIXED'
      b.counterAxisSizingMode = 'FIXED'
      b.primaryAxisAlignItems = 'CENTER'
      b.counterAxisAlignItems = 'CENTER'
      bindRadius(b, radControl, radiusControl)
      if (kind === 'current') b.fills = [fillP(p.action)]
      b.appendChild(txt(label, {
        style: kind === 'current' ? 'Medium' : 'Regular', size: 13, sizeVar: sizeSm,
        weightVar: kind === 'current' ? wMedium : wRegular,
        colorP: kind === 'current' ? p.textOnBrand
          : kind === 'ellipsis' ? p.textPlaceholder
          : kind === 'arrow' ? p.iconTertiary : p.textSecondary,
      }))
      c.appendChild(b)
      b.resize(32, 32)
    }
    pageBtn('‹', 'arrow')
    pageBtn('1', 'page')
    pageBtn('2', 'current')
    pageBtn('3', 'page')
    pageBtn('…', 'ellipsis')
    pageBtn('8', 'page')
    pageBtn('›', 'arrow')
  }

  // Tab Menu — pill-style horizontal menu, the softer sibling of Tabs.
  function buildTabMenu(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'AUTO'
    gap(c, 4)
    c.fills = []
    const items: [string, boolean][] = [['Overview', true], ['Analytics', false], ['Reports', false], ['Settings', false]]
    for (const [label, active] of items) {
      const pill = row(`tab-${label.toLowerCase()}`, 0)
      pill.fills = active ? [fillP(p.brandSubtle)] : []
      pill.cornerRadius = 999
      pad(pill, 7, 14, 7, 14)
      pill.appendChild(txt(label, {
        style: active ? 'Medium' : 'Regular', size: 13, sizeVar: sizeSm,
        weightVar: active ? wMedium : wRegular,
        colorP: active ? p.textBrand : p.textTertiary,
      }))
      c.appendChild(pill)
    }
  }

  // Shared menu panel for Dropdown / Context menus.
  function menuPanel(c: ComponentNode, items: { label: string; hint?: string; kind?: 'default' | 'active' | 'danger' | 'separator' }[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    gap(c, 2)
    pad(c, 6, 6, 6, 6)
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    bindRadius(c, radAction, radiusMd)
    c.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.14 }, offset: { x: 0, y: 6 }, radius: 24, spread: -4, visible: true, blendMode: 'NORMAL' }]
    for (const item of items) {
      if (item.kind === 'separator') {
        const rule = figma.createFrame()
        rule.name = 'separator'
        rule.resize(100, 1)
        rule.fills = [fillP(p.borderSubtle)]
        c.appendChild(rule)
        rule.layoutSizingHorizontal = 'FILL'
        rule.layoutSizingVertical = 'FIXED'
        continue
      }
      const rowF = row(`item-${item.label.toLowerCase().replace(/\s+/g, '-')}`, 8)
      rowF.primaryAxisSizingMode = 'FIXED'
      rowF.primaryAxisAlignItems = 'SPACE_BETWEEN'
      pad(rowF, 8, 10, 8, 10)
      bindRadius(rowF, radControl, radiusControl)
      if (item.kind === 'active') rowF.fills = [fillP(p.surface1Hover)]
      const colorP = item.kind === 'danger' ? p.textError : p.textPrimary
      rowF.appendChild(txt(item.label, { roleKey: 'label', size: 13, sizeVar: sizeSm, colorP }))
      if (item.hint) rowF.appendChild(txt(item.hint, { roleKey: 'caption', size: 12, sizeVar: sizeXs, colorP: p.textPlaceholder }))
      c.appendChild(rowF)
      rowF.layoutSizingHorizontal = 'FILL'
    }
    c.resize(220, c.height)
  }

  function buildDropdownMenu(c: ComponentNode, _out: PendingProp[]) {
    menuPanel(c, [
      { label: 'Edit', kind: 'active' },
      { label: 'Duplicate' },
      { label: 'Share…' },
      { label: '', kind: 'separator' },
      { label: 'Delete', kind: 'danger' },
    ])
  }

  function buildContextMenu(c: ComponentNode, _out: PendingProp[]) {
    menuPanel(c, [
      { label: 'Cut', hint: '⌘X' },
      { label: 'Copy', hint: '⌘C', kind: 'active' },
      { label: 'Paste', hint: '⌘V' },
      { label: '', kind: 'separator' },
      { label: 'Select all', hint: '⌘A' },
    ])
  }

  // Command — searchable action palette (⌘K).
  function buildCommand(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.itemSpacing = 0
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    bindRadius(c, radOverlay, radiusOverlay)
    c.clipsContent = true
    c.effects = [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.18 }, offset: { x: 0, y: 12 }, radius: 40, spread: -8, visible: true, blendMode: 'NORMAL' }]

    const search = row('search', 10)
    search.primaryAxisSizingMode = 'FIXED'
    pad(search, 14, 16, 14, 16)
    search.appendChild(txt('🔍', { size: 13, colorP: p.iconQuaternary }))
    const query = txt('Type a command or search…', { roleKey: 'placeholder', size: 14, sizeVar: sizeSm, colorP: p.textPlaceholder })
    search.appendChild(query)
    query.layoutSizingHorizontal = 'FILL'
    const kbd = row('kbd', 0)
    kbd.fills = [fillP(p.surface2)]
    kbd.strokes = [fillP(p.borderSubtle)]
    kbd.strokeWeight = 1
    bindRadius(kbd, radControl, radiusControl)
    pad(kbd, 2, 6, 2, 6)
    kbd.appendChild(txt('⌘K', { size: 11, colorP: p.textTertiary }))
    search.appendChild(kbd)
    c.appendChild(search)
    search.layoutSizingHorizontal = 'FILL'
    out.push({ node: query, prop: 'Placeholder', def: query.characters })

    const rule = figma.createFrame()
    rule.name = 'divider'
    rule.resize(100, 1)
    rule.fills = [fillP(p.borderSubtle)]
    c.appendChild(rule)
    rule.layoutSizingHorizontal = 'FILL'
    rule.layoutSizingVertical = 'FIXED'

    const list = col('results', 2)
    pad(list, 8, 6, 8, 6)
    const group = txt('SUGGESTIONS', { style: 'Medium', size: 10, weightVar: wMedium, colorP: p.textPlaceholder })
    group.name = 'group'
    const groupPad = row('group-label', 0)
    pad(groupPad, 4, 10, 4, 10)
    groupPad.appendChild(group)
    list.appendChild(groupPad)
    const cmds: [string, string, boolean][] = [
      ['📄', 'New document', true],
      ['👤', 'Invite teammate', false],
      ['⚙', 'Open settings', false],
    ]
    for (const [glyph, label, active] of cmds) {
      const rowF = row(`cmd-${label.toLowerCase().replace(/\s+/g, '-')}`, 10)
      rowF.primaryAxisSizingMode = 'FIXED'
      pad(rowF, 9, 10, 9, 10)
      bindRadius(rowF, radControl, radiusControl)
      if (active) rowF.fills = [fillP(p.surface1Hover)]
      rowF.appendChild(txt(glyph, { size: 13, colorP: p.iconTertiary }))
      rowF.appendChild(txt(label, { roleKey: 'body-sm', size: 13, sizeVar: sizeSm, colorP: p.textPrimary }))
      list.appendChild(rowF)
      rowF.layoutSizingHorizontal = 'FILL'
    }
    c.appendChild(list)
    list.layoutSizingHorizontal = 'FILL'
    c.resize(420, c.height)
  }

  // Navbar — brand mark, primary destinations, account cluster.
  function buildNavbar(c: ComponentNode, out: PendingProp[]) {
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    c.counterAxisAlignItems = 'CENTER'
    c.primaryAxisAlignItems = 'SPACE_BETWEEN'
    pad(c, 12, 24, 12, 24)
    c.fills = [fillP(p.surface0)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    c.strokeAlign = 'INSIDE'

    const brand = row('brand', 8)
    const mark = figma.createFrame()
    mark.name = 'logo'
    mark.resize(24, 24)
    mark.cornerRadius = 6
    mark.fills = [fillP(p.action)]
    brand.appendChild(mark)
    mark.layoutSizingHorizontal = 'FIXED'
    mark.layoutSizingVertical = 'FIXED'
    const name = txt('Acme', { style: 'Semi Bold', size: 15, weightVar: wSemibold, colorP: p.textPrimary })
    brand.appendChild(name)
    c.appendChild(brand)
    out.push({ node: name, prop: 'Brand', def: 'Acme' })

    const nav = row('nav', 4)
    const links: [string, boolean][] = [['Home', true], ['Projects', false], ['Teams', false], ['Reports', false]]
    for (const [label, active] of links) {
      const link = row(`link-${label.toLowerCase()}`, 0)
      pad(link, 6, 12, 6, 12)
      bindRadius(link, radControl, radiusControl)
      if (active) link.fills = [fillP(p.surface1Hover)]
      link.appendChild(txt(label, {
        style: active ? 'Medium' : 'Regular', size: 13, sizeVar: sizeSm,
        weightVar: active ? wMedium : wRegular,
        colorP: active ? p.textPrimary : p.textTertiary,
      }))
      nav.appendChild(link)
    }
    c.appendChild(nav)

    const cluster = row('actions', 10)
    cluster.appendChild(txt('🔍', { size: 14, colorP: p.iconTertiary }))
    const avatar = figma.createFrame()
    avatar.name = 'avatar'
    avatar.layoutMode = 'HORIZONTAL'
    avatar.primaryAxisSizingMode = 'FIXED'
    avatar.counterAxisSizingMode = 'FIXED'
    avatar.primaryAxisAlignItems = 'CENTER'
    avatar.counterAxisAlignItems = 'CENTER'
    avatar.cornerRadius = 9999
    avatar.fills = [fillP(p.brandSubtle)]
    avatar.appendChild(txt('AC', { style: 'Medium', size: 10, weightVar: wMedium, colorP: p.textBrand }))
    cluster.appendChild(avatar)
    avatar.resize(28, 28)
    c.appendChild(cluster)
    c.resize(720, c.height)
  }

  // Sidebar — grouped vertical navigation with an active item.
  function buildSidebar(c: ComponentNode, _out: PendingProp[]) {
    c.layoutMode = 'VERTICAL'
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    gap(c, 2)
    pad(c, 16, 10, 16, 10)
    c.fills = [fillP(p.surface1)]
    c.strokes = [fillP(p.borderDefault)]
    c.strokeWeight = 1
    function groupLabel(label: string, topGap = false) {
      const g = row('group-label', 0)
      pad(g, topGap ? 16 : 4, 10, 6, 10)
      g.appendChild(txt(label, { style: 'Medium', size: 10, weightVar: wMedium, colorP: p.textPlaceholder }))
      c.appendChild(g)
    }
    function navItem(glyph: string, label: string, active = false) {
      const rowF = row(`item-${label.toLowerCase()}`, 10)
      rowF.primaryAxisSizingMode = 'FIXED'
      pad(rowF, 8, 10, 8, 10)
      bindRadius(rowF, radControl, radiusControl)
      if (active) rowF.fills = [fillP(p.brandSubtle)]
      rowF.appendChild(txt(glyph, { size: 13, colorP: active ? p.iconBrand : p.iconTertiary }))
      rowF.appendChild(txt(label, {
        style: active ? 'Medium' : 'Regular', size: 13, sizeVar: sizeSm,
        weightVar: active ? wMedium : wRegular,
        colorP: active ? p.textBrand : p.textSecondary,
      }))
      c.appendChild(rowF)
      rowF.layoutSizingHorizontal = 'FILL'
    }
    groupLabel('WORKSPACE')
    navItem('🏠', 'Dashboard', true)
    navItem('📁', 'Projects')
    navItem('👥', 'Team')
    groupLabel('SYSTEM', true)
    navItem('⚙', 'Settings')
    navItem('❓', 'Support')
    c.resize(220, c.height)
  }

  // ── Assemble the atom → spec table ─────────────────────────────────────────
  const SPECS: Record<string, AtomSpec> = {
    Button: {
      cols: BTN_COLORS ? Object.keys(BTN_COLORS).length * BTN_STYLES.length : 12,
      description: 'Universal action button. Size × Color × Style × State × Icon (None/Leading/Trailing) matrix; fills → component tokens → semantics.',
      variants: BTN_SIZE_KEYS.flatMap((size) =>
        STATES.flatMap((state) =>
          Object.keys(BTN_COLORS).flatMap((color) =>
            BTN_STYLES.flatMap((style) =>
              BTN_ICON_POS.map((iconPos) => ({
                props: { Size: size, Color: color, Style: style, State: state, Icon: iconPos },
                build: (c: ComponentNode, out: PendingProp[]) => buildButton(c, out, color, style, state, size, iconPos),
              })),
            ),
          ),
        ),
      ),
    },
    Input: {
      cols: INPUT_TYPES.length,
      description: 'Text input field — Type × State × Size with label, description and helper rows. Every context ships its exact inner layout; styling bound to input/* tokens.',
      variants: INPUT_SIZE_KEYS.flatMap((size) =>
        INPUT_STATES.flatMap((state) =>
          INPUT_TYPES.map((type) => ({
            props: { Size: size, State: state, Type: type },
            build: (c: ComponentNode, out: PendingProp[]) => buildInputField(c, out, size, type, state),
          })),
        ),
      ),
    },
    Select: {
      cols: 5,
      description: 'Select trigger — Size × State. Shares the input/* tokens.',
      variants: ['MD', 'SM', 'LG'].flatMap((size) =>
        ['Default', 'Hover', 'Focused', 'Error', 'Disabled'].map((state) => ({
          props: { Size: size, State: state },
          build: (c: ComponentNode, out: PendingProp[]) => buildSelectTrigger(c, out, state, size),
        })),
      ),
    },
    Checkbox: {
      cols: 4,
      description: 'Checkbox — Size × Checked × State. Box fill → checkbox/bg → action/primary.',
      variants: ['MD', 'SM'].flatMap((size) =>
        (['True', 'False'] as const).flatMap((checked) =>
          ['Default', 'Hover', 'Focused', 'Disabled'].map((state) => ({
            props: { Size: size, Checked: checked, State: state },
            build: (c: ComponentNode, out: PendingProp[]) => buildCheckbox(c, out, checked === 'True', state, size),
          })),
        ),
      ),
    },
    Toggle: {
      cols: 4,
      description: 'Toggle switch — Size × On × State. Track → toggle/track-on|off tokens.',
      variants: ['MD', 'SM'].flatMap((size) =>
        (['True', 'False'] as const).flatMap((on) =>
          ['Default', 'Hover', 'Focused', 'Disabled'].map((state) => ({
            props: { Size: size, On: on, State: state },
            build: (c: ComponentNode, out: PendingProp[]) => buildToggle(c, out, on === 'True', state, size),
          })),
        ),
      ),
    },
    Badge: {
      cols: 6,
      description: 'Badge — Size × Style (Solid/Soft/Outline) × Color (semantic status roles) × Icon (None/Leading/Trailing).',
      variants: ['MD', 'SM', 'LG'].flatMap((size) =>
        ['Solid', 'Soft', 'Outline'].flatMap((style) =>
          Object.keys(BADGE_COLORS).flatMap((color) =>
            BADGE_ICON_POS.map((iconPos) => ({
              props: { Size: size, Style: style, Color: color, Icon: iconPos },
              build: (c: ComponentNode, out: PendingProp[]) => buildBadge(c, out, style, color, size, iconPos),
            })),
          ),
        ),
      ),
    },
    Avatar: {
      cols: 5,
      description: 'Avatar with initials — XS to XL sizes. Fill → avatar/bg token.',
      variants: Object.keys(AVATAR_SIZES).map((size) => ({
        props: { Size: size },
        build: (c: ComponentNode, out: PendingProp[]) => buildAvatar(c, out, size),
      })),
    },
    Toast: {
      cols: 2,
      description: 'Toast notification — one variant per semantic status.',
      variants: Object.keys(TOAST_STATUS).map((status) => ({
        props: { Status: status },
        build: (c: ComponentNode, out: PendingProp[]) => buildToast(c, out, status),
      })),
    },
    Spinner: {
      cols: 3,
      description: 'Loading spinner — SM/MD/LG. Arc → spinner/color token.',
      variants: Object.keys(SPINNER_SIZES).map((size) => ({
        props: { Size: size },
        build: (c: ComponentNode, out: PendingProp[]) => buildSpinner(c, out, size),
      })),
    },
    Divider: {
      cols: 2,
      description: 'Rule — Horizontal / Vertical. Fill → divider/color token.',
      variants: ['Horizontal', 'Vertical'].map((o) => ({
        props: { Orientation: o },
        build: (c: ComponentNode, out: PendingProp[]) => buildDivider(c, out, o),
      })),
    },
    // Single-variant components
    Tooltip:    { cols: 1, description: 'Tooltip. Fill → tooltip/bg → surface/inverse.', variants: [{ props: {}, build: buildTooltip }] },
    Card:       { cols: 1, description: 'Content card. Fill → card/bg → surface/1.', variants: [{ props: {}, build: buildCard }] },
    Modal:      { cols: 1, description: 'Dialog with footer actions.', variants: [{ props: {}, build: buildModal }] },
    Tabs:       { cols: 1, description: 'Tab bar. Indicator → tabs/indicator → action/primary.', variants: [{ props: {}, build: buildTabs }] },
    Breadcrumb: { cols: 1, description: 'Breadcrumb trail.', variants: [{ props: {}, build: buildBreadcrumb }] },
    Progress:   { cols: 1, description: 'Progress bar, 60%. Bar → progress/bar → action/primary.', variants: [{ props: {}, build: buildProgress }] },
    // ── Extended catalog ──────────────────────────────────────────────────────
    ButtonClose: {
      cols: 5,
      description: 'Icon-only dismiss button — Size × State, ghost interaction states.',
      variants: ['MD', 'SM'].flatMap((size) =>
        ['Default', 'Hover', 'Pressed', 'Focused', 'Disabled'].map((state) => ({
          props: { Size: size, State: state },
          build: (c: ComponentNode, out: PendingProp[]) => buildCloseButton(c, out, state, size),
        })),
      ),
    },
    ButtonFab: {
      cols: 2,
      description: 'Floating action button — Size × State. Fill → button/bg token.',
      variants: Object.keys(FAB_SIZES).flatMap((size) =>
        ['Default', 'Hover'].map((state) => ({
          props: { Size: size, State: state },
          build: (c: ComponentNode, out: PendingProp[]) => buildFab(c, out, size, state),
        })),
      ),
    },
    ButtonGroup: {
      cols: 3,
      description: 'Attached button group / segmented actions — one variant per Size.',
      variants: ['MD', 'SM', 'LG'].map((size) => ({
        props: { Size: size },
        build: (c: ComponentNode, out: PendingProp[]) => buildButtonGroup(c, out, size),
      })),
    },
    ButtonSocial: {
      cols: 2,
      description: 'SSO sign-in button — Size × Provider × State.',
      variants: ['MD', 'LG'].flatMap((size) =>
        ['Google', 'Apple', 'GitHub'].flatMap((provider) =>
          ['Default', 'Hover'].map((state) => ({
            props: { Size: size, Provider: provider, State: state },
            build: (c: ComponentNode, out: PendingProp[]) => buildSocial(c, out, provider, state, size),
          })),
        ),
      ),
    },
    ButtonTextLink: {
      cols: 3,
      description: 'Inline text link. Color → text/brand semantic role.',
      variants: ['Default', 'Hover', 'Disabled'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildTextLink(c, out, state),
      })),
    },
    StoreBadge: {
      cols: 2,
      description: 'App store download badges (App Store / Google Play).',
      variants: ['App Store', 'Google Play'].map((store) => ({
        props: { Store: store },
        build: (c: ComponentNode, out: PendingProp[]) => buildStoreBadge(c, out, store),
      })),
    },
    CheckboxGroup: { cols: 1, description: 'Checkbox group with legend — shares checkbox/* tokens.', variants: [{ props: {}, build: buildCheckboxGroup }] },
    Radio: {
      cols: 4,
      description: 'Radio — Size × Checked × State. Ring → checkbox/bg → action/primary.',
      variants: ['MD', 'SM'].flatMap((size) =>
        (['True', 'False'] as const).flatMap((sel) =>
          ['Default', 'Hover', 'Focused', 'Disabled'].map((state) => ({
            props: { Size: size, Checked: sel, State: state },
            build: (c: ComponentNode, out: PendingProp[]) => buildRadio(c, out, sel === 'True', state, size),
          })),
        ),
      ),
    },
    RadioGroup: { cols: 1, description: 'Radio group with legend — shares checkbox/* tokens.', variants: [{ props: {}, build: buildRadioGroup }] },
    TextArea: {
      cols: 2,
      description: 'Multi-line input — shares the input/* tokens.',
      variants: ['Default', 'Focused', 'Error', 'Disabled'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildTextArea(c, out, state),
      })),
    },
    InputOtp: {
      cols: 3,
      description: 'One-time-code input — Size × State, 4 cells sharing the input/* tokens.',
      variants: ['MD', 'SM', 'LG'].flatMap((size) =>
        ['Default', 'Focused', 'Filled'].map((state) => ({
          props: { Size: size, State: state },
          build: (c: ComponentNode, out: PendingProp[]) => buildOtp(c, out, state, size),
        })),
      ),
    },
    InputStepper: {
      cols: 2,
      description: 'Number input with increment/decrement — shares input/* tokens.',
      variants: ['Default', 'Disabled'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildStepperInput(c, out, state),
      })),
    },
    InputTag: { cols: 1, description: 'Tag input with removable chips — shares input/* tokens.', variants: [{ props: {}, build: buildTagInput }] },
    FileUpload: {
      cols: 2,
      description: 'Dashed dropzone — border → input/border, accent on hover.',
      variants: ['Default', 'Hover'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildFileUpload(c, out, state),
      })),
    },
    Segmented: {
      cols: 2,
      description: 'Segmented control — one variant per Size; active segment on surface/0.',
      variants: ['MD', 'SM'].map((size) => ({
        props: { Size: size },
        build: (c: ComponentNode, out: PendingProp[]) => buildSegmented(c, out, size),
      })),
    },
    Slider: {
      cols: 3,
      description: 'Slider at 60% — track/fill → progress tokens, knob → toggle/knob.',
      variants: ['Default', 'Hover', 'Disabled'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildSlider(c, out, state),
      })),
    },
    SwitchGroup: { cols: 1, description: 'Switch group with legend — shares toggle/* tokens.', variants: [{ props: {}, build: buildSwitchGroup }] },
    Chip: {
      cols: 3,
      description: 'Filter chip — Size × Selected × State. Selected → badge/bg + badge/text tokens.',
      variants: ['MD', 'SM'].flatMap((size) =>
        (['True', 'False'] as const).flatMap((sel) =>
          ['Default', 'Hover', 'Disabled'].map((state) => ({
            props: { Size: size, Selected: sel, State: state },
            build: (c: ComponentNode, out: PendingProp[]) => buildChip(c, out, sel === 'True', state, size),
          })),
        ),
      ),
    },
    StatusBadge: {
      cols: 5,
      description: 'Status badge — dot + label per semantic status role.',
      variants: ['Neutral', 'Success', 'Warning', 'Error', 'Info'].map((status) => ({
        props: { Status: status },
        build: (c: ComponentNode, out: PendingProp[]) => buildStatusBadge(c, out, status),
      })),
    },
    StepIndicator: { cols: 1, description: 'Step indicator — done / current / upcoming steps.', variants: [{ props: {}, build: buildStepIndicator }] },
    AlertBanner: {
      cols: 2,
      description: 'Alert banner — Status × Style (Soft / Solid), tinted by the semantic status roles.',
      variants: Object.keys(ALERT_STATUS).flatMap((status) =>
        ['Soft', 'Solid'].map((style) => ({
          props: { Status: status, Style: style },
          build: (c: ComponentNode, out: PendingProp[]) => buildAlertBanner(c, out, status, style),
        })),
      ),
    },
    InlineAlert: {
      cols: 2,
      description: 'Inline alert — one variant per semantic status, soft tint + status border.',
      variants: Object.keys(ALERT_STATUS).map((status) => ({
        props: { Status: status },
        build: (c: ComponentNode, out: PendingProp[]) => buildInlineAlert(c, out, status),
      })),
    },
    // ── Catalogue parity (configurator componentCatalogue.ts) ────────────────
    Combobox: {
      cols: 2,
      description: 'Type-ahead select — an input that filters a dropdown list as the user types. Shares the input/* tokens.',
      variants: ['Default', 'Open'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildCombobox(c, out, state),
      })),
    },
    InputGroup: {
      cols: 1,
      description: 'Input with attached add-ons — prefix segment and action button sharing one border.',
      variants: [{ props: {}, build: buildInputGroup }],
    },
    Dropzone: {
      cols: 3,
      description: 'Drag-and-drop file target — Default / Dragging / Error states with dashed border.',
      variants: ['Default', 'Dragging', 'Error'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildDropzone(c, out, state),
      })),
    },
    Field: {
      cols: 2,
      description: 'The form-row composition — label, control slot and hint/error wired together.',
      variants: ['Default', 'Error'].map((state) => ({
        props: { State: state },
        build: (c: ComponentNode, out: PendingProp[]) => buildField(c, out, state),
      })),
    },
    Label: {
      cols: 2,
      description: 'Standalone form label — Required True/False with * marker or optional hint.',
      variants: (['False', 'True'] as const).map((req) => ({
        props: { Required: req },
        build: (c: ComponentNode, out: PendingProp[]) => buildLabel(c, out, req === 'True'),
      })),
    },
    PasswordStrength: {
      cols: 1,
      description: 'Segmented meter + caption scoring a password — Weak / Fair / Strong.',
      variants: ['Weak', 'Fair', 'Strong'].map((strength) => ({
        props: { Strength: strength },
        build: (c: ComponentNode, out: PendingProp[]) => buildPasswordStrength(c, out, strength),
      })),
    },
    Rating: {
      cols: 2,
      description: 'Star row for a 1–5 score — read-only and interactive (with count label).',
      variants: (['False', 'True'] as const).map((i) => ({
        props: { Interactive: i },
        build: (c: ComponentNode, out: PendingProp[]) => buildRating(c, out, i === 'True'),
      })),
    },
    FileFormat: {
      cols: 4,
      description: 'Document glyph with a colored format plate — PDF, PNG, SVG, ZIP.',
      variants: Object.keys(FILE_FORMATS).map((format) => ({
        props: { Format: format },
        build: (c: ComponentNode, out: PendingProp[]) => buildFileFormat(c, out, format),
      })),
    },
    Accordion:   { cols: 1, description: 'Stacked disclosure rows — first panel expanded, headers with chevrons.', variants: [{ props: {}, build: buildAccordion }] },
    AspectRatio: {
      cols: 3,
      description: 'Layout primitive locking content to a fixed ratio — 16:9, 4:3, 1:1.',
      variants: ['16:9', '4:3', '1:1'].map((ratio) => ({
        props: { Ratio: ratio },
        build: (c: ComponentNode, out: PendingProp[]) => buildAspectRatio(c, out, ratio),
      })),
    },
    Popover:     { cols: 1, description: 'Anchored floating panel — title, body and one action over surface/1.', variants: [{ props: {}, build: buildPopover }] },
    InfoTooltip: { cols: 1, description: 'The ⓘ affordance + tooltip bubble pairing for inline explanations.', variants: [{ props: {}, build: buildInfoTooltip }] },
    ScrollArea:  { cols: 1, description: 'Bounded panel with custom scrollbar track and thumb.', variants: [{ props: {}, build: buildScrollArea }] },
    Pagination:  { cols: 1, description: 'Page switcher — arrows, numbered pages, overflow ellipsis; current page → button tokens.', variants: [{ props: {}, build: buildPagination }] },
    TabMenu:     { cols: 1, description: 'Pill-style horizontal menu — the softer sibling of Tabs.', variants: [{ props: {}, build: buildTabMenu }] },
    DropdownMenu:{ cols: 1, description: 'Action menu — items, separator and destructive zone on surface/1.', variants: [{ props: {}, build: buildDropdownMenu }] },
    ContextMenu: { cols: 1, description: 'Right-click menu with keyboard shortcut hints.', variants: [{ props: {}, build: buildContextMenu }] },
    Command:     { cols: 1, description: 'Command palette — ⌘K search input over a grouped result list.', variants: [{ props: {}, build: buildCommand }] },
    Navbar:      { cols: 1, description: 'Top app bar — brand mark, primary destinations, account cluster.', variants: [{ props: {}, build: buildNavbar }] },
    Sidebar:     { cols: 1, description: 'Vertical navigation panel with grouped items and an active state.', variants: [{ props: {}, build: buildSidebar }] },
  }

  // ── Catalog: category divider pages + one page per component ───────────────
  // Mirrors the library structure: a "❖ Category" divider page, then one
  // "   ↳ Component" page per element. Entries are gated on the imported atoms
  // so the catalog only generates what the design system enables.
  // `legacyPage` — previous page name for this entry; its content is harvested
  // so renames move the existing set instead of duplicating it.
  // `gate` — the componentCatalogue key (configurator) that enables this entry.
  // `legacyGate` — coarse pre-catalogue key honored only for OLD payloads that
  // don't speak the fine-grained vocabulary (see fineGrained below), so
  // deselecting e.g. FABButton on the web actually removes the FAB here.
  interface CatalogEntry { page: string; set: string; gate: string; legacyGate?: string; spec: string; legacyPage?: string }
  const CATALOG: { category: string; entries: CatalogEntry[] }[] = [
    {
      category: 'Button & Actions',
      entries: [
        { page: 'Button [Default]',               set: 'Button',        gate: 'Button',            spec: 'Button' },
        { page: 'Button [Close – Dismiss]',       set: 'Button Close',  gate: 'CloseButton',       legacyGate: 'Button', spec: 'ButtonClose' },
        { page: 'Button [Floating Action – FAB]', set: 'Button FAB',    gate: 'FABButton',         legacyGate: 'Button', spec: 'ButtonFab' },
        { page: 'Button [Group]',                 set: 'Button Group',  gate: 'ButtonGroup',       legacyGate: 'Button', spec: 'ButtonGroup' },
        { page: 'Button [Social – SSO]',          set: 'Button Social', gate: 'SocialLoginButton', legacyGate: 'Button', spec: 'ButtonSocial' },
        { page: 'Button [Text Link]',             set: 'Text Link',     gate: 'TextLink',          legacyGate: 'Button', spec: 'ButtonTextLink' },
        { page: 'Button [App Store Badges]',      set: 'Store Badge',   gate: 'AppStoreBadge',     legacyGate: 'Button', spec: 'StoreBadge' },
      ],
    },
    {
      category: 'Form Controls',
      entries: [
        { page: 'Checkbox',                 set: 'Checkbox',          gate: 'Checkbox',         spec: 'Checkbox' },
        { page: 'Checkbox Group',           set: 'Checkbox Group',    gate: 'CheckboxGroup',    legacyGate: 'Checkbox', spec: 'CheckboxGroup' },
        { page: 'Combobox',                 set: 'Combobox',          gate: 'Combobox',         spec: 'Combobox' },
        { page: 'Dropzone',                 set: 'Dropzone',          gate: 'Dropzone',         spec: 'Dropzone' },
        { page: 'Field',                    set: 'Field',             gate: 'Field',            spec: 'Field' },
        { page: 'File Upload',              set: 'File Upload',       gate: 'FileUpload',       legacyGate: 'Input',    spec: 'FileUpload' },
        { page: 'Input [OTP]',              set: 'Input OTP',         gate: 'InputOTP',         legacyGate: 'Input',    spec: 'InputOtp' },
        { page: 'Input [Stepper – Number]', set: 'Input Stepper',     gate: 'InputStepper',     legacyGate: 'Input',    spec: 'InputStepper' },
        { page: 'Input [Tag]',              set: 'Input Tag',         gate: 'InputTag',         legacyGate: 'Input',    spec: 'InputTag' },
        { page: 'Input [Text Area]',        set: 'Input Text Area',   gate: 'Textarea',         legacyGate: 'Input',    spec: 'TextArea' },
        { page: 'Input [Text]',             set: 'Input',             gate: 'Input',            spec: 'Input' },
        { page: 'Input Group',              set: 'Input Group',       gate: 'InputGroup',       spec: 'InputGroup' },
        { page: 'Label',                    set: 'Label',             gate: 'Label',            spec: 'Label' },
        { page: 'Password Strength',        set: 'Password Strength', gate: 'PasswordStrength', spec: 'PasswordStrength' },
        { page: 'Radio Group',              set: 'Radio',             gate: 'Radio',            legacyGate: 'Checkbox', spec: 'Radio' },
        { page: 'Radio Group',              set: 'Radio Group',       gate: 'RadioGroup',       legacyGate: 'Checkbox', spec: 'RadioGroup' },
        { page: 'Segmented Control',        set: 'Segmented Control', gate: 'SegmentedControl', legacyGate: 'Tabs',     spec: 'Segmented' },
        { page: 'Select Field',             set: 'Select',            gate: 'Select',           spec: 'Select' },
        { page: 'Slider',                   set: 'Slider',            gate: 'Slider',           legacyGate: 'Input',    spec: 'Slider' },
        { page: 'Switch',                   set: 'Toggle',            gate: 'Toggle',           spec: 'Toggle' },
        { page: 'Switch Group',             set: 'Switch Group',      gate: 'SwitchGroup',      legacyGate: 'Toggle',   spec: 'SwitchGroup' },
      ],
    },
    {
      category: 'Indicators',
      entries: [
        { page: 'Badge (Tag)',         set: 'Badge',          gate: 'Badge',       spec: 'Badge' },
        { page: 'Chips',               set: 'Chip',           gate: 'Chip',        legacyGate: 'Badge',    spec: 'Chip' },
        { page: 'File Format',         set: 'File Format',    gate: 'FileFormat',  spec: 'FileFormat' },
        { page: 'Progress Indicators', set: 'Progress',       gate: 'Progress',    spec: 'Progress' },
        { page: 'Rating',              set: 'Rating',         gate: 'Rating',      spec: 'Rating' },
        { page: 'Spinner – Loaders',   set: 'Spinner',        gate: 'Spinner',     spec: 'Spinner' },
        { page: 'Status Badge',        set: 'Status Badge',   gate: 'StatusBadge', legacyGate: 'Badge',    spec: 'StatusBadge' },
        { page: 'Step Indicator',      set: 'Step Indicator', gate: 'Stepper',     legacyGate: 'Progress', spec: 'StepIndicator' },
      ],
    },
    {
      category: 'Content & Surfaces',
      entries: [
        { page: 'Accordion',    set: 'Accordion',    gate: 'Accordion',   spec: 'Accordion' },
        { page: 'Aspect Ratio', set: 'Aspect Ratio', gate: 'AspectRatio', spec: 'AspectRatio' },
        { page: 'Avatar',       set: 'Avatar',       gate: 'Avatar',      spec: 'Avatar' },
        { page: 'Card',         set: 'Card',         gate: 'Card',        spec: 'Card' },
        { page: 'Divider',      set: 'Divider',      gate: 'Divider',     spec: 'Divider' },
        { page: 'Modal',        set: 'Modal',        gate: 'Modal',       spec: 'Modal' },
        { page: 'Popover',      set: 'Popover',      gate: 'Popover',     spec: 'Popover' },
        { page: 'Scroll Area',  set: 'Scroll Area',  gate: 'ScrollArea',  spec: 'ScrollArea' },
        { page: 'Tooltip',      set: 'Tooltip',      gate: 'Tooltip',     spec: 'Tooltip' },
        { page: 'Tooltip [Info]', set: 'Info Tooltip', gate: 'InfoTooltip', spec: 'InfoTooltip' },
      ],
    },
    {
      category: 'Feedback',
      entries: [
        { page: 'Alert Banner',     set: 'Alert Banner', gate: 'AlertBanner', legacyGate: 'Toast', spec: 'AlertBanner' },
        { page: 'Inline Alert',     set: 'Inline Alert', gate: 'InlineAlert', legacyGate: 'Toast', spec: 'InlineAlert' },
        { page: 'Toast – Snackbar', set: 'Toast',        gate: 'Toast',       spec: 'Toast', legacyPage: 'Toast' },
      ],
    },
    {
      category: 'Navigation',
      entries: [
        { page: 'Breadcrumb',    set: 'Breadcrumb',    gate: 'Breadcrumb',   spec: 'Breadcrumb' },
        { page: 'Command',       set: 'Command',       gate: 'Command',      spec: 'Command' },
        { page: 'Context Menu',  set: 'Context Menu',  gate: 'ContextMenu',  spec: 'ContextMenu' },
        { page: 'Dropdown Menu', set: 'Dropdown Menu', gate: 'DropdownMenu', spec: 'DropdownMenu' },
        { page: 'Navbar',        set: 'Navbar',        gate: 'Navbar',       spec: 'Navbar' },
        { page: 'Pagination',    set: 'Pagination',    gate: 'Pagination',   spec: 'Pagination' },
        { page: 'Sidebar',       set: 'Sidebar',       gate: 'Sidebar',      spec: 'Sidebar' },
        { page: 'Tab Menu',      set: 'Tab Menu',      gate: 'TabMenu',      spec: 'TabMenu' },
        { page: 'Tabs',          set: 'Tabs',          gate: 'Tabs',         spec: 'Tabs' },
      ],
    },
  ]

  // ── The sample sheet — what this plugin actually builds ────────────────────
  // Escala is a TOKEN generator. The components exist to SHOW what the tokens
  // look like, not to be a component library — so the CATALOG above is no
  // longer generated. It expanded to 58 sets / ~1403 variants across 63 pages
  // (Button alone: 4 size × 6 state × 3 color × 4 style × 3 icon = 864, built
  // in ONE synchronous buildEntry call), which locked Figma up on every
  // import — and Live Sync used to re-run that entire build on every token
  // change (see fetchAndSync in ui.html, now scoped to variables + styles).
  //
  // This sheet mirrors the configurator's own Color preview panel: 9 elements,
  // one page, ~80 variants. It REUSES the CATALOG's specs and builders and
  // only FILTERS the variant matrix, so there is no second rendering path that
  // could drift — a fix to buildButton still lands here.
  //
  // The CATALOG and the 49 specs it references are kept in this file, unwired,
  // the same way the web repo keeps WorkbenchLayout/PickerColor for reference.
  // Don't wire them back up without re-measuring the freeze.
  interface SampleEntry {
    set: string
    /** Key into SPECS — the real matrix this is a subset of. */
    spec: string
    /** Shown in the showcase header; mirrors CatalogEntry.page. */
    page: string
    /** Which variants survive. Omitted = keep the whole (already small) matrix. */
    keep?: (props: Record<string, string>) => boolean
    /** Grid columns on the sample page; falls back to the spec's own. */
    cols?: number
  }
  const SAMPLE_PAGE = '⬡ Components Overview'
  // Axis values referenced below, for the record: Button size MD|SM|LG|XL,
  // state Default|Hover|Pressed|Focused|Loading|Disabled, colour Brand|Danger|
  // Success, style Solid|Outline|Soft|Ghost, icon None|Leading|Trailing.
  // Input's Type axis has NO 'Text' value — its plain variant is 'Default'.
  const SAMPLE: SampleEntry[] = [
    {
      set: 'Button', spec: 'Button', page: 'Button', cols: 4,
      // 3 colours × 4 styles × 3 states = 36. Size and Icon collapse to one
      // value and get stripped from the variant panel by sampleSpec().
      keep: (p) => p.Size === 'MD' && p.Icon === 'None' &&
        (p.State === 'Default' || p.State === 'Hover' || p.State === 'Disabled'),
    },
    {
      set: 'Input', spec: 'Input', page: 'Input', cols: 4,
      keep: (p) => p.Size === 'MD' && p.Type === 'Default' &&
        (p.State === 'Default' || p.State === 'Focused' || p.State === 'Error' || p.State === 'Disabled'),
    },
    {
      set: 'Select', spec: 'Select', page: 'Select', cols: 2,
      keep: (p) => p.Size === 'MD' && (p.State === 'Default' || p.State === 'Focused'),
    },
    {
      set: 'Checkbox', spec: 'Checkbox', page: 'Checkbox', cols: 4,
      keep: (p) => p.Size === 'MD' && (p.State === 'Default' || p.State === 'Disabled'),
    },
    {
      set: 'Toggle', spec: 'Toggle', page: 'Switch', cols: 4,
      keep: (p) => p.Size === 'MD' && (p.State === 'Default' || p.State === 'Disabled'),
    },
    {
      // Every semantic status × all three styles — this is the one that makes
      // a colour change legible, so its matrix stays wide (18).
      set: 'Badge', spec: 'Badge', page: 'Badge', cols: 6,
      keep: (p) => p.Size === 'MD' && p.Icon === 'None',
    },
    { set: 'Status Badge', spec: 'StatusBadge', page: 'Status Badge', cols: 5 },
    { set: 'Toast', spec: 'Toast', page: 'Toast', cols: 2 },
    { set: 'Avatar', spec: 'Avatar', page: 'Avatar', cols: 5 },
  ]

  /**
   * The subset of a spec that ships on the sample page.
   *
   * Axes that collapse to a single value after filtering (Size=MD, Icon=None…)
   * are STRIPPED from every kept variant, so Figma's variant panel doesn't show
   * a dropdown with one option. Every kept variant must end up with the exact
   * same property keys or `combineAsVariants` throws.
   */
  function sampleSpec(e: SampleEntry): AtomSpec | undefined {
    const base = SPECS[e.spec]
    if (!base) return undefined
    const kept = e.keep ? base.variants.filter((v) => e.keep!(v.props)) : base.variants
    if (kept.length === 0) return undefined

    const seen = new Map<string, Set<string>>()
    for (const v of kept) {
      for (const [k, val] of Object.entries(v.props)) {
        let bucket = seen.get(k)
        if (!bucket) { bucket = new Set(); seen.set(k, bucket) }
        bucket.add(val)
      }
    }
    const drop = new Set([...seen].filter(([, vals]) => vals.size <= 1).map(([k]) => k))
    const variants = drop.size === 0 ? kept : kept.map((v) => ({
      ...v,
      props: Object.fromEntries(Object.entries(v.props).filter(([k]) => !drop.has(k))),
    }))
    return { cols: e.cols ?? base.cols, variants, description: base.description }
  }

  // Fine-grained payload detection: gates the legacyGate widen-by-family
  // fallback (below) to genuinely OLD tokens.json files — the ones from before
  // the configurator's componentCatalogue spoke per-variant keys at all, where
  // a coarse name ('Button', 'Input'…) was the ONLY vocabulary and meant
  // "everything in this family."
  //
  // This USED to be inferred from the selection's own content — fine-grained
  // if any atom matched a variant key (CloseButton, Textarea…). That broke any
  // selection made of ONLY base keys (Button, Badge, Input, Card, Toast — e.g.
  // a curated "essential" set with no variants ticked): base keys never appear
  // in FINE_KEYS, so a selection like ['Button','Badge','Input'] was
  // misdetected as an old coarse payload and every Button/Input-family variant
  // got imported anyway, ignoring what was actually selected.
  //
  // `schemaVersion` is a better signal because it answers the right question —
  // WHEN was this written — instead of guessing from what happens to be
  // selected. It's been on every payload since early in the contract's history
  // (see checkSchema above), long before this file's current 58-key catalogue,
  // so any payload carrying it already speaks today's vocabulary and its
  // selection should be honored exactly. Only a truly old, schema-less
  // tokens.json falls back to the family-wide legacy behavior.
  // NOTE: the per-entry `gateOpen` check that used to live here is gone with
  // the catalogue loop — the sample sheet is a fixed specimen of the token
  // system, not a selection of the user's components, so it doesn't read
  // `tokens.atoms`. The payload still carries that field (contract unchanged)
  // and `atomSet` above still gates which component pages are generated.

  // ── Pages ─────────────────────────────────────────────────────────────────
  // Sets are harvested from the previous generation's pages and MOVED onto the
  // sample sheet, so instances placed from them keep working across imports.
  const ITEM_PREFIX = '   ↳ '

  const oldPage = figma.root.children.find((pg) => pg.name === '⬡ Components')
  const existingSets = new Map<string, ComponentSetNode>()
  const existingSingles = new Map<string, ComponentNode>()
  const harvested = new Set<string>()
  async function harvest(pg: PageNode) {
    if (harvested.has(pg.id)) return
    harvested.add(pg.id)
    await pg.loadAsync()
    for (const child of [...pg.children]) {
      // Clean generated captions/doc panels/stub grids left by previous runs
      if (child.type === 'FRAME' && (/ — Atoms$/.test(child.name) || child.name.startsWith('docs/') || /^\d{2} · /.test(child.name))) {
        // Sets now live INSIDE these boards, so rescue them before dropping the
        // board — removing a board with the set still in it would delete the
        // set and break every instance placed from it. Components nested in a
        // set are its own variants and must stay put.
        for (const inner of child.findAll(
          (n) => n.type === 'COMPONENT_SET' ||
            (n.type === 'COMPONENT' && n.parent?.type !== 'COMPONENT_SET'),
        )) {
          if (inner.type === 'COMPONENT_SET' && !existingSets.has(inner.name)) {
            pg.appendChild(inner)
            existingSets.set(inner.name, inner as ComponentSetNode)
          } else if (inner.type === 'COMPONENT' && !existingSingles.has(inner.name)) {
            pg.appendChild(inner)
            existingSingles.set(inner.name, inner as ComponentNode)
          }
        }
        child.remove()
      }
      else if (child.type === 'TEXT' && child.name.startsWith('label/')) child.remove()
      else if (child.type === 'COMPONENT_SET' && !existingSets.has(child.name)) existingSets.set(child.name, child as ComponentSetNode)
      else if (child.type === 'COMPONENT' && !existingSingles.has(child.name)) existingSingles.set(child.name, child as ComponentNode)
    }
  }
  if (oldPage) await harvest(oldPage)

  const pageByName = (name: string) =>
    figma.root.children.find((pg) => pg.name.trim() === name.trim())

  // Figma Starter files cap the page count. Far less likely to bite now that
  // this phase asks for ONE page instead of 63, but the guard stays: the
  // caller falls back to the old page (or the current one) so a capped file
  // still gets its sheet instead of an error.
  let pageLimitHit = false
  function makePage(name: string): PageNode | undefined {
    const found = pageByName(name)
    if (found) return found
    if (pageLimitHit) return undefined
    try {
      const pg = figma.createPage()
      pg.name = name
      return pg
    } catch {
      pageLimitHit = true
      return undefined
    }
  }

  const variantName = (props: Record<string, string>) =>
    Object.keys(props).sort().map((k) => `${k}=${props[k]}`).join(', ')
  const normName = (s: string) =>
    s.split(',').map((x) => x.trim()).filter(Boolean).sort().join(', ')

  const GAP_X = 24
  const GAP_Y = 24
  const MARGIN = 80
  const BOARD_GAP = 160
  let builtVariants = 0
  let builtAtoms = 0
  let boardX = 0
  let boardIndex = 0
  const cursorByPage = new Map<string, number>()
  let firstBuiltPage: PageNode | undefined

  // ── Per-element documentation ──────────────────────────────────────────────
  // Every element gets an editorial doc panel (breadcrumb, title, intro, SPECS
  // bullets derived from the real variant matrix, FEATURES chips, insert hint)
  // and its component set, both wrapped in a Documentation-style board (rounded
  // slab + tinted section bar) — see the placement code in buildEntry. Fixed
  // light chrome; the specimens inside it are what re-theme.
  const sampleTypo = await typoVarMap()
  const sampleChrome = docChromeVarsFrom(semLookup)
  const sampleModePin = docModePin(tokens, allCols)
  const { docSolid, docText, docFrame, wrapText, docDivider, docBullet, docBoard } = docChrome(fontFor, sampleTypo, tokens.typography.sizes, sampleChrome, sampleModePin)

  const DOC_INTRO: Record<string, string> = {
    Button: 'The core action component of the system. It covers primary, destructive and success intents across four visual styles and the full interaction lifecycle, so a generic button never has to be rebuilt.',
    Input: 'The core text entry component. It covers every common input context out of the box — plain text, e-mail, password, search, phone number and website — each variant shipping with the exact inner layout its context demands, across three sizes and the full input lifecycle with token-mapped styling at every step.',
    Select: 'Dropdown trigger that shares the input tokens, with full state coverage for forms and filters.',
    Checkbox: 'Binary selection control with checked and unchecked matrices across every interaction state.',
    Toggle: 'On/off switch with token-driven track and knob, covering hover, focus and disabled states.',
    Badge: 'Compact label for statuses and metadata — three visual styles across the semantic status roles.',
    Chip: 'Filter chip with selected and unselected states, built on the badge tokens.',
    Progress: 'Linear progress indicator; track and bar reference the progress tokens.',
    Spinner: 'Loading indicator in three sizes, tinted by the spinner color token.',
    AlertBanner: 'Prominent page-level alert for system feedback. Soft and solid styles across the semantic status roles, with title, message, action link and dismiss — all status colors resolve through the imported tokens.',
    InlineAlert: 'Compact contextual alert that sits inside forms and content flows. One variant per semantic status with a soft tint and matching border.',
    Toast: 'Transient snackbar notification with status dot, message and action — one variant per semantic status role.',
    // Catalogue parity — intros mirror the configurator's componentCatalogue descriptions.
    Combobox: 'Type-ahead select — an input that filters a dropdown list as the user types. Use when options exceed ~10 items or need search; for short lists, plain Select is enough.',
    InputGroup: 'An input with attached add-ons — prefix segments, selects or buttons sharing one border. Use for values with a fixed context (URLs, amounts, handles).',
    Dropzone: 'Drag-and-drop target area for files, with active-drag and error states. Pair with a click-to-browse fallback — drag alone is not discoverable on touch.',
    Field: 'The form-row composition — label, control slot, hint and error wired together. Wrap every form control in a Field so spacing, labels and errors stay consistent.',
    Label: 'Standalone form label with optional required marker and secondary hint. Always visible — placeholder text is not a label.',
    PasswordStrength: 'Segmented meter + caption that scores a password as the user types. Pair the meter with concrete guidance, not just a score.',
    Rating: 'Star row for displaying or collecting a 1–5 score. Read-only by default; make interactive only where the user actually rates.',
    FileFormat: 'Document glyph with a format plate (PDF, PNG, SVG, ZIP…) for file lists — formats scan at a glance inside upload rows and attachment lists.',
    Accordion: 'Vertically stacked disclosure rows — headers that expand one panel of content each. For secondary content like FAQs and advanced settings.',
    AspectRatio: 'Layout primitive that locks its content to a fixed ratio (16:9, 4:3, 1:1…). Wrap media so layouts never shift while content loads.',
    Popover: 'Anchored floating panel for rich contextual content — richer than a tooltip, lighter than a modal. Open on click, not hover.',
    InfoTooltip: 'The ⓘ affordance + tooltip pairing for inline explanations next to labels — one sentence of context where hint text would be too much.',
    ScrollArea: 'Custom-scrollbar container that keeps overflow styling consistent cross-platform. For panels and menus with bounded height.',
    Pagination: 'Page switcher with previous/next arrows, numbered pages and overflow ellipsis. The current page stays visually unmistakable via the button tokens.',
    TabMenu: 'Pill-style horizontal menu — the softer sibling of Tabs for page-level sections where an underline bar feels too heavy.',
    DropdownMenu: 'Action menu opened from a trigger — items, separators and a destructive zone. For 3+ secondary actions behind a "⋯" or button.',
    ContextMenu: 'Right-click menu with shortcut hints — the pointer-positioned sibling of Dropdown Menu. Every action here must also exist somewhere visible.',
    Command: 'Command palette — a searchable action list summoned with ⌘K. Index every significant action and destination.',
    Navbar: 'Top app bar — brand mark, primary destinations and the account cluster. Keep to 5±2 destinations with the current page visibly marked.',
    Sidebar: 'Vertical navigation panel with grouped items and an active state. For app-level sections when destinations exceed what a navbar holds.',
  }
  const docIntro = (entry: CatalogEntry) =>
    DOC_INTRO[entry.spec] ??
    `${entry.page} ships ready to use: every fill, stroke, radius and text style references the imported design tokens (component → semantic → primitive), so it re-themes automatically and stays consistent across the product.`

  function buildDocPanel(entry: CatalogEntry, spec: AtomSpec, category: string, propNames: string[], toggleNames: string[] = []): FrameNode {
    const panel = docFrame(`docs/${entry.set}-panel`, 'VERTICAL', 20)
    panel.fills = [docSolid(DOC.card, 1, sampleChrome.board)]
    panel.strokes = [docSolid(DOC.border, 1, sampleChrome.border)]
    panel.strokeWeight = 1
    panel.cornerRadius = 16
    panel.paddingTop = PANEL_PAD; panel.paddingBottom = PANEL_PAD
    panel.paddingLeft = PANEL_PAD; panel.paddingRight = PANEL_PAD
    panel.counterAxisSizingMode = 'FIXED'
    panel.resize(PANEL_W, 100)

    const crumb = docFrame('breadcrumb', 'HORIZONTAL', 8)
    crumb.primaryAxisSizingMode = 'FIXED'
    crumb.counterAxisSizingMode = 'FIXED'
    crumb.resize(PANEL_INNER, 18)
    crumb.primaryAxisAlignItems = 'SPACE_BETWEEN'
    crumb.counterAxisAlignItems = 'CENTER'
    crumb.appendChild(docText(`Components  /  ${category}  /  ${entry.page}`, 9, 'Regular', DOC.muted, 1, sampleChrome.secondary))
    crumb.appendChild(docText('v1.0 – LAUNCH', 8, 'Medium', DOC.muted, 0.9, sampleChrome.secondary))
    panel.appendChild(crumb)

    panel.appendChild(wrapText(docText(entry.page, 26, 'Semi Bold', DOC.text, 1, sampleChrome.text), PANEL_INNER))
    const intro = wrapText(docText(docIntro(entry), 12, 'Regular', DOC.muted, 1, sampleChrome.muted), PANEL_INNER)
    intro.lineHeight = { value: 150, unit: 'PERCENT' }
    panel.appendChild(intro)

    // SPECS — derived from the real variant matrix and text properties
    panel.appendChild(docDivider('SPECS'))
    const specs = docFrame('specs', 'VERTICAL', 14)
    const axes = new Map<string, string[]>()
    for (const vd of spec.variants) {
      for (const [k, v] of Object.entries(vd.props)) {
        const arr = axes.get(k) ?? []
        if (!arr.includes(v)) arr.push(v)
        axes.set(k, arr)
      }
    }
    if (spec.variants.length > 1) {
      const axisDesc = [...axes.entries()].map(([k, vals]) => `${k}: ${vals.join(', ')}`).join('  ·  ')
      docBullet(specs, `${spec.variants.length} variants`, axisDesc || spec.description)
    } else {
      docBullet(specs, 'Single component', spec.description)
    }
    const states = axes.get('State')
    if (states && states.length > 1) {
      docBullet(specs, `${states.length} interaction states`, `${states.join(', ')} — the full lifecycle with token-mapped styling at every step.`)
    }
    docBullet(specs, 'Token-driven throughout', 'Fills, strokes, radius, spacing and typography reference the imported variables — component → semantic → primitive — so the component re-themes system-wide.')
    if (propNames.length > 0) {
      docBullet(specs, 'Editable text properties', `${propNames.join(', ')} — exposed on the parent instance, swap content without detaching.`)
    }
    if (toggleNames.length > 0) {
      docBullet(specs, 'Visibility toggles', `${toggleNames.join(', ')} — show or hide parts of the component directly from the instance panel.`)
    }
    panel.appendChild(specs)

    // FEATURES chips
    panel.appendChild(docDivider('FEATURES'))
    const feats = ['Variable System', 'Auto Layout', 'Themable', 'Dark Mode Native', 'Font System', 'AI Friendly']
    const accent = p.action.hex
    for (let i = 0; i < feats.length; i += 3) {
      const rw = docFrame(`features-${i / 3 + 1}`, 'HORIZONTAL', 6)
      for (const f of feats.slice(i, i + 3)) {
        const chipF = docFrame(`feat-${f.toLowerCase().replace(/\s+/g, '-')}`, 'HORIZONTAL', 4)
        chipF.paddingLeft = 8; chipF.paddingRight = 8
        chipF.paddingTop = 4; chipF.paddingBottom = 4
        chipF.cornerRadius = 999
        chipF.strokes = [docSolid(accent, 0.45, sampleChrome.accentBorder)]
        chipF.strokeWeight = 1
        chipF.appendChild(docText(f, 9, 'Medium', accent, 1, sampleChrome.accentText))
        rw.appendChild(chipF)
      }
      panel.appendChild(rw)
    }

    // Insert hint card
    const hint = docFrame('insert-hint', 'VERTICAL', 6)
    hint.fills = [docSolid(DOC.faint, 1, sampleChrome.card)]
    hint.strokes = [docSolid(DOC.border, 1, sampleChrome.border)]
    hint.strokeWeight = 1
    hint.cornerRadius = 10
    hint.paddingTop = 14; hint.paddingBottom = 14
    hint.paddingLeft = 16; hint.paddingRight = 16
    hint.counterAxisSizingMode = 'FIXED'
    hint.resize(PANEL_INNER, 60)
    hint.appendChild(wrapText(docText('Insert components easily to your canvas', 12, 'Medium', DOC.text, 1, sampleChrome.text), PANEL_INNER - 32))
    hint.appendChild(wrapText(docText(`hold ⇧ Shift + I, search “${entry.set}” and press insert — or drag it from Assets to the canvas`, 10.5, 'Regular', DOC.muted, 1, sampleChrome.muted), PANEL_INNER - 32))
    panel.appendChild(hint)
    return panel
  }

  // ── Labeled variant matrix — reproduces the reference file's "❖ <Component>"
  // spec sheet: a permanent, always-visible grid (column headers, row labels,
  // bracket-grouped outer axis, dashed cell borders) instead of relying on
  // Figma's own variant-grouping overlay, which only shows on hover/selection.
  // Sits beside the doc panel, same board, same grammar the reference used.
  const MATRIX_INK = '#9747FF' // Figma's own "component" purple — this is
  // annotation chrome (like DOC.*), not a design token, so it stays fixed.
  interface AxisInfo { key: string; values: string[] }
  // Axes in FIRST-SEEN key order (matches each spec's own `props` literal
  // order) — the same order buildDocPanel's own SPECS bullet already reads,
  // so "which axis reads as columns" can't disagree between the panel copy
  // and the matrix itself.
  function computeDisplayAxes(variants: { props: Record<string, string> }[]): AxisInfo[] {
    const order: string[] = []
    const seen = new Map<string, string[]>()
    for (const v of variants) {
      for (const [k, val] of Object.entries(v.props)) {
        if (!seen.has(k)) { seen.set(k, []); order.push(k) }
        const arr = seen.get(k)!
        if (!arr.includes(val)) arr.push(val)
      }
    }
    return order.map((k) => ({ key: k, values: seen.get(k)! }))
  }

  function buildVariantMatrix(entry: CatalogEntry, spec: AtomSpec, nodes: ComponentNode[], set: ComponentSetNode): FrameNode {
    const axes = computeDisplayAxes(spec.variants)
    // Last axis reads as COLUMNS — in every SPECS definition, State (when
    // present) is the last key written in the variant's `props` literal, and
    // interaction state is the one axis that genuinely reads left-to-right as
    // a progression (Default → Hover → Disabled). Everything else stacks as
    // rows, outermost axis first (bracket-grouped) if there's more than one.
    const colAxis: AxisInfo | undefined = axes.length > 0 ? axes[axes.length - 1] : undefined
    const rowAxes = axes.slice(0, Math.max(0, axes.length - 1))
    const colValues = colAxis ? colAxis.values : ['']

    interface RowCombo { group?: string; sub: string; values: Record<string, string> }
    const rowCombos: RowCombo[] = []
    if (rowAxes.length === 0) {
      rowCombos.push({ sub: '', values: {} })
    } else if (rowAxes.length === 1) {
      for (const v of rowAxes[0].values) rowCombos.push({ sub: v, values: { [rowAxes[0].key]: v } })
    } else {
      const outer = rowAxes[0]
      const inner = rowAxes.slice(1)
      for (const ov of outer.values) {
        let combos: Record<string, string>[] = [{}]
        for (const ax of inner) {
          const next: Record<string, string>[] = []
          for (const c of combos) for (const val of ax.values) next.push({ ...c, [ax.key]: val })
          combos = next
        }
        for (const c of combos) {
          rowCombos.push({ group: ov, sub: inner.map((ax) => c[ax.key]).join(' · '), values: { [outer.key]: ov, ...c } })
        }
      }
    }

    function findVariant(rowValues: Record<string, string>, colVal: string): ComponentNode | undefined {
      const want = colAxis ? { ...rowValues, [colAxis.key]: colVal } : rowValues
      const idx = spec.variants.findIndex((vd) => Object.entries(want).every(([k, v]) => vd.props[k] === v))
      return idx >= 0 ? nodes[idx] : undefined
    }

    const cellW = Math.max(...nodes.map((n) => n.width)) + 50
    const cellH = Math.max(...nodes.map((n) => n.height)) + 40
    const hasGroups = rowAxes.length >= 2
    const GROUP_W = hasGroups ? 56 : 0
    const ROWLBL_W = rowAxes.length > 0 ? 76 : 0
    const HEADER_H = colAxis ? 32 : 0
    const gridX = GROUP_W + ROWLBL_W
    const gridW = gridX + colValues.length * cellW
    const gridH = HEADER_H + rowCombos.length * cellH

    const wrapper = figma.createFrame()
    wrapper.name = `❖ ${entry.page}`
    wrapper.layoutMode = 'NONE'
    wrapper.fills = []
    wrapper.resize(gridW, gridH)

    // The real ComponentSet stays parented here (Figma still needs a master
    // it can insert from Assets) but hidden — instances below are what's
    // actually shown, laid out on the SEMANTIC grid rather than whatever
    // physical wrap `spec.cols` used to build the set itself.
    wrapper.appendChild(set)
    set.x = 0; set.y = 0
    set.visible = false

    // Column headers
    if (colAxis) {
      colValues.forEach((cv, j) => {
        const cell = docFrame(`col-${cv}`, 'HORIZONTAL', 0)
        cell.primaryAxisAlignItems = 'CENTER'
        cell.counterAxisAlignItems = 'CENTER'
        cell.primaryAxisSizingMode = 'FIXED'
        cell.counterAxisSizingMode = 'FIXED'
        cell.resize(cellW, HEADER_H)
        cell.appendChild(docText(cv, 12, 'Medium', MATRIX_INK))
        wrapper.appendChild(cell)
        cell.x = gridX + j * cellW
        cell.y = 0
      })
    }

    // Rows: sub-label + cells (dashed border, instance centered)
    rowCombos.forEach((rc, i) => {
      const y = HEADER_H + i * cellH
      if (rc.sub) {
        const lbl = docFrame(`row-${rc.sub}`, 'HORIZONTAL', 0)
        lbl.primaryAxisAlignItems = 'CENTER'
        lbl.counterAxisAlignItems = 'CENTER'
        lbl.primaryAxisSizingMode = 'FIXED'
        lbl.counterAxisSizingMode = 'FIXED'
        lbl.resize(ROWLBL_W, cellH)
        lbl.appendChild(docText(rc.sub, 11, 'Medium', MATRIX_INK))
        wrapper.appendChild(lbl)
        lbl.x = GROUP_W
        lbl.y = y
      }
      colValues.forEach((cv, j) => {
        const cellFrame = figma.createFrame()
        cellFrame.name = `cell-${rc.sub || 'x'}-${cv || 'x'}`
        cellFrame.layoutMode = 'NONE'
        cellFrame.fills = []
        cellFrame.strokes = [docSolid(MATRIX_INK, 0.4)]
        cellFrame.strokeWeight = 1
        try { (cellFrame as unknown as { dashPattern: number[] }).dashPattern = [3, 3] } catch {}
        cellFrame.resize(cellW, cellH)
        wrapper.appendChild(cellFrame)
        cellFrame.x = gridX + j * cellW
        cellFrame.y = y

        const variant = findVariant(rc.values, cv)
        if (variant) {
          const inst = variant.createInstance()
          wrapper.appendChild(inst)
          inst.x = cellFrame.x + (cellW - inst.width) / 2
          inst.y = cellFrame.y + (cellH - inst.height) / 2
        }
      })
    })

    // Bracket-grouped outer axis label — a simple spine (not a true bracket
    // glyph; the label beside it already carries the meaning) spanning every
    // contiguous run of rows that share the same group value.
    if (hasGroups) {
      let runStart = 0
      for (let i = 1; i <= rowCombos.length; i++) {
        const boundary = i === rowCombos.length || rowCombos[i].group !== rowCombos[runStart].group
        if (!boundary) continue
        const runEnd = i - 1
        const yTop = HEADER_H + runStart * cellH
        const yBot = HEADER_H + (runEnd + 1) * cellH
        const spine = figma.createFrame()
        spine.name = 'group-spine'
        spine.layoutMode = 'NONE'
        spine.fills = [docSolid(MATRIX_INK, 0.6)]
        spine.resize(1.5, Math.max(1, yBot - yTop - 20))
        wrapper.appendChild(spine)
        spine.x = GROUP_W - 14
        spine.y = yTop + 10
        const label = docText(rowCombos[runStart].group ?? '', 11, 'Medium', MATRIX_INK)
        wrapper.appendChild(label)
        label.x = 0
        label.y = yTop + (yBot - yTop) / 2 - label.height / 2
        runStart = i
      }
    }

    return wrapper
  }

  // NOTE: the free-floating `docs/<set>-header` bar that used to sit above each
  // set is gone — the board's own section bar (docBoard) is the header now.
  // Two bars stacked was the visual collision reported on a real import.

  // Resolve pending props on the owner (set or single component): string defs
  // become TEXT properties bound to characters, boolean defs become BOOLEAN
  // properties bound to visibility. Stale non-variant props are pruned so
  // re-imports after a spec change don't accumulate orphans.
  function applyPendingProps(owner: ComponentSetNode | ComponentNode, pending: PendingProp[]) {
    for (const pp of pending) {
      try {
        const defs = owner.componentPropertyDefinitions
        let id = Object.keys(defs).find((k) => k === pp.prop || k.startsWith(`${pp.prop}#`))
        const refs = { ...(pp.node.componentPropertyReferences ?? {}) }
        if (typeof pp.def === 'boolean') {
          if (!id) id = owner.addComponentProperty(pp.prop, 'BOOLEAN', pp.def)
          refs.visible = id
        } else {
          if (!id) id = owner.addComponentProperty(pp.prop, 'TEXT', pp.def)
          refs.characters = id
        }
        pp.node.componentPropertyReferences = refs
      } catch {}
    }
    try {
      const wanted = new Set(pending.map((pp) => pp.prop))
      const defs = owner.componentPropertyDefinitions
      for (const key of Object.keys(defs)) {
        if (defs[key].type === 'VARIANT') continue
        if (!wanted.has(key.split('#')[0])) owner.deleteComponentProperty(key)
      }
    } catch {}
  }

  function buildEntry(entry: CatalogEntry, spec: AtomSpec, pg: PageNode, category: string) {
    const pending: PendingProp[] = []
    const isVariantSet = spec.variants.length > 1
    const cursorY = cursorByPage.get(pg.id) ?? 120
    let placedNode: SceneNode
    let variantNodes: ComponentNode[] | undefined

    if (isVariantSet) {
      const existingSet = existingSets.get(entry.set)
      const childByName = new Map<string, ComponentNode>()
      if (existingSet) {
        for (const ch of existingSet.children) {
          if (ch.type === 'COMPONENT') childByName.set(normName(ch.name), ch as ComponentNode)
        }
      }
      // Legacy single component (previous plugin generation) becomes the first variant.
      const legacySingle = !existingSet ? existingSingles.get(entry.set) : undefined

      const nodes: ComponentNode[] = []
      spec.variants.forEach((vd, i) => {
        const name = variantName(vd.props)
        let comp = childByName.get(normName(name))
        if (!comp && i === 0 && legacySingle) {
          comp = legacySingle
          comp.name = name
        }
        if (comp) {
          for (const ch of [...comp.children]) ch.remove()
          comp.effects = []
          comp.strokes = []
          comp.fills = []
        } else {
          comp = figma.createComponent()
          comp.name = name
          pg.appendChild(comp)
        }
        try {
          vd.build(comp, pending)
          builtVariants++
        } catch (e) {
          log(`⚠ ${entry.set} ${name}: ${e instanceof Error ? e.message : String(e)}`)
        }
        nodes.push(comp)
      })

      // Grid-position variants, then combine (or reuse + move the set).
      const cellW = Math.max(...nodes.map((n) => n.width)) + GAP_X
      const cellH = Math.max(...nodes.map((n) => n.height)) + GAP_Y
      let set = existingSet
      if (!set) {
        nodes.forEach((n, i) => {
          n.x = MARGIN + (i % spec.cols) * cellW
          n.y = cursorY + Math.floor(i / spec.cols) * cellH
        })
        set = figma.combineAsVariants(nodes, pg)
        set.name = entry.set
      } else {
        if (set.parent !== pg) pg.appendChild(set)
        for (const n of nodes) {
          if (n.parent !== set) set.appendChild(n)
        }
        // Retire variants that fell out of the matrix (e.g. after an axis change)
        // so the set doesn't mix conflicting variant properties.
        const expected = new Set(spec.variants.map((vd) => normName(variantName(vd.props))))
        for (const ch of [...set.children]) {
          if (ch.type === 'COMPONENT' && !expected.has(normName(ch.name))) ch.remove()
        }
        nodes.forEach((n, i) => {
          n.x = 20 + (i % spec.cols) * cellW
          n.y = 20 + Math.floor(i / spec.cols) * cellH
        })
      }
      try { set.description = spec.description } catch {}
      set.x = MARGIN
      set.y = cursorY

      // Set-level TEXT / BOOLEAN properties (variant children can't own them).
      applyPendingProps(set, pending)
      placedNode = set
      variantNodes = nodes
    } else {
      // Single-variant component
      let comp = existingSingles.get(entry.set)
      if (comp) {
        if (comp.parent !== pg) pg.appendChild(comp)
        for (const ch of [...comp.children]) ch.remove()
        comp.effects = []
        comp.strokes = []
        comp.fills = []
      } else {
        comp = figma.createComponent()
        comp.name = entry.set
        pg.appendChild(comp)
      }
      try {
        spec.variants[0].build(comp, pending)
        builtVariants++
      } catch (e) {
        log(`⚠ ${entry.set}: ${e instanceof Error ? e.message : String(e)}`)
      }
      try { comp.description = spec.description } catch {}
      applyPendingProps(comp, pending)
      comp.x = MARGIN
      comp.y = cursorY
      placedNode = comp
    }

    // ── Each element lives INSIDE its own board ──────────────────────────────
    // These used to be loose siblings on the page: an absolutely-positioned
    // black header bar, the set 28px below it, and one shared doc panel off to
    // the left. Two problems, both visible on a real import — nothing was
    // contained (everything floated on the canvas), and Figma draws a component
    // set's own name label ABOVE its bounds, so that label collided with the
    // header bar sitting right on top of it.
    //
    // The board is now HORIZONTAL, not vertical: a left column (section bar +
    // doc panel, stacked) beside the real content — matching the reference
    // file's own "01 · Button" layout (panel left, labeled spec grid right)
    // rather than the panel sitting on top of the set. docBoard() (used by
    // Documentation/Icons) still stacks vertically; this one needs its own
    // composition because the bar here is scoped to the panel's column width,
    // not the whole board.
    const propNames = [...new Set(pending.filter((pp) => typeof pp.def === 'string').map((pp) => pp.prop))]
    const toggleNames = [...new Set(pending.filter((pp) => typeof pp.def === 'boolean').map((pp) => pp.prop))]
    const panel = buildDocPanel(entry, spec, category, propNames, toggleNames)

    const barW = Math.ceil(panel.width)
    const bar = docFrame(`§ ${category}  /  ${entry.page}`, 'HORIZONTAL', 8)
    bar.fills = [docSolid(DOC.bar)]
    bar.cornerRadius = 12
    bar.primaryAxisSizingMode = 'FIXED'
    bar.counterAxisSizingMode = 'FIXED'
    bar.resize(barW, 56)
    bar.primaryAxisAlignItems = 'SPACE_BETWEEN'
    bar.counterAxisAlignItems = 'CENTER'
    bar.paddingLeft = 24; bar.paddingRight = 24
    bar.appendChild(docText(`${category}  /  ${entry.page}`, 12, 'Medium', DOC.barText, 1, sampleChrome.text))
    bar.appendChild(docText(`⬡ ${tokens.project || 'Design System'}`, 12, 'Semi Bold', DOC.barText, 1, sampleChrome.text))

    const leftCol = docFrame('leftCol', 'VERTICAL', 24)
    leftCol.appendChild(bar)
    leftCol.appendChild(panel)

    // Multi-variant entries get the labeled spec grid instead of the raw
    // (now hidden) component set; single-variant entries still show
    // themselves directly — there's nothing to compare/label.
    const rightContent: SceneNode = (isVariantSet && variantNodes)
      ? buildVariantMatrix(entry, spec, variantNodes, placedNode as ComponentSetNode)
      : placedNode

    const idx = String(++boardIndex).padStart(2, '0')
    const board = docFrame(`${idx} · ${entry.page}`, 'HORIZONTAL', 24)
    board.fills = [docSolid(DOC.board, 1, sampleChrome.board)]
    board.cornerRadius = 24
    board.paddingTop = 48; board.paddingBottom = 48
    board.paddingLeft = 48; board.paddingRight = 48
    board.counterAxisAlignItems = 'MIN'
    pinToLightMode(board, sampleModePin)
    pg.appendChild(board)
    board.appendChild(leftCol)
    // Re-parenting into the board is what stops it floating. Must happen
    // AFTER combineAsVariants (above), which needs a page-level parent to lay
    // the variants out on a grid first.
    board.appendChild(rightContent)
    board.x = boardX
    board.y = 0
    boardX += Math.ceil(board.width) + BOARD_GAP

    builtAtoms++
  }

  // Everything lands on ONE page. Resolve the specs up front so the progress
  // bar counts what will actually be built (a spec whose filter matched
  // nothing is skipped rather than reported).
  const planned = SAMPLE
    .map((e) => ({ entry: e, spec: sampleSpec(e) }))
    .filter((x): x is { entry: SampleEntry; spec: AtomSpec } => x.spec !== undefined)
  const plannedTotal = planned.length
  let plannedDone = 0

  // Migration: the sheet shipped briefly as '⬡ Sample'. Rename in place rather
  // than creating a second page beside it — makePage matches on name, so a
  // rename is what keeps the existing sets (and every instance placed from
  // them) attached to the sheet.
  const legacySamplePage = pageByName('⬡ Sample')
  if (legacySamplePage) legacySamplePage.name = SAMPLE_PAGE

  const samplePage = makePage(SAMPLE_PAGE) ?? (oldPage ?? figma.currentPage)
  await harvest(samplePage)
  // Migration: adopt sets built by the previous, per-component-page generation
  // so a re-import MOVES them here instead of leaving a duplicate behind on
  // '   ↳ Button' etc. Only the 9 pages we care about are loaded — not the
  // whole 60-page sweep the catalogue build used to do.
  for (const { entry } of planned) {
    const legacy = pageByName(ITEM_PREFIX + entry.page)
    if (legacy && legacy !== samplePage) await harvest(legacy)
  }
  figma.root.appendChild(samplePage)
  try { samplePage.backgrounds = [docSolid(DOC.page)] } catch {}
  // Pin the WHOLE page to the first theme's mode, not just each board — any
  // node dropped directly on the page (outside a docBoard) still needs the
  // bound chrome fills to resolve as light, and pinning higher up is strictly
  // safer than relying on every call site to nest inside a pinned board.
  pinToLightMode(samplePage, sampleModePin)
  firstBuiltPage = samplePage

  for (const { entry, spec } of planned) {
    progress('Components', plannedDone, plannedTotal, entry.page)
    // buildEntry stacks onto the page via cursorByPage and renders the doc
    // panel only for the first set, so passing one page gives a single
    // documented sheet with a showcase header per element.
    buildEntry({ page: entry.page, set: entry.set, gate: entry.set, spec: entry.spec }, spec, samplePage, 'Components Overview')
    plannedDone++
    // One set is the natural unit of work — small enough now that Figma never
    // locks up, but the yield stays so the UI can paint progress.
    await yieldToUI()
  }
  progress('Components', plannedTotal, plannedTotal)

  // The old shared page is retired once its sets have moved onto the sheet.
  // The per-component '❖'/'↳' pages from the previous generation are LEFT
  // ALONE on purpose: deleting a user's pages is destructive and irreversible,
  // and any set still on them was just moved here, so they're empty shells the
  // user can remove at their own pace.
  if (oldPage && oldPage !== samplePage && oldPage !== figma.currentPage && oldPage.children.length === 0) {
    oldPage.remove()
  }
  if (pageLimitHit) {
    log(`⚠ This file's page limit was reached — the sample sheet shares an existing page.`)
  }

  if (firstBuiltPage) {
    await figma.setCurrentPageAsync(firstBuiltPage)
    const placed = firstBuiltPage.children.filter((n) => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
    if (placed.length > 0) figma.viewport.scrollAndZoomIntoView(placed)
  }

  log(`✓ Components Overview — ${builtAtoms} elements (${builtVariants} variants), every fill, radius, spacing and text bound to your tokens`)

  return builtVariants
}


// ─── Documentation page ──────────────────────────────────────────────────────
// Generates a "⬡ Documentation" handoff page: every foundation (colors,
// typography, spacing, radius, borders, opacity, shadows, grid, sizes) laid out
// as specimens whose fills / sizes / fonts are BOUND to the imported variables,
// so the docs stay live — switch the page's variable mode to preview themes.

async function importDocumentation(tokens: DesignTokens): Promise<number> {
  // ── Variable lookup (same pattern as importComponents) ────────────────────
  const allVars = await figma.variables.getLocalVariablesAsync()
  const allCols = await figma.variables.getLocalVariableCollectionsAsync()
  const colNameById = new Map(allCols.map((c) => [c.id, c.name] as const))
  const varsByCollection = new Map<string, Map<string, Variable>>()
  for (const v of allVars) {
    const cname = colNameById.get(v.variableCollectionId)
    if (!cname) continue
    let m = varsByCollection.get(cname)
    if (!m) { m = new Map(); varsByCollection.set(cname, m) }
    if (!m.has(v.name)) m.set(v.name, v)
  }
  const findVar = (coll: string, name: string) => varsByCollection.get(coll)?.get(name)
  function bestVar(coll: string, ...names: string[]): Variable | undefined {
    for (const n of names) { const v = findVar(coll, n); if (v) return v }
    return undefined
  }

  function boundFill(v: Variable | undefined, hexFallback: string, opacity = 1): SolidPaint {
    let paint: SolidPaint = { type: 'SOLID', color: hexToRgb(hexFallback), opacity }
    if (v?.resolvedType === 'COLOR') paint = figma.variables.setBoundVariableForPaint(paint, 'color', v)
    return paint
  }

  // Bind a numeric field not yet in the VariableBindableNodeField typings.
  function bindField(node: SceneNode, field: string, v: Variable | undefined) {
    if (!v) return
    try {
      ;(node as unknown as { setBoundVariable(f: string, v: Variable): void }).setBoundVariable(field, v)
    } catch { /* field not bindable on this node/plan */ }
  }

  // ── Documentation chrome — editorial palette, bound to real tokens ────────
  // Charcoal page, light boards, light cards — the LOOK never changes, but the
  // fills painting it now bind to the system's own Content/Border/Surface
  // roles instead of hardcoded hex (see docChromeVarsFrom / docModePin above).
  // Readability across modes is guaranteed by pinning every board's resolved
  // mode to the first theme (docModePin below), not by leaving the fills unbound.
  const sem = tokens.colors.semantic
  const surfaceHex = '#FFFFFF'   // board fill on the charcoal page
  const cardHex    = '#FFFFFF'   // section cards
  const textHex    = '#111114'   // headings / body
  const mutedHex   = '#6E6E76'   // secondary text
  const borderHex  = '#E9E9EC'   // hairlines
  const inkHex     = '#0A0A0B'   // dark-theme panels / cover bar
  // The brand tone the architecture actually resolves to (falling back to the
  // flat role) — the doc chrome must not disagree with what the file paints.
  const accentHex  = archHexFor(tokens, 'background-brand-solid', (tokens.colors.themeOrder ?? ['light'])[0])
    || sem['background-brand-solid'] || sem['content-brand'] || sem['action-primary'] || sem['bg-accent-solid'] || sem.primary || '#3B82F6'

  const S = COLLECTIONS.semantics
  // Same translation layer the components use — the docs must bind to whatever
  // vocabulary "Color Semantics" is actually holding (see semLookupFor).
  const docSem = semLookupFor(tokens, allVars, allCols)
  const accentVar  = docSem.varFor('background-brand-solid', 'Action/primary/default', 'Action/primary.default', 'action/primary/default', 'action/primary.default', 'action/primary', 'bg/accent-solid', 'primary')
  const docChromeVars = docChromeVarsFrom(docSem)
  const docModeVars = docModePin(tokens, allCols)
  const surfaceVar = docChromeVars.board
  const cardVar    = docChromeVars.card
  const textVar    = docChromeVars.text
  const mutedVar   = docChromeVars.muted
  const borderVar  = docChromeVars.border
  const familyVar  = findVar(COLLECTIONS.typography, 'family')
  const typoBind = new Map<string, Variable>()
  {
    const typoColVars = varsByCollection.get(COLLECTIONS.typography)
    if (typoColVars) for (const [n, v] of typoColVars) typoBind.set(n, v)
  }

  // Theme columns for the color spec tables: the first theme documents as
  // "light"; the dark theme (or second theme) fills the black panel. Roles
  // missing in dark fall back to light, mirroring importVariables.
  const themesMap: Record<string, Record<string, string>> =
    tokens.colors.themes && Object.keys(tokens.colors.themes).length > 0
      ? tokens.colors.themes
      : { light: sem, ...(tokens.colors.semanticDark ? { dark: tokens.colors.semanticDark } : {}) }
  const themeOrdered = (tokens.colors.themeOrder ?? []).filter((t) => themesMap[t])
  const themeNames = [...themeOrdered, ...Object.keys(themesMap).filter((t) => !themeOrdered.includes(t))]
  const lightTheme = themesMap[themeNames[0]] ?? {}
  const darkThemeName = themesMap.dark ? 'dark' : themeNames[1]
  const darkTheme = darkThemeName && darkThemeName !== themeNames[0] ? themesMap[darkThemeName] : undefined

  // The architecture, normalized exactly as importVariables normalizes it, so
  // the colour boards document the tokens that are really in the file rather
  // than the flat catalogue they're projected from.
  const docArch = tokens.colors.architecture
  const docNorm = docArch ? normalizeArchitecture(docArch, themeNames) : null

  // hex → primitive variable / raw key (for the PRIMITIVES chips: "accent-7")
  const primByHex = new Map<string, Variable>()
  const primKeyByHex = new Map<string, string>()
  for (const [key, hex] of Object.entries(tokens.colors.primitive)) {
    if (!hex) continue
    const v = findVar(COLLECTIONS.primitives, primitiveVarName(key))
    if (v && !primByHex.has(normHex(hex))) primByHex.set(normHex(hex), v)
    if (!primKeyByHex.has(normHex(hex))) primKeyByHex.set(normHex(hex), key)
  }

  // ── Fonts ──────────────────────────────────────────────────────────────────
  const fontFamily = tokens.typography?.fontFamily || 'Inter'
  const loadedStyles = new Set<string>()
  for (const style of ['Regular', 'Medium', 'Semi Bold', 'Bold'] as const) {
    try { await figma.loadFontAsync({ family: fontFamily, style }); loadedStyles.add(style) } catch {
      try { await figma.loadFontAsync({ family: 'Inter', style }); loadedStyles.add(`Inter:${style}`) } catch {}
    }
  }
  function fontFor(style: 'Regular' | 'Medium' | 'Semi Bold' | 'Bold'): FontName {
    if (loadedStyles.has(style)) return { family: fontFamily, style }
    return { family: 'Inter', style }
  }

  function weightStyle(weightKey: string): 'Regular' | 'Medium' | 'Semi Bold' | 'Bold' {
    const val = tokens.typography.weights?.[weightKey]
      ?? (weightKey === 'bold' ? 700 : weightKey === 'semibold' ? 600 : weightKey === 'medium' ? 500 : 400)
    if (val >= 700) return 'Bold'
    if (val >= 600) return 'Semi Bold'
    if (val >= 500) return 'Medium'
    return 'Regular'
  }

  // ── Page (wiped + rebuilt each import — generated content only) ───────────
  let page = figma.root.children.find((p) => p.name === '⬡ Documentation') as PageNode | undefined
  if (!page) {
    page = figma.createPage()
    page.name = '⬡ Documentation'
  } else {
    await page.loadAsync()
    for (const child of [...page.children]) child.remove()
  }
  try { page.backgrounds = [{ type: 'SOLID', color: hexToRgb(DOC.page) }] } catch {}
  pinToLightMode(page, docModeVars)

  // ── Text helper ────────────────────────────────────────────────────────────
  interface TextOpts {
    size?: number
    style?: 'Regular' | 'Medium' | 'Semi Bold' | 'Bold'
    colorVar?: Variable | undefined
    colorHex?: string
    opacity?: number
    bindFamily?: boolean
  }
  function mkText(chars: string, opts: TextOpts = {}): TextNode {
    const t = figma.createText()
    t.fontName = fontFor(opts.style ?? 'Regular')
    t.characters = chars
    t.fontSize = opts.size ?? 12
    t.fills = [boundFill(opts.colorVar, opts.colorHex ?? textHex, opts.opacity ?? 1)]
    const sizePx = opts.size ?? 12
    const sizeKey = nearestTypeSizeKey(tokens.typography.sizes, sizePx)
    const heading = (opts.style === 'Semi Bold' || opts.style === 'Bold') && sizePx >= 20
    if (opts.bindFamily !== false) {
      bindAllTextFields(t, typoBind, {
        sizeKey,
        weightKey: weightKeyFromStyle(opts.style ?? 'Regular'),
        heading,
      })
    }
    return t
  }

  function autoFrame(name: string, dir: 'VERTICAL' | 'HORIZONTAL', gap: number): FrameNode {
    const f = figma.createFrame()
    f.name = name
    f.layoutMode = dir
    f.primaryAxisSizingMode = 'AUTO'
    f.counterAxisSizingMode = 'AUTO'
    f.itemSpacing = gap
    f.fills = []
    return f
  }

  // Page metrics — every card and section bar shares one fixed width
  const CARD_W = 1180
  const INNER_W = CARD_W - 80

  const solid = (hex: string, opacity = 1): SolidPaint => ({ type: 'SOLID', color: hexToRgb(hex), opacity })

  // Readable label color for text sitting on an arbitrary swatch
  function onColor(hex: string): string {
    const { r, g, b } = hexToRgb(hex)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.55 ? '#FFFFFF' : '#18181B'
  }

  // Section card: title + description + content, white spec-sheet card
  function section(title: string, subtitle: string): { card: FrameNode; body: FrameNode } {
    const card = autoFrame(title, 'VERTICAL', 24)
    card.fills = [boundFill(cardVar, cardHex)]
    card.strokes = [boundFill(borderVar, borderHex)]
    card.strokeWeight = 1
    card.cornerRadius = 16
    card.paddingTop = 36; card.paddingBottom = 44
    card.paddingLeft = 40; card.paddingRight = 40
    card.counterAxisSizingMode = 'FIXED'
    card.resize(CARD_W, 100)

    const head = autoFrame(`${title}__head`, 'VERTICAL', 8)
    head.appendChild(mkText(title, { size: 24, style: 'Semi Bold', colorVar: textVar, colorHex: textHex }))
    const sub = mkText(subtitle, { size: 12, colorVar: mutedVar, colorHex: mutedHex })
    // Typography's own subtitle carries the font family name(s) — "Family
    // 'X' · headings 'Y' — sizes, weights…" — which can run past one line for
    // a real family name. `sub.resize(INNER_W, sub.height)` used to read
    // `.height` from the node's PRE-wrap, single-line state (still `NONE`/
    // whatever textAutoResize mkText leaves it in) and lock the frame to
    // that height before switching to auto-height — so a family name long
    // enough to wrap got its second line masked under the frame's own
    // (too-short) bounds. `textAutoResize` is reset to 'NONE' first so the
    // width-then-height handoff always starts from a known state, and the
    // placeholder height is generous rather than trusting a pre-wrap read —
    // 'HEIGHT' below is what actually settles the real height once the width
    // is in place, so a too-tall placeholder just means one synchronous
    // shrink, never a clip.
    sub.textAutoResize = 'NONE'
    sub.resize(INNER_W, 200)
    sub.textAutoResize = 'HEIGHT'
    head.appendChild(sub)
    card.appendChild(head)

    const body = autoFrame(`${title}__body`, 'VERTICAL', 20)
    card.appendChild(body)
    return { card, body }
  }

  // Full-width tinted bar that opens a documentation chapter
  function sectionBar(label: string): FrameNode {
    const bar = autoFrame(`§ ${label}`, 'HORIZONTAL', 8)
    bar.fills = [solid('#E6E6F7')]
    bar.cornerRadius = 12
    bar.primaryAxisSizingMode = 'FIXED'
    bar.counterAxisSizingMode = 'FIXED'
    bar.resize(CARD_W, 56)
    bar.primaryAxisAlignItems = 'SPACE_BETWEEN'
    bar.counterAxisAlignItems = 'CENTER'
    bar.paddingLeft = 24; bar.paddingRight = 24
    bar.appendChild(mkText(label, { size: 12, style: 'Medium', colorVar: textVar, colorHex: '#26262E' }))
    bar.appendChild(mkText(`⬡ ${tokens.project || 'Design System'}`, { size: 12, style: 'Semi Bold', colorVar: textVar, colorHex: '#26262E' }))
    return bar
  }

  let sections = 0

  // ── Boards — one top-level frame per documentation segment ─────────────────
  // Every chapter (Overview, Primitive Colors, Brand Colors, State Colors,
  // Foundation Colors, Typography, Spacing, Radius, …) lives on its own board,
  // laid side by side across the canvas so each segment can be browsed, linked
  // and presented independently.
  const docPage = page
  const BOARD_W = CARD_W + 96          // card width + 48px board padding per side
  const BOARD_GAP = 160
  let boardX = 0
  const boards: FrameNode[] = []
  let root!: FrameNode
  // Async purely to hand the thread back between boards: each one is a big
  // synchronous build, and this is the only choke point every segment passes
  // through. Total is unknown up front (segments skip themselves when their
  // token group is empty), so the bar reports indeterminate and the label
  // carries the news.
  async function newBoard(label: string): Promise<FrameNode> {
    progress('Documentation', boards.length, 0, label)
    await yieldToUI()
    const idx = String(boards.length + 1).padStart(2, '0')
    const b = autoFrame(`${idx} · ${label}`, 'VERTICAL', 24)
    b.fills = [boundFill(surfaceVar, surfaceHex)]
    b.paddingTop = 48; b.paddingBottom = 96
    b.paddingLeft = 48; b.paddingRight = 48
    b.cornerRadius = 24
    // Pinned to the system's first theme — see docModePin — so the bound
    // Content/Border/Surface fills above always resolve as the intended
    // light editorial board, whatever mode the rest of the file is in.
    pinToLightMode(b, docModeVars)
    docPage.appendChild(b)
    b.x = boardX
    b.y = 0
    boardX += BOARD_W + BOARD_GAP
    boards.push(b)
    root = b
    return b
  }

  // ── Cover — editorial intro: brand bar + 3 columns (intro / primitives / vars)
  {
    await newBoard('Overview')
    const project = tokens.project || 'Design System'
    const themeCount = themeNames.length
    const famTones = new Map<string, number>()
    for (const key of Object.keys(tokens.colors.primitive)) {
      const dash = key.lastIndexOf('-')
      const fam = dash === -1 ? key : key.slice(0, dash)
      famTones.set(fam, (famTones.get(fam) ?? 0) + 1)
    }
    const steps = Math.max(0, ...famTones.values())

    const cover = autoFrame('cover', 'VERTICAL', 0)
    cover.fills = [boundFill(cardVar, cardHex)]
    cover.strokes = [boundFill(borderVar, borderHex)]
    cover.strokeWeight = 1
    cover.cornerRadius = 16
    cover.clipsContent = true
    cover.counterAxisSizingMode = 'FIXED'
    cover.resize(CARD_W, 100)
    root.appendChild(cover)

    // Top black brand bar
    const bar = autoFrame('cover__bar', 'HORIZONTAL', 8)
    bar.fills = [solid(inkHex)]
    bar.primaryAxisSizingMode = 'FIXED'
    bar.counterAxisSizingMode = 'FIXED'
    bar.resize(CARD_W, 56)
    bar.primaryAxisAlignItems = 'SPACE_BETWEEN'
    bar.counterAxisAlignItems = 'CENTER'
    bar.paddingLeft = 24; bar.paddingRight = 24
    const brand = autoFrame('cover__brand', 'HORIZONTAL', 8)
    brand.counterAxisAlignItems = 'CENTER'
    brand.appendChild(mkText(`⬡ ${project}`, { size: 13, style: 'Semi Bold', colorHex: '#FFFFFF' }))
    const vChip = autoFrame('cover__version', 'HORIZONTAL', 0)
    vChip.paddingLeft = 8; vChip.paddingRight = 8; vChip.paddingTop = 3; vChip.paddingBottom = 3
    vChip.cornerRadius = 999
    vChip.strokes = [solid('#3A3A40')]
    vChip.strokeWeight = 1
    vChip.appendChild(mkText('v1.0', { size: 9, style: 'Medium', colorHex: '#C9C9D2' }))
    brand.appendChild(vChip)
    bar.appendChild(brand)
    const barMid = mkText('DESIGN TOKENS · FOUNDATIONS', { size: 10, style: 'Medium', colorHex: '#9C9CA6' })
    barMid.letterSpacing = { value: 1.2, unit: 'PIXELS' }
    bar.appendChild(barMid)
    bar.appendChild(mkText('escalatokens.com', { size: 10, colorHex: '#9C9CA6' }))
    cover.appendChild(bar)

    // Three columns, equal fixed height so the tinted/ink panels run full-bleed
    const COVER_H = 400
    const cols = autoFrame('cover__cols', 'HORIZONTAL', 0)
    cover.appendChild(cols)
    function coverCol(name: string, w: number, fillHex?: string): FrameNode {
      const c = autoFrame(name, 'VERTICAL', 14)
      c.counterAxisSizingMode = 'FIXED'
      c.primaryAxisSizingMode = 'FIXED'
      c.resize(w, COVER_H)
      c.paddingTop = 36; c.paddingBottom = 36
      c.paddingLeft = 32; c.paddingRight = 32
      if (fillHex) c.fills = [solid(fillHex)]
      cols.appendChild(c)
      return c
    }
    function bullet(parent: FrameNode, w: number, title: string, desc: string, dark: boolean) {
      const b = autoFrame(title, 'VERTICAL', 3)
      b.appendChild(mkText(title, { size: 11, style: 'Medium', colorHex: dark ? '#F4F4F6' : textHex }))
      const d = mkText(desc, { size: 10, colorHex: dark ? '#9C9CA6' : mutedHex })
      d.resize(w - 64, d.height)
      d.textAutoResize = 'HEIGHT'
      b.appendChild(d)
      parent.appendChild(b)
    }

    // Column 1 — breadcrumb, title, intro paragraph
    const main = coverCol('cover__intro', 590)
    main.paddingLeft = 40
    main.appendChild(mkText('Foundations  /  Color System  /  Tokens', { size: 10, colorVar: mutedVar, colorHex: mutedHex }))
    main.appendChild(mkText('Color System', { size: 30, style: 'Semi Bold', colorVar: textVar, colorHex: textHex }))
    const para = mkText(
      `${project}'s color foundation is built on primitive ramps — raw, unopinionated values that feed every semantic token in the system. Primitives never appear in components directly; they exist solely as the source of truth that the semantic layer references.`,
      { size: 13, colorVar: mutedVar, colorHex: mutedHex },
    )
    para.resize(500, para.height)
    para.textAutoResize = 'HEIGHT'
    para.lineHeight = { value: 150, unit: 'PERCENT' }
    main.appendChild(para)

    // Column 2 — primitive palette facts
    const midCol = coverCol('cover__primitives', 295, '#FAFAFB')
    midCol.appendChild(mkText('Primitive Colors', { size: 18, style: 'Semi Bold', colorVar: textVar, colorHex: textHex }))
    const midSub = mkText('The raw ramps — every family, every step.', { size: 11, colorVar: mutedVar, colorHex: mutedHex })
    midSub.resize(231, midSub.height)
    midSub.textAutoResize = 'HEIGHT'
    midCol.appendChild(midSub)
    bullet(midCol, 295, `${famTones.size} color families`, 'Accent, neutral and state ramps imported from the configurator.', false)
    bullet(midCol, 295, `${steps}-step scale`, 'Every family runs a consistent tonal scale for precise control.', false)
    bullet(midCol, 295, 'Never used directly', 'Components consume semantic tokens only — primitives stay refactorable and theme-safe.', false)
    bullet(midCol, 295, 'Single source of truth', 'Change a primitive and every semantic alias updates system-wide.', false)

    // Column 3 — variables / live-sync panel (ink)
    const inkCol = coverCol('cover__variables', 295, inkHex)
    inkCol.appendChild(mkText(`${project} Variables`, { size: 18, style: 'Semi Bold', colorHex: '#FFFFFF' }))
    const inkSub = mkText('Everything below is bound to Figma variables — a live mirror of the token source.', { size: 11, colorHex: '#9C9CA6' })
    inkSub.resize(231, inkSub.height)
    inkSub.textAutoResize = 'HEIGHT'
    inkCol.appendChild(inkSub)
    bullet(inkCol, 295, `${allVars.length} variables`, 'Split into one collection per token category.', true)
    bullet(inkCol, 295, `${themeCount} theme mode${themeCount > 1 ? 's' : ''}`, "Switch the page's variable mode to preview each theme.", true)
    bullet(inkCol, 295, 'Live sync', 'Re-imports rebuild this page in place, bindings intact.', true)
    const btn = autoFrame('cover__btn', 'HORIZONTAL', 0)
    btn.fills = [solid('#FFFFFF')]
    btn.cornerRadius = 8
    btn.primaryAxisSizingMode = 'FIXED'
    btn.counterAxisSizingMode = 'FIXED'
    btn.resize(231, 40)
    btn.primaryAxisAlignItems = 'CENTER'
    btn.counterAxisAlignItems = 'CENTER'
    btn.appendChild(mkText('Open configurator ↗', { size: 11, style: 'Medium', colorVar: textVar, colorHex: textHex }))
    inkCol.appendChild(btn)
  }

  // ── 01 · Color primitives ──────────────────────────────────────────────────
  {
    await newBoard('Primitive Colors')
    root.appendChild(sectionBar('Primitive Colors'))
    const { card, body } = section('Primitives', 'The raw color ramps — unopinionated source values that every semantic token aliases. Never used directly in designs.')
    // Group tokens by family path (e.g. Accent, Neutral, State/Error)
    const families = new Map<string, { tone: string; hex: string; v: Variable | undefined }[]>()
    for (const [key, hex] of Object.entries(tokens.colors.primitive)) {
      if (!hex) continue
      const name = primitiveVarName(key)
      const slash = name.lastIndexOf('/')
      const fam = slash === -1 ? name : name.slice(0, slash)
      const tone = slash === -1 ? '' : name.slice(slash + 1)
      if (!families.has(fam)) families.set(fam, [])
      families.get(fam)!.push({ tone, hex, v: findVar(COLLECTIONS.primitives, name) })
    }
    for (const [fam, tones] of families) {
      const famRow = autoFrame(fam, 'VERTICAL', 8)
      famRow.appendChild(mkText(fam, { size: 12, style: 'Medium', colorVar: mutedVar, colorHex: mutedHex }))
      const ramp = autoFrame(`${fam}__ramp`, 'HORIZONTAL', 8)
      for (const { tone, hex, v } of tones) {
        const cell = autoFrame(`${fam}/${tone}`, 'VERTICAL', 6)
        cell.counterAxisAlignItems = 'CENTER'
        const sw = figma.createFrame()
        sw.name = 'swatch'
        sw.resize(56, 56)
        sw.cornerRadius = 8
        sw.fills = [boundFill(v, hex)]
        sw.strokes = [boundFill(borderVar, borderHex, 0.4)]
        sw.strokeWeight = 1
        cell.appendChild(sw)
        cell.appendChild(mkText(tone || '—', { size: 10, style: 'Medium', colorVar: textVar, opacity: 0.9 }))
        cell.appendChild(mkText(hex.toUpperCase(), { size: 9, colorVar: mutedVar, colorHex: mutedHex, opacity: 0.9 }))
        ramp.appendChild(cell)
      }
      famRow.appendChild(ramp)
      body.appendChild(famRow)
    }
    root.appendChild(card)
    sections++
  }

  // ── 02 · Semantic color categories — scale strip + light/dark spec tables ──
  // One card per role category (Primary, State Error/Success/…, Background,
  // Text, Icon, Border): a description, the token scale as a color strip, and a
  // table of TOKEN NAMES | PRIMITIVES | HEX for the light theme plus an ink
  // panel with the same columns for the dark theme.
  {
    interface DocEntry { key: string; label: string; v?: Variable; light: string; dark?: string }
    const claimed = new Set<string>()
    const allSemKeys = Array.from(new Set([
      ...Object.keys(lightTheme),
      ...(darkTheme ? Object.keys(darkTheme) : []),
    ]))

    function collect(match: (key: string) => boolean, strip?: RegExp): DocEntry[] {
      const out: DocEntry[] = []
      for (const key of allSemKeys) {
        if (claimed.has(key) || !match(key)) continue
        const light = lightTheme[key] || darkTheme?.[key]
        if (!light) continue
        claimed.add(key)
        out.push({
          key,
          label: (strip ? key.replace(strip, '') : key) || key,
          v: docSem.varFor(key),
          light,
          dark: darkTheme ? (darkTheme[key] || light) : undefined,
        })
      }
      return out
    }

    // weakest → strongest ordering where the vocabulary is recognizable
    const EMPHASIS: Record<string, number> = {
      static: 0, weakest: 1, subtle: 1, weak: 2, light: 3, placeholder: 3,
      medium: 4, base: 5, default: 5, primary: 5, solid: 5, body: 5,
      secondary: 6, heavy: 6, strong: 7, tertiary: 7, strongest: 8,
      inverse: 9, disabled: 10,
    }
    function rankOf(label: string): number {
      const last = label.split(/[-_/]/).pop() ?? ''
      if (last in EMPHASIS) return EMPHASIS[last]
      const n = parseInt(last, 10)
      return isNaN(n) ? 50 : 3 + n
    }
    const sorted = (list: DocEntry[]) =>
      list.map((e, i) => ({ e, i }))
        .sort((a, b) => (rankOf(a.e.label) - rankOf(b.e.label)) || (a.i - b.i))
        .map(({ e }) => e)

    const STRIP = /^(action|status|bg|fg|surface|text|border|icon)-/

    interface DocCard { title: string; desc: string; entries: DocEntry[] }
    const stateCard = (name: string, desc: string): DocCard => ({
      title: `State ${name.charAt(0).toUpperCase()}${name.slice(1)}`,
      desc,
      entries: sorted(collect((k) => new RegExp(`(^|-)${name}(-|$)`).test(k), /^status-/)),
    })

    // Claim order matters: brand first, then states, then the role groups, so
    // e.g. text-error documents under State Error rather than Text.
    const flatSections: { bar: string; cards: DocCard[] }[] = [
      {
        bar: 'Brand Colors',
        cards: [{
          title: 'Primary',
          desc: 'Primary colors establish the core brand identity of the interface, from weakest tints to strongest emphasis levels — used for primary actions, focus states and recognizable visual consistency across the product.',
          entries: sorted(collect((k) => /accent|brand|^action-|^primary$/.test(k), STRIP)),
        }],
      },
      {
        bar: 'State Colors',
        cards: [
          stateCard('error', 'Error state colors provide clear visual signaling for failures, invalid inputs and critical system feedback, ensuring immediate recognition and strong contrast across all themes.'),
          stateCard('success', 'Success state colors communicate positive outcomes, confirmations and completed actions, delivering reassuring feedback with clarity and consistency across the interface.'),
          stateCard('warning', 'Warning state colors highlight caution, pending risks and notices that need attention without signaling failure, staying legible across all themes.'),
          stateCard('info', 'Info state colors communicate neutral, helpful information — hints, tips and system notices — with a calm, recognizable accent across the interface.'),
        ],
      },
      {
        bar: 'Foundation Colors',
        cards: [
          {
            title: 'Background',
            desc: 'Background colors define the foundational surfaces of the interface, from the base canvas to a layered elevation hierarchy that adapts to light and dark themes.',
            entries: sorted(collect((k) => /^(bg|surface)(-|$)/.test(k), STRIP)),
          },
          {
            title: 'Text',
            desc: 'Text colors deliver clear hierarchy and readability across all themes, from primary copy down to placeholder and disabled emphasis levels.',
            entries: sorted(collect((k) => /^text(-|$)/.test(k), STRIP)),
          },
          {
            title: 'Icon',
            desc: 'Icon colors deliver clear hierarchy and recognizability across all themes, mirroring the text emphasis scale.',
            entries: sorted(collect((k) => /^(fg|icon)(-|$)/.test(k), STRIP)),
          },
          {
            title: 'Border',
            desc: 'Border colors define edges, dividers and outlines with consistent contrast across themes, from subtle separators to strong emphasis strokes.',
            entries: sorted(collect((k) => /^border(-|$)/.test(k), STRIP)),
          },
          {
            title: 'Other',
            desc: 'Remaining semantic roles that fall outside the standard categories.',
            entries: sorted(collect(() => true)),
          },
        ],
      },
    ]

    // ── Architecture-native boards ──────────────────────────────────────────
    // When the system is on an architecture, "Color Semantics" holds THAT
    // vocabulary — so the boards document its groups and keys, in its order,
    // instead of the flat roles it was projected from. Anything else would
    // hand the reader a spec sheet for tokens their file doesn't contain.
    function archSections(): { bar: string; cards: DocCard[] }[] | null {
      if (!docNorm || !docArch) return null
      const palettes = docArch.palettes as Record<string, Record<string, string>> | undefined
      const lookup = docArch.kind === 'tonal'
        ? (fam: string, tone: string) => palettes?.[fam]?.[tone]
        : (fam: string, tone: string) => primitiveRefHex(tokens, fam, tone)
      const modeKeys = docNorm.modes.map(([k]) => k)
      const lightKey = modeKeys[0]
      // Second column: the mode literally named 'dark' when the architecture
      // has one, else the next mode along — same rule the flat tables use.
      const darkKey = modeKeys.indexOf('dark') > 0 ? 'dark' : modeKeys[1]
      const hexAt = (tok: { byMode: Record<string, string> }, mode: string | undefined): string | undefined => {
        if (!mode) return undefined
        const rgba = archValueRgba(tok.byMode[mode] ?? '', lookup)
        return rgba ? `#${rgbaToHex(rgba)}` : undefined
      }
      const label = ARCH_LABEL[docArch.kind] ?? docArch.kind
      const cards: DocCard[] = []
      for (const group of docNorm.groups) {
        const entries: DocEntry[] = []
        for (const tok of group.tokens) {
          const light = hexAt(tok, lightKey)
          if (!light) continue
          entries.push({
            key: archFigmaName(group.label, tok.key),
            label: tok.key,
            v: findVar(S, archFigmaName(group.label, tok.key)),
            light,
            dark: hexAt(tok, darkKey),
          })
        }
        if (entries.length === 0) continue
        cards.push({
          title: group.label,
          desc: `The ${group.label} group of the ${label} contract — ${entries.length} token${entries.length > 1 ? 's' : ''}, one value per mode, resolved from the primitive ramps.`,
          entries,
        })
      }
      return cards.length > 0 ? [{ bar: `${label} Semantics`, cards }] : null
    }

    const docSections = archSections() ?? flatSections

    // Swatch + label pill; light chips sit on the card, dark chips on the ink panel
    function chip(hex: string, label: string, width: number, dark: boolean, bindVar?: Variable): FrameNode {
      const c = autoFrame(`chip-${label}`, 'HORIZONTAL', 8)
      c.primaryAxisSizingMode = 'FIXED'
      c.counterAxisSizingMode = 'FIXED'
      c.resize(width, 28)
      c.counterAxisAlignItems = 'CENTER'
      c.paddingLeft = 8; c.paddingRight = 8
      c.cornerRadius = 6
      c.fills = [solid(dark ? '#19191C' : '#FAFAFB')]
      c.strokes = [solid(dark ? '#2C2C30' : '#EDEDF0')]
      c.strokeWeight = 1
      const sw = figma.createFrame()
      sw.name = 'swatch'
      sw.resize(20, 14)
      sw.cornerRadius = 4
      sw.fills = [boundFill(bindVar, hex)]
      sw.strokes = [solid(dark ? '#FFFFFF' : '#000000', 0.08)]
      sw.strokeWeight = 1
      c.appendChild(sw)
      c.appendChild(mkText(label, { size: 10, style: 'Medium', colorHex: dark ? '#EAEAEE' : '#3A3A42' }))
      return c
    }

    function headCell(label: string, width: number, padLeft = 0): FrameNode {
      const c = autoFrame(`h-${label}`, 'HORIZONTAL', 0)
      c.primaryAxisSizingMode = 'FIXED'
      c.resize(width, 14)
      c.paddingLeft = padLeft
      const t = mkText(label, { size: 9, style: 'Medium', colorVar: mutedVar, colorHex: mutedHex })
      t.letterSpacing = { value: 0.8, unit: 'PIXELS' }
      c.appendChild(t)
      return c
    }

    // Column metrics: name | light primitive | light hex | ink panel (dark primitive + hex)
    const W = { name: 190, prim: 180, hex: 160, dark: 180, gap: 12, pad: 16 }

    function categoryCard(def: DocCard) {
      const { card, body } = section(def.title, def.desc)
      const n = def.entries.length

      // Scale strip — one segment per token, fills bound to the semantic variables.
      // All sizes on this table are set explicitly (never hug): resizing an
      // auto-layout frame before its children exist left the containers frozen
      // at the placeholder height, clipping every chip.
      const SEG_H = 48
      const perRow = Math.min(n, 6)
      const stripRows = Math.ceil(n / perRow)
      const segW = Math.floor(INNER_W / perRow)
      const strip = autoFrame(`${def.title}__scale`, 'HORIZONTAL', 0)
      strip.layoutWrap = 'WRAP'
      strip.counterAxisSpacing = 0
      strip.clipsContent = true
      strip.cornerRadius = 10
      for (const e of def.entries) {
        const seg = autoFrame(e.label, 'HORIZONTAL', 0)
        seg.primaryAxisSizingMode = 'FIXED'
        seg.counterAxisSizingMode = 'FIXED'
        seg.resize(segW, SEG_H)
        seg.primaryAxisAlignItems = 'CENTER'
        seg.counterAxisAlignItems = 'CENTER'
        seg.fills = [boundFill(e.v, e.light)]
        seg.appendChild(mkText(e.label, { size: 10, style: 'Medium', colorHex: onColor(e.light) }))
        strip.appendChild(seg)
      }
      strip.primaryAxisSizingMode = 'FIXED'
      strip.counterAxisSizingMode = 'FIXED'
      strip.resize(INNER_W, stripRows * SEG_H)
      body.appendChild(strip)

      // Table header row
      const hasDark = def.entries.some((e) => e.dark !== undefined)
      const head = autoFrame(`${def.title}__thead`, 'HORIZONTAL', W.gap)
      head.appendChild(headCell('TOKEN NAMES', W.name))
      head.appendChild(headCell('PRIMITIVES · LIGHT', W.prim))
      head.appendChild(headCell('HEX · LIGHT', W.hex))
      if (hasDark) {
        head.appendChild(headCell('PRIMITIVES · DARK', W.dark + W.pad, W.pad))
        head.appendChild(headCell('HEX · DARK', W.dark))
      }
      body.appendChild(head)

      // Table columns — fixed 28px rows so all columns stay aligned. Column
      // heights are computed from the row count and set explicitly; light
      // columns carry a top padding matching the ink panel's padding so rows
      // line up across the table.
      const ROW_H = 28, ROW_GAP = 8
      const rowsH = n * ROW_H + (n - 1) * ROW_GAP
      const cols = autoFrame(`${def.title}__cols`, 'HORIZONTAL', W.gap)
      const vcol = (name: string, w: number, padded: boolean) => {
        const c = autoFrame(name, 'VERTICAL', ROW_GAP)
        if (padded) c.paddingTop = W.pad
        c.primaryAxisSizingMode = 'FIXED'
        c.counterAxisSizingMode = 'FIXED'
        c.resize(w, rowsH + (padded ? W.pad : 0))
        return c
      }
      const names = vcol('names', W.name, hasDark)
      const prims = vcol('primitives-light', W.prim, hasDark)
      const hexes = vcol('hex-light', W.hex, hasDark)
      for (const e of def.entries) {
        const cell = autoFrame(e.key, 'HORIZONTAL', 8)
        cell.primaryAxisSizingMode = 'FIXED'
        cell.counterAxisSizingMode = 'FIXED'
        cell.resize(W.name, 28)
        cell.counterAxisAlignItems = 'CENTER'
        const dot = figma.createFrame()
        dot.name = 'dot'
        dot.resize(10, 10)
        dot.cornerRadius = 3
        dot.fills = [boundFill(e.v, e.light)]
        dot.strokes = [solid('#000000', 0.1)]
        dot.strokeWeight = 1
        cell.appendChild(dot)
        cell.appendChild(mkText(e.label, { size: 11, style: 'Medium', colorVar: textVar, colorHex: textHex }))
        names.appendChild(cell)

        const lightKey = primKeyByHex.get(normHex(e.light))
        prims.appendChild(chip(e.light, lightKey ?? '—', W.prim, false, primByHex.get(normHex(e.light))))
        hexes.appendChild(chip(e.light, `#${normHex(e.light).toUpperCase()}`, W.hex, false, primByHex.get(normHex(e.light))))
      }
      cols.appendChild(names)
      cols.appendChild(prims)
      cols.appendChild(hexes)

      if (hasDark) {
        const panel = autoFrame('dark-panel', 'HORIZONTAL', W.gap)
        panel.fills = [solid(inkHex)]
        panel.cornerRadius = 12
        panel.paddingTop = W.pad; panel.paddingBottom = W.pad
        panel.paddingLeft = W.pad; panel.paddingRight = W.pad
        const dPrims = vcol('primitives-dark', W.dark, false)
        const dHexes = vcol('hex-dark', W.dark, false)
        for (const e of def.entries) {
          const dark = e.dark ?? e.light
          const darkKey = primKeyByHex.get(normHex(dark))
          dPrims.appendChild(chip(dark, darkKey ?? '—', W.dark, true, primByHex.get(normHex(dark))))
          dHexes.appendChild(chip(dark, `#${normHex(dark).toUpperCase()}`, W.dark, true, primByHex.get(normHex(dark))))
        }
        panel.appendChild(dPrims)
        panel.appendChild(dHexes)
        panel.primaryAxisSizingMode = 'FIXED'
        panel.counterAxisSizingMode = 'FIXED'
        panel.resize(2 * W.dark + W.gap + 2 * W.pad, rowsH + 2 * W.pad)
        cols.appendChild(panel)
      }
      // Explicit row size — hug is unreliable after the children were resized
      const colsW = W.name + W.prim + W.hex + 3 * W.gap
        + (hasDark ? 2 * W.dark + W.gap + 2 * W.pad : -W.gap)
      const colsH = rowsH + (hasDark ? 2 * W.pad : 0)
      cols.primaryAxisSizingMode = 'FIXED'
      cols.counterAxisSizingMode = 'FIXED'
      cols.resize(colsW, colsH)
      body.appendChild(cols)
      root.appendChild(card)
      sections++
    }

    for (const s of docSections) {
      const cards = s.cards.filter((c) => c.entries.length > 0)
      if (cards.length === 0) continue
      await newBoard(s.bar)
      root.appendChild(sectionBar(s.bar))
      for (const c of cards) categoryCard(c)
    }
  }

  // ── 03 · Typography ────────────────────────────────────────────────────────
  {
    await newBoard('Typography')
    root.appendChild(sectionBar('Typography'))
    const { card, body } = section('Typography', `Family “${fontFamily}”${tokens.typography.headingFontFamily && tokens.typography.headingFontFamily !== fontFamily ? ` · headings “${tokens.typography.headingFontFamily}”` : ''} — sizes, weights, line-heights bound to Typography variables.`)
    const sizes = Object.entries(tokens.typography.sizes)
      .map(([k, v]) => [k, pxToFloat(v)] as const)
      .filter(([, px]) => px > 0)
      .sort((a, b) => b[1] - a[1])
    for (const [key, px] of sizes) {
      const row = autoFrame(key, 'HORIZONTAL', 24)
      row.counterAxisAlignItems = 'CENTER'
      const label = mkText(`${key} · ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
      row.appendChild(label)
      label.resize(150, label.height)
      ;(label as TextNode).textAutoResize = 'HEIGHT'
      const spec = mkText('Almost before we knew it, we had left the ground.', {
        style: px >= 28 ? 'Semi Bold' : 'Regular',
        colorVar: textVar,
      })
      spec.fontSize = px
      const sv = bestVar(COLLECTIONS.typography, `size/${key}`)
      if (sv) bindField(spec, 'fontSize', sv)
      const lh = tokens.typography.lineHeights?.[key]
      if (lh) spec.lineHeight = { value: pxToFloat(lh), unit: 'PIXELS' }
      const lhv = bestVar(COLLECTIONS.typography, `line-height/${key}`)
      if (lhv) bindField(spec, 'lineHeight', lhv)
      row.appendChild(spec)
      body.appendChild(row)
    }
    // Weights
    const wRow = autoFrame('weights', 'HORIZONTAL', 32)
    for (const [wKey, wVal] of Object.entries(tokens.typography.weights ?? {})) {
      const cell = autoFrame(wKey, 'VERTICAL', 4)
      const style = wVal >= 700 ? 'Bold' : wVal >= 600 ? 'Semi Bold' : wVal >= 500 ? 'Medium' : 'Regular'
      const s = mkText('Ag', { size: 28, style, colorVar: textVar })
      bindField(s, 'fontWeight', bestVar(COLLECTIONS.typography, `weight/${wKey}`))
      cell.appendChild(s)
      cell.appendChild(mkText(`${wKey} · ${wVal}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }))
      wRow.appendChild(cell)
    }
    body.appendChild(wRow)
    root.appendChild(card)
    sections++

    const typeRoles = tokens.typography.roles
    if (typeRoles && Object.keys(typeRoles).length > 0) {
      const { card: roleCard, body: roleBody } = section(
        'Type roles',
        'Semantic text roles — each line aliases a size, weight and family primitive (desktop). Bound to Typography role/* variables.',
      )
      for (const [key, modes] of Object.entries(typeRoles)) {
        const d = modes?.desktop
        if (!d) continue
        const px = pxToFloat(tokens.typography.sizes[d.size] ?? '')
        if (!px) continue
        // A row here spans display-2xl (72px) down to helper (12px) — the
        // widest size range in the whole doc. BASELINE alignment on a HUG row
        // with that much size variance left the row's reported height out of
        // sync with the specimen's actual rendered box, so every row visually
        // collapsed onto the next (the clipped/overlapping "Type roles" stack).
        // CENTER is what the "sizes" list right above already uses safely —
        // matching it here removes the one thing that differed between a
        // working row and a broken one, and a vertically centered label reads
        // fine next to a specimen of any size.
        const row = autoFrame(`role-${key}`, 'HORIZONTAL', 24)
        row.counterAxisAlignItems = 'CENTER'
        const label = mkText(`${key}  →  ${d.size} / ${d.weight}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
        row.appendChild(label)
        label.resize(220, label.height)
        label.textAutoResize = 'HEIGHT'
        label.layoutSizingHorizontal = 'FIXED'
        label.layoutSizingVertical = 'HUG'
        const spec = mkText('Almost before we knew it, we had left the ground.', {
          style: weightStyle(d.weight),
          colorVar: textVar,
          colorHex: textHex,
        })
        spec.fontSize = px
        // An explicit, deterministic line-height — the same "resize before
        // trusting the box" reasoning as label above — so a display-size
        // specimen never carries over a smaller row's auto line-height.
        spec.lineHeight = { value: 120, unit: 'PERCENT' }
        spec.textAutoResize = 'WIDTH_AND_HEIGHT'
        bindField(spec, 'fontSize', bestVar(COLLECTIONS.typography, `role/${key}/size`, `size/${d.size}`))
        bindField(spec, 'fontWeight', bestVar(COLLECTIONS.typography, `role/${key}/weight`, `weight/${d.weight}`))
        bindField(spec, 'fontFamily', bestVar(COLLECTIONS.typography, `role/${key}/family`, d.family === 'display' ? 'heading-family' : 'family'))
        row.appendChild(spec)
        spec.layoutSizingHorizontal = 'HUG'
        spec.layoutSizingVertical = 'HUG'
        roleBody.appendChild(row)
        row.layoutSizingHorizontal = 'HUG'
        row.layoutSizingVertical = 'HUG'
      }
      root.appendChild(roleCard)
      sections++
    }
  }

  // ── 04 · Spacing ───────────────────────────────────────────────────────────
  {
    const entries = Object.entries(tokens.spacing)
      .map(([k, v]) => [k, pxToFloat(v)] as const)
      .filter(([, px]) => px > 0)
      .sort((a, b) => a[1] - b[1])
    if (entries.length > 0) {
      await newBoard('Spacing')
      root.appendChild(sectionBar('Spacing'))
      const { card, body } = section('Spacing', 'Spacing scale — bar widths are bound to the Spacing variables.')
      for (const [key, px] of entries) {
        const row = autoFrame(key, 'HORIZONTAL', 16)
        row.counterAxisAlignItems = 'CENTER'
        const label = mkText(`${key} · ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
        row.appendChild(label)
        label.resize(90, label.height)
        const bar = figma.createFrame()
        bar.name = `bar-${key}`
        bar.resize(Math.max(px, 2), 14)
        bar.cornerRadius = 3
        bar.fills = [boundFill(accentVar, accentHex, 0.9)]
        bindField(bar, 'width', findVar(COLLECTIONS.spacing, figmaVarName(key)) ?? findVar(COLLECTIONS.spacing, key))
        row.appendChild(bar)
        body.appendChild(row)
      }
      const spacingRoles = tokens.spacingRoles
      if (spacingRoles) {
        for (const [role, step] of Object.entries(spacingRoles)) {
          const px = pxToFloat(tokens.spacing[step] ?? '')
          const row = autoFrame(`role-${role}`, 'HORIZONTAL', 16)
          row.counterAxisAlignItems = 'CENTER'
          const label = mkText(`${role}  →  ${step}${px ? ` · ${px}px` : ''}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
          row.appendChild(label)
          label.resize(200, label.height)
          const bar = figma.createFrame()
          bar.name = `role-bar-${role}`
          bar.resize(Math.max(px, 2), 14)
          bar.cornerRadius = 3
          bar.fills = [boundFill(accentVar, accentHex, 0.55)]
          bindField(bar, 'width', findVar(COLLECTIONS.spacing, figmaVarName(`role/${role}`)))
          row.appendChild(bar)
          body.appendChild(row)
        }
      }
      root.appendChild(card)
      sections++
    }
  }

  // ── 05 · Radius ────────────────────────────────────────────────────────────
  {
    const entries = Object.entries(tokens.radius ?? {})
    if (entries.length > 0) {
      await newBoard('Border Radius')
      root.appendChild(sectionBar('Border Radius'))
      const { card, body } = section('Border Radius', 'Corner radii — each specimen\'s corners are bound to the Radius variables.')
      const row = autoFrame('radii', 'HORIZONTAL', 24)
      for (const [key, val] of entries) {
        const px = pxToFloat(val)
        const cell = autoFrame(key, 'VERTICAL', 8)
        cell.counterAxisAlignItems = 'CENTER'
        const sq = figma.createFrame()
        sq.name = `radius-${key}`
        sq.resize(72, 72)
        sq.cornerRadius = Math.min(px, 36)
        sq.fills = [boundFill(cardVar, cardHex)]
        sq.strokes = [boundFill(accentVar, accentHex, 0.9)]
        sq.strokeWeight = 2
        const rv = findVar(COLLECTIONS.radius, key)
        if (rv?.resolvedType === 'FLOAT') {
          sq.setBoundVariable('topLeftRadius', rv)
          sq.setBoundVariable('topRightRadius', rv)
          sq.setBoundVariable('bottomLeftRadius', rv)
          sq.setBoundVariable('bottomRightRadius', rv)
        }
        cell.appendChild(sq)
        cell.appendChild(mkText(`${key} · ${px >= 9999 ? 'full' : `${px}px`}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }))
        row.appendChild(cell)
      }
      body.appendChild(row)
      const radiusRoles = tokens.radiusRoles
      if (radiusRoles) {
        const roleRow = autoFrame('radius-roles', 'HORIZONTAL', 24)
        for (const [role, step] of Object.entries(radiusRoles)) {
          const px = pxToFloat(tokens.radius[step] ?? '')
          const cell = autoFrame(`role-${role}`, 'VERTICAL', 8)
          cell.counterAxisAlignItems = 'CENTER'
          const sq = figma.createFrame()
          sq.name = `role-radius-${role}`
          sq.resize(56, 56)
          sq.cornerRadius = Math.min(px || 0, 28)
          sq.fills = [boundFill(cardVar, cardHex)]
          sq.strokes = [boundFill(accentVar, accentHex, 0.7)]
          sq.strokeWeight = 2
          const rv = findVar(COLLECTIONS.radius, figmaVarName(`role/${role}`)) ?? findVar(COLLECTIONS.radius, step)
          if (rv?.resolvedType === 'FLOAT') {
            sq.setBoundVariable('topLeftRadius', rv)
            sq.setBoundVariable('topRightRadius', rv)
            sq.setBoundVariable('bottomLeftRadius', rv)
            sq.setBoundVariable('bottomRightRadius', rv)
          }
          cell.appendChild(sq)
          cell.appendChild(mkText(`${role} → ${step}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }))
          roleRow.appendChild(cell)
        }
        body.appendChild(roleRow)
      }
      root.appendChild(card)
      sections++
    }
  }

  // ── 06 · Borders / Stroke ──────────────────────────────────────────────────
  {
    const strokeMap = (tokens.stroke && Object.keys(tokens.stroke).length > 0)
      ? tokens.stroke
      : tokens.borders?.width
    const entries = Object.entries(strokeMap ?? {})
    if (entries.length > 0) {
      await newBoard('Stroke')
      root.appendChild(sectionBar('Stroke'))
      const { card, body } = section('Stroke', 'Stroke widths — primitives and semantic roles, bound to the Border collection.')
      for (const [key, val] of entries) {
        const px = pxToFloat(val)
        const row = autoFrame(key, 'HORIZONTAL', 16)
        row.counterAxisAlignItems = 'CENTER'
        const label = mkText(`${key} · ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
        row.appendChild(label)
        label.resize(90, label.height)
        const line = figma.createFrame()
        line.name = `border-${key}`
        line.resize(220, Math.max(px * 2, 12))
        line.fills = []
        line.strokes = [boundFill(textVar, textHex, 0.85)]
        line.strokeWeight = px
        line.cornerRadius = 4
        bindField(line, 'strokeWeight', findVar(COLLECTIONS.border, key) ?? findVar(COLLECTIONS.border, `width/${key}`))
        row.appendChild(line)
        body.appendChild(row)
      }
      if (tokens.strokeRoles) {
        for (const [role, step] of Object.entries(tokens.strokeRoles)) {
          const px = pxToFloat((strokeMap ?? {})[step] ?? '')
          const row = autoFrame(`role-${role}`, 'HORIZONTAL', 16)
          row.counterAxisAlignItems = 'CENTER'
          const label = mkText(`${role}  →  ${step}${px ? ` · ${px}px` : ''}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
          row.appendChild(label)
          label.resize(200, label.height)
          const line = figma.createFrame()
          line.name = `role-border-${role}`
          line.resize(220, Math.max(px * 2, 12))
          line.fills = []
          line.strokes = [boundFill(accentVar, accentHex, 0.85)]
          line.strokeWeight = px || 1
          line.cornerRadius = 4
          bindField(line, 'strokeWeight', findVar(COLLECTIONS.border, figmaVarName(`role/${role}`)))
          row.appendChild(line)
          body.appendChild(row)
        }
      }
      root.appendChild(card)
      sections++
    }
  }

  // ── 07 · Opacity ───────────────────────────────────────────────────────────
  {
    const entries = Object.entries(tokens.opacity ?? {})
      .map(([k, v]) => [k, parseFloat(v) || 0] as const)
      .sort((a, b) => a[1] - b[1])
    if (entries.length > 0) {
      await newBoard('Opacity')
      root.appendChild(sectionBar('Opacity'))
      const { card, body } = section('Opacity', 'Opacity steps — layer opacity bound to the Opacity variables.')
      const row = autoFrame('opacity', 'HORIZONTAL', 20)
      for (const [key, pct] of entries) {
        const cell = autoFrame(key, 'VERTICAL', 8)
        cell.counterAxisAlignItems = 'CENTER'
        const sw = figma.createFrame()
        sw.name = `opacity-${key}`
        sw.resize(56, 56)
        sw.cornerRadius = 8
        sw.fills = [boundFill(accentVar, accentHex)]
        sw.opacity = pct / 100
        bindField(sw, 'opacity', findVar(COLLECTIONS.opacity, key))
        cell.appendChild(sw)
        cell.appendChild(mkText(`${key} · ${pct}%`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }))
        row.appendChild(cell)
      }
      body.appendChild(row)
      root.appendChild(card)
      sections++
    }
  }

  // ── 08 · Shadows ───────────────────────────────────────────────────────────
  {
    const entries = Object.entries(tokens.shadows ?? {})
    if (entries.length > 0) {
      await newBoard('Shadows')
      root.appendChild(sectionBar('Shadows'))
      const { card, body } = section('Shadows', 'Elevation levels — matching Effect Styles are created under Styles.')
      const row = autoFrame('shadows', 'HORIZONTAL', 28)
      for (const [key, css] of entries) {
        const effects = parseBoxShadow(css)
        if (effects.length === 0) continue
        const cell = autoFrame(key, 'VERTICAL', 10)
        cell.counterAxisAlignItems = 'CENTER'
        const sw = figma.createFrame()
        sw.name = `shadow-${key}`
        sw.resize(96, 64)
        sw.cornerRadius = 10
        sw.fills = [boundFill(cardVar, cardHex)]
        sw.effects = effects
        cell.appendChild(sw)
        cell.appendChild(mkText(key, { size: 10, colorVar: mutedVar, colorHex: mutedHex }))
        row.appendChild(cell)
      }
      body.appendChild(row)
      root.appendChild(card)
      sections++
    }
  }

  // ── 09 · Grid & Sizes ──────────────────────────────────────────────────────
  {
    const grid = tokens.grid ?? {}
    const sizes = Object.entries(tokens.sizes ?? {})
      .map(([k, v]) => [k, pxToFloat(v)] as const)
      .filter(([, px]) => px > 0)
      .sort((a, b) => a[1] - b[1])
    if (Object.keys(grid).length > 0 || sizes.length > 0) {
      await newBoard('Grid & Sizes')
      root.appendChild(sectionBar('Grid & Sizes'))
      const { card, body } = section('Grid & Sizes', 'Layout grid settings and component height scale.')
      if (Object.keys(grid).length > 0) {
        const spec = Object.entries(grid).map(([k, v]) => `${k} ${v}`).join('   ·   ')
        body.appendChild(mkText(spec, { size: 12, colorVar: textVar, opacity: 0.9 }))
      }
      for (const [key, px] of sizes) {
        const row = autoFrame(key, 'HORIZONTAL', 16)
        row.counterAxisAlignItems = 'CENTER'
        const label = mkText(`${key} · ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
        row.appendChild(label)
        label.resize(90, label.height)
        const bar = figma.createFrame()
        bar.name = `size-${key}`
        bar.resize(180, px)
        bar.cornerRadius = 6
        bar.fills = [boundFill(cardVar, cardHex)]
        bar.strokes = [boundFill(borderVar, borderHex, 0.7)]
        bar.strokeWeight = 1
        bindField(bar, 'height', findVar(COLLECTIONS.size, key))
        row.appendChild(bar)
        body.appendChild(row)
      }
      if (tokens.sizeRoles) {
        for (const [role, step] of Object.entries(tokens.sizeRoles)) {
          const px = pxToFloat(tokens.sizes?.[step] ?? '')
          const row = autoFrame(`role-${role}`, 'HORIZONTAL', 16)
          row.counterAxisAlignItems = 'CENTER'
          const label = mkText(`${role}  →  ${step}${px ? ` · ${px}px` : ''}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex })
          row.appendChild(label)
          label.resize(200, label.height)
          const bar = figma.createFrame()
          bar.name = `role-size-${role}`
          bar.resize(180, Math.max(px, 8))
          bar.cornerRadius = 6
          bar.fills = [boundFill(accentVar, accentHex, 0.35)]
          bindField(bar, 'height', findVar(COLLECTIONS.size, figmaVarName(`role/${role}`)))
          row.appendChild(bar)
          body.appendChild(row)
        }
      }
      root.appendChild(card)
      sections++
    }
  }

  // ── 10 · Gradients ─────────────────────────────────────────────────────────
  {
    const entries = Object.entries(tokens.gradients ?? {})
    if (entries.length > 0) {
      await newBoard('Gradients')
      root.appendChild(sectionBar('Gradients'))
      const { card, body } = section('Gradients', 'Named gradients from the configurator. Tags mark the surface each one is assigned to — the "cover" gradient paints the ⬡ Cover page.')
      const assigned = tokens.gradientAssignments ?? {}
      const row = autoFrame('gradients', 'HORIZONTAL', 24)
      row.layoutWrap = 'WRAP'
      row.counterAxisSpacing = 24
      row.primaryAxisSizingMode = 'FIXED'
      row.counterAxisSizingMode = 'AUTO'
      row.resize(INNER_W, 100)
      for (const [slug, css] of entries) {
        const paint = parseCssGradient(css)
        if (!paint) continue
        const cell = autoFrame(slug, 'VERTICAL', 8)
        const sw = figma.createFrame()
        sw.name = `gradient-${slug}`
        sw.resize(248, 140)
        sw.cornerRadius = 12
        sw.strokes = [boundFill(borderVar, borderHex)]
        sw.strokeWeight = 1
        sw.fills = [paint]
        cell.appendChild(sw)
        const tags = (['cover', 'avatar'] as const).filter((s) => assigned[s] === slug)
        cell.appendChild(mkText(slug + (tags.length ? `  ·  ${tags.join(' + ')}` : ''), { size: 11, style: 'Medium', colorVar: textVar, colorHex: textHex }))
        row.appendChild(cell)
      }
      body.appendChild(row)
      root.appendChild(card)
      sections++
    }
  }

  await figma.setCurrentPageAsync(docPage)
  figma.viewport.scrollAndZoomIntoView(boards)
  log(`✓ Documentation rebuilt: ${boards.length} boards / ${sections} sections, all bound to variables, on "⬡ Documentation"`)
  return boards.length
}

// ─── Icons — custom SVGs + the selected library's core set ──────────────────
// Custom uploads come embedded in the payload. The chosen icon FAMILY (Lucide,
// Heroicons, Phosphor, Radix, Material) is fetched from the Iconify API — the
// same service that powers the configurator's icon browser — as a curated set
// of core UI glyphs, generated as components tinted with the text/primary
// semantic variable so they re-theme with the modes.

// Iconify collection prefixes for the configurator's library keys (newer
// payloads carry `icons.prefix` directly; this map covers older ones).
const ICONIFY_PREFIXES: Record<string, string> = {
  lucide: 'lucide',
  heroicons: 'heroicons',
  phosphor: 'ph',
  radix: 'radix-icons',
  material: 'material-symbols',
}

// Core UI glyphs — canonical name + per-collection overrides where a set names
// the concept differently. Names Iconify can't resolve are skipped silently
// (reported in `not_found`), so partial coverage degrades gracefully.
// NOTE: Lucide renamed several classics (home→house, edit→pencil,
// alert-triangle→triangle-alert…) — hence the lucide aliases.
const ICON_CORE: { name: string; alias?: Record<string, string> }[] = [
  // Navigation
  { name: 'home',            alias: { lucide: 'house', ph: 'house' } },
  { name: 'menu',            alias: { heroicons: 'bars-3', ph: 'list', 'radix-icons': 'hamburger-menu' } },
  { name: 'more-horizontal', alias: { lucide: 'ellipsis', heroicons: 'ellipsis-horizontal', ph: 'dots-three', 'radix-icons': 'dots-horizontal', 'material-symbols': 'more-horiz' } },
  { name: 'more-vertical',   alias: { lucide: 'ellipsis-vertical', heroicons: 'ellipsis-vertical', ph: 'dots-three-vertical', 'radix-icons': 'dots-vertical', 'material-symbols': 'more-vert' } },
  { name: 'chevron-left',    alias: { ph: 'caret-left' } },
  { name: 'chevron-right',   alias: { ph: 'caret-right' } },
  { name: 'chevron-up',      alias: { ph: 'caret-up', 'material-symbols': 'expand-less' } },
  { name: 'chevron-down',    alias: { ph: 'caret-down', 'material-symbols': 'expand-more' } },
  { name: 'arrow-left',      alias: { 'material-symbols': 'arrow-back' } },
  { name: 'arrow-right',     alias: { 'material-symbols': 'arrow-forward' } },
  { name: 'arrow-up',        alias: { 'material-symbols': 'arrow-upward' } },
  { name: 'arrow-down',      alias: { 'material-symbols': 'arrow-downward' } },
  { name: 'arrow-up-right',  alias: { 'radix-icons': 'arrow-top-right', 'material-symbols': 'north-east' } },
  { name: 'external-link',   alias: { heroicons: 'arrow-top-right-on-square', ph: 'arrow-square-out', 'material-symbols': 'open-in-new' } },
  { name: 'log-in',          alias: { ph: 'sign-in', 'radix-icons': 'enter', 'material-symbols': 'login' } },
  { name: 'log-out',         alias: { ph: 'sign-out', 'radix-icons': 'exit', 'material-symbols': 'logout' } },
  // Actions
  { name: 'search',          alias: { heroicons: 'magnifying-glass', ph: 'magnifying-glass', 'radix-icons': 'magnifying-glass' } },
  { name: 'settings',        alias: { heroicons: 'cog-6-tooth', ph: 'gear', 'radix-icons': 'gear' } },
  { name: 'plus',            alias: { 'material-symbols': 'add' } },
  { name: 'minus',           alias: { 'material-symbols': 'remove' } },
  { name: 'x',               alias: { heroicons: 'x-mark', 'radix-icons': 'cross-2', 'material-symbols': 'close' } },
  { name: 'check' },
  { name: 'check-circle',    alias: { lucide: 'circle-check', 'radix-icons': 'check-circled' } },
  { name: 'x-circle',        alias: { lucide: 'circle-x', 'radix-icons': 'cross-circled', 'material-symbols': 'cancel' } },
  { name: 'plus-circle',     alias: { lucide: 'circle-plus', 'radix-icons': 'plus-circled', 'material-symbols': 'add-circle' } },
  { name: 'edit',            alias: { lucide: 'pencil', heroicons: 'pencil', ph: 'pencil-simple', 'radix-icons': 'pencil-1' } },
  { name: 'trash',           alias: { 'material-symbols': 'delete' } },
  { name: 'copy',            alias: { heroicons: 'document-duplicate', 'material-symbols': 'content-copy' } },
  { name: 'save',            alias: { ph: 'floppy-disk' } },
  { name: 'download',        alias: { heroicons: 'arrow-down-tray', ph: 'download-simple' } },
  { name: 'upload',          alias: { heroicons: 'arrow-up-tray', ph: 'upload-simple' } },
  { name: 'share-2',         alias: { heroicons: 'share', ph: 'share-network', 'radix-icons': 'share-1', 'material-symbols': 'share' } },
  { name: 'undo',            alias: { heroicons: 'arrow-uturn-left', ph: 'arrow-u-up-left' } },
  { name: 'redo',            alias: { heroicons: 'arrow-uturn-right', ph: 'arrow-u-up-right' } },
  { name: 'refresh-cw',      alias: { heroicons: 'arrow-path', ph: 'arrows-clockwise', 'radix-icons': 'reload', 'material-symbols': 'refresh' } },
  { name: 'repeat',          alias: { 'radix-icons': 'loop' } },
  { name: 'archive',         alias: { heroicons: 'archive-box' } },
  { name: 'bookmark',        alias: { ph: 'bookmark-simple' } },
  { name: 'zoom-in',         alias: { heroicons: 'magnifying-glass-plus', ph: 'magnifying-glass-plus' } },
  { name: 'zoom-out',        alias: { heroicons: 'magnifying-glass-minus', ph: 'magnifying-glass-minus' } },
  { name: 'filter',          alias: { heroicons: 'funnel', ph: 'funnel', 'material-symbols': 'filter-alt' } },
  { name: 'sliders',         alias: { lucide: 'sliders-horizontal', heroicons: 'adjustments-horizontal', ph: 'sliders-horizontal', 'radix-icons': 'mixer-horizontal', 'material-symbols': 'tune' } },
  { name: 'pin',             alias: { ph: 'push-pin', 'radix-icons': 'drawing-pin', 'material-symbols': 'push-pin' } },
  // Communication
  { name: 'mail',            alias: { heroicons: 'envelope', ph: 'envelope-simple', 'radix-icons': 'envelope-closed' } },
  { name: 'send',            alias: { heroicons: 'paper-airplane', ph: 'paper-plane-tilt', 'radix-icons': 'paper-plane' } },
  { name: 'message-circle',  alias: { heroicons: 'chat-bubble-oval-left', ph: 'chat-circle', 'radix-icons': 'chat-bubble', 'material-symbols': 'chat' } },
  { name: 'at-sign',         alias: { heroicons: 'at-symbol', ph: 'at', 'material-symbols': 'alternate-email' } },
  { name: 'phone',           alias: { 'material-symbols': 'call' } },
  { name: 'paperclip',       alias: { heroicons: 'paper-clip', 'material-symbols': 'attach-file' } },
  { name: 'inbox',           alias: { ph: 'tray' } },
  // People
  { name: 'user',            alias: { 'radix-icons': 'person', 'material-symbols': 'person' } },
  { name: 'users',           alias: { 'material-symbols': 'group' } },
  { name: 'user-plus',       alias: { 'material-symbols': 'person-add' } },
  // Media
  { name: 'image',           alias: { heroicons: 'photo' } },
  { name: 'camera',          alias: { 'material-symbols': 'photo-camera' } },
  { name: 'video',           alias: { heroicons: 'video-camera', ph: 'video-camera', 'material-symbols': 'videocam' } },
  { name: 'mic',             alias: { heroicons: 'microphone', ph: 'microphone' } },
  { name: 'play',            alias: { 'material-symbols': 'play-arrow' } },
  { name: 'pause' },
  { name: 'volume-2',        alias: { heroicons: 'speaker-wave', ph: 'speaker-high', 'material-symbols': 'volume-up' } },
  { name: 'music',           alias: { heroicons: 'musical-note', ph: 'music-notes', 'material-symbols': 'music-note' } },
  // Files
  { name: 'file',            alias: { heroicons: 'document', 'material-symbols': 'description' } },
  { name: 'file-text',       alias: { heroicons: 'document-text', 'material-symbols': 'article' } },
  { name: 'folder' },
  { name: 'folder-open' },
  { name: 'clipboard',       alias: { 'material-symbols': 'content-paste' } },
  { name: 'printer',         alias: { 'material-symbols': 'print' } },
  // Status
  { name: 'info',            alias: { heroicons: 'information-circle', 'radix-icons': 'info-circled' } },
  { name: 'alert-triangle',  alias: { lucide: 'triangle-alert', heroicons: 'exclamation-triangle', ph: 'warning', 'radix-icons': 'exclamation-triangle', 'material-symbols': 'warning' } },
  { name: 'alert-circle',    alias: { lucide: 'circle-alert', heroicons: 'exclamation-circle', ph: 'warning-circle', 'material-symbols': 'error' } },
  { name: 'help-circle',     alias: { lucide: 'circle-help', heroicons: 'question-mark-circle', ph: 'question', 'radix-icons': 'question-mark-circled', 'material-symbols': 'help' } },
  { name: 'bell',            alias: { 'material-symbols': 'notifications' } },
  { name: 'bell-off',        alias: { heroicons: 'bell-slash', ph: 'bell-slash', 'material-symbols': 'notifications-off' } },
  { name: 'shield',          alias: { heroicons: 'shield-check' } },
  { name: 'thumbs-up',       alias: { heroicons: 'hand-thumb-up', 'material-symbols': 'thumb-up' } },
  { name: 'thumbs-down',     alias: { heroicons: 'hand-thumb-down', 'material-symbols': 'thumb-down' } },
  { name: 'star' },
  { name: 'heart',           alias: { 'material-symbols': 'favorite' } },
  // Commerce
  { name: 'shopping-cart' },
  { name: 'shopping-bag',    alias: { ph: 'bag' } },
  { name: 'credit-card' },
  { name: 'tag',             alias: { 'material-symbols': 'sell' } },
  { name: 'gift',            alias: { 'material-symbols': 'redeem' } },
  { name: 'dollar-sign',     alias: { heroicons: 'currency-dollar', ph: 'currency-dollar', 'material-symbols': 'attach-money' } },
  { name: 'percent' },
  // Time
  { name: 'calendar',        alias: { ph: 'calendar-blank', 'material-symbols': 'calendar-today' } },
  { name: 'clock',           alias: { 'material-symbols': 'schedule' } },
  // Visibility & security
  { name: 'eye',             alias: { 'radix-icons': 'eye-open', 'material-symbols': 'visibility' } },
  { name: 'eye-off',         alias: { heroicons: 'eye-slash', ph: 'eye-slash', 'radix-icons': 'eye-closed', 'material-symbols': 'visibility-off' } },
  { name: 'lock',            alias: { heroicons: 'lock-closed', 'radix-icons': 'lock-closed' } },
  { name: 'unlock',          alias: { lucide: 'lock-open', heroicons: 'lock-open', ph: 'lock-open', 'radix-icons': 'lock-open-1', 'material-symbols': 'lock-open' } },
  { name: 'key' },
  { name: 'link',            alias: { 'radix-icons': 'link-2' } },
  // Tech & devices
  { name: 'globe',           alias: { heroicons: 'globe-alt', 'material-symbols': 'public' } },
  { name: 'map-pin',         alias: { 'material-symbols': 'location-on' } },
  { name: 'map',             alias: { ph: 'map-trifold' } },
  { name: 'wifi',            alias: { ph: 'wifi-high' } },
  { name: 'cloud' },
  { name: 'database',        alias: { heroicons: 'circle-stack' } },
  { name: 'server',          alias: { 'material-symbols': 'dns' } },
  { name: 'code',            alias: { heroicons: 'code-bracket', 'radix-icons': 'code' } },
  { name: 'terminal',        alias: { heroicons: 'command-line' } },
  { name: 'cpu',             alias: { heroicons: 'cpu-chip', 'material-symbols': 'memory' } },
  { name: 'smartphone',      alias: { heroicons: 'device-phone-mobile', ph: 'device-mobile', 'radix-icons': 'mobile' } },
  { name: 'monitor',         alias: { heroicons: 'computer-desktop', 'radix-icons': 'desktop' } },
  { name: 'battery',         alias: { heroicons: 'battery-100', ph: 'battery-full', 'material-symbols': 'battery-full' } },
  // Layout & misc
  { name: 'grid',            alias: { lucide: 'layout-grid', heroicons: 'squares-2x2', ph: 'squares-four', 'material-symbols': 'grid-view' } },
  { name: 'list',            alias: { heroicons: 'list-bullet', ph: 'list-bullets', 'radix-icons': 'list-bullet' } },
  { name: 'dashboard',       alias: { lucide: 'layout-dashboard', ph: 'layout', 'material-symbols': 'dashboard' } },
  { name: 'sun',             alias: { 'material-symbols': 'light-mode' } },
  { name: 'moon',            alias: { 'material-symbols': 'dark-mode' } },
  { name: 'zap',             alias: { heroicons: 'bolt', ph: 'lightning', 'radix-icons': 'lightning-bolt', 'material-symbols': 'bolt' } },
  { name: 'layers',          alias: { heroicons: 'square-3-stack-3d', ph: 'stack' } },
  { name: 'package',         alias: { heroicons: 'cube', 'radix-icons': 'cube', 'material-symbols': 'package-2' } },
  { name: 'truck',           alias: { 'material-symbols': 'local-shipping' } },
  { name: 'flag' },
]

// Every glyph generates as a component SET with three size variants.
const ICON_SIZES: [string, number][] = [['Large', 24], ['Medium', 20], ['Small', 16]]

async function importIcons(tokens: DesignTokens): Promise<number> {
  const custom = tokens.icons?.custom ?? []
  const libKey = tokens.icons?.library ?? ''
  const libName = tokens.icons?.name ?? libKey
  const prefix = tokens.icons?.prefix ?? ICONIFY_PREFIXES[libKey]
  if (custom.length === 0 && !prefix) return 0

  let page = figma.root.children.find((p) => p.name === '⬡ Icons') as PageNode | undefined
  if (!page) {
    page = figma.createPage()
    page.name = '⬡ Icons'
  } else {
    await page.loadAsync()
  }
  const pg = page

  // createNodeFromSvg / createComponentFromNode drop nodes on the CURRENT page,
  // and combineAsVariants can't reparent across pages — build ON the Icons page
  // so nothing strands wherever the user happened to be, then switch back.
  const prevPage = figma.currentPage
  if (prevPage !== pg) await figma.setCurrentPageAsync(pg)

  // Rescue icons stranded on other pages by older runs (they were created on
  // the then-current page): any icon/* component or set moves home to ⬡ Icons.
  for (const other of figma.root.children) {
    if (other === pg) continue
    await other.loadAsync()
    const strays = other.findAll((n) =>
      (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') && n.name.startsWith('icon/'))
    for (const s of strays) {
      // Only move top-level components — variants inside a set travel with it.
      if (s.parent?.type === 'COMPONENT_SET') continue
      pg.appendChild(s as SceneNode)
    }
    if (strays.length > 0) log(`✓ Moved ${strays.length} stray icon${strays.length > 1 ? 's' : ''} from "${other.name}" to "⬡ Icons"`)
  }

  // Doc chrome fonts (token family, Inter fallback — same as component pages)
  const fontFamily = tokens.typography?.fontFamily || 'Inter'
  const loadedStyles = new Set<string>()
  for (const style of ['Regular', 'Medium', 'Semi Bold', 'Bold'] as const) {
    try { await figma.loadFontAsync({ family: fontFamily, style }); loadedStyles.add(style) } catch {
      try { await figma.loadFontAsync({ family: 'Inter', style }) } catch {}
    }
  }
  const fontFor = (style: DocFontStyle): FontName =>
    loadedStyles.has(style) ? { family: fontFamily, style } : { family: 'Inter', style }
  const iconsTypo = await typoVarMap()
  const iconsAllVars = await figma.variables.getLocalVariablesAsync()
  const iconsAllCols = await figma.variables.getLocalVariableCollectionsAsync()
  const iconsChrome = docChromeVarsFrom(semLookupFor(tokens, iconsAllVars, iconsAllCols))
  const iconsModePin = docModePin(tokens, iconsAllCols)
  const { docSolid, docText, docFrame, wrapText, docDivider, docBullet, docBoard } = docChrome(fontFor, iconsTypo, tokens.typography.sizes, iconsChrome, iconsModePin)
  try { pg.backgrounds = [docSolid(DOC.page)] } catch {}
  pinToLightMode(pg, iconsModePin)

  const MARGIN = 80
  const TOP = 120
  const SHOWCASE_X = MARGIN + (PANEL_W + 96) + 60   // board width (panel + 48px padding per side) + gutter
  const GRID_W = 960

  // Existing icon components anywhere on the page (loose from older imports,
  // or already inside the section frames) — kept so placed instances survive.
  // Sets (current format) skip re-import; loose singles (older format) get
  // upgraded to the Large variant of a new set.
  const existingComponents = new Map<string, ComponentNode>()
  for (const n of pg.findAll((nn) => nn.type === 'COMPONENT')) {
    if (!existingComponents.has(n.name)) existingComponents.set(n.name, n as ComponentNode)
  }
  const existingIconSets = new Set<string>()
  for (const n of pg.findAll((nn) => nn.type === 'COMPONENT_SET')) existingIconSets.add(n.name)

  // Chrome (panel + header) is rebuilt from scratch every run.
  for (const child of [...pg.children]) {
    if (child.type === 'FRAME' && child.name.startsWith('docs/')) child.remove()
  }

  // Section card — a framed, wrapping auto-layout grid the icons live INSIDE.
  // Reused across imports (components must stay put); the label is refreshed.
  function sectionCard(name: string, label: string): { card: FrameNode; grid: FrameNode } {
    let card = pg.children.find((n) => n.type === 'FRAME' && n.name === name) as FrameNode | undefined
    if (!card) {
      card = figma.createFrame()
      card.name = name
      card.layoutMode = 'VERTICAL'
      card.primaryAxisSizingMode = 'AUTO'
      card.counterAxisSizingMode = 'FIXED'
      card.resize(GRID_W, 100)
      card.itemSpacing = 16
      card.paddingTop = 24; card.paddingBottom = 24
      card.paddingLeft = 24; card.paddingRight = 24
      card.cornerRadius = 16
      pg.appendChild(card)
    }
    card.fills = [docSolid(DOC.card, 1, iconsChrome.card)]
    card.strokes = [docSolid(DOC.border, 1, iconsChrome.border)]
    card.strokeWeight = 1
    const oldLabel = card.children.find((n) => n.type === 'TEXT' && n.name === 'label')
    if (oldLabel) oldLabel.remove()
    const lbl = docText(label.toUpperCase(), 10, 'Medium', DOC.muted, 1, iconsChrome.muted)
    lbl.name = 'label'
    lbl.letterSpacing = { value: 1, unit: 'PIXELS' }
    card.insertChild(0, lbl)
    let grid = card.children.find((n) => n.type === 'FRAME' && n.name === 'grid') as FrameNode | undefined
    if (!grid) {
      grid = figma.createFrame()
      grid.name = 'grid'
      grid.layoutMode = 'HORIZONTAL'
      grid.primaryAxisSizingMode = 'FIXED'
      grid.counterAxisSizingMode = 'AUTO'
      grid.layoutWrap = 'WRAP'
      grid.itemSpacing = 20
      grid.counterAxisSpacing = 20
      grid.fills = []
      card.appendChild(grid)
      grid.layoutSizingHorizontal = 'FILL'
    }
    return { card, grid }
  }

  // Tint variable — icons bind to the primary ink role so they follow the theme
  // modes, whichever vocabulary "Color Semantics" is holding (see semLookupFor).
  const allVars = await figma.variables.getLocalVariablesAsync()
  const allCols = await figma.variables.getLocalVariableCollectionsAsync()
  const tintCandidate = semLookupFor(tokens, allVars, allCols).varFor('content-primary', 'text/primary', 'text')
  const tintVar = tintCandidate?.resolvedType === 'COLOR' ? tintCandidate : undefined
  function tint(root: FrameNode) {
    if (!tintVar) return
    const nodes: SceneNode[] = [root, ...root.findAll()]
    for (const n of nodes) {
      const g = n as SceneNode & GeometryMixin
      if ('fills' in g && Array.isArray(g.fills) && (g.fills as Paint[]).some((f) => f.type === 'SOLID')) {
        g.fills = (g.fills as Paint[]).map((f) =>
          f.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(f, 'color', tintVar!) : f)
      }
      if ('strokes' in g && (g.strokes as Paint[]).some((f) => f.type === 'SOLID')) {
        g.strokes = (g.strokes as Paint[]).map((f) =>
          f.type === 'SOLID' ? figma.variables.setBoundVariableForPaint(f, 'color', tintVar!) : f)
      }
    }
  }

  let created = 0

  // ── Library core set (one bulk Iconify request) ────────────────────────────
  // One card per family — switching libraries starts a new card and leaves the
  // previous one (and its placed instances) untouched.
  let libCard: FrameNode | undefined
  let libCount = 0
  if (prefix) {
    const { card, grid } = sectionCard(`icons/lib-${libKey}`, `${libName} — Core UI Set`)
    libCard = card
    // Migrate loose components from older imports into the framed grid.
    for (const [name, comp] of existingComponents) {
      if (name.startsWith(`icon/${libKey}/`) && comp.parent !== grid) grid.appendChild(comp)
    }
    const wanted = ICON_CORE
      .map((def) => ({ canonical: def.name, source: def.alias?.[prefix] ?? def.name }))
      .filter((w) => !existingIconSets.has(`icon/${libKey}/${w.canonical}`))
    if (wanted.length > 0) {
      try {
        const url = `https://api.iconify.design/${prefix}.json?icons=${wanted.map((w) => w.source).join(',')}`
        const res = await fetchWithTimeout(url)
        if (!res.ok) throw new Error(`Iconify responded ${res.status}`)
        const data = await res.json() as {
          icons?: Record<string, { body: string; width?: number; height?: number }>
          aliases?: Record<string, { parent: string }>
          width?: number; height?: number; not_found?: string[]
        }
        const icons = data.icons ?? {}
        const aliases = data.aliases ?? {}
        let libCreated = 0
        let iconSeen = 0
        for (const w of wanted) {
          // Each icon is a component SET (several sizes), so a full core library
          // is thousands of nodes — yield every few or the editor locks up here
          // exactly like it did in the component phase. Every 8 keeps the bar
          // moving without paying a macrotask per glyph.
          if (iconSeen % 8 === 0) {
            progress('Icons', iconSeen, wanted.length, w.canonical)
            await yieldToUI()
          }
          iconSeen++
          // Iconify sometimes resolves a requested name to its alias parent and
          // keys the response under that parent instead (e.g. asking for
          // "circle-help" returns the icon body under "circle-question-mark").
          const resolvedKey = icons[w.source] ? w.source : aliases[w.source]?.parent
          const ic = resolvedKey ? icons[resolvedKey] : undefined
          if (!ic) continue
          try {
            const setName = `icon/${libKey}/${w.canonical}`
            const iw = ic.width ?? data.width ?? 24
            const ih = ic.height ?? data.height ?? 24
            const body = ic.body.replace(/currentColor/g, '#000000')
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iw}" height="${ih}" viewBox="0 0 ${iw} ${ih}">${body}</svg>`

            // A loose single from the previous format becomes the Large variant,
            // keeping its placed instances alive.
            const legacy = existingComponents.get(setName)
            const variants: ComponentNode[] = []
            let set: ComponentSetNode
            try {
              for (const [sizeName, px] of ICON_SIZES) {
                if (sizeName === 'Large' && legacy) {
                  legacy.name = 'Size=Large'
                  variants.push(legacy)
                  continue
                }
                const frame = figma.createNodeFromSvg(svg)
                if (frame.width !== px) frame.rescale(px / frame.width)
                tint(frame)
                const comp = figma.createComponentFromNode(frame)
                comp.name = `Size=${sizeName}`
                variants.push(comp)
              }
              set = figma.combineAsVariants(variants, grid)
            } catch (buildErr) {
              // Never strand half-built Size=* components on the canvas.
              for (const v of variants) {
                if (v !== legacy && !v.removed) try { v.remove() } catch {}
              }
              throw buildErr
            }
            set.name = setName
            set.layoutMode = 'HORIZONTAL'
            set.primaryAxisSizingMode = 'AUTO'
            set.counterAxisSizingMode = 'AUTO'
            set.counterAxisAlignItems = 'CENTER'
            set.itemSpacing = 12
            set.paddingTop = 12; set.paddingBottom = 12
            set.paddingLeft = 12; set.paddingRight = 12
            try { set.description = `${libName} — ${w.source} (Large 24 / Medium 20 / Small 16)` } catch {}
            libCreated++
          } catch (iconErr) {
            log(`⚠ Could not build icon "${w.source}" from ${prefix} — ${iconErr instanceof Error ? iconErr.message : String(iconErr)}`)
          }
        }
        created += libCreated
        const missing = (data.not_found?.length ?? 0)
        if (libCreated > 0) {
          log(`✓ Imported ${libCreated} ${libName} icon sets (Large/Medium/Small) on page "⬡ Icons"${missing ? ` (${missing} not in this set)` : ''}`)
        } else {
          log(`⚠ Iconify responded but matched 0 of ${wanted.length} requested "${prefix}" icons — the collection prefix may be wrong, or the API response shape changed.`)
        }
      } catch (e) {
        log(`⚠ Icon library fetch failed (${e instanceof Error ? e.message : String(e)}) — if this is a network/permission error, the plugin likely needs a full reload to pick up api.iconify.design from the manifest: in Figma, Plugins → Development → right-click "Escala DS" → Remove, then Import plugin from manifest… again (editing manifest.json alone isn't always enough for a running dev session). Custom icons and tokens are unaffected.`)
      }
    }
    libCount = grid.children.length

    // Retire the legacy single-library card once its icons have moved over.
    const legacyLib = pg.children.find((n) => n.type === 'FRAME' && n.name === 'icons/library') as FrameNode | undefined
    if (legacyLib && legacyLib.findAll((n) => n.type === 'COMPONENT').length === 0) legacyLib.remove()
  }

  // ── Custom uploads (kept untinted — brand marks may be multicolor) ─────────
  // Anything under a known library namespace is NOT custom — icons from a
  // previously selected family stay in their own card.
  const libNamespaces = Object.keys(ICONIFY_PREFIXES).map((k) => `icon/${k}/`)
  const isCustomName = (n: string) => n.startsWith('icon/') && !libNamespaces.some((ns) => n.startsWith(ns))
  const hasCustom = custom.length > 0 || [...existingComponents.keys()].some(isCustomName)
  let customCard: FrameNode | undefined
  let customCount = 0
  if (hasCustom) {
    const { card, grid } = sectionCard('icons/custom', 'Custom Icons')
    customCard = card
    for (const [name, comp] of existingComponents) {
      if (isCustomName(name) && comp.parent !== grid) grid.appendChild(comp)
    }
    let customCreated = 0
    for (const icon of custom) {
      const name = `icon/${icon.name}`
      if (existingComponents.has(name)) continue
      try {
        const frame = figma.createNodeFromSvg(icon.svg)
        const comp = figma.createComponentFromNode(frame)
        comp.name = name
        grid.appendChild(comp)
        customCreated++
      } catch (e) {
        log(`⚠ Could not import icon "${icon.name}" — invalid SVG`)
      }
    }
    created += customCreated
    if (customCreated > 0) log(`✓ Imported ${customCreated} custom icon${customCreated > 1 ? 's' : ''} on page "⬡ Icons"`)
    customCount = grid.children.length
  }

  // ── Page documentation — black title bar + editorial side panel ────────────
  const header = docFrame('docs/icons-header', 'HORIZONTAL', 8)
  header.fills = [docSolid(DOC.ink)]
  header.cornerRadius = 10
  header.primaryAxisSizingMode = 'FIXED'
  header.counterAxisSizingMode = 'FIXED'
  header.resize(GRID_W, 48)
  header.counterAxisAlignItems = 'CENTER'
  header.primaryAxisAlignItems = 'SPACE_BETWEEN'
  header.paddingLeft = 24; header.paddingRight = 24
  header.appendChild(docText('Icons', 13, 'Semi Bold', '#FFFFFF'))
  header.appendChild(docText(tokens.project || 'Design System', 10, 'Medium', '#9C9CA6'))
  pg.appendChild(header)
  header.x = SHOWCASE_X
  header.y = TOP

  // Stack the section cards: current library first, then older library cards,
  // then custom icons.
  const otherLibCards = pg.children.filter((n) =>
    n.type === 'FRAME' && n.name.startsWith('icons/lib-') && n !== libCard) as FrameNode[]
  let y = TOP + 76
  for (const cardF of [libCard, ...otherLibCards, customCard]) {
    if (!cardF) continue
    cardF.x = SHOWCASE_X
    cardF.y = y
    y += cardF.height + 40
  }

  const panel = docFrame('docs/icons-panel', 'VERTICAL', 20)
  panel.fills = [docSolid(DOC.card, 1, iconsChrome.board)]
  panel.strokes = [docSolid(DOC.border, 1, iconsChrome.border)]
  panel.strokeWeight = 1
  panel.cornerRadius = 16
  panel.paddingTop = PANEL_PAD; panel.paddingBottom = PANEL_PAD
  panel.paddingLeft = PANEL_PAD; panel.paddingRight = PANEL_PAD
  panel.counterAxisSizingMode = 'FIXED'
  panel.resize(PANEL_W, 100)

  const crumb = docFrame('breadcrumb', 'HORIZONTAL', 8)
  crumb.primaryAxisSizingMode = 'FIXED'
  crumb.counterAxisSizingMode = 'FIXED'
  crumb.resize(PANEL_INNER, 18)
  crumb.primaryAxisAlignItems = 'SPACE_BETWEEN'
  crumb.counterAxisAlignItems = 'CENTER'
  crumb.appendChild(docText('Foundations  /  Icons', 9, 'Regular', DOC.muted, 1, iconsChrome.secondary))
  crumb.appendChild(docText('v1.0 – LAUNCH', 8, 'Medium', DOC.muted, 0.9, iconsChrome.secondary))
  panel.appendChild(crumb)

  panel.appendChild(wrapText(docText('Icons', 26, 'Semi Bold', DOC.text, 1, iconsChrome.text), PANEL_INNER))
  const intro = wrapText(docText(
    `${libName || 'The icon set'} is the icon language of this design system. The core UI set is imported straight from the official collection, normalized to a 24px grid and tinted through the text/primary variable — custom brand glyphs live alongside it.`,
    12, 'Regular', DOC.muted, 1, iconsChrome.muted), PANEL_INNER)
  intro.lineHeight = { value: 150, unit: 'PERCENT' }
  panel.appendChild(intro)

  panel.appendChild(docDivider('SPECS'))
  const specs = docFrame('specs', 'VERTICAL', 14)
  docBullet(specs, `Library — ${libName || 'custom only'}`,
    tokens.icons?.package
      ? `Ships as ${tokens.icons.package} in code, so design and engineering draw from the same set.`
      : 'Selected in the configurator and stored as the Icons/library variable.')
  if (libCount > 0) {
    docBullet(specs, `${libCount} core UI glyphs`,
      'Navigation, actions, forms, status, commerce, media and device icons — insert as icon/<library>/<name>. Missing concepts in a set are skipped gracefully.')
    docBullet(specs, '3 sizes per glyph',
      'Every icon is a variant set — Large 24, Medium 20 and Small 16 — switch sizes from the instance panel without swapping components.')
  }
  if (customCount > 0) {
    docBullet(specs, `${customCount} custom icons`,
      'Uploaded in the configurator; imported as-is so multicolor brand marks keep their fills.')
  }
  docBullet(specs, 'Token-tinted',
    'Library glyphs bind fills and strokes to the primary ink semantic variable — switch the page\'s variable mode and every icon follows the theme.')
  panel.appendChild(specs)

  panel.appendChild(docDivider('FEATURES'))
  const sem = tokens.colors?.semantic ?? {}
  const accent = archHexFor(tokens, 'background-brand-solid', (tokens.colors?.themeOrder ?? ['light'])[0])
    || sem['background-brand-solid'] || sem['content-brand'] || sem['action-primary'] || sem['bg-accent-solid'] || sem.primary || '#3B82F6'
  const feats = ['Variable Tinted', 'Auto Layout', 'Themable', '24px Grid', 'Iconify Sourced', 'AI Friendly']
  for (let i = 0; i < feats.length; i += 3) {
    const rw = docFrame(`features-${i / 3 + 1}`, 'HORIZONTAL', 6)
    for (const f of feats.slice(i, i + 3)) {
      const chipF = docFrame(`feat-${f.toLowerCase().replace(/\s+/g, '-')}`, 'HORIZONTAL', 4)
      chipF.paddingLeft = 8; chipF.paddingRight = 8
      chipF.paddingTop = 4; chipF.paddingBottom = 4
      chipF.cornerRadius = 999
      chipF.strokes = [docSolid(accent, 0.45, iconsChrome.accentBorder)]
      chipF.strokeWeight = 1
      chipF.appendChild(docText(f, 9, 'Medium', accent, 1, iconsChrome.accentText))
      rw.appendChild(chipF)
    }
    panel.appendChild(rw)
  }

  const hint = docFrame('insert-hint', 'VERTICAL', 6)
  hint.fills = [docSolid(DOC.faint, 1, iconsChrome.card)]
  hint.strokes = [docSolid(DOC.border, 1, iconsChrome.border)]
  hint.strokeWeight = 1
  hint.cornerRadius = 10
  hint.paddingTop = 14; hint.paddingBottom = 14
  hint.paddingLeft = 16; hint.paddingRight = 16
  hint.counterAxisSizingMode = 'FIXED'
  hint.resize(PANEL_INNER, 60)
  hint.appendChild(wrapText(docText('Insert icons easily to your canvas', 12, 'Medium', DOC.text, 1, iconsChrome.text), PANEL_INNER - 32))
  hint.appendChild(wrapText(docText('hold ⇧ Shift + I, search “icon/” and press insert — or drag any glyph from Assets to the canvas', 10.5, 'Regular', DOC.muted, 1, iconsChrome.muted), PANEL_INNER - 32))
  panel.appendChild(hint)

  const board = docBoard('docs/board · Icons', 'Foundations  /  Icons',
    tokens.project || 'Design System', PANEL_W)
  board.appendChild(panel)
  pg.appendChild(board)
  board.x = MARGIN
  board.y = TOP

  // Back to wherever the user was before the import.
  if (prevPage !== pg) {
    try { await figma.setCurrentPageAsync(prevPage) } catch {}
  }

  return created
}

// ─── Cover page ──────────────────────────────────────────────────────────────
// Rebuilds a "⬡ Cover" page holding a single 1600×900 hero frame — the file's
// front door and thumbnail. The background uses the gradient the configurator
// assigned to "cover" (falling back to a brand gradient built from the accent
// ramp), typography uses the system's heading family, and the frame is set as
// the file thumbnail so the design system is recognizable from the file browser.

async function importCover(tokens: DesignTokens): Promise<boolean> {
  const project = tokens.project || 'Design System'

  // ── Fonts — heading family first, Inter as fallback ────────────────────────
  const headingFamily = tokens.typography.headingFontFamily || tokens.typography.fontFamily || 'Inter'
  const bodyFamily = tokens.typography.fontFamily || 'Inter'
  const loaded = new Set<string>()
  async function loadFont(family: string, style: string): Promise<FontName> {
    const key = `${family}:${style}`
    if (!loaded.has(key)) {
      try { await figma.loadFontAsync({ family, style }) } catch {
        await figma.loadFontAsync({ family: 'Inter', style })
        loaded.add(`Inter:${style}`)
        return { family: 'Inter', style }
      }
      loaded.add(key)
    }
    return { family, style }
  }
  const headingFont = await loadFont(headingFamily, 'Bold')
  const bodyFont = await loadFont(bodyFamily, 'Regular')
  const mediumFont = await loadFont(bodyFamily, 'Medium')

  // ── Background — assigned cover gradient, else accent-ramp fallback ────────
  const gradient = assignedGradient(tokens, 'cover')
  const prim = tokens.colors.primitive
  const tone = (fam: string, tones: string[]) => {
    for (const t of tones) { const hex = prim[`${fam}-${t}`]; if (hex) return hex }
    return undefined
  }
  const deep = tone('accent', ['12', '1000', '11', '900']) ?? '#111114'
  const solidTone = tone('accent', ['9', '600', '8', '500']) ?? '#3B82F6'
  const fallback: GradientPaint = {
    type: 'GRADIENT_LINEAR',
    gradientStops: [
      { color: hexToRgba(deep), position: 0 },
      { color: hexToRgba(solidTone), position: 1 },
    ],
    gradientTransform: (() => {
      const rad = ((135 - 90) * Math.PI) / 180
      const cos = Math.cos(rad), sin = Math.sin(rad)
      return [
        [cos, sin, 0.5 - 0.5 * cos - 0.5 * sin],
        [-sin, cos, 0.5 + 0.5 * sin - 0.5 * cos],
      ] as Transform
    })(),
  }
  const bg = gradient ?? fallback

  // Readable ink for text sitting on the gradient — average the stops.
  let lum = 0
  for (const s of bg.gradientStops) lum += 0.2126 * s.color.r + 0.7152 * s.color.g + 0.0722 * s.color.b
  lum /= bg.gradientStops.length
  const inkHex = lum < 0.55 ? '#FFFFFF' : '#18181B'
  const ink = (opacity = 1): SolidPaint => ({ type: 'SOLID', color: hexToRgb(inkHex), opacity })

  // ── Page (wiped + rebuilt each import — generated content only) ────────────
  let page = figma.root.children.find((p) => p.name === '⬡ Cover') as PageNode | undefined
  if (!page) {
    page = figma.createPage()
    page.name = '⬡ Cover'
  } else {
    await page.loadAsync()
    for (const child of [...page.children]) child.remove()
  }

  const frame = figma.createFrame()
  frame.name = `${project} — Cover`
  frame.resize(1600, 900)
  frame.fills = [bg]
  // Bind the fill to the gradient's PAINT STYLE when there is one. A Live Sync
  // refreshes variables and styles but deliberately never rebuilds pages, so a
  // raw paint here would freeze the cover at whatever the gradient looked like
  // on the last full import — re-editing it on the web would update the style
  // and the Documentation swatch while the cover kept the old colours. Through
  // the style, the cover re-paints on the next sync like everything else.
  // Falls back to the raw paint set above when the style isn't there (a
  // pages-only run, or a gradient CSS form parseCssGradient can't read).
  const coverSlug = tokens.gradientAssignments?.cover
  if (coverSlug && gradient) {
    // `tokens.project || 'SD'`, not this function's `project` (which falls back
    // to 'Design System') — the name has to match what importStyles created.
    const styleName = `Gradient/${coverSlug}`
    const style = (await figma.getLocalPaintStylesAsync()).find((s) => s.name === styleName)
    if (style) { try { await frame.setFillStyleIdAsync(style.id) } catch (e) { /* keep the raw paint */ } }
  }
  frame.cornerRadius = 0
  frame.layoutMode = 'VERTICAL'
  frame.primaryAxisAlignItems = 'SPACE_BETWEEN'
  frame.paddingTop = 72; frame.paddingBottom = 72
  frame.paddingLeft = 96; frame.paddingRight = 96
  frame.primaryAxisSizingMode = 'FIXED'
  frame.counterAxisSizingMode = 'FIXED'
  page.appendChild(frame)

  const coverTypo = await typoVarMap()
  function text(chars: string, font: FontName, size: number, opacity = 1): TextNode {
    const t = figma.createText()
    t.fontName = font
    t.characters = chars
    t.fontSize = size
    t.fills = [ink(opacity)]
    bindAllTextFields(t, coverTypo, {
      sizeKey: nearestTypeSizeKey(tokens.typography.sizes, size),
      weightKey: font.style === 'Bold' || font.style === 'Semi Bold' ? 'semibold' : 'regular',
      heading: size >= 28,
    })
    return t
  }

  // Top row — brand mark + version chip
  const top = figma.createFrame()
  top.name = 'cover__top'
  top.layoutMode = 'HORIZONTAL'
  top.primaryAxisSizingMode = 'FIXED'
  top.counterAxisSizingMode = 'AUTO'
  top.layoutAlign = 'STRETCH'
  top.resize(1600 - 192, 40)
  top.primaryAxisAlignItems = 'SPACE_BETWEEN'
  top.counterAxisAlignItems = 'CENTER'
  top.fills = []
  top.appendChild(text(`⬡ ${project}`, mediumFont, 20))
  const chip = figma.createFrame()
  chip.name = 'cover__version'
  chip.layoutMode = 'HORIZONTAL'
  // Hug both axes (pill sizes to its text + padding) — left at the
  // createFrame() default (fixed 100×100) this rendered as a corner-radius-999
  // circle clipping the label to nothing, same root cause as cover__title below.
  chip.primaryAxisSizingMode = 'AUTO'
  chip.counterAxisSizingMode = 'AUTO'
  chip.paddingLeft = 14; chip.paddingRight = 14; chip.paddingTop = 6; chip.paddingBottom = 6
  chip.cornerRadius = 999
  chip.fills = []
  chip.strokes = [ink(0.4)]
  chip.strokeWeight = 1
  chip.appendChild(text('DESIGN SYSTEM · v1.0', mediumFont, 12, 0.9))
  top.appendChild(chip)
  frame.appendChild(top)

  // Middle — the big title block
  const mid = figma.createFrame()
  mid.name = 'cover__title'
  mid.layoutMode = 'VERTICAL'
  mid.itemSpacing = 20
  // Unlike top/bottom (HORIZONTAL, width fixed via resize + AUTO height), mid
  // is VERTICAL — width is the counter axis here, so it needs the same
  // fixed-width/STRETCH treatment on that axis instead, or it keeps
  // createFrame()'s default 100×100 and clips the 128px title + everything
  // else into a sliver (visible as "100 × 234 Hug" in Figma's inspect panel).
  mid.layoutAlign = 'STRETCH'
  mid.primaryAxisSizingMode = 'AUTO'
  mid.counterAxisSizingMode = 'FIXED'
  mid.resize(1600 - 192, mid.height)
  mid.fills = []
  const eyebrow = text('FOUNDATIONS · TOKENS · COMPONENTS', mediumFont, 14, 0.75)
  eyebrow.letterSpacing = { value: 3, unit: 'PIXELS' }
  mid.appendChild(eyebrow)
  const title = text(project, headingFont, 128)
  title.resize(1600 - 192, title.height)
  title.textAutoResize = 'HEIGHT'
  mid.appendChild(title)
  const themeCount = Object.keys(tokens.colors.themes ?? {}).length ||
    (tokens.colors.semanticDark ? 2 : 1)
  const famCount = new Set(
    Object.keys(prim).map((k) => (k.includes('-') ? k.slice(0, k.lastIndexOf('-')) : k)),
  ).size
  const atoms = tokens.atoms ?? tokens.components ?? []
  const sub = text(
    `${famCount} color families · ${themeCount} theme${themeCount === 1 ? '' : 's'} · ${atoms.length} components — synced from the configurator`,
    bodyFont, 18, 0.85,
  )
  mid.appendChild(sub)
  frame.appendChild(mid)

  // Bottom row — source URL + date stamp
  const bottom = figma.createFrame()
  bottom.name = 'cover__bottom'
  bottom.layoutMode = 'HORIZONTAL'
  bottom.primaryAxisSizingMode = 'FIXED'
  bottom.counterAxisSizingMode = 'AUTO'
  bottom.layoutAlign = 'STRETCH'
  bottom.resize(1600 - 192, 24)
  bottom.primaryAxisAlignItems = 'SPACE_BETWEEN'
  bottom.counterAxisAlignItems = 'CENTER'
  bottom.fills = []
  bottom.appendChild(text('escalatokens.com', bodyFont, 14, 0.75))
  const now = new Date()
  bottom.appendChild(text(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    bodyFont, 14, 0.6,
  ))
  frame.appendChild(bottom)

  // The cover doubles as the file thumbnail (best-effort — plan-dependent).
  try { await figma.setFileThumbnailNodeAsync(frame) } catch {}

  log(`✓ Cover page rebuilt on "⬡ Cover"${gradient ? ' (using the assigned cover gradient)' : ''}`)
  return true
}

// ─── Variables export — Figma → JSON, works in any file ──────────────────────
// Serializes every LOCAL variable collection in the current file: collection →
// modes → variables with per-mode values. Colors become hex (#rrggbb, or
// #rrggbbaa when alpha < 1); aliases resolve to their concrete value and record
// the chain target in `aliasOf`. This is the reverse direction of the import —
// it reads whatever the file actually contains, Escala-made or not.

function rgbToHexStr(c: RGB | RGBA): string {
  const to = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0')
  const base = `#${to(c.r)}${to(c.g)}${to(c.b)}`
  const a = 'a' in c ? (c as RGBA).a : 1
  return a >= 1 ? base : `${base}${to(a)}`
}

interface ExportedVariable {
  name: string
  type: VariableResolvedDataType
  values: Record<string, unknown>
  aliasOf?: Record<string, string>
  description?: string
}

async function exportVariablesJson() {
  const allCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const skipped = allCollections.filter((c) => !PLUGIN_COLLECTION_NAMES.has(c.name)).map((c) => c.name)
  if (skipped.length > 0) {
    log(`ℹ Export skipped ${skipped.length} collection${skipped.length > 1 ? 's' : ''} not from this plugin (${skipped.slice(0, 4).join(', ')}${skipped.length > 4 ? '…' : ''}) — leftover names like a previous project are not the synced system`)
  }
  const collections = allCollections.filter((c) => PLUGIN_COLLECTION_NAMES.has(c.name))
  const variables = await figma.variables.getLocalVariablesAsync()
  const varById = new Map<string, Variable>(variables.map((v) => [v.id, v]))
  const colById = new Map<string, VariableCollection>(collections.map((c) => [c.id, c]))

  // Aliases routinely point at team-library variables that the local maps
  // don't contain. Pull those in by id (worklist — a remote variable can alias
  // further) so alias chains still resolve to concrete values.
  const pendingIds: string[] = []
  const seenIds = new Set<string>()
  const enqueueAlias = (value: VariableValue) => {
    if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'VARIABLE_ALIAS'
        && !varById.has(value.id) && !seenIds.has(value.id)) {
      seenIds.add(value.id)
      pendingIds.push(value.id)
    }
  }
  for (const v of variables) for (const raw of Object.values(v.valuesByMode)) enqueueAlias(raw)
  while (pendingIds.length > 0) {
    const id = pendingIds.pop()!
    try {
      const v = await figma.variables.getVariableByIdAsync(id)
      if (!v) continue
      varById.set(v.id, v)
      if (!colById.has(v.variableCollectionId)) {
        const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId)
        if (c) colById.set(c.id, c)
      }
      for (const raw of Object.values(v.valuesByMode)) enqueueAlias(raw)
    } catch { /* unresolvable remote — its aliases export as null */ }
  }

  // Follow alias chains to a concrete value (same mode when the target
  // collection has it, its default mode otherwise). Depth-capped so a broken
  // circular alias can't hang the export.
  function resolve(value: VariableValue, modeId: string, depth = 0): { value: unknown; alias?: string } {
    if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'VARIABLE_ALIAS') {
      const target = varById.get(value.id)
      if (!target || depth > 10) return { value: null }
      const tCol = colById.get(target.variableCollectionId)
      const tModeId = tCol?.modes.some((m) => m.modeId === modeId) ? modeId : tCol?.defaultModeId
      const raw = tModeId !== undefined ? target.valuesByMode[tModeId] : undefined
      const inner = raw === undefined ? { value: null as unknown } : resolve(raw, tModeId!, depth + 1)
      return { value: inner.value, alias: `${tCol?.name ?? '?'} / ${target.name}` }
    }
    if (typeof value === 'object' && value !== null && 'r' in value) return { value: rgbToHexStr(value) }
    return { value }
  }

  let total = 0
  const out = {
    source: 'Escala DS Sync — Figma plugin',
    file: figma.root.name,
    exportedAt: new Date().toISOString(),
    collections: collections.map((col) => {
      // Mode names key the values map — dedupe duplicates ("Mode", "Mode (2)").
      const modeName = new Map<string, string>()
      const used = new Set<string>()
      for (const m of col.modes) {
        let n = m.name || 'Mode'
        let i = 2
        while (used.has(n)) n = `${m.name} (${i++})`
        used.add(n)
        modeName.set(m.modeId, n)
      }
      const colVars = variables.filter((v) => v.variableCollectionId === col.id)
      total += colVars.length
      return {
        name: col.name,
        modes: col.modes.map((m) => modeName.get(m.modeId)!),
        variables: colVars.map((v): ExportedVariable => {
          const values: Record<string, unknown> = {}
          const aliasOf: Record<string, string> = {}
          for (const m of col.modes) {
            const raw = v.valuesByMode[m.modeId]
            const r = raw === undefined ? { value: null as unknown } : resolve(raw, m.modeId)
            values[modeName.get(m.modeId)!] = r.value
            if (r.alias) aliasOf[modeName.get(m.modeId)!] = r.alias
          }
          const entry: ExportedVariable = { name: v.name, type: v.resolvedType, values }
          if (Object.keys(aliasOf).length > 0) entry.aliasOf = aliasOf
          if (v.description) entry.description = v.description
          return entry
        }),
      }
    }),
  }
  return { data: out, total }
}

// ─── Main message handler ────────────────────────────────────────────────────

figma.showUI(__html__, { width: 880, height: 620, themeColors: true })

// Foundation pages always lead the page list — ⬡ Cover opens the file, then
// ⬡ Documentation and ⬡ Icons, followed by the "❖ Category / ↳ Component"
// catalog. Runs when the plugin opens and after every import, even a failed
// one, so the order holds no matter how the file got rearranged.
function ensureFoundationPageOrder() {
  let idx = 0
  for (const name of ['⬡ Cover', '⬡ Documentation', '⬡ Components Overview', '⬡ Icons']) {
    const foundation = figma.root.children.find((p) => p.name === name)
    if (foundation) figma.root.insertChild(idx++, foundation)
  }
}
ensureFoundationPageOrder()

// User-scoped (figma.clientStorage): tool PREFERENCES a person reasonably
// wants to carry between files, since they set them once per PLUGIN, not per
// file — check interval, which import phases to run, whether they've seen the
// guided walkthrough. Deliberately does NOT include the sync url or whether
// Live Sync should auto-resume: those name WHICH SYSTEM this file is
// connected to, and that used to live here too — the bug being fixed with
// FILE_SYNC_KEY below. Renamed from a comment that called url/autoStart
// "reasonable to carry" as well; in practice a brand-new file auto-starting
// another file's sync is not what "reasonable" means.
const SETTINGS_KEY = 'sd-sync-settings'

// File-scoped (figma.root.pluginData, stored INSIDE the .fig itself): the
// system actually imported into THIS file. clientStorage is scoped to the
// user across every file they open, so a brand-new empty file used to inherit
// whatever was last imported anywhere else — Overview showed a system that
// didn't exist in that file, and Export "from this file" would have exported
// a different file's tokens. figma.root is the one node guaranteed unique to
// this document.
const FILE_TOKENS_KEY = 'sd-file-tokens'
// Project names this file has imported. Used to drop leftover collections
// and styles named after a previous system (the old plugin named one
// collection after `tokens.project` — "Jasdy" stayed after a switch).
const FILE_PROJECTS_KEY = 'sd-file-projects'

// File-scoped, same reasoning as FILE_TOKENS_KEY but for the sync CONNECTION
// itself rather than its last payload. Reported bug: opening a brand-new file
// would immediately start Live Sync against whatever URL was last used in a
// DIFFERENT file, because the url/autoStart pair used to live in
// clientStorage (SETTINGS_KEY) alongside genuinely global preferences. A
// fresh file has no opinion on which system it syncs from until the person
// using it says so IN THAT FILE — so the connection now lives here instead,
// and only resumes automatically if this exact document was the one that
// started it.
const FILE_SYNC_KEY = 'sd-file-sync'

// The import timestamp travels WITH the tokens (one file-scoped record, one
// write) rather than as a separate field in the user-scoped settings object —
// that's where it used to live, which meant Overview's "last import" could
// show a time from a completely different file, same bug as the tokens
// themselves.
interface FileTokensRecord { tokens: DesignTokens; importedAt: string }
interface FileSyncRecord { url: string; autoStart: boolean }

function readFileTokens(): FileTokensRecord | null {
  try {
    const raw = figma.root.getPluginData(FILE_TOKENS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && parsed.tokens ? (parsed as FileTokensRecord) : null
  } catch {
    return null // corrupted or from an incompatible future version — treat as absent
  }
}

function readImportedProjects(): string[] {
  try {
    const raw = figma.root.getPluginData(FILE_PROJECTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string' && x.length > 0) : []
  } catch {
    return []
  }
}

function rememberImportedProject(name: string | undefined) {
  if (!name) return
  const prev = readImportedProjects()
  if (prev.includes(name)) return
  try {
    figma.root.setPluginData(FILE_PROJECTS_KEY, JSON.stringify([...prev, name].slice(-12)))
  } catch { /* pluginData ceiling — remembering is best-effort */ }
}

/** Collection / style prefixes this file may still hold from earlier imports. */
function leftoverProjectNames(currentProject: string): string[] {
  const names = new Set<string>()
  if (currentProject) names.add(currentProject)
  const stored = readFileTokens()?.tokens.project
  if (stored) names.add(stored)
  for (const p of readImportedProjects()) names.add(p)
  return [...names]
}

function inheritedStylePrefix(name: string): string | null {
  const parts = name.split('/')
  if (parts.length < 2) return null
  if (PLUGIN_STYLE_ROOTS.has(parts[0])) return null
  if ((INHERITED_STYLE_FOLDERS as readonly string[]).includes(parts[1])) return parts[0]
  return null
}

async function scanInheritedStylePrefixes(): Promise<string[]> {
  const found = new Set<string>()
  const note = (name: string) => {
    const p = inheritedStylePrefix(name)
    if (p) found.add(p)
  }
  for (const s of await figma.getLocalTextStylesAsync()) note(s.name)
  for (const s of await figma.getLocalPaintStylesAsync()) note(s.name)
  for (const s of await figma.getLocalEffectStylesAsync()) note(s.name)
  try {
    for (const s of await figma.getLocalGridStylesAsync()) note(s.name)
  } catch { /* grid styles API not on every plan */ }
  return [...found]
}

async function removeInheritedStyles(): Promise<number> {
  let dropped = 0
  const drop = (s: { name: string; remove(): void }) => {
    if (!inheritedStylePrefix(s.name)) return
    try { s.remove(); dropped++ } catch { /* still referenced */ }
  }
  for (const s of await figma.getLocalTextStylesAsync()) drop(s)
  for (const s of await figma.getLocalPaintStylesAsync()) drop(s)
  for (const s of await figma.getLocalEffectStylesAsync()) drop(s)
  try {
    for (const s of await figma.getLocalGridStylesAsync()) drop(s)
  } catch { /* grid styles API not on every plan */ }
  return dropped
}

function readDocsRev(): number {
  const n = parseInt(figma.root.getPluginData(FILE_DOCS_REV_KEY) || '0', 10)
  return Number.isFinite(n) ? n : 0
}

function writeDocsRev() {
  try { figma.root.setPluginData(FILE_DOCS_REV_KEY, String(DOCS_REV)) } catch { /* best-effort */ }
}

async function purgeInheritedCollections(currentProject: string) {
  const prefixes = new Set([
    ...leftoverProjectNames(currentProject),
    ...(await scanInheritedStylePrefixes()),
  ])
  // This file has been stuck on a leftover "Jasdy" collection across several
  // imports. If the payload is no longer that system, drop the name too.
  if (currentProject.trim().toLowerCase() !== 'jasdy') prefixes.add('Jasdy')
  const cols = await figma.variables.getLocalVariableCollectionsAsync()
  const vars = await figma.variables.getLocalVariablesAsync()
  const protectedNames = new Set<string>([...Object.values(COLLECTIONS), ...Object.values(ARCH_LABEL)])
  for (const col of cols) {
    if (protectedNames.has(col.name)) continue
    const named = prefixes.has(col.name) || (LEGACY_COLLECTIONS as string[]).indexOf(col.name) !== -1
    // Old plugin put the whole system in one collection named after the
    // project. Detect that shape even when we never recorded the name:
    // COLOR variables grouped Accent/01, Neutral/12, …
    const looksLikeLegacyDump = vars.some((v) =>
      v.variableCollectionId === col.id
      && v.resolvedType === 'COLOR'
      && /^(Accent|Neutral|State)\//.test(v.name),
    )
    if (!named && !looksLikeLegacyDump) continue
    const mine = vars.filter((v) => v.variableCollectionId === col.id)
    let droppedVars = 0
    for (const v of mine) {
      try { v.remove(); droppedVars++ } catch { /* still bound */ }
    }
    try {
      col.remove()
      log(`✓ Removed leftover "${col.name}" collection (${droppedVars} variables) after docs rebound`)
    } catch {
      log(`⚠ Leftover "${col.name}" still referenced — removed ${droppedVars}/${mine.length} variables`)
    }
  }
}

function writeFileTokens(tokens: DesignTokens) {
  try {
    const record: FileTokensRecord = { tokens, importedAt: new Date().toISOString() }
    figma.root.setPluginData(FILE_TOKENS_KEY, JSON.stringify(record))
    rememberImportedProject(tokens.project)
  } catch (err) {
    // setPluginData has a size ceiling (~100KB) — an unusually large system
    // (many themes/custom colors) could exceed it. The import itself already
    // succeeded; this only means Overview/Export won't remember it after the
    // file is closed and reopened.
    const m = err instanceof Error ? err.message : String(err)
    log(`⚠ Could not save this file's system for later (${m}) — the import itself is unaffected.`)
  }
}

function readFileSync(): FileSyncRecord | null {
  try {
    const raw = figma.root.getPluginData(FILE_SYNC_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && typeof parsed.url === 'string'
      ? (parsed as FileSyncRecord)
      : null
  } catch {
    return null
  }
}

function writeFileSync(url: string, autoStart: boolean) {
  try {
    const record: FileSyncRecord = { url, autoStart }
    figma.root.setPluginData(FILE_SYNC_KEY, JSON.stringify(record))
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err)
    log(`⚠ Could not save this file's sync connection (${m}).`)
  }
}

// Reset button: disconnects THIS file completely — clears the imported
// system and the sync connection, both file-scoped, so the file goes back to
// exactly the state a brand-new file starts in. Does not touch clientStorage:
// tool preferences (check interval, import scope, guide-seen) are the user's
// across every file and a reset here is about this document, not the plugin
// install.
function resetFile() {
  figma.root.setPluginData(FILE_TOKENS_KEY, '')
  figma.root.setPluginData(FILE_SYNC_KEY, '')
  figma.root.setPluginData(FILE_PROJECTS_KEY, '')
  figma.root.setPluginData(FILE_DOCS_REV_KEY, '')
}

// ─── What this file actually contains ────────────────────────────────────────
// Overview used to describe the SYSTEM (accent, typeface, themes) but never the
// FILE, so there was no way to see that e.g. the pages were missing — which is
// exactly the state a file lands in when it has only ever Live-Synced, since a
// sync refreshes variables and never builds pages. Reported as "the plugin
// isn't showing me Cover / Documentation / the sample sheet when it syncs".
//
// Deliberately cheap: it reads page NAMES off figma.root (already in memory,
// no loadAsync) and counts local variables. It must stay cheap because the UI
// asks for it on every open and after every import.
interface FileAssets {
  cover: boolean
  documentation: boolean
  sample: boolean
  icons: boolean
  variables: number
  collections: number
}

async function reportFileAssets(): Promise<FileAssets> {
  const names = new Set(figma.root.children.map((p) => p.name.trim()))
  let variables = 0
  let collections = 0
  try {
    variables = (await figma.variables.getLocalVariablesAsync()).length
    collections = (await figma.variables.getLocalVariableCollectionsAsync()).length
  } catch {
    // Variables API unavailable (older editor) — report zero rather than fail
    // the whole panel; the page flags below are still useful on their own.
  }
  return {
    cover: names.has('⬡ Cover'),
    documentation: names.has('⬡ Documentation'),
    sample: names.has('⬡ Components Overview'),
    icons: names.has('⬡ Icons'),
    variables,
    collections,
  }
}

figma.ui.onmessage = async (msg: {
  type: string
  tokens?: DesignTokens
  options?: ImportOptions
  settings?: unknown
  url?: string
  autoStart?: boolean
}) => {
  if (msg.type === 'ping') {
    figma.ui.postMessage({ type: 'pong' })
    return
  }

  if (msg.type === 'load-settings') {
    const settings = await figma.clientStorage.getAsync(SETTINGS_KEY)
    const record = readFileTokens()
    const fileSync = readFileSync()
    // The payload itself rides along (not just `hasTokens`) so the Overview can
    // render the connected system — accent ramp, typography, architecture —
    // without a network round-trip. It's the same object the Export button
    // already hands back, so no new storage and nothing extra to keep in sync.
    // `fileSync` is this document's OWN sync connection (url + whether it was
    // running) — the UI resumes Live Sync from this, never from `settings`.
    figma.ui.postMessage({
      type: 'settings',
      settings: settings ?? null,
      hasTokens: !!record,
      tokens: record?.tokens ?? null,
      tokensImportedAt: record?.importedAt ?? null,
      fileSync: fileSync ?? null,
      assets: await reportFileAssets(),
    })
    return
  }

  // Re-read what's in the file. The UI asks after every import and after every
  // sync, so Overview's "In this file" panel reflects reality rather than what
  // the last run intended to build.
  if (msg.type === 'report-assets') {
    figma.ui.postMessage({ type: 'assets', assets: await reportFileAssets() })
    return
  }

  // Persist THIS file's sync connection — see FILE_SYNC_KEY above. Written on
  // every start/stop and on every URL/field change so it can't drift from
  // what's actually running.
  if (msg.type === 'save-file-sync') {
    writeFileSync(typeof msg.url === 'string' ? msg.url : '', !!msg.autoStart)
    return
  }

  // Disconnect this file entirely — clears both the imported system and the
  // sync connection, file-scoped only. clientStorage (tool preferences) is
  // untouched, and no other file is affected.
  if (msg.type === 'reset-file') {
    resetFile()
    log('― File reset — this file has no connected system or sync ―')
    figma.ui.postMessage({ type: 'reset-file-done' })
    return
  }

  // Open the configurator in the user's browser. Figma shows its own
  // confirmation before leaving, and only ever from a real click — this is the
  // plugin's one door out to the web, used by the Overview's empty state and
  // its "Edit on the web" action.
  if (msg.type === 'open-external') {
    const url = typeof msg.url === 'string' ? msg.url : ''
    // https only: `openExternal` will happily take any scheme, and the URL is
    // built from stored payload values (project slug), not a constant.
    if (!/^https:\/\//i.test(url)) {
      log('✗ Refused to open a non-https URL')
      return
    }
    figma.openExternal(url)
    return
  }

  if (msg.type === 'save-settings') {
    if (msg.settings) await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings)
    return
  }

  // Figma → JSON: serialize this file's local variable collections. Works in
  // any file, whether or not it was built by this plugin.
  if (msg.type === 'export-variables') {
    try {
      const { data, total } = await exportVariablesJson()
      figma.ui.postMessage({ type: 'export-variables-data', data, total })
      if (total > 0) log(`✓ Exported ${total} variables from ${data.collections.length} collection${data.collections.length === 1 ? '' : 's'}`)
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err)
      log(`✗ Variables export failed: ${m}`)
      figma.ui.postMessage({ type: 'export-variables-data', data: null, total: 0 })
    }
    return
  }

  // Manual sync with the configurator: hand the UI the last imported payload
  // so it can be downloaded as a tokens.json file. Reads THIS file's own
  // record — a fresh file that never imported anything has nothing to export.
  if (msg.type === 'export-tokens') {
    figma.ui.postMessage({ type: 'export-tokens-data', tokens: readFileTokens()?.tokens ?? null })
    return
  }

  if (msg.type === 'import') {
    const { tokens, options } = msg
    if (!tokens || !options) return

    log(`― Starting import for "${tokens.project || 'Untitled'}" ―`)
    checkSchema(tokens)

    // The Artefacts feature (composed screens built from a few not-yet-solid
    // component builders) was pulled — an existing file can still carry the
    // page it left behind, orphaned nodes and all. Remove it on sight so
    // nothing from it lingers or gets mistaken for a component this plugin
    // still maintains.
    try {
      const staleArtefacts = figma.root.children.find((p) => p.name === '⬡ Artefacts')
      if (staleArtefacts) {
        staleArtefacts.remove()
        log('✓ Removed the retired "⬡ Artefacts" page')
      }
    } catch { /* best-effort cleanup */ }

    // Docs used to stay frozen on Live Sync (variables-only). After a plugin
    // update that adds Type/Spacing/Size/Stroke boards — or when this file
    // still carries a previous project's style folder (Jasdy/Type/…) — rebuild
    // Cover + Documentation even on a sync pass.
    const inheritedPrefixes = await scanInheritedStylePrefixes()
    const staleDocs = readDocsRev() < DOCS_REV
    let docsMustRebuild = inheritedPrefixes.length > 0 || staleDocs
    if (docsMustRebuild) {
      const why = inheritedPrefixes.length > 0
        ? `inherited project folder${inheritedPrefixes.length > 1 ? 's' : ''} ${inheritedPrefixes.join(', ')}`
        : 'documentation is from an older plugin'
      log(`↻ Documentation will rebuild — ${why}`)
    }

    // Guard a malformed/partial payload (hand-edited or stale tokens.json
    // missing a required field) — without this, a missing `typography`
    // threw inside importVariables and — since every phase used to share one
    // try/catch — silently aborted Components and Documentation too, even
    // though neither reads typography at that point.
    if (!tokens.typography || typeof tokens.typography !== 'object') {
      log(`⚠ Payload is missing "typography" — using a fallback (Inter, no custom sizes/weights).`)
      tokens.typography = { fontFamily: 'Inter', sizes: {}, weights: {} }
    } else {
      if (!tokens.typography.sizes) tokens.typography.sizes = {}
      if (!tokens.typography.weights) tokens.typography.weights = {}
    }

    let totalVars = 0
    let totalStyles = 0
    let totalComponents = 0
    let totalIcons = 0
    let totalDocs = 0
    let hasCover = false
    let hadError = false

    // Each phase runs independently — a failure in one (bad field, a plan's
    // mode-limit, a network hiccup fetching an icon) is logged and skipped,
    // but never blocks the others. Components and Documentation are
    // unrelated to Variables/Styles and should still import even if those fail.
    // Phases that will actually run, so "step 2 of 5" counts the real work
    // instead of always claiming 6.
    // Icons used to ride on `importComponents`, so asking for the sample sheet
    // also meant generating 117 icon sets × 3 sizes = 351 SVG components plus
    // an Iconify network fetch. It has its own flag now, OFF by default (see
    // ui.html's scope cards) — the `icons.library` token still ships as a
    // variable either way, this only controls generating the components.
    // Each falls back to the combined importDocs flag when its own is absent,
    // so a caller that never heard of importCover/importDocumentation (the
    // Import panel) still gets its old all-or-nothing behavior.
    // `let`, not `const`: a semantics rebuild switches these on mid-run (see
    // the escalation right after the Variables phase).
    let wantComponents = options.importComponents
    let wantCover = options.importCover ?? (options.importDocs !== false)
    let wantDocumentation = options.importDocumentation ?? (options.importDocs !== false)

    const planned = [
      options.importVariables && 'Variables',
      options.importStyles && 'Styles',
      wantComponents && 'Components',
      options.importIcons && 'Icons',
      wantCover && 'Cover',
      wantDocumentation && 'Documentation',
    ].filter(Boolean) as string[]
    let phaseIdx = 0

    async function phase(name: string, run: () => Promise<void>) {
      // Announce BEFORE the work: a phase that takes 20s should say what it's
      // doing for those 20s, not after they're over.
      progress(name, phaseIdx, planned.length)
      // Let the UI paint the new phase label before the thread is taken again.
      await yieldToUI()
      try {
        await run()
      } catch (err) {
        hadError = true
        const m = err instanceof Error ? err.message : String(err)
        log(`✗ ${name} failed: ${m}`)
      }
      phaseIdx++
      progress(name, phaseIdx, planned.length)
      await yieldToUI()
    }

    try {
      if (options.importVariables) {
        await phase('Variables', async () => { totalVars = await importVariables(tokens) })

        // ── Recalibration ────────────────────────────────────────────────────
        // The semantic variables were recreated (the system moved to another
        // architecture, or its token set/order changed — see the order check in
        // importVariables). Every fill, stroke and radius in this file that was
        // bound to one of them now points at a variable that no longer exists:
        // Figma keeps painting the last resolved colour, so nothing LOOKS
        // broken, and the next theme switch quietly does nothing.
        //
        // A Live Sync pass asks for Variables + Styles only, which is right for
        // a colour tweak and wrong for this. So the import escalates itself and
        // redraws what it draws — components, cover, boards — rebinding
        // everything to the new system. Icons are deliberately left out: their
        // generation is the slowest phase by far (351 components + a network
        // fetch) and re-running it skips existing sets anyway, so it would cost
        // minutes and rebind nothing. Re-run Import with the Icon library
        // ticked when the icon tint needs to follow too.
        if (semanticsRebuilt || foundationsRebuilt || docsMustRebuild) {
          const added: string[] = []
          if (semanticsRebuilt && !wantComponents) { wantComponents = true; added.push('Components') }
          if (!wantCover) { wantCover = true; added.push('Cover') }
          if (!wantDocumentation) { wantDocumentation = true; added.push('Documentation') }
          if (added.length > 0) {
            planned.push(...added)
            const why = semanticsRebuilt
              ? 'the new semantic variables'
              : docsMustRebuild
                ? 'updated documentation (roles + leftover project folders)'
                : 'the restacked Spacing / Radius / Type collections'
            log(`↻ Recalibrating: ${added.join(', ')} rebuilt too, so everything binds to ${why}`)
          }
        }
      }
      if (options.importStyles) {
        await phase('Styles', async () => { totalStyles = await importStyles(tokens) })
      }
      if (wantComponents) {
        await phase('Components', async () => { totalComponents = await importSample(tokens) })
      }
      if (options.importIcons) {
        await phase('Icons', async () => { totalIcons = await importIcons(tokens) })
      }
      if (wantCover) {
        await phase('Cover', async () => { hasCover = await importCover(tokens) })
      }
      if (wantDocumentation) {
        await phase('Documentation', async () => { totalDocs = await importDocumentation(tokens) })
        writeDocsRev()
      }

      // Leftover project-named collections (Jasdy, …) stay referenced while
      // old docs still bind to them. Purge AFTER Cover/Docs/Components so
      // those bindings are gone and the remove can succeed.
      await purgeInheritedCollections(tokens.project || '')

      // Keep the payload for manual export and Overview — scoped to THIS file
      // (see writeFileTokens), so it survives restarts without leaking into
      // any other file the user opens with the plugin.
      writeFileTokens(tokens)

      const summary = [
        totalVars      > 0 ? `${totalVars} variables`     : null,
        totalStyles    > 0 ? `${totalStyles} styles`       : null,
        totalComponents > 0 ? `${totalComponents} components` : null,
        totalIcons     > 0 ? `${totalIcons} icons`         : null,
        hasCover           ? 'cover'                       : null,
        totalDocs      > 0 ? `docs (${totalDocs} boards)`  : null,
      ].filter(Boolean).join(' · ')

      log(`― Done${summary ? `: ${summary}` : ''}${hadError ? ' — some phases failed, see ✗ lines above' : ''} ―`)
      figma.ui.postMessage({ type: 'done', summary })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log(`✗ Error: ${msg}`)
      figma.ui.postMessage({ type: 'error', message: msg })
    } finally {
      ensureFoundationPageOrder()
    }
  }

  if (msg.type === 'close') {
    figma.closePlugin()
  }
}
