"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/code.ts
  function normHex(hex) {
    let h = hex.trim().toLowerCase().replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return h.slice(0, 6);
  }
  function hexToRgb(hex) {
    const clean = normHex(hex);
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return { r, g, b };
  }
  function hexToRgba(hex) {
    const h = hex.trim().toLowerCase().replace("#", "");
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return __spreadProps(__spreadValues({}, hexToRgb(hex)), { a });
  }
  function rgbaToHex(c) {
    const ch = (n) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, "0");
    return `${ch(c.r)}${ch(c.g)}${ch(c.b)}`;
  }
  function rgbaToHex8(c) {
    const ch = (n) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, "0");
    return `${rgbaToHex(c)}${ch(c.a)}`;
  }
  function pxToFloat(val) {
    return parseFloat(val.replace("px", "").replace("rem", "")) || 0;
  }
  function normalizeFontFamilyName(raw) {
    if (!raw || typeof raw !== "string") return "Inter";
    const trimmed = raw.trim();
    if (!trimmed) return "Inter";
    const quoted = /^['"]([^'"]+)['"]/.exec(trimmed);
    if (quoted == null ? void 0 : quoted[1]) return quoted[1].trim();
    const first = trimmed.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
    return first || "Inter";
  }
  function collectSystemFontFamilies(tokens) {
    var _a, _b, _c, _d, _e;
    const out = [];
    const add = (raw) => {
      if (!raw) return;
      const n = normalizeFontFamilyName(raw);
      if (n && !out.includes(n)) out.push(n);
    };
    add((_a = tokens.typography) == null ? void 0 : _a.fontFamily);
    add((_b = tokens.typography) == null ? void 0 : _b.headingFontFamily);
    for (const entry of Object.values((_c = tokens.foundationsByTheme) != null ? _c : {})) {
      add((_d = entry.typography) == null ? void 0 : _d.fontFamily);
      add((_e = entry.typography) == null ? void 0 : _e.headingFontFamily);
    }
    return out;
  }
  function previewTypography(tokens) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const root = tokens.typography;
    const fb = tokens.foundationsByTheme;
    if (!fb) return root;
    const order = (_a = tokens.colors.themeOrder) != null ? _a : [];
    const active = activeThemeKey(tokens);
    const key = (_d = (_c = active && ((_b = fb[active]) == null ? void 0 : _b.typography) ? active : void 0) != null ? _c : order.find((k) => {
      var _a2;
      return (_a2 = fb[k]) == null ? void 0 : _a2.typography;
    })) != null ? _d : Object.keys(fb).find((k) => {
      var _a2;
      return (_a2 = fb[k]) == null ? void 0 : _a2.typography;
    });
    const over = key ? (_e = fb[key]) == null ? void 0 : _e.typography : void 0;
    if (!over) return root;
    return __spreadProps(__spreadValues(__spreadValues({}, root), over), {
      fontFamily: (_f = over.fontFamily) != null ? _f : root.fontFamily,
      headingFontFamily: (_h = (_g = over.headingFontFamily) != null ? _g : over.fontFamily) != null ? _h : root.headingFontFamily,
      sizes: (_i = over.sizes) != null ? _i : root.sizes,
      lineHeights: (_j = over.lineHeights) != null ? _j : root.lineHeights,
      weights: (_k = over.weights) != null ? _k : root.weights,
      roles: (_l = over.roles) != null ? _l : root.roles
    });
  }
  function previewRadius(tokens) {
    var _a, _b, _c, _d, _e, _f, _g;
    const root = (_a = tokens.radius) != null ? _a : {};
    const rootRoles = tokens.radiusRoles;
    const fb = tokens.foundationsByTheme;
    if (!fb) return { radius: root, radiusRoles: rootRoles };
    const order = (_b = tokens.colors.themeOrder) != null ? _b : [];
    const keys = [...order.filter((k) => fb[k]), ...Object.keys(fb).filter((k) => !order.includes(k))];
    const active = activeThemeKey(tokens);
    const rootSig = JSON.stringify(rootRoles != null ? rootRoles : null);
    const key = (_e = (_d = (_c = active && fb[active] && (fb[active].radius || fb[active].radiusRoles) ? active : void 0) != null ? _c : keys.find((k) => {
      var _a2, _b2;
      return JSON.stringify((_b2 = (_a2 = fb[k]) == null ? void 0 : _a2.radiusRoles) != null ? _b2 : null) !== rootSig;
    })) != null ? _d : keys.find((k) => {
      var _a2, _b2;
      return ((_a2 = fb[k]) == null ? void 0 : _a2.radius) || ((_b2 = fb[k]) == null ? void 0 : _b2.radiusRoles);
    })) != null ? _e : keys[0];
    const over = key ? fb[key] : void 0;
    return {
      radius: (_f = over == null ? void 0 : over.radius) != null ? _f : root,
      radiusRoles: (_g = over == null ? void 0 : over.radiusRoles) != null ? _g : rootRoles
    };
  }
  function varStringAt(v, modeId) {
    const val = v.valuesByMode[modeId];
    return typeof val === "string" ? val : void 0;
  }
  var STYLE_PREF = {
    "Regular": ["Regular", "Normal", "Book", "Roman"],
    "Medium": ["Medium", "Regular", "Book"],
    "Semi Bold": ["Semi Bold", "SemiBold", "Semibold", "Demi Bold", "DemiBold", "Demi", "Bold", "Medium"],
    "Bold": ["Bold", "Semi Bold", "SemiBold", "Black", "Heavy", "Extra Bold", "ExtraBold", "Medium"]
  };
  var TYPOGRAPHY_FAMILY_VARS = {
    body: "font-family-body",
    display: "font-family-display",
    // Names emitted by pre-role plugin builds. They are only maintained when a
    // file already has them, preserving existing variable bindings on upgrade.
    legacyBody: "family",
    legacyDisplay: "heading-family"
  };
  async function createFontResolver(tokens) {
    var _a;
    const preview = previewTypography(tokens);
    const bodyFamily = normalizeFontFamilyName(preview.fontFamily);
    const headingFamily = normalizeFontFamilyName((_a = preview.headingFontFamily) != null ? _a : bodyFamily);
    const stylesByFamily = /* @__PURE__ */ new Map();
    try {
      for (const f of await figma.listAvailableFontsAsync()) {
        let s = stylesByFamily.get(f.fontName.family);
        if (!s) {
          s = /* @__PURE__ */ new Set();
          stylesByFamily.set(f.fontName.family, s);
        }
        s.add(f.fontName.style);
      }
    } catch (e) {
    }
    const resolvedFont = /* @__PURE__ */ new Map();
    const pick = (fam, logical) => {
      var _a2;
      const have = stylesByFamily.get(fam);
      if (!have) return void 0;
      for (const cand of STYLE_PREF[logical]) if (have.has(cand)) return cand;
      return (_a2 = [...have].find((st) => !/italic|oblique/i.test(st))) != null ? _a2 : [...have][0];
    };
    async function loadLogical(family, logical) {
      var _a2;
      const key = `${family}|${logical}`;
      if (resolvedFont.has(key)) return;
      const wantStyle = pick(family, logical);
      if (wantStyle) {
        try {
          await figma.loadFontAsync({ family, style: wantStyle });
          resolvedFont.set(key, { family, style: wantStyle });
          return;
        } catch (e) {
        }
      }
      const interStyle = (_a2 = pick("Inter", logical)) != null ? _a2 : "Regular";
      try {
        await figma.loadFontAsync({ family: "Inter", style: interStyle });
      } catch (e) {
      }
      resolvedFont.set(key, { family: "Inter", style: interStyle });
    }
    const families = collectSystemFontFamilies(tokens);
    for (const family of families) {
      for (const logical of ["Regular", "Medium", "Semi Bold", "Bold"]) await loadLogical(family, logical);
    }
    const loadedFamilies = /* @__PURE__ */ new Set();
    for (const family of families) {
      if ([...resolvedFont.entries()].some(([k, fn]) => k.startsWith(`${family}|`) && fn.family === family)) {
        loadedFamilies.add(family);
      }
    }
    return {
      bodyFamily,
      headingFamily,
      loadedFamilies,
      fontFor: (style, heading = false) => {
        var _a2;
        return (_a2 = resolvedFont.get(`${heading ? headingFamily : bodyFamily}|${style}`)) != null ? _a2 : { family: "Inter", style };
      }
    };
  }
  async function warnUnavailableSystemFonts(tokens) {
    const available = /* @__PURE__ */ new Set();
    try {
      for (const f of await figma.listAvailableFontsAsync()) available.add(f.fontName.family);
    } catch (e) {
      log("\u26A0 Could not inspect fonts available in this Figma workspace; Typography values were still synced from the system.");
      return;
    }
    for (const family of collectSystemFontFamilies(tokens)) {
      if (!available.has(family)) {
        log(`\u26A0 Font family "${family}" is not available in this Figma workspace. The system value was kept in Typography; install or enable the font, then sync again to render generated text with it.`);
      }
    }
  }
  function weightKeyFromStyle(style) {
    if (style === "Bold") return "bold";
    if (style === "Semi Bold") return "semibold";
    if (style === "Medium") return "medium";
    return "regular";
  }
  function nearestTypeSizeKey(sizes, px) {
    if (!sizes || !px) return void 0;
    let best;
    let bestD = Infinity;
    for (const [key, val] of Object.entries(sizes)) {
      const d = Math.abs(pxToFloat(val) - px);
      if (d < bestD) {
        bestD = d;
        best = key;
      }
    }
    return best;
  }
  function bindAllTextFields(t, typo, opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const family = opts.roleKey ? (_d = (_c = (_b = typo.get(`role/${opts.roleKey}/family`)) != null ? _b : opts.heading ? (_a = typo.get(TYPOGRAPHY_FAMILY_VARS.display)) != null ? _a : typo.get(TYPOGRAPHY_FAMILY_VARS.legacyDisplay) : void 0) != null ? _c : typo.get(TYPOGRAPHY_FAMILY_VARS.body)) != null ? _d : typo.get(TYPOGRAPHY_FAMILY_VARS.legacyBody) : opts.heading ? (_g = (_f = (_e = typo.get(TYPOGRAPHY_FAMILY_VARS.display)) != null ? _e : typo.get(TYPOGRAPHY_FAMILY_VARS.legacyDisplay)) != null ? _f : typo.get(TYPOGRAPHY_FAMILY_VARS.body)) != null ? _g : typo.get(TYPOGRAPHY_FAMILY_VARS.legacyBody) : (_h = typo.get(TYPOGRAPHY_FAMILY_VARS.body)) != null ? _h : typo.get(TYPOGRAPHY_FAMILY_VARS.legacyBody);
    if (family) {
      try {
        t.setBoundVariable("fontFamily", family);
      } catch (e) {
      }
    }
    const sizeVar = (_i = opts.roleKey ? typo.get(`role/${opts.roleKey}/size`) : void 0) != null ? _i : opts.sizeKey ? typo.get(`size/${opts.sizeKey}`) : void 0;
    if (sizeVar) {
      try {
        t.setBoundVariable("fontSize", sizeVar);
      } catch (e) {
      }
    }
    const weightVar = (_k = (_j = opts.roleKey ? typo.get(`role/${opts.roleKey}/weight`) : void 0) != null ? _j : opts.weightKey ? typo.get(`weight/${opts.weightKey}`) : void 0) != null ? _k : typo.get("weight/regular");
    if (weightVar) {
      try {
        t.setBoundVariable("fontWeight", weightVar);
      } catch (e) {
      }
    }
    const lh = opts.sizeKey ? typo.get(`line-height/${opts.sizeKey}`) : void 0;
    if (lh) {
      try {
        t.setBoundVariable("lineHeight", lh);
      } catch (e) {
      }
    }
    const ls = opts.sizeKey ? typo.get(`letter-spacing/${opts.sizeKey}`) : void 0;
    if (ls) {
      try {
        t.setBoundVariable("letterSpacing", ls);
      } catch (e) {
      }
    }
  }
  async function typoVarMap() {
    const m = /* @__PURE__ */ new Map();
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const col = cols.find((c) => c.name === COLLECTIONS.typography);
    if (!col) return m;
    for (const v of await figma.variables.getLocalVariablesAsync()) {
      if (v.variableCollectionId === col.id) m.set(v.name, v);
    }
    return m;
  }
  function log(msg) {
    figma.ui.postMessage({ type: "log", message: msg });
  }
  function yieldToUI() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  function progress(phase, done, total, label) {
    figma.ui.postMessage({ type: "progress", phase, done, total, label });
  }
  function fetchWithTimeout(url, ms = 15e3) {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Request timed out after ${Math.round(ms / 1e3)}s`)), ms))
    ]);
  }
  var SUPPORTED_SCHEMA_VERSION = 7;
  function checkSchema(tokens) {
    const v = tokens.schemaVersion;
    if (typeof v === "number" && v > SUPPORTED_SCHEMA_VERSION) {
      log(`\u26A0 Token schema v${v} is newer than this plugin supports (v${SUPPORTED_SCHEMA_VERSION}) \u2014 update the plugin if anything looks off.`);
    }
  }
  var COLLECTIONS = {
    primitives: "Color Primitives",
    semantics: "Color Semantics",
    typography: "Typography",
    spacing: "Spacing",
    radius: "Radius",
    border: "Border",
    opacity: "Opacity",
    size: "Size",
    selector: "Selector",
    grid: "Grid",
    icons: "Icons",
    copy: "Copy"
  };
  var PLUGIN_COLLECTION_NAMES = new Set(Object.values(COLLECTIONS));
  var PLUGIN_STYLE_ROOTS = /* @__PURE__ */ new Set(["Type", "Shadow", "Gradient", "Grid"]);
  var INHERITED_STYLE_FOLDERS = ["Type", "Shadow", "Gradient", "Grid", "Scale", "Semantic"];
  var DOCS_REV = 11;
  var FILE_DOCS_REV_KEY = "sd-docs-rev";
  var FILE_PRIMITIVES_HIDDEN_KEY = "sd-primitives-hidden-v1";
  var FILE_SEM_ORDER_STUCK_KEY = "sd-sem-order-stuck";
  var FILE_INHERITED_BLOCKED_KEY = "sd-inherited-blocked";
  var FILE_PROJECT_NAME_KEY = "sd-file-project-name";
  function orderFingerprint(names) {
    let h = 2166136261;
    const s = names.join(" ");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return `${names.length}:${(h >>> 0).toString(36)}`;
  }
  function collectionPanelOrder(tokens) {
    var _a, _b;
    const rest = [
      { name: COLLECTIONS.border, include: !!(tokens.stroke || ((_a = tokens.borders) == null ? void 0 : _a.width)) },
      { name: COLLECTIONS.copy, include: !!tokens.copy },
      { name: COLLECTIONS.grid, include: !!tokens.grid },
      { name: COLLECTIONS.icons, include: !!((_b = tokens.icons) == null ? void 0 : _b.library) },
      { name: COLLECTIONS.opacity, include: !!tokens.opacity },
      { name: COLLECTIONS.radius, include: true },
      { name: COLLECTIONS.selector, include: !!tokens.selector },
      { name: COLLECTIONS.size, include: !!tokens.sizes },
      { name: COLLECTIONS.spacing, include: true },
      { name: COLLECTIONS.typography, include: true }
    ];
    rest.sort((a, b) => a.name.localeCompare(b.name));
    return [
      COLLECTIONS.semantics,
      COLLECTIONS.primitives,
      ...rest.filter((r) => r.include).map((r) => r.name)
    ];
  }
  function semanticVarName(key) {
    const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    const dash = kebab.indexOf("-");
    return dash === -1 ? kebab : `${kebab.slice(0, dash)}/${kebab.slice(dash + 1)}`;
  }
  function figmaVarName(name) {
    const slashed = name.replace(/\./g, "/");
    const first = slashed.split("/")[0];
    return /^\d/.test(first) ? `step/${slashed}` : slashed;
  }
  function archFigmaName(groupLabel, key) {
    return figmaVarName(`${groupLabel}/${key}`);
  }
  function scopesForSemantic(_name) {
    return ["ALL_SCOPES"];
  }
  function scopesForCollection(collName, varName) {
    switch (collName) {
      // Ramps exist only to back aliases — empty scopes keeps them out of every
      // fill/stroke/effect picker. Semantics (above) stay ALL_SCOPES.
      case COLLECTIONS.primitives:
        return [];
      case COLLECTIONS.spacing:
        return ["GAP", "WIDTH_HEIGHT"];
      case COLLECTIONS.radius:
        return ["CORNER_RADIUS"];
      case COLLECTIONS.border:
        return ["STROKE_FLOAT"];
      case COLLECTIONS.size:
        return ["WIDTH_HEIGHT"];
      case COLLECTIONS.selector:
        return ["WIDTH_HEIGHT"];
      case COLLECTIONS.opacity:
        return ["OPACITY"];
      case COLLECTIONS.grid:
        return ["WIDTH_HEIGHT"];
      case COLLECTIONS.typography: {
        if (varName.startsWith("size/") || varName.endsWith("/size")) return ["FONT_SIZE"];
        if (varName.startsWith("weight/") || varName.endsWith("/weight")) return ["FONT_WEIGHT"];
        if (varName.startsWith("line-height/")) return ["LINE_HEIGHT"];
        if (varName.startsWith("letter-spacing/")) return ["LETTER_SPACING"];
        if (varName === TYPOGRAPHY_FAMILY_VARS.body || varName === TYPOGRAPHY_FAMILY_VARS.display || varName === TYPOGRAPHY_FAMILY_VARS.legacyBody || varName === TYPOGRAPHY_FAMILY_VARS.legacyDisplay || varName.endsWith("/family")) return ["FONT_FAMILY"];
        return void 0;
      }
      default:
        return void 0;
    }
  }
  var PRIMITIVE_GROUPS = {
    accent: "Accent",
    brand: "Accent",
    "accent-dark": "Accent Dark",
    "brand-dark": "Accent Dark",
    neutral: "Neutral",
    gray: "Neutral",
    "neutral-dark": "Neutral Dark",
    "gray-dark": "Neutral Dark",
    error: "States/Error",
    "error-dark": "States/Error Dark",
    success: "States/Success",
    "success-dark": "States/Success Dark",
    warning: "States/Warning",
    "warning-dark": "States/Warning Dark",
    info: "States/Info",
    "info-dark": "States/Info Dark"
  };
  var namingCtx;
  var STATE_SLOT_SEGS = /* @__PURE__ */ new Set(["error", "warning", "success", "info"]);
  var STATE_SLOT_RANK = { error: 0, warning: 1, success: 2, info: 3 };
  var SLOT_FOLDER_RANK = {
    Accents: 0,
    Neutrals: 1,
    States: 2
  };
  function familyBaseKey(family) {
    let base = family;
    if (base.endsWith("-dark")) base = base.slice(0, -5);
    if (base.endsWith("-a") && base !== "black-a" && base !== "white-a") base = base.slice(0, -2);
    return base;
  }
  function slotFolderFor(family) {
    var _a;
    const raw = familyBaseKey(family);
    if (raw === "black-a" || raw === "white-a" || raw === "black" || raw === "white") return "Neutrals";
    if (raw === "accent" || raw === "brand") return "Accents";
    if (raw === "neutral" || raw === "gray") return "Neutrals";
    if (STATE_SLOT_SEGS.has(raw)) return "States";
    const stripped = raw.replace(/-\d+$/, "");
    const seg = (_a = stripped.split("-").pop()) != null ? _a : "";
    if (seg === "gray") return "Neutrals";
    if (STATE_SLOT_SEGS.has(seg)) return "States";
    return "Accents";
  }
  function stateSlotLabel(family) {
    var _a;
    const raw = familyBaseKey(family);
    if (STATE_SLOT_SEGS.has(raw)) return raw.charAt(0).toUpperCase() + raw.slice(1);
    const stripped = raw.replace(/-\d+$/, "");
    const seg = (_a = stripped.split("-").pop()) != null ? _a : "";
    if (STATE_SLOT_SEGS.has(seg)) return seg.charAt(0).toUpperCase() + seg.slice(1);
    return void 0;
  }
  function themesUsingFamily(family, tokens = namingCtx) {
    var _a, _b;
    if (!tokens) return [];
    const base = familyBaseKey(family);
    const sources = (_a = tokens.colors.themeSources) != null ? _a : {};
    const order = (_b = tokens.colors.themeOrder) != null ? _b : [];
    return order.filter((t) => {
      const src = sources[t];
      if (!src) return false;
      return Object.values(src).includes(base);
    });
  }
  function uniqueThemeForFamily(family, tokens = namingCtx) {
    const hits = themesUsingFamily(family, tokens);
    return hits.length === 1 ? hits[0] : void 0;
  }
  function shippedThemeLabel(key, tokens = namingCtx) {
    var _a, _b;
    const labeled = (_b = (_a = tokens == null ? void 0 : tokens.colors.themeLabels) == null ? void 0 : _a[key]) == null ? void 0 : _b.trim();
    if (labeled) return labeled;
    if (key === "light") return "Light";
    if (key === "dark") return "Dark";
    return key.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  function primitiveSortTuple(flatKey, tokens = namingCtx) {
    var _a, _b, _c, _d;
    const dash = flatKey.lastIndexOf("-");
    const fam = dash === -1 ? flatKey : flatKey.slice(0, dash);
    const tone = parseInt(flatKey.slice(dash + 1), 10) || 0;
    const folder = SLOT_FOLDER_RANK[slotFolderFor(fam)];
    const order = (_a = tokens == null ? void 0 : tokens.colors.themeOrder) != null ? _a : [];
    const owners = themesUsingFamily(fam, tokens);
    const themeIdx = owners.length === 1 ? order.indexOf(owners[0]) : -1;
    const slot = (_c = (_b = stateSlotLabel(fam)) == null ? void 0 : _b.toLowerCase()) != null ? _c : "";
    const slotRank = (_d = STATE_SLOT_RANK[slot]) != null ? _d : 0;
    const dark = fam.endsWith("-dark") ? 1 : 0;
    return [folder, themeIdx, slotRank, dark, fam, tone];
  }
  function comparePrimitiveKeys(a, b) {
    const A = primitiveSortTuple(a);
    const B = primitiveSortTuple(b);
    for (let i = 0; i < 4; i++) {
      if (A[i] !== B[i]) return A[i] - B[i];
    }
    if (A[4] !== B[4]) return A[4].localeCompare(B[4]);
    return A[5] - B[5];
  }
  function titleCaseFamily(family) {
    return family.replace(/-+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  function primitiveGroupFor(family) {
    var _a, _b;
    const slot = stateSlotLabel(family);
    if (slot) {
      const dark = family.endsWith("-dark");
      const folder = dark ? `${slot} Dark` : slot;
      const theme = uniqueThemeForFamily(family);
      if (theme && ((_b = (_a = namingCtx == null ? void 0 : namingCtx.colors.themeOrder) == null ? void 0 : _a.length) != null ? _b : 0) > 1) {
        return `States/${shippedThemeLabel(theme)}/${folder}`;
      }
      if (PRIMITIVE_GROUPS[family]) return PRIMITIVE_GROUPS[family];
      return `States/${folder}`;
    }
    if (PRIMITIVE_GROUPS[family]) return `${slotFolderFor(family)}/${PRIMITIVE_GROUPS[family]}`;
    if (family.includes("/")) {
      return family.split("/").map((seg) => {
        var _a2;
        return (_a2 = PRIMITIVE_GROUPS[seg]) != null ? _a2 : seg.charAt(0).toUpperCase() + seg.slice(1);
      }).join("/");
    }
    return `${slotFolderFor(family)}/${titleCaseFamily(family)}`;
  }
  function primitiveVarName(key) {
    const dash = key.lastIndexOf("-");
    if (dash === -1) return key;
    const family = key.slice(0, dash);
    const tone = key.slice(dash + 1);
    const paddedTone = /^\d$/.test(tone) ? `0${tone}` : tone;
    return `${primitiveGroupFor(family)}/${paddedTone}`;
  }
  function legacyPrimitiveVarName(key) {
    var _a;
    const dash = key.lastIndexOf("-");
    if (dash === -1) return key;
    const family = key.slice(0, dash);
    const tone = key.slice(dash + 1);
    const group = (_a = PRIMITIVE_GROUPS[family]) != null ? _a : family.split("/").map((seg) => {
      var _a2;
      return (_a2 = PRIMITIVE_GROUPS[seg]) != null ? _a2 : seg.charAt(0).toUpperCase() + seg.slice(1);
    }).join("/");
    const paddedTone = /^\d$/.test(tone) ? `0${tone}` : tone;
    return `${group}/${paddedTone}`;
  }
  function previousPrimitiveVarNames(key) {
    const dash = key.lastIndexOf("-");
    if (dash === -1) return [];
    const family = key.slice(0, dash);
    const tone = key.slice(dash + 1);
    const padded = /^\d$/.test(tone) ? `0${tone}` : tone;
    const names = /* @__PURE__ */ new Set([legacyPrimitiveVarName(key)]);
    names.add(`${slotFolderFor(family)}/${titleCaseFamily(family)}/${padded}`);
    const slot = stateSlotLabel(family);
    if (slot) {
      const folder = family.endsWith("-dark") ? `${slot} Dark` : slot;
      names.add(`States/${titleCaseFamily(family)}/${padded}`);
      names.add(`States/${folder}/${padded}`);
    }
    return [...names];
  }
  function previousPrimitiveAlphaVarNames(key) {
    const names = /* @__PURE__ */ new Set([legacyPrimitiveAlphaVarName(key)]);
    for (const solid of previousPrimitiveVarNames(key)) {
      const slash = solid.lastIndexOf("/");
      names.add(slash === -1 ? `Alpha/${solid}` : `${solid.slice(0, slash)}/Alpha/${solid.slice(slash + 1)}`);
    }
    return [...names];
  }
  function primitiveAlphaVarName(key) {
    const neutralLadder = /^(black|white)-a-\d+$/.exec(key);
    if (neutralLadder) {
      const dash = key.lastIndexOf("-");
      const tone = key.slice(dash + 1);
      const paddedTone = /^\d$/.test(tone) ? `0${tone}` : tone;
      return `Neutrals/${neutralLadder[1] === "black" ? "Black" : "White"} Alpha/${paddedTone}`;
    }
    const solid = primitiveVarName(key);
    const slash = solid.lastIndexOf("/");
    if (slash === -1) return `Alpha/${solid}`;
    return `${solid.slice(0, slash)}/Alpha/${solid.slice(slash + 1)}`;
  }
  function legacyPrimitiveAlphaVarName(key) {
    const neutralLadder = /^(black|white)-a-\d+$/.exec(key);
    if (neutralLadder) {
      const dash = key.lastIndexOf("-");
      const tone = key.slice(dash + 1);
      const paddedTone = /^\d$/.test(tone) ? `0${tone}` : tone;
      return `${neutralLadder[1] === "black" ? "Black" : "White"} Alpha/${paddedTone}`;
    }
    const solid = legacyPrimitiveVarName(key);
    const slash = solid.lastIndexOf("/");
    if (slash === -1) return `Alpha/${solid}`;
    return `${solid.slice(0, slash)}/Alpha/${solid.slice(slash + 1)}`;
  }
  function primitiveFamilies(prim) {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const k of Object.keys(prim)) {
      const m = /^(.+)-(\d+)$/.exec(k);
      if (!m || seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push(m[1]);
    }
    return out;
  }
  function familyToneHex(prim, family, tones) {
    for (const t of tones) {
      const hex = prim[`${family}-${t}`];
      if (hex) return hex;
    }
    return void 0;
  }
  function pickThemeString(node, theme) {
    if (typeof node === "string") return node;
    if (!node || typeof node !== "object") return void 0;
    const rec = node;
    for (const key of [theme, "light", "dark"]) {
      if (typeof rec[key] === "string") return rec[key];
    }
    for (const v of Object.values(rec)) {
      if (typeof v === "string") return v;
    }
    return void 0;
  }
  function archLeafValue(tokens, group, key, theme) {
    var _a;
    const groups = (_a = tokens.colors.architecture) == null ? void 0 : _a.tokens;
    if (!groups || typeof groups !== "object") return void 0;
    const g = groups[group];
    if (!g || typeof g !== "object") return void 0;
    if (g[key] !== void 0) return pickThemeString(g[key], theme);
    let cur = g;
    for (const seg of key.split(".")) {
      if (!cur || typeof cur !== "object") return void 0;
      cur = cur[seg];
    }
    return pickThemeString(cur, theme);
  }
  function architectureSolidValue(tokens, theme) {
    var _a, _b, _c;
    const kind = (_a = tokens.colors.architecture) == null ? void 0 : _a.kind;
    if (kind === "astryx") return archLeafValue(tokens, "accent", "solid", theme);
    if (kind === "shadcn") return archLeafValue(tokens, "primary", "fill", theme);
    return (_c = (_b = archLeafValue(tokens, "action", "primary.default", theme)) != null ? _b : archLeafValue(tokens, "accent", "solid", theme)) != null ? _c : archLeafValue(tokens, "primary", "fill", theme);
  }
  function isStatusOrNeutralFamily(fam) {
    const base = fam.replace(/-dark$/, "").replace(/-a$/, "");
    if (base === "black" || base === "white") return true;
    if (/(?:^|-)(error|warning|success|info)$/.test(base)) return true;
    if (/(?:^|-)(neutral|gray)$/.test(base)) return true;
    return false;
  }
  function activeThemeKey(tokens) {
    var _a, _b, _c, _d, _e;
    const order = (_a = tokens.colors.themeOrder) != null ? _a : [];
    const named = tokens.colors.activeTheme;
    if (named && (order.includes(named) || Boolean((_b = tokens.foundationsByTheme) == null ? void 0 : _b[named]) || Boolean((_c = tokens.colors.themes) == null ? void 0 : _c[named]))) return named;
    const own = order.filter((t) => t !== "light" && t !== "dark");
    return (_e = (_d = own[own.length - 1]) != null ? _d : order[0]) != null ? _e : "light";
  }
  function familyMatchingSolid(prim, hex) {
    const want = normHex(hex);
    for (const fam of primitiveFamilies(prim)) {
      if (fam.endsWith("-dark") || fam.endsWith("-a") || isStatusOrNeutralFamily(fam)) continue;
      const t9 = familyToneHex(prim, fam, ["9", "09", "600"]);
      if (t9 && normHex(t9) === want) return fam;
    }
    return void 0;
  }
  function brandFamilyFromTokens(tokens) {
    var _a, _b, _c, _d, _e, _f, _g;
    const prim = (_a = tokens.colors.primitive) != null ? _a : {};
    const theme = activeThemeKey(tokens);
    const leaf = (_f = (_d = architectureSolidValue(tokens, theme)) != null ? _d : (_c = (_b = tokens.colors.themes) == null ? void 0 : _b[theme]) == null ? void 0 : _c["background-brand-solid"]) != null ? _f : (_e = tokens.colors.semantic) == null ? void 0 : _e["background-brand-solid"];
    if (leaf) {
      const ref = /^\{([a-z0-9/-]+)\.(\d+)\}$/i.exec(leaf.trim());
      if (ref && familyToneHex(prim, ref[1], ["1", "9", "01", "09"])) return ref[1];
      if (leaf.startsWith("#")) {
        const hit = familyMatchingSolid(prim, leaf);
        if (hit) return hit;
      }
    }
    if (familyToneHex(prim, "accent", ["1", "9", "01", "09"])) return "accent";
    if (familyToneHex(prim, "brand", ["1", "9", "01", "09"])) return "brand";
    return (_g = primitiveFamilies(prim).find((f) => !f.endsWith("-dark") && !f.endsWith("-a") && !isStatusOrNeutralFamily(f))) != null ? _g : "accent";
  }
  var ARCH_ROLE_MAP = {
    astryx: {
      "background-primary": ["background", "body"],
      "background-secondary": ["background", "surface"],
      "background-tertiary": ["background", "muted"],
      "background-brand-primary": ["accent", "muted"],
      "background-brand-solid": ["accent", "solid"],
      "background-inverse": ["background", "inverted"],
      "background-error-solid": ["status", "error"],
      "background-error-primary": ["status", "error-muted"],
      "background-success-solid": ["status", "success"],
      "background-success-primary": ["status", "success-muted"],
      "background-warning-solid": ["status", "warning"],
      "background-warning-primary": ["status", "warning-muted"],
      "border-primary": ["border", "default"],
      "content-primary": ["text", "primary"],
      "content-secondary": ["text", "secondary"],
      "content-disabled": ["text", "disabled"],
      "content-brand": ["text", "accent"],
      "content-on-brand": ["accent", "on-solid"]
    },
    categorical: {
      "background-primary": ["surface", "page"],
      "background-secondary": ["surface", "layer-1"],
      "background-tertiary": ["surface", "layer-2"],
      "background-active": ["surface", "selected"],
      "background-disabled": ["action", "disabled"],
      "background-overlay": ["surface", "overlay"],
      // Not an ALL_ROLES key — inverted surfaces (tooltips, snackbars) bind here
      // so they don't share background-overlay's scrim token.
      "background-inverse": ["surface", "inverse"],
      "background-brand-primary": ["surface", "accent"],
      "background-input": ["surface", "input"],
      "background-brand-secondary": ["action", "secondary.accent"],
      "background-brand-solid": ["action", "primary.default"],
      "background-brand-solid-hover": ["action", "primary.hover"],
      "background-error-primary": ["status", "critical.surface"],
      "background-error-solid": ["status", "critical.surface-solid"],
      "background-success-primary": ["status", "success.surface"],
      "background-warning-primary": ["status", "warning.surface"],
      // Solid fills for the other three severities. Critical was the only one
      // Categorical shipped a solid pair for, so these had nothing to bind to
      // and fell through to the hex fallback in `pair()`.
      "background-success-solid": ["status", "success.surface-solid"],
      "background-warning-solid": ["status", "warning.surface-solid"],
      // Info had NO categorical mapping at all, which is why InlineAlert Info
      // shipped `pair()`'s literal `#1570ef` on `#131c2a` — both verified
      // byte-for-byte in the Figma file against the fallbacks below.
      "status-info": ["status", "info.surface-solid"],
      "status-info-subtle": ["status", "info.surface"],
      "text-info": ["status", "info.content"],
      // The stroke around a status surface. Was a magic `0.4` in this file and a
      // magic `33` (20%) in the configurator's own specimen — 40% in Figma vs
      // 20% in the preview, same component. Now one alpha token per severity.
      "status-error-border": ["status", "critical.border"],
      "status-warning-border": ["status", "warning.border"],
      "status-success-border": ["status", "success.border"],
      "status-info-border": ["status", "info.border"],
      // `border-primary` is the flat catalogue's CONTROL stroke, so it follows
      // the control boundary through the phase-1 split — that role is
      // `border.control` now, not `border.default` (which became the decorative
      // ladder's middle rung). Same resolved value; the name moved.
      "border-primary": ["border", "control"],
      "border-secondary": ["border", "subtle"],
      "border-strong": ["border", "control-hover"],
      // Dividers and rules. Deliberately mapped, deliberately NOT moved onto the
      // decorative ladder's heavier rungs in this phase: every component here
      // keeps the exact colour it had, so the split is provably a rename. Which
      // of the ~20 stroke call sites should drop from the boundary to a
      // decorative tone is a look decision, not a rename.
      "border-tertiary": ["border", "subtle"],
      "border-focus": ["border", "focus"],
      "border-brand": ["border", "accent"],
      // The CONTROL BOUNDARY of an invalid / status-state field. `border.critical`
      // moved into the `status` group as `status.<sev>.border-strong` (configurator
      // audit F1/F3 — a severity-family stroke belongs beside `status.<sev>.border`,
      // and `info` joined so all four are symmetric). `status.<sev>.border` (mapped
      // above as `status-<sev>-border`) is the softer ALPHA edge of a message; this
      // is the solved solid stroke of a form control.
      "border-error": ["status", "critical.border-strong"],
      "border-warning": ["status", "warning.border-strong"],
      "border-success": ["status", "success.border-strong"],
      "border-info": ["status", "info.border-strong"],
      "content-primary": ["content", "primary"],
      "content-secondary": ["content", "secondary"],
      "content-tertiary": ["content", "subtle"],
      "content-inverse": ["content", "inverse"],
      // Not an ALL_ROLES key — button label ink is content.on-action, not inverse.
      "content-on-brand": ["content", "on-action"],
      "status-on-solid": ["status", "critical.on-solid"],
      "status-warning-on": ["status", "warning.on-solid"],
      "status-success-on": ["status", "success.on-solid"],
      "status-info-on": ["status", "info.on-solid"],
      "content-brand": ["content", "accent"],
      "content-brand-hover": ["content", "link.hover"],
      "content-disabled": ["content", "disabled"],
      "content-error": ["status", "critical.content"],
      "content-success": ["status", "success.content"],
      "content-warning": ["status", "warning.content"]
    },
    shadcn: {
      "background-primary": ["base", "background"],
      "background-secondary": ["card", "fill"],
      "background-tertiary": ["muted", "fill"],
      "background-brand-solid": ["primary", "fill"],
      "background-error-solid": ["destructive", "fill"],
      "border-primary": ["border", "default"],
      "content-primary": ["base", "foreground"],
      "content-on-brand": ["primary", "foreground"]
    }
  };
  var ARCH_REF_RE = /^\{([a-z0-9-]+)\.(\d+)\}$/;
  function archRefHex(node, themeKey, tokens) {
    var _a, _b;
    if (!node) return void 0;
    const raw = ((_b = (_a = node[themeKey]) != null ? _a : Object.values(node)[0]) != null ? _b : "").trim();
    if (!raw) return void 0;
    const m = ARCH_REF_RE.exec(raw);
    if (m) return primitiveRefHex(tokens, m[1], m[2]);
    if (/^#?[0-9a-f]{6}([0-9a-f]{2})?$/i.test(raw)) return raw.startsWith("#") ? raw : `#${raw}`;
    return void 0;
  }
  function archVarNameFor(tokens, roleKey) {
    var _a, _b;
    const kind = (_a = tokens.colors.architecture) == null ? void 0 : _a.kind;
    if (!kind || !(kind in ARCH_ROLE_MAP)) return void 0;
    const hit = ARCH_ROLE_MAP[kind][roleKey];
    if (!hit) return void 0;
    const group = (_b = ARCH_GROUPS[kind]) == null ? void 0 : _b.find(([k]) => k === hit[0]);
    const label = group ? group[1] : hit[0].charAt(0).toUpperCase() + hit[0].slice(1);
    return archFigmaName(label, hit[1]);
  }
  function archHexFor(tokens, roleKey, theme) {
    var _a, _b, _c;
    const kind = (_a = tokens.colors.architecture) == null ? void 0 : _a.kind;
    if (!kind || !(kind in ARCH_ROLE_MAP)) return void 0;
    const hit = ARCH_ROLE_MAP[kind][roleKey];
    if (!hit) return void 0;
    const t = (_b = tokens.colors.architecture) == null ? void 0 : _b.tokens;
    return archRefHex((_c = t == null ? void 0 : t[hit[0]]) == null ? void 0 : _c[hit[1]], theme, tokens);
  }
  function resolveVarRgb(v, modeId, byId, defaultModeOf, depth = 0) {
    const val = v.valuesByMode[modeId];
    if (val === void 0 || val === null || typeof val !== "object") return void 0;
    if ("type" in val && val.type === "VARIABLE_ALIAS") {
      if (depth >= 4) return void 0;
      const target = byId.get(val.id);
      if (!target) return void 0;
      const mid = defaultModeOf.get(target.variableCollectionId);
      return mid ? resolveVarRgb(target, mid, byId, defaultModeOf, depth + 1) : void 0;
    }
    return "r" in val ? val : void 0;
  }
  function semLookupFor(tokens, allVars, allCols) {
    var _a, _b, _c;
    const col = allCols.find((c) => c.name === COLLECTIONS.semantics);
    const byName = /* @__PURE__ */ new Map();
    const byHex = /* @__PURE__ */ new Map();
    if (col) {
      const byId = new Map(allVars.map((v) => [v.id, v]));
      const defaultModeOf = new Map(allCols.map((c) => [c.id, c.defaultModeId]));
      for (const v of allVars) {
        if (v.variableCollectionId !== col.id) continue;
        if (!byName.has(v.name)) byName.set(v.name, v);
        if (v.resolvedType !== "COLOR") continue;
        const rgb = resolveVarRgb(v, col.defaultModeId, byId, defaultModeOf);
        if (!rgb) continue;
        const hex = normHex(rgbaToHex(rgb));
        if (!byHex.has(hex)) byHex.set(hex, v);
      }
    }
    const themes = tokens.colors.themes && Object.keys(tokens.colors.themes).length > 0 ? tokens.colors.themes : { light: tokens.colors.semantic || {} };
    const themeOrder = ((_a = tokens.colors.themeOrder) != null ? _a : []).filter((t) => themes[t]);
    const firstTheme = (_c = (_b = themeOrder[0]) != null ? _b : Object.keys(themes)[0]) != null ? _c : "light";
    const hexFor = (roleKey) => {
      var _a2, _b2;
      return archHexFor(tokens, roleKey, firstTheme) || ((_a2 = themes[firstTheme]) == null ? void 0 : _a2[roleKey]) || ((_b2 = tokens.colors.semantic) == null ? void 0 : _b2[roleKey]);
    };
    return {
      hexFor,
      varFor(roleKey, ...extraNames) {
        const archName = archVarNameFor(tokens, roleKey);
        const names = archName ? [archName, semanticVarName(roleKey), ...extraNames] : [semanticVarName(roleKey), ...extraNames];
        for (const n of names) {
          const v = byName.get(n);
          if (v) return v;
        }
        const hex = hexFor(roleKey);
        return hex ? byHex.get(normHex(hex)) : void 0;
      }
    };
  }
  function docChromeVarsFrom(sem) {
    return {
      text: sem.varFor("content-primary", "Content/primary", "content/primary", "text/primary", "text"),
      secondary: sem.varFor("content-secondary", "Content/secondary", "content/secondary", "text/secondary"),
      muted: sem.varFor("content-tertiary", "Content/subtle", "content/subtle", "Content/tertiary", "content/tertiary", "text/tertiary", "Content/secondary", "content/secondary"),
      border: sem.varFor("border-default", "Border/default", "border/default", "border/primary", "border"),
      borderStrong: sem.varFor("border-strong", "Border/strong", "border/strong"),
      board: sem.varFor("background-primary", "Surface/page", "surface/page", "background/primary", "surface/0"),
      card: sem.varFor("background-tertiary", "Surface/layer-2", "surface/layer-2", "background/tertiary", "surface/2"),
      inverse: sem.varFor("background-inverse", "Surface/inverse", "surface/inverse", "background/inverse", "background/overlay", "bg/inverse"),
      accentText: sem.varFor("content-brand", "Content/accent", "content/accent", "Content/brand", "content/brand", "text/brand-secondary"),
      accentBorder: sem.varFor("border-brand", "Border/accent", "border/accent", "border/brand")
    };
  }
  function docModePin(tokens, allCols) {
    var _a, _b, _c;
    const collection = allCols.find((c) => c.name === COLLECTIONS.semantics);
    if (!collection) return void 0;
    const firstTheme = (_b = ((_a = tokens.colors.themeOrder) != null ? _a : ["light"])[0]) != null ? _b : "light";
    const mode = (_c = collection.modes.find((m) => m.name.toLowerCase() === firstTheme.toLowerCase())) != null ? _c : collection.modes[0];
    return mode ? { collection, modeId: mode.modeId } : void 0;
  }
  function componentThemeKey(tokens) {
    var _a, _b, _c;
    const order = (_a = tokens.colors.themeOrder) != null ? _a : ["light"];
    const active = tokens.colors.activeTheme;
    if (active && order.includes(active)) return active;
    return order.length > 2 ? (_b = order[order.length - 1]) != null ? _b : "light" : (_c = order[0]) != null ? _c : "light";
  }
  function componentModePin(tokens, allCols) {
    var _a;
    const collection = allCols.find((c) => c.name === COLLECTIONS.semantics);
    if (!collection) return void 0;
    const key = componentThemeKey(tokens);
    const mode = (_a = collection.modes.find((m) => m.name.toLowerCase() === key.toLowerCase())) != null ? _a : collection.modes[0];
    return mode ? { collection, modeId: mode.modeId } : void 0;
  }
  function pinToLightMode(node, pin) {
    if (!pin) return;
    try {
      node.setExplicitVariableModeForCollection(pin.collection, pin.modeId);
    } catch (e) {
    }
  }
  function vStack(f, width) {
    f.counterAxisSizingMode = "FIXED";
    f.resize(width, Math.max(1, f.height));
    f.primaryAxisSizingMode = "AUTO";
    return f;
  }
  var ARCH_LABEL = {
    astryx: "Astryx",
    shadcn: "shadcn/ui",
    categorical: "Categorical Semantic",
    vibrancy: "Contextual Vibrancy",
    carbon: "IBM Carbon",
    tonal: "Material Tonal"
  };
  var LEGACY_COLLECTIONS = [...Object.values(ARCH_LABEL), "Components"];
  var ARCH_GROUPS = {
    astryx: [
      ["accent", "Accent"],
      ["background", "Background"],
      ["text", "Text"],
      ["icon", "Icon"],
      ["status", "Status"],
      ["utility", "Utility"],
      ["border", "Border"]
    ],
    shadcn: [
      ["base", "Base"],
      ["card", "Card"],
      ["popover", "Popover"],
      ["primary", "Primary"],
      ["secondary", "Secondary"],
      ["muted", "Muted"],
      ["accent", "Accent"],
      ["destructive", "Destructive"],
      ["border", "Border"],
      ["chart", "Chart"],
      ["sidebar", "Sidebar"]
    ],
    categorical: [
      ["content", "Content"],
      ["action", "Action"],
      ["surface", "Surface"],
      ["status", "Status"],
      ["border", "Border"]
    ],
    carbon: [
      ["layer", "Layer"],
      ["field", "Field"],
      ["text", "Text"],
      ["icon", "Icon"],
      ["border", "Border"],
      ["link", "Link"],
      ["interactive", "Interactive"],
      ["support", "Support"],
      ["utility", "Utility"]
    ],
    tonal: [
      ["core", "Core"],
      ["secondary", "Secondary"],
      ["tertiary", "Tertiary"],
      ["error", "Error"],
      ["surfaces", "Surfaces"],
      ["outlines", "Outlines"]
    ],
    vibrancy: [
      ["labels", "Labels"],
      ["backgrounds", "Backgrounds"],
      ["fills", "Fills"],
      ["separators", "Separators"],
      ["materials", "Materials"]
    ]
  };
  var CARBON_MODES = [
    ["white", "White"],
    ["g10", "Gray 10"],
    ["g90", "Gray 90"],
    ["g100", "Gray 100"]
  ];
  var LIGHT_DARK_MODES = [["light", "Light"], ["dark", "Dark"]];
  function archGroupOrder(kind, present) {
    var _a;
    const known = (_a = ARCH_GROUPS[kind]) != null ? _a : [];
    const seen = new Set(known.map(([k]) => k));
    const extra = present.filter((k) => !seen.has(k)).map((k) => [k, k.charAt(0).toUpperCase() + k.slice(1)]);
    return [...known.filter(([k]) => present.includes(k)), ...extra];
  }
  function normalizeArchitecture(arch, themeNames, labels = {}) {
    const kind = arch.kind;
    if (kind === "tonal") {
      const scheme = arch.scheme;
      if (!scheme) return null;
      return {
        modes: LIGHT_DARK_MODES,
        groups: archGroupOrder(kind, Object.keys(scheme)).map(([key, label]) => {
          var _a;
          return {
            label,
            tokens: Object.entries((_a = scheme[key]) != null ? _a : {}).map(([k, v]) => ({
              key: k,
              byMode: { light: v.light, dark: v.dark }
            }))
          };
        })
      };
    }
    if (kind === "vibrancy") {
      const t2 = arch.tokens;
      if (!t2 || !t2.light) return null;
      const groupKeys = ARCH_GROUPS[kind].map(([k]) => k).filter((g) => t2.light[g]);
      return {
        modes: LIGHT_DARK_MODES,
        groups: archGroupOrder(kind, groupKeys).map(([key, label]) => {
          var _a;
          return {
            label,
            tokens: Object.keys((_a = t2.light[key]) != null ? _a : {}).map((k) => {
              var _a2, _b, _c, _d, _e;
              return {
                key: k,
                byMode: { light: (_b = (_a2 = t2.light[key]) == null ? void 0 : _a2[k]) != null ? _b : "", dark: (_e = (_d = (_c = t2.dark) == null ? void 0 : _c[key]) == null ? void 0 : _d[k]) != null ? _e : "" }
              };
            })
          };
        })
      };
    }
    const t = arch.tokens;
    if (!t) return null;
    let modes;
    if (kind === "carbon") {
      modes = CARBON_MODES;
    } else {
      const present = /* @__PURE__ */ new Set();
      for (const group of Object.values(t)) {
        for (const node of Object.values(group)) Object.keys(node).forEach((m) => present.add(m));
      }
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
      const labelOf = (m) => {
        var _a;
        return ((_a = labels[m]) == null ? void 0 : _a.trim()) || cap(m);
      };
      const ordered = themeNames.filter((m) => present.has(m));
      modes = (ordered.length ? ordered : themeNames).map((m) => [m, labelOf(m)]);
    }
    if (modes.length === 0) return null;
    return {
      modes,
      groups: archGroupOrder(kind, Object.keys(t)).map(([key, label]) => {
        var _a;
        return {
          label,
          tokens: Object.entries((_a = t[key]) != null ? _a : {}).map(([k, byMode]) => ({ key: k, byMode }))
        };
      })
    };
  }
  var RGB_FN_RE = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i;
  function primitiveRefHex(tokens, fam, tone) {
    var _a;
    const solid = tokens.colors.primitive[`${fam}-${tone}`];
    if (solid) return solid;
    const alpha = tokens.colors.primitiveAlpha;
    if (!alpha) return void 0;
    return (_a = alpha[`${fam}-${tone}`]) != null ? _a : fam.endsWith("-a") ? alpha[`${fam.slice(0, -2)}-${tone}`] : void 0;
  }
  function archValueRgba(raw, lookup) {
    const val = (raw != null ? raw : "").trim();
    if (!val) return void 0;
    const ref = ARCH_REF_RE.exec(val);
    if (ref) {
      const hex = lookup(ref[1], ref[2]);
      return hex ? hexToRgba(hex) : void 0;
    }
    const fn = RGB_FN_RE.exec(val);
    if (fn) {
      return {
        r: Number(fn[1]) / 255,
        g: Number(fn[2]) / 255,
        b: Number(fn[3]) / 255,
        a: fn[4] === void 0 ? 1 : Number(fn[4])
      };
    }
    if (/^#?[0-9a-f]{6}([0-9a-f]{2})?$/i.test(val)) return hexToRgba(val);
    return void 0;
  }
  var semanticsRebuilt = false;
  var foundationsRebuilt = false;
  async function importVariables(tokens) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U;
    namingCtx = tokens;
    let count = 0;
    semanticsRebuilt = false;
    foundationsRebuilt = false;
    const previousProject = ((_a = readFileTokens()) == null ? void 0 : _a.tokens.project) || figma.root.getPluginData(FILE_PROJECT_NAME_KEY) || void 0;
    if (previousProject && tokens.project && previousProject !== tokens.project) {
      foundationsRebuilt = true;
      log(`\u21BB System changed "${previousProject}" \u2192 "${tokens.project}" \u2014 leftover collections and docs will follow the new name`);
    }
    const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const allVars = await figma.variables.getLocalVariablesAsync();
    function findOrCreateCollection(name) {
      let c = existingCollections.find((col) => col.name === name);
      if (!c) {
        c = figma.variables.createVariableCollection(name);
        existingCollections.push(c);
        log(`Created collection "${name}"`);
      }
      return c;
    }
    const panelOrder = collectionPanelOrder(tokens);
    const namesNow = existingCollections.map((c) => c.name);
    const semIdx = namesNow.indexOf(COLLECTIONS.semantics);
    const primIdx = namesNow.indexOf(COLLECTIONS.primitives);
    if (semIdx !== -1 && primIdx !== -1 && primIdx < semIdx) {
      for (const c of [...existingCollections]) {
        if (c.name === COLLECTIONS.semantics || !PLUGIN_COLLECTION_NAMES.has(c.name)) continue;
        try {
          c.remove();
          const i = existingCollections.indexOf(c);
          if (i !== -1) existingCollections.splice(i, 1);
          foundationsRebuilt = true;
        } catch (e) {
          log(`\u26A0 Could not restack "${c.name}" in the Variables panel`);
        }
      }
      if (foundationsRebuilt) {
        log(`\u21BB Variables panel restacked \u2014 "${COLLECTIONS.semantics}" stays first, "${COLLECTIONS.primitives}" is recreated below it`);
        const fresh = await figma.variables.getLocalVariablesAsync();
        allVars.length = 0;
        allVars.push(...fresh);
      }
    }
    for (const name of panelOrder) findOrCreateCollection(name);
    function cacheFor(collection) {
      const m = /* @__PURE__ */ new Map();
      for (const v of allVars) {
        if (v.variableCollectionId === collection.id) m.set(v.name, v);
      }
      return m;
    }
    function upsertVarIn(collection, cache, name, type, scopes) {
      const safe = figmaVarName(name);
      let found = cache.get(safe);
      if (found) {
        const stale = found.resolvedType !== type;
        if (stale) {
          try {
            found.remove();
            const i = allVars.indexOf(found);
            if (i !== -1) allVars.splice(i, 1);
            cache.delete(safe);
            found = void 0;
          } catch (e) {
          }
        }
      }
      if (found) {
        if (scopes !== void 0) {
          try {
            found.scopes = scopes;
          } catch (e) {
          }
        }
        applyVarDescription(found, collection.name, safe);
        return found;
      }
      let created;
      try {
        created = figma.variables.createVariable(safe, collection, type);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        log(`\u26A0 Could not create variable "${safe}" in "${collection.name}": ${msg}`);
        throw e;
      }
      count++;
      if (scopes !== void 0) {
        try {
          created.scopes = scopes;
        } catch (e) {
        }
      }
      if (collection.name === COLLECTIONS.primitives) {
        try {
          created.hiddenFromPublishing = true;
        } catch (e) {
        }
      }
      applyVarDescription(created, collection.name, safe);
      cache.set(safe, created);
      allVars.push(created);
      return created;
    }
    function applyVarDescription(variable, collectionName, varName) {
      var _a2, _b2;
      const desc = (_b2 = (_a2 = tokens.descriptions) == null ? void 0 : _a2[collectionName]) == null ? void 0 : _b2[varName];
      if (typeof desc !== "string") return;
      try {
        if (variable.description !== desc) variable.description = desc;
      } catch (e) {
      }
    }
    function setDefault(collection, v, value) {
      for (const mode of collection.modes) {
        v.setValueForMode(mode.modeId, value);
      }
    }
    function pruneModes(col, wanted, collLabel) {
      const stale = col.modes.filter((m) => m.modeId !== col.defaultModeId && !wanted.has(m.name));
      const removed = [];
      for (const m of stale) {
        try {
          col.removeMode(m.modeId);
          removed.push(m.name);
        } catch (e) {
        }
      }
      if (removed.length > 0) {
        log(`Removed ${removed.length} stale ${collLabel} theme column${removed.length > 1 ? "s" : ""} (${removed.join(", ")}) \u2014 not in the system any more`);
      }
    }
    function pruneVars(cache, written, collLabel) {
      const removed = [];
      for (const [name, v] of cache) {
        if (written.has(name)) continue;
        try {
          v.remove();
          cache.delete(name);
          const i = allVars.indexOf(v);
          if (i !== -1) allVars.splice(i, 1);
          removed.push(name);
        } catch (e) {
        }
      }
      if (removed.length > 0) {
        log(`Removed ${removed.length} stale ${collLabel} token${removed.length > 1 ? "s" : ""} (${removed.slice(0, 6).join(", ")}${removed.length > 6 ? `, +${removed.length - 6} more` : ""}) \u2014 not in the system any more`);
      }
    }
    const foundationThemes = (() => {
      var _a2;
      const fb = tokens.foundationsByTheme;
      if (!fb) return [];
      const order = (_a2 = tokens.colors.themeOrder) != null ? _a2 : [];
      return [...order.filter((k) => fb[k]), ...Object.keys(fb).filter((k) => !order.includes(k))];
    })();
    function themeMapsDiffer(pick, root) {
      var _a2;
      if (foundationThemes.length === 0) return false;
      if (root !== void 0) {
        const rootSig = JSON.stringify(root != null ? root : null);
        if (foundationThemes.some((t) => {
          var _a3;
          return JSON.stringify((_a3 = pick(t)) != null ? _a3 : null) !== rootSig;
        })) return true;
      }
      if (foundationThemes.length < 2) return false;
      const first = JSON.stringify((_a2 = pick(foundationThemes[0])) != null ? _a2 : null);
      return foundationThemes.slice(1).some((t) => {
        var _a3;
        return JSON.stringify((_a3 = pick(t)) != null ? _a3 : null) !== first;
      });
    }
    function ensureNamedModes(col, keys) {
      const labels = keys.map((k) => [k, shippedThemeLabel(k)]);
      try {
        col.renameMode(col.defaultModeId, labels[0][1]);
      } catch (e) {
      }
      pruneModes(col, new Set(labels.map(([, l]) => l)), col.name);
      const modeIdOf2 = { [labels[0][0]]: col.defaultModeId };
      const skipped = [];
      for (const [key, label] of labels.slice(1)) {
        const found = col.modes.find((m) => m.name === label);
        if (found) {
          modeIdOf2[key] = found.modeId;
          continue;
        }
        try {
          modeIdOf2[key] = col.addMode(label);
        } catch (e) {
          skipped.push(label);
        }
      }
      if (skipped.length > 0) {
        log(`\u26A0 ${skipped.length} ${col.name} theme column${skipped.length > 1 ? "s" : ""} skipped (${skipped.join(", ")}) \u2014 your Figma plan's mode-per-collection limit was reached.`);
      }
      return modeIdOf2;
    }
    function writeByTheme(v, byTheme, modeIdOf2) {
      var _a2;
      let fallback;
      for (const theme of foundationThemes) {
        const val = byTheme[theme];
        if (val !== void 0 && fallback === void 0) fallback = val;
      }
      for (const theme of foundationThemes) {
        const mid = modeIdOf2[theme];
        const val = (_a2 = byTheme[theme]) != null ? _a2 : fallback;
        if (mid && val !== void 0) v.setValueForMode(mid, val);
      }
    }
    function emitCollection(collName, entries, type, transform, nameOf = (k) => k, themeMapOf, forceModes = false) {
      var _a2, _b2, _c2, _d2;
      if (!entries || entries.length === 0) return;
      const col = findOrCreateCollection(collName);
      const cache = cacheFor(col);
      const root = Object.fromEntries(entries);
      const hasThemeMaps = !!(themeMapOf && foundationThemes.length > 0);
      const useModes = hasThemeMaps && (forceModes || themeMapsDiffer((t) => themeMapOf(t), root));
      const modeIdOf2 = useModes ? ensureNamedModes(col, foundationThemes) : void 0;
      const keys = new Set(Object.keys(root));
      if (hasThemeMaps && themeMapOf) {
        for (const t of foundationThemes) Object.keys((_a2 = themeMapOf(t)) != null ? _a2 : {}).forEach((k) => keys.add(k));
      }
      const preferred = themeMapOf && foundationThemes[0] ? themeMapOf(foundationThemes[0]) : void 0;
      for (const key of keys) {
        const rawRoot = root[key];
        if (rawRoot === void 0 && !(hasThemeMaps && themeMapOf && foundationThemes.some((t) => {
          var _a3;
          return (_a3 = themeMapOf(t)) == null ? void 0 : _a3[key];
        }))) continue;
        const varName = nameOf(key);
        const v = upsertVarIn(col, cache, varName, type, scopesForCollection(collName, figmaVarName(varName)));
        if (modeIdOf2 && themeMapOf) {
          const byTheme = {};
          for (const t of foundationThemes) {
            const raw = (_c2 = (_b2 = themeMapOf(t)) == null ? void 0 : _b2[key]) != null ? _c2 : rawRoot;
            if (raw !== void 0) byTheme[t] = transform(raw);
          }
          writeByTheme(v, byTheme, modeIdOf2);
        } else {
          const raw = (_d2 = preferred == null ? void 0 : preferred[key]) != null ? _d2 : rawRoot;
          if (raw !== void 0) setDefault(col, v, transform(raw));
        }
      }
    }
    function emitRoleAliases(collName, roles, primitiveNameOf, themeRolesOf, forceModes = false) {
      var _a2, _b2, _c2, _d2;
      const rootRoles = roles != null ? roles : {};
      const allRoles = new Set(Object.keys(rootRoles));
      if (themeRolesOf) {
        for (const t of foundationThemes) Object.keys((_a2 = themeRolesOf(t)) != null ? _a2 : {}).forEach((k) => allRoles.add(k));
      }
      if (allRoles.size === 0) return 0;
      const col = findOrCreateCollection(collName);
      const cache = cacheFor(col);
      const hasThemeMaps = !!(themeRolesOf && foundationThemes.length > 0);
      const useModes = hasThemeMaps && (forceModes || themeMapsDiffer((t) => themeRolesOf(t), rootRoles));
      const modeIdOf2 = useModes ? ensureNamedModes(col, foundationThemes) : void 0;
      const preferred = themeRolesOf && foundationThemes[0] ? themeRolesOf(foundationThemes[0]) : void 0;
      let n = 0;
      for (const role of allRoles) {
        const v = upsertVarIn(col, cache, `role/${role}`, "FLOAT", scopesForCollection(collName, `role/${role}`));
        if (modeIdOf2 && themeRolesOf) {
          const byTheme = {};
          for (const t of foundationThemes) {
            const step = (_c2 = (_b2 = themeRolesOf(t)) == null ? void 0 : _b2[role]) != null ? _c2 : rootRoles[role];
            if (typeof step !== "string" || !step) continue;
            const prim = cache.get(figmaVarName(primitiveNameOf(step)));
            if (!prim) continue;
            byTheme[t] = figma.variables.createVariableAlias(prim);
          }
          writeByTheme(v, byTheme, modeIdOf2);
          n++;
        } else {
          const step = (_d2 = preferred == null ? void 0 : preferred[role]) != null ? _d2 : rootRoles[role];
          if (typeof step !== "string" || !step) continue;
          const prim = cache.get(figmaVarName(primitiveNameOf(step)));
          if (!prim) continue;
          setDefault(col, v, figma.variables.createVariableAlias(prim));
          n++;
        }
      }
      return n;
    }
    try {
      let typoVar2 = function(name, type, value) {
        const variable = upsertVarIn(typoCol, typoCache, name, type, scopesForCollection(COLLECTIONS.typography, name));
        setDefault(typoCol, variable, value);
      }, migrateLegacyFamilyName2 = function(legacy, canonical) {
        const legacyVar = typoCache.get(legacy);
        if (!legacyVar || typoCache.has(canonical)) return;
        try {
          legacyVar.name = canonical;
          typoCache.delete(legacy);
          typoCache.set(canonical, legacyVar);
        } catch (e) {
        }
      };
      var typoVar = typoVar2, migrateLegacyFamilyName = migrateLegacyFamilyName2;
      const typoCol = findOrCreateCollection(COLLECTIONS.typography);
      const typoCache = cacheFor(typoCol);
      async function writeFontFamily(name, family) {
        const variable = upsertVarIn(typoCol, typoCache, name, "STRING", scopesForCollection(COLLECTIONS.typography, name));
        setDefault(typoCol, variable, family);
        const verify = async () => {
          const current = await figma.variables.getVariableByIdAsync(variable.id);
          if (!current) return false;
          return typoCol.modes.every((mode) => current.valuesByMode[mode.modeId] === family);
        };
        if (await verify()) return;
        const fresh = await figma.variables.getVariableByIdAsync(variable.id);
        if (fresh) setDefault(typoCol, fresh, family);
        if (!await verify()) throw new Error(`Figma kept a stale value for Typography/${name}; expected "${family}"`);
      }
      Object.entries(tokens.typography.sizes).forEach(([key, val]) => typoVar2(`size/${key}`, "FLOAT", pxToFloat(val)));
      Object.entries(tokens.typography.weights).forEach(([key, val]) => typoVar2(`weight/${key}`, "FLOAT", val));
      const bodyFamily = normalizeFontFamilyName(tokens.typography.fontFamily);
      const headingFamily = normalizeFontFamilyName((_b = tokens.typography.headingFontFamily) != null ? _b : bodyFamily);
      migrateLegacyFamilyName2(TYPOGRAPHY_FAMILY_VARS.legacyBody, TYPOGRAPHY_FAMILY_VARS.body);
      migrateLegacyFamilyName2(TYPOGRAPHY_FAMILY_VARS.legacyDisplay, TYPOGRAPHY_FAMILY_VARS.display);
      const prevFamily = (() => {
        const v = typoCache.get(TYPOGRAPHY_FAMILY_VARS.body);
        return v ? varStringAt(v, typoCol.defaultModeId) : void 0;
      })();
      const typoByTheme = themeMapsDiffer(
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.typography;
        },
        tokens.typography
      );
      if (typoByTheme) {
        const modeIdOf2 = ensureNamedModes(typoCol, foundationThemes);
        const bodyVar = upsertVarIn(typoCol, typoCache, TYPOGRAPHY_FAMILY_VARS.body, "STRING", scopesForCollection(COLLECTIONS.typography, TYPOGRAPHY_FAMILY_VARS.body));
        const displayVar = upsertVarIn(typoCol, typoCache, TYPOGRAPHY_FAMILY_VARS.display, "STRING", scopesForCollection(COLLECTIONS.typography, TYPOGRAPHY_FAMILY_VARS.display));
        for (const theme of foundationThemes) {
          const f = (_d = (_c = tokens.foundationsByTheme) == null ? void 0 : _c[theme]) == null ? void 0 : _d.typography;
          const body = normalizeFontFamilyName((_e = f == null ? void 0 : f.fontFamily) != null ? _e : tokens.typography.fontFamily);
          const heading = normalizeFontFamilyName(
            (_h = (_g = (_f = f == null ? void 0 : f.headingFontFamily) != null ? _f : f == null ? void 0 : f.fontFamily) != null ? _g : tokens.typography.headingFontFamily) != null ? _h : tokens.typography.fontFamily
          );
          const mid = modeIdOf2[theme];
          if (!mid) continue;
          bodyVar.setValueForMode(mid, body);
          displayVar.setValueForMode(mid, heading);
          for (const [key, val] of Object.entries((_i = f == null ? void 0 : f.sizes) != null ? _i : tokens.typography.sizes)) {
            const v = (_j = typoCache.get(figmaVarName(`size/${key}`))) != null ? _j : upsertVarIn(typoCol, typoCache, `size/${key}`, "FLOAT", scopesForCollection(COLLECTIONS.typography, `size/${key}`));
            v.setValueForMode(mid, pxToFloat(val));
          }
          for (const [key, val] of Object.entries((_k = f == null ? void 0 : f.weights) != null ? _k : tokens.typography.weights)) {
            const v = (_l = typoCache.get(figmaVarName(`weight/${key}`))) != null ? _l : upsertVarIn(typoCol, typoCache, `weight/${key}`, "FLOAT", scopesForCollection(COLLECTIONS.typography, `weight/${key}`));
            v.setValueForMode(mid, val);
          }
          for (const [key, val] of Object.entries((_n = (_m = f == null ? void 0 : f.lineHeights) != null ? _m : tokens.typography.lineHeights) != null ? _n : {})) {
            const v = (_o = typoCache.get(figmaVarName(`line-height/${key}`))) != null ? _o : upsertVarIn(typoCol, typoCache, `line-height/${key}`, "FLOAT", scopesForCollection(COLLECTIONS.typography, `line-height/${key}`));
            v.setValueForMode(mid, pxToFloat(val));
          }
          for (const [key, val] of Object.entries((_q = (_p = f == null ? void 0 : f.letterSpacings) != null ? _p : tokens.typography.letterSpacings) != null ? _q : {})) {
            const v = (_r = typoCache.get(figmaVarName(`letter-spacing/${key}`))) != null ? _r : upsertVarIn(typoCol, typoCache, `letter-spacing/${key}`, "FLOAT", scopesForCollection(COLLECTIONS.typography, `letter-spacing/${key}`));
            v.setValueForMode(mid, pxToFloat(val));
          }
        }
        for (const theme of foundationThemes) {
          const mid = modeIdOf2[theme];
          if (!mid) continue;
          const f = (_t = (_s = tokens.foundationsByTheme) == null ? void 0 : _s[theme]) == null ? void 0 : _t.typography;
          const body = normalizeFontFamilyName((_u = f == null ? void 0 : f.fontFamily) != null ? _u : tokens.typography.fontFamily);
          const heading = normalizeFontFamilyName(
            (_x = (_w = (_v = f == null ? void 0 : f.headingFontFamily) != null ? _v : f == null ? void 0 : f.fontFamily) != null ? _w : tokens.typography.headingFontFamily) != null ? _x : tokens.typography.fontFamily
          );
          const verifyMode = async (variable, expected, name) => {
            const current = await figma.variables.getVariableByIdAsync(variable.id);
            if ((current == null ? void 0 : current.valuesByMode[mid]) === expected) return;
            variable.setValueForMode(mid, expected);
            const again = await figma.variables.getVariableByIdAsync(variable.id);
            if ((again == null ? void 0 : again.valuesByMode[mid]) !== expected) {
              throw new Error(`Figma kept a stale value for Typography/${name} (${capFoundationTheme(theme)}); expected "${expected}"`);
            }
          };
          await verifyMode(bodyVar, body, TYPOGRAPHY_FAMILY_VARS.body);
          await verifyMode(displayVar, heading, TYPOGRAPHY_FAMILY_VARS.display);
        }
        if (typoCache.has(TYPOGRAPHY_FAMILY_VARS.legacyBody)) {
          const leg = typoCache.get(TYPOGRAPHY_FAMILY_VARS.legacyBody);
          for (const theme of foundationThemes) {
            const mid = modeIdOf2[theme];
            const f = (_z = (_y = tokens.foundationsByTheme) == null ? void 0 : _y[theme]) == null ? void 0 : _z.typography;
            if (mid) leg.setValueForMode(mid, normalizeFontFamilyName((_A = f == null ? void 0 : f.fontFamily) != null ? _A : bodyFamily));
          }
        }
        if (typoCache.has(TYPOGRAPHY_FAMILY_VARS.legacyDisplay)) {
          const leg = typoCache.get(TYPOGRAPHY_FAMILY_VARS.legacyDisplay);
          for (const theme of foundationThemes) {
            const mid = modeIdOf2[theme];
            const f = (_C = (_B = tokens.foundationsByTheme) == null ? void 0 : _B[theme]) == null ? void 0 : _C.typography;
            if (mid) {
              leg.setValueForMode(mid, normalizeFontFamilyName(
                (_E = (_D = f == null ? void 0 : f.headingFontFamily) != null ? _D : f == null ? void 0 : f.fontFamily) != null ? _E : headingFamily
              ));
            }
          }
        }
        const shown = foundationThemes.map((theme) => {
          var _a2, _b2, _c2;
          const f = (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[theme]) == null ? void 0 : _b2.typography;
          return `${capFoundationTheme(theme)}="${normalizeFontFamilyName((_c2 = f == null ? void 0 : f.fontFamily) != null ? _c2 : bodyFamily)}"`;
        }).join(", ");
        log(`\u2713 Typography per theme (${foundationThemes.length} columns) \u2014 ${shown}`);
        if (prevFamily && prevFamily !== normalizeFontFamilyName(
          (_I = (_H = (_G = (_F = tokens.foundationsByTheme) == null ? void 0 : _F[foundationThemes[0]]) == null ? void 0 : _G.typography) == null ? void 0 : _H.fontFamily) != null ? _I : bodyFamily
        )) {
          log(`\u21BB Typography family "${prevFamily}" \u2192 theme columns updated from foundationsByTheme`);
        }
      } else {
        await writeFontFamily(TYPOGRAPHY_FAMILY_VARS.body, bodyFamily);
        await writeFontFamily(TYPOGRAPHY_FAMILY_VARS.display, headingFamily);
        if (typoCache.has(TYPOGRAPHY_FAMILY_VARS.legacyBody)) {
          setDefault(typoCol, typoCache.get(TYPOGRAPHY_FAMILY_VARS.legacyBody), bodyFamily);
        }
        if (typoCache.has(TYPOGRAPHY_FAMILY_VARS.legacyDisplay)) {
          setDefault(typoCol, typoCache.get(TYPOGRAPHY_FAMILY_VARS.legacyDisplay), headingFamily);
        }
        const familyNow = (() => {
          const v = typoCache.get(TYPOGRAPHY_FAMILY_VARS.body);
          return v ? varStringAt(v, typoCol.defaultModeId) : void 0;
        })();
        if (familyNow === bodyFamily) {
          if (prevFamily && prevFamily !== bodyFamily) {
            log(`\u21BB Typography family "${prevFamily}" \u2192 "${bodyFamily}"`);
          } else {
            log(`\u2713 Typography family \u2192 "${bodyFamily}"`);
          }
        } else {
          log(`\u2717 Typography "${TYPOGRAPHY_FAMILY_VARS.body}" is still "${familyNow != null ? familyNow : "?"}" \u2014 wanted "${bodyFamily}" from the payload`);
        }
        const displayNow = (() => {
          const v = typoCache.get(TYPOGRAPHY_FAMILY_VARS.display);
          return v ? varStringAt(v, typoCol.defaultModeId) : void 0;
        })();
        if (displayNow === headingFamily) {
          log(`\u2713 Typography families \u2014 body: "${bodyFamily}", display: "${headingFamily}"`);
        } else {
          log(`\u2717 Typography "${TYPOGRAPHY_FAMILY_VARS.display}" is still "${displayNow != null ? displayNow : "?"}" \u2014 wanted "${headingFamily}" from the payload`);
        }
      }
      if (!typoByTheme) {
        if (tokens.typography.lineHeights) {
          Object.entries(tokens.typography.lineHeights).forEach(([key, val]) => typoVar2(`line-height/${key}`, "FLOAT", pxToFloat(val)));
        }
        if (tokens.typography.letterSpacings) {
          Object.entries(tokens.typography.letterSpacings).forEach(([key, val]) => typoVar2(`letter-spacing/${key}`, "FLOAT", pxToFloat(val)));
        }
      }
      const typeRoles = tokens.typography.roles;
      if (typeRoles) {
        let roleCount = 0;
        for (const [key, modes] of Object.entries(typeRoles)) {
          const d = modes == null ? void 0 : modes.desktop;
          if (!d) continue;
          const sizePrim = typoCache.get(figmaVarName(`size/${d.size}`));
          const weightPrim = typoCache.get(figmaVarName(`weight/${d.weight}`));
          const familyName = d.family === "display" ? TYPOGRAPHY_FAMILY_VARS.display : TYPOGRAPHY_FAMILY_VARS.body;
          const familyPrim = typoCache.get(figmaVarName(familyName));
          if (sizePrim) {
            typoVar2(`role/${key}/size`, "FLOAT", figma.variables.createVariableAlias(sizePrim));
            roleCount++;
          }
          if (weightPrim) {
            typoVar2(`role/${key}/weight`, "FLOAT", figma.variables.createVariableAlias(weightPrim));
          }
          if (familyPrim) {
            typoVar2(`role/${key}/family`, "STRING", figma.variables.createVariableAlias(familyPrim));
          }
        }
        if (roleCount > 0) log(`\u2713 Typography roles (${roleCount} aliased to size/weight/family)`);
      }
      const sizeCount = Object.keys(tokens.typography.sizes).length;
      if (sizeCount > 0) log(`\u2713 Typography sizes (${sizeCount} steps \u2014 change them on the web and sync updates size/* here)`);
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      log(`\u2717 Typography failed: ${m}`);
      throw new Error(`Typography failed: ${m}`);
    }
    const primCol = findOrCreateCollection(COLLECTIONS.primitives);
    const primCache = cacheFor(primCol);
    for (const [name, v] of Array.from(primCache.entries())) {
      const slash = name.lastIndexOf("/");
      if (slash === -1) continue;
      const seg = name.slice(slash + 1);
      if (/^\d$/.test(seg)) {
        const newName = `${name.slice(0, slash)}/0${seg}`;
        if (!primCache.has(newName)) {
          v.name = newName;
          primCache.delete(name);
          primCache.set(newName, v);
        }
      }
    }
    const renamePrimitive = (from, to) => {
      if (from === to) return;
      const v = primCache.get(from);
      if (!v || primCache.has(to)) return;
      try {
        v.name = to;
        primCache.delete(from);
        primCache.set(to, v);
      } catch (e) {
      }
    };
    for (const key of Object.keys(tokens.colors.primitive)) {
      const to = primitiveVarName(key);
      for (const from of previousPrimitiveVarNames(key)) renamePrimitive(from, to);
    }
    for (const key of Object.keys((_J = tokens.colors.primitiveAlpha) != null ? _J : {})) {
      const to = primitiveAlphaVarName(key);
      for (const from of previousPrimitiveAlphaVarNames(key)) renamePrimitive(from, to);
    }
    for (const [name] of Array.from(primCache.entries())) {
      if (name.startsWith("State/") && !name.startsWith("States/")) {
        renamePrimitive(name, `States/${name.slice("State/".length)}`);
      }
    }
    Object.entries(tokens.colors.primitive).sort(([a], [b]) => comparePrimitiveKeys(a, b)).forEach(([key, hex]) => {
      if (!hex) return;
      const name = primitiveVarName(key);
      setDefault(primCol, upsertVarIn(primCol, primCache, name, "COLOR", scopesForCollection(COLLECTIONS.primitives, name)), __spreadProps(__spreadValues({}, hexToRgb(hex)), { a: 1 }));
    });
    log(`\u2713 Primitive scale (${Object.keys(tokens.colors.primitive).length} tones) \u2014 preview "${activeThemeKey(tokens)}" \xB7 brand "${brandFamilyFromTokens(tokens)}"`);
    if (tokens.colors.primitiveAlpha && Object.keys(tokens.colors.primitiveAlpha).length > 0) {
      Object.entries(tokens.colors.primitiveAlpha).sort(([a], [b]) => comparePrimitiveKeys(a, b)).forEach(([key, hex]) => {
        if (!hex) return;
        const name = primitiveAlphaVarName(key);
        setDefault(primCol, upsertVarIn(primCol, primCache, name, "COLOR", scopesForCollection(COLLECTIONS.primitives, name)), hexToRgba(hex));
      });
      log(`\u2713 Alpha twins (${Object.keys(tokens.colors.primitiveAlpha).length} tones)`);
    }
    if (tokens.colors.background) {
      setDefault(primCol, upsertVarIn(primCol, primCache, "Background", "COLOR", scopesForCollection(COLLECTIONS.primitives, "Background")), __spreadProps(__spreadValues({}, hexToRgb(tokens.colors.background)), { a: 1 }));
    }
    const writtenPrim = /* @__PURE__ */ new Set();
    for (const [key, hex] of Object.entries(tokens.colors.primitive)) {
      if (hex) writtenPrim.add(primitiveVarName(key));
    }
    for (const [key, hex] of Object.entries((_K = tokens.colors.primitiveAlpha) != null ? _K : {})) {
      if (hex) writtenPrim.add(primitiveAlphaVarName(key));
    }
    if (tokens.colors.background) writtenPrim.add("Background");
    pruneVars(primCache, writtenPrim, COLLECTIONS.primitives);
    if (figma.root.getPluginData(FILE_PRIMITIVES_HIDDEN_KEY) !== "1") {
      let hidden = 0;
      for (const v of primCache.values()) {
        if (!v.hiddenFromPublishing) {
          try {
            v.hiddenFromPublishing = true;
            hidden++;
          } catch (e) {
          }
        }
      }
      try {
        figma.root.setPluginData(FILE_PRIMITIVES_HIDDEN_KEY, "1");
      } catch (e) {
      }
      if (hidden > 0) log(`\u2713 Hid ${hidden} primitive${hidden > 1 ? "s" : ""} from publishing \u2014 consume "${COLLECTIONS.semantics}" instead; toggle a variable's eye icon in Figma to expose it again`);
    }
    const primByHex = /* @__PURE__ */ new Map();
    for (const [key, hex] of Object.entries(tokens.colors.primitive)) {
      if (!hex) continue;
      const v = primCache.get(primitiveVarName(key));
      const norm2 = normHex(hex);
      if (v && !primByHex.has(norm2)) primByHex.set(norm2, v);
    }
    const primAlphaByHex = /* @__PURE__ */ new Map();
    for (const [key, hex] of Object.entries((_L = tokens.colors.primitiveAlpha) != null ? _L : {})) {
      if (!hex) continue;
      const v = primCache.get(primitiveAlphaVarName(key));
      const norm2 = rgbaToHex8(hexToRgba(hex));
      if (v && !primAlphaByHex.has(norm2)) primAlphaByHex.set(norm2, v);
    }
    const semCol = findOrCreateCollection(COLLECTIONS.semantics);
    const semCache = cacheFor(semCol);
    const themes = tokens.colors.themes && Object.keys(tokens.colors.themes).length > 0 ? tokens.colors.themes : __spreadValues({
      light: tokens.colors.semantic || {}
    }, tokens.colors.semanticDark ? { dark: tokens.colors.semanticDark } : {});
    const ordered = ((_M = tokens.colors.themeOrder) != null ? _M : []).filter((t) => themes[t]);
    const themeNames = [...ordered, ...Object.keys(themes).filter((t) => !ordered.includes(t))];
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const arch = tokens.colors.architecture;
    const themeLabels = tokens.colors.themeLabels && typeof tokens.colors.themeLabels === "object" ? tokens.colors.themeLabels : {};
    const norm = arch ? normalizeArchitecture(arch, themeNames, themeLabels) : null;
    if (arch && !norm) {
      log(`\u26A0 "${arch.kind}" architecture present but its token payload couldn't be read \u2014 falling back to the flat role catalogue`);
    }
    const modeSpec = norm ? norm.modes : themeNames.map((t) => {
      var _a2;
      return [t, ((_a2 = themeLabels[t]) == null ? void 0 : _a2.trim()) || cap(t)];
    });
    const modeIdOf = {};
    const skippedModes = [];
    try {
      semCol.renameMode(semCol.defaultModeId, modeSpec[0][1]);
    } catch (e) {
    }
    pruneModes(semCol, new Set(modeSpec.map(([, label]) => label)), COLLECTIONS.semantics);
    modeIdOf[modeSpec[0][0]] = semCol.defaultModeId;
    for (const [key, label] of modeSpec.slice(1)) {
      const found = semCol.modes.find((m) => m.name === label);
      if (found) {
        modeIdOf[key] = found.modeId;
        continue;
      }
      try {
        modeIdOf[key] = semCol.addMode(label);
      } catch (e) {
        skippedModes.push(label);
      }
    }
    const allModeIds = Object.values(modeIdOf);
    if (skippedModes.length > 0) {
      log(`\u26A0 ${skippedModes.length} theme column${skippedModes.length > 1 ? "s" : ""} skipped (${skippedModes.join(", ")}) \u2014 your Figma plan's mode-per-collection limit was reached. Upgrade the plan to add more theme columns.`);
    }
    const plan = [];
    let aliasedCount = 0;
    let rawCount = 0;
    let unresolvedCount = 0;
    const valueFor = (rgba) => {
      const prim = rgba.a === 1 ? primByHex.get(normHex(rgbaToHex(rgba))) : primAlphaByHex.get(rgbaToHex8(rgba));
      if (prim) {
        aliasedCount++;
        return figma.variables.createVariableAlias(prim);
      }
      rawCount++;
      return rgba;
    };
    if (norm && arch) {
      const palettes = arch.palettes;
      const lookup = arch.kind === "tonal" ? (fam, tone) => {
        var _a2;
        return (_a2 = palettes == null ? void 0 : palettes[fam]) == null ? void 0 : _a2[tone];
      } : (fam, tone) => primitiveRefHex(tokens, fam, tone);
      for (const group of norm.groups) {
        for (const tok of group.tokens) {
          const resolved = [];
          let base;
          for (const [modeKey] of norm.modes) {
            const mid = modeIdOf[modeKey];
            if (!mid) continue;
            const rgba = archValueRgba((_N = tok.byMode[modeKey]) != null ? _N : "", lookup);
            if (rgba && !base) base = rgba;
            resolved.push([mid, rgba]);
          }
          if (!base) {
            unresolvedCount++;
            continue;
          }
          plan.push({
            name: archFigmaName(group.label, tok.key),
            type: "COLOR",
            values: resolved.map(([mid, rgba]) => [mid, valueFor(rgba != null ? rgba : base)])
          });
        }
      }
    } else {
      const roleKeys = /* @__PURE__ */ new Set();
      for (const t of themeNames) Object.keys(themes[t]).forEach((k) => roleKeys.add(k));
      for (const key of roleKeys) {
        const baseHex = themes[themeNames[0]][key] || themeNames.map((t) => themes[t][key]).find(Boolean);
        if (!baseHex) continue;
        const values = [];
        for (const t of themeNames) {
          const mid = modeIdOf[t];
          if (!mid) continue;
          values.push([mid, valueFor(__spreadProps(__spreadValues({}, hexToRgb(themes[t][key] || baseHex)), { a: 1 }))]);
        }
        plan.push({ name: semanticVarName(key), type: "COLOR", values });
      }
    }
    if (tokens.colors.panelBackground) {
      const pb = tokens.colors.panelBackground;
      plan.push({ name: "panel-background", type: "STRING", values: allModeIds.map((mid) => [mid, pb]) });
    }
    const desired = plan.map((e) => e.name);
    const byId = new Map(allVars.map((v) => [v.id, v]));
    const currentVars = semCol.variableIds.map((id) => byId.get(id)).filter((v) => v !== void 0);
    const currentNames = currentVars.map((v) => v.name);
    const desiredKey = orderFingerprint(desired);
    const blockedKey = figma.root.getPluginData(FILE_SEM_ORDER_STUCK_KEY);
    const orderMatches = currentNames.length === 0 || currentNames.join(" ") === desired.join(" ");
    if (!orderMatches && blockedKey !== desiredKey) {
      let dropped = 0;
      let stuck = 0;
      for (const v of currentVars) {
        try {
          v.remove();
          dropped++;
          const i = allVars.indexOf(v);
          if (i !== -1) allVars.splice(i, 1);
        } catch (e) {
          stuck++;
        }
      }
      semCache.clear();
      if (stuck > 0) {
        try {
          figma.root.setPluginData(FILE_SEM_ORDER_STUCK_KEY, desiredKey);
        } catch (e) {
        }
        log(`\u26A0 "${COLLECTIONS.semantics}": ${stuck} token${stuck === 1 ? "" : "s"} could not be recreated in the platform's order \u2014 Figma refuses to remove a variable another file still uses. Their VALUES keep syncing normally; only the grouping stays as it was. To fix the order, unpublish this file as a library (or run Reset this file) and import once more. This is not retried \u2014 retrying would rebuild the whole file on every sync.`);
      } else {
        try {
          figma.root.setPluginData(FILE_SEM_ORDER_STUCK_KEY, "");
        } catch (e) {
        }
        log(`\u21BB "${COLLECTIONS.semantics}" rebuilt in the platform's order (${dropped} token${dropped === 1 ? "" : "s"} recreated) \u2014 Figma has no reorder API, so recreating them is the only way the groups can follow the system`);
      }
      semanticsRebuilt = true;
    } else if (orderMatches && blockedKey) {
      try {
        figma.root.setPluginData(FILE_SEM_ORDER_STUCK_KEY, "");
      } catch (e) {
      }
    }
    for (const entry of plan) {
      const scopes = entry.type === "COLOR" ? scopesForSemantic(entry.name) : void 0;
      const v = upsertVarIn(semCol, semCache, entry.name, entry.type, scopes);
      for (const [mid, value] of entry.values) v.setValueForMode(mid, value);
    }
    if (norm && arch) {
      log(`\u2713 Semantic tokens \u2014 ${(_O = ARCH_LABEL[arch.kind]) != null ? _O : arch.kind} architecture (${plan.length} tokens \xB7 ${norm.groups.length} groups \xD7 ${allModeIds.length} mode${allModeIds.length > 1 ? "s" : ""} \u2014 ${aliasedCount} linked to primitives${unresolvedCount > 0 ? `, ${unresolvedCount} unresolved` : ""})`);
    } else {
      log(`\u2713 Semantic tokens (${plan.length} roles \xD7 ${allModeIds.length} theme${allModeIds.length > 1 ? "s" : ""} \u2014 ${aliasedCount} linked to primitives${rawCount > 0 ? `, ${rawCount} raw` : ""})`);
    }
    pruneVars(semCache, new Set(desired), COLLECTIONS.semantics);
    for (const stale of existingCollections.filter((c) => LEGACY_COLLECTIONS.indexOf(c.name) !== -1)) {
      const staleName = stale.name;
      try {
        stale.remove();
        existingCollections.splice(existingCollections.indexOf(stale), 1);
        log(`Removed "${staleName}" \u2014 merged into "${COLLECTIONS.semantics}"`);
      } catch (e) {
      }
    }
    emitCollection(
      COLLECTIONS.spacing,
      Object.entries(tokens.spacing),
      "FLOAT",
      pxToFloat,
      (k) => k,
      (t) => {
        var _a2, _b2;
        return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.spacing;
      }
    );
    const spacingRoleCount = emitRoleAliases(
      COLLECTIONS.spacing,
      tokens.spacingRoles,
      (s) => s,
      (t) => {
        var _a2, _b2;
        return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.spacingRoles;
      }
    );
    log(`\u2713 Spacing tokens (${Object.keys(tokens.spacing).length} steps${spacingRoleCount ? ` \xB7 ${spacingRoleCount} roles` : ""})`);
    if (tokens.padding && Object.keys(tokens.padding).length > 0) {
      emitCollection(
        COLLECTIONS.spacing,
        Object.entries(tokens.padding),
        "FLOAT",
        pxToFloat,
        (k) => `padding/${k}`,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.padding;
        }
      );
      log(`\u2713 Surface padding tokens (${Object.keys(tokens.padding).length} sides)`);
    }
    emitCollection(
      COLLECTIONS.radius,
      Object.entries(tokens.radius),
      "FLOAT",
      pxToFloat,
      (k) => k,
      (t) => {
        var _a2, _b2;
        return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.radius;
      },
      true
    );
    const radiusRoleCount = emitRoleAliases(
      COLLECTIONS.radius,
      tokens.radiusRoles,
      (s) => s,
      (t) => {
        var _a2, _b2;
        return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.radiusRoles;
      },
      true
    );
    const previewRad = previewRadius(tokens);
    const shownRoles = foundationThemes.length ? foundationThemes.map((theme) => {
      var _a2, _b2, _c2, _d2, _e2;
      const roles = (_c2 = (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[theme]) == null ? void 0 : _b2.radiusRoles) != null ? _c2 : tokens.radiusRoles;
      return `${capFoundationTheme(theme)} boxes=${(_d2 = roles == null ? void 0 : roles.container) != null ? _d2 : "?"} fields=${(_e2 = roles == null ? void 0 : roles.action) != null ? _e2 : "?"}`;
    }).join(", ") : `boxes=${(_Q = (_P = previewRad.radiusRoles) == null ? void 0 : _P.container) != null ? _Q : "?"} fields=${(_S = (_R = previewRad.radiusRoles) == null ? void 0 : _R.action) != null ? _S : "?"}`;
    log(`\u2713 Radius tokens${radiusRoleCount ? ` \xB7 ${radiusRoleCount} roles` : ""} \u2014 ${shownRoles}`);
    const strokeFromV6 = tokens.stroke && Object.keys(tokens.stroke).length > 0;
    const strokeMap = strokeFromV6 ? tokens.stroke : (_T = tokens.borders) == null ? void 0 : _T.width;
    if (strokeMap) {
      const nameOf = strokeFromV6 ? (k) => k : (k) => `width/${k}`;
      emitCollection(
        COLLECTIONS.border,
        Object.entries(strokeMap),
        "FLOAT",
        pxToFloat,
        nameOf,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.stroke;
        }
      );
      const strokeRoleCount = emitRoleAliases(
        COLLECTIONS.border,
        tokens.strokeRoles,
        (s) => s,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.strokeRoles;
        }
      );
      log(`\u2713 Border width tokens (${Object.keys(strokeMap).length}${strokeRoleCount ? ` \xB7 ${strokeRoleCount} roles` : ""})`);
    }
    if (tokens.opacity) {
      emitCollection(COLLECTIONS.opacity, Object.entries(tokens.opacity), "FLOAT", (v) => (parseFloat(v) || 0) / 100);
      log(`\u2713 Opacity tokens (${Object.keys(tokens.opacity).length})`);
    }
    if (tokens.sizes) {
      emitCollection(
        COLLECTIONS.size,
        Object.entries(tokens.sizes),
        "FLOAT",
        pxToFloat,
        (k) => k,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.sizes;
        }
      );
      const sizeRoleCount = emitRoleAliases(
        COLLECTIONS.size,
        tokens.sizeRoles,
        (s) => s,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.sizeRoles;
        }
      );
      log(`\u2713 Size tokens (${Object.keys(tokens.sizes).length}${sizeRoleCount ? ` \xB7 ${sizeRoleCount} roles` : ""})`);
    }
    if (tokens.selector) {
      emitCollection(
        COLLECTIONS.selector,
        Object.entries(tokens.selector),
        "FLOAT",
        pxToFloat,
        (k) => k,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.selector;
        }
      );
      const selectorRoleCount = emitRoleAliases(
        COLLECTIONS.selector,
        tokens.selectorRoles,
        (s) => s,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.selectorRoles;
        }
      );
      log(`\u2713 Selector tokens (${Object.keys(tokens.selector).length}${selectorRoleCount ? ` \xB7 ${selectorRoleCount} roles` : ""})`);
    }
    if (tokens.grid) {
      emitCollection(
        COLLECTIONS.grid,
        Object.entries(tokens.grid),
        "FLOAT",
        pxToFloat,
        (k) => k,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.grid;
        }
      );
      const bpRoleCount = emitRoleAliases(
        COLLECTIONS.grid,
        tokens.breakpointRoles,
        (s) => `breakpoint-${s}`,
        (t) => {
          var _a2, _b2;
          return (_b2 = (_a2 = tokens.foundationsByTheme) == null ? void 0 : _a2[t]) == null ? void 0 : _b2.breakpointRoles;
        }
      );
      log(`\u2713 Grid tokens (${Object.keys(tokens.grid).length}${bpRoleCount ? ` \xB7 ${bpRoleCount} breakpoint roles` : ""})`);
    }
    if ((_U = tokens.icons) == null ? void 0 : _U.library) {
      emitCollection(COLLECTIONS.icons, [["library", tokens.icons.name || tokens.icons.library]], "STRING", (v) => v);
    }
    if (tokens.copy) {
      emitCollection(COLLECTIONS.copy, Object.entries(tokens.copy), "STRING", (v) => v);
      log(`\u2713 Copy tokens (${Object.keys(tokens.copy).length} strings)`);
    }
    const protectedNames = /* @__PURE__ */ new Set([...Object.values(COLLECTIONS), ...Object.values(ARCH_LABEL)]);
    for (const leftoverName of leftoverProjectNames(tokens.project || "")) {
      if (protectedNames.has(leftoverName)) continue;
      const leftover = existingCollections.find((c) => c.name === leftoverName);
      if (!leftover) continue;
      try {
        leftover.remove();
        existingCollections.splice(existingCollections.indexOf(leftover), 1);
        log(`\u2713 Removed leftover "${leftoverName}" collection \u2014 this file now holds "${tokens.project || "untitled"}"`);
      } catch (e) {
      }
    }
    log(`\u2139 One design system per file \u2014 add variants as themes (modes) in "Color Semantics".`);
    return count;
  }
  function parseBoxShadow(css) {
    const layers = [];
    let depth = 0;
    let cur = "";
    for (const ch of css) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        layers.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) layers.push(cur);
    const effects = [];
    for (const layer of layers) {
      let rest = layer.trim();
      if (!rest || /^none$/i.test(rest)) continue;
      if (/\binset\b/i.test(rest)) continue;
      let color = { r: 0, g: 0, b: 0, a: 0.1 };
      const rgbaComma = rest.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
      const rgbaSpace = rest.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i);
      const hexC = rest.match(/#([0-9a-fA-F]{3,8})\b/);
      if (rgbaComma) {
        color = { r: Number(rgbaComma[1]) / 255, g: Number(rgbaComma[2]) / 255, b: Number(rgbaComma[3]) / 255, a: rgbaComma[4] === void 0 ? 1 : Number(rgbaComma[4]) };
        rest = rest.replace(rgbaComma[0], "");
      } else if (rgbaSpace) {
        color = { r: Number(rgbaSpace[1]) / 255, g: Number(rgbaSpace[2]) / 255, b: Number(rgbaSpace[3]) / 255, a: rgbaSpace[4] === void 0 ? 1 : Number(rgbaSpace[4]) };
        rest = rest.replace(rgbaSpace[0], "");
      } else if (hexC) {
        color = hexToRgba("#" + hexC[1]);
        rest = rest.replace(hexC[0], "");
      }
      const nums = rest.trim().split(/\s+/).map(pxToFloat).filter((n) => !Number.isNaN(n));
      if (nums.length < 3) continue;
      const [x, y, blur, spread = 0] = nums;
      effects.push({
        type: "DROP_SHADOW",
        color,
        offset: { x, y },
        radius: blur,
        spread,
        visible: true,
        blendMode: "NORMAL"
      });
    }
    return effects;
  }
  function parseCssGradient(css) {
    const m = css.trim().match(/^(linear|radial)-gradient\((.*)\)$/);
    if (!m) return null;
    const radial = m[1] === "radial";
    let body = m[2].trim();
    let angle = 180;
    if (radial) {
      body = body.replace(/^circle\s+at\s+[^,]+,\s*/, "");
    } else {
      const am = body.match(/^(-?\d+(?:\.\d+)?)deg\s*,\s*/);
      if (am) {
        angle = parseFloat(am[1]);
        body = body.slice(am[0].length);
      }
    }
    const gradientStops = [];
    for (const part of body.split(",")) {
      const sm = part.trim().match(/^(#[0-9a-fA-F]{3,8})\s+(-?\d+(?:\.\d+)?)%$/);
      if (!sm) return null;
      gradientStops.push({
        color: hexToRgba(sm[1]),
        position: Math.max(0, Math.min(1, parseFloat(sm[2]) / 100))
      });
    }
    if (gradientStops.length < 2) return null;
    if (radial) {
      const cx = 0.3, cy = 0.3, r = 0.9;
      return {
        type: "GRADIENT_RADIAL",
        gradientStops,
        gradientTransform: [[r, 0, cx - r / 2], [0, r, cy - r / 2]]
      };
    }
    const rad = (angle - 90) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    return {
      type: "GRADIENT_LINEAR",
      gradientStops,
      gradientTransform: [
        [cos, sin, 0.5 - 0.5 * cos - 0.5 * sin],
        [-sin, cos, 0.5 + 0.5 * sin - 0.5 * cos]
      ]
    };
  }
  function assignedGradient(tokens, surface) {
    var _a, _b;
    const slug = (_a = tokens.gradientAssignments) == null ? void 0 : _a[surface];
    if (!slug) return null;
    const css = (_b = tokens.gradients) == null ? void 0 : _b[slug];
    return css ? parseCssGradient(css) : null;
  }
  async function importStyles(tokens) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    let count = 0;
    const previewType = previewTypography(tokens);
    const fontFamily = normalizeFontFamilyName(previewType.fontFamily);
    const headingFamily = normalizeFontFamilyName((_a = previewType.headingFontFamily) != null ? _a : fontFamily);
    const textByName = new Map(
      (await figma.getLocalTextStylesAsync()).map((s) => [s.name, s])
    );
    const stalePaints = (await figma.getLocalPaintStylesAsync()).filter((s) => {
      const parts = s.name.split("/");
      return parts.length >= 2 && (parts[1] === "Scale" || parts[1] === "Semantic");
    });
    if (stalePaints.length > 0) {
      for (const s of stalePaints) {
        try {
          s.remove();
        } catch (e) {
        }
      }
      log(`\u2713 Removed ${stalePaints.length} legacy color paint styles (colors are variables-only now)`);
    }
    const gradients = (_b = tokens.gradients) != null ? _b : {};
    if (Object.keys(gradients).length > 0) {
      const paintByName = new Map(
        (await figma.getLocalPaintStylesAsync()).map((s) => [s.name, s])
      );
      const upsertPaint = (name, paint) => {
        const existing = paintByName.get(name);
        const style = existing != null ? existing : figma.createPaintStyle();
        if (!existing) {
          count++;
          paintByName.set(name, style);
        }
        style.name = name;
        style.paints = [paint];
      };
      const assigned = (_c = tokens.gradientAssignments) != null ? _c : {};
      let made = 0;
      let darkMade = 0;
      const unparsed = [];
      for (const [slug, css] of Object.entries(gradients)) {
        const paint = parseCssGradient(css);
        if (!paint) {
          unparsed.push(slug);
          continue;
        }
        upsertPaint(`Gradient/${slug}`, paint);
        made++;
        const darkCss = (_d = tokens.gradientsDark) == null ? void 0 : _d[slug];
        if (darkCss && darkCss !== css) {
          const darkPaint = parseCssGradient(darkCss);
          if (darkPaint) {
            upsertPaint(`Gradient/${slug} (Dark)`, darkPaint);
            darkMade++;
          }
        }
      }
      const tags = ["cover", "avatar"].filter((s) => assigned[s]).map((s) => `${s} \u2192 ${assigned[s]}`);
      if (made > 0) {
        log(`\u2713 Gradient paint styles (${made}${darkMade > 0 ? ` + ${darkMade} dark` : ""})${tags.length ? ` \u2014 ${tags.join(", ")}` : ""}`);
      }
      if (unparsed.length > 0) {
        log(`\u26A0 ${unparsed.length} gradient${unparsed.length > 1 ? "s" : ""} couldn't be converted to a Figma paint (${unparsed.join(", ")}) \u2014 unsupported CSS gradient form`);
      }
    }
    const typoVars = /* @__PURE__ */ new Map();
    {
      const cols = await figma.variables.getLocalVariableCollectionsAsync();
      const typoCol = cols.find((c) => c.name === COLLECTIONS.typography);
      if (typoCol) {
        for (const v of await figma.variables.getLocalVariablesAsync()) {
          if (v.variableCollectionId === typoCol.id) typoVars.set(v.name, v);
        }
      }
    }
    function bindTextStyle(ts, field, v) {
      if (!v) return;
      try {
        ts.setBoundVariable(field, v);
      } catch (e) {
      }
    }
    const { loadedFamilies, fontFor: fontForStyle } = await createFontResolver(tokens);
    const weightMap = (_e = tokens.typography.weights) != null ? _e : {};
    function resolvedStyle(weightKey) {
      var _a2, _b2;
      const val = (_b2 = weightMap[weightKey]) != null ? _b2 : weightKey.startsWith("display") ? (_a2 = weightMap.semibold) != null ? _a2 : 600 : 400;
      if (val >= 700) return "Bold";
      if (val >= 600) return "Semi Bold";
      if (val >= 500) return "Medium";
      return "Regular";
    }
    for (const [sizeKey, sizeVal] of Object.entries(tokens.typography.sizes)) {
      const sizePx = pxToFloat(sizeVal);
      if (!sizePx) continue;
      const styleName = `Type/size/${sizeKey}`;
      const existing = textByName.get(styleName);
      const ts = existing != null ? existing : figma.createTextStyle();
      if (!existing) {
        count++;
        textByName.set(styleName, ts);
      }
      ts.name = styleName;
      const isHeading = /^(display|heading)/.test(sizeKey);
      const wantedFamily = isHeading ? headingFamily : fontFamily;
      const fontStyle = resolvedStyle(sizeKey);
      const resolved = fontForStyle(fontStyle, isHeading);
      try {
        ts.fontName = loadedFamilies.has(wantedFamily) ? resolved : { family: "Inter", style: resolved.style };
      } catch (e) {
        ts.fontName = { family: "Inter", style: fontStyle };
      }
      ts.fontSize = sizePx;
      const lhVal = (_f = tokens.typography.lineHeights) == null ? void 0 : _f[sizeKey];
      ts.lineHeight = lhVal ? { value: pxToFloat(lhVal), unit: "PIXELS" } : { unit: "AUTO" };
      const lsVal = (_g = tokens.typography.letterSpacings) == null ? void 0 : _g[sizeKey];
      ts.letterSpacing = lsVal ? { value: pxToFloat(lsVal), unit: "PIXELS" } : { value: 0, unit: "PIXELS" };
      bindTextStyle(
        ts,
        "fontFamily",
        (_j = (_i = isHeading ? (_h = typoVars.get(TYPOGRAPHY_FAMILY_VARS.display)) != null ? _h : typoVars.get(TYPOGRAPHY_FAMILY_VARS.legacyDisplay) : void 0) != null ? _i : typoVars.get(TYPOGRAPHY_FAMILY_VARS.body)) != null ? _j : typoVars.get(TYPOGRAPHY_FAMILY_VARS.legacyBody)
      );
      bindTextStyle(ts, "fontSize", typoVars.get(`size/${sizeKey}`));
      bindTextStyle(ts, "fontWeight", (_k = typoVars.get(`weight/${isHeading ? "semibold" : "regular"}`)) != null ? _k : typoVars.get("weight/regular"));
      bindTextStyle(ts, "lineHeight", typoVars.get(`line-height/${sizeKey}`));
      bindTextStyle(ts, "letterSpacing", typoVars.get(`letter-spacing/${sizeKey}`));
    }
    if (Object.keys(tokens.typography.sizes).length > 0) {
      log(`\u2713 Text styles (${Object.keys(tokens.typography.sizes).length} sizes)`);
    }
    const typeRoles = tokens.typography.roles;
    if (typeRoles) {
      let roleStyles = 0;
      for (const [key, modes] of Object.entries(typeRoles)) {
        const d = modes == null ? void 0 : modes.desktop;
        if (!d) continue;
        const sizeVal = tokens.typography.sizes[d.size];
        const sizePx = sizeVal ? pxToFloat(sizeVal) : 0;
        if (!sizePx) continue;
        const styleName = `Type/${key}`;
        const existing = textByName.get(styleName);
        const ts = existing != null ? existing : figma.createTextStyle();
        if (!existing) {
          count++;
          textByName.set(styleName, ts);
        }
        ts.name = styleName;
        const isHeading = d.family === "display";
        const wantedFamily = isHeading ? headingFamily : fontFamily;
        const fontStyle = resolvedStyle(d.weight);
        const resolved = fontForStyle(fontStyle, isHeading);
        try {
          ts.fontName = loadedFamilies.has(wantedFamily) ? resolved : { family: "Inter", style: resolved.style };
        } catch (e) {
          ts.fontName = { family: "Inter", style: fontStyle };
        }
        ts.fontSize = sizePx;
        const lhVal = (_l = tokens.typography.lineHeights) == null ? void 0 : _l[d.size];
        ts.lineHeight = lhVal ? { value: pxToFloat(lhVal), unit: "PIXELS" } : { unit: "AUTO" };
        const lsVal = (_m = tokens.typography.letterSpacings) == null ? void 0 : _m[d.size];
        ts.letterSpacing = lsVal ? { value: pxToFloat(lsVal), unit: "PIXELS" } : { value: 0, unit: "PIXELS" };
        bindTextStyle(
          ts,
          "fontFamily",
          (_q = (_p = (_o = typoVars.get(`role/${key}/family`)) != null ? _o : isHeading ? (_n = typoVars.get(TYPOGRAPHY_FAMILY_VARS.display)) != null ? _n : typoVars.get(TYPOGRAPHY_FAMILY_VARS.legacyDisplay) : void 0) != null ? _p : typoVars.get(TYPOGRAPHY_FAMILY_VARS.body)) != null ? _q : typoVars.get(TYPOGRAPHY_FAMILY_VARS.legacyBody)
        );
        bindTextStyle(ts, "fontSize", (_r = typoVars.get(`role/${key}/size`)) != null ? _r : typoVars.get(`size/${d.size}`));
        bindTextStyle(ts, "fontWeight", (_s = typoVars.get(`role/${key}/weight`)) != null ? _s : typoVars.get(`weight/${d.weight}`));
        bindTextStyle(ts, "lineHeight", typoVars.get(`line-height/${d.size}`));
        bindTextStyle(ts, "letterSpacing", typoVars.get(`letter-spacing/${d.size}`));
        roleStyles++;
      }
      if (roleStyles > 0) log(`\u2713 Text styles (${roleStyles} semantic roles)`);
    }
    if (tokens.shadows && Object.keys(tokens.shadows).length > 0) {
      const effectByName = new Map(
        (await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s])
      );
      const upsertEffect = (name, css) => {
        const effects = parseBoxShadow(css);
        if (effects.length === 0) return false;
        const existing = effectByName.get(name);
        const style = existing != null ? existing : figma.createEffectStyle();
        if (!existing) {
          count++;
          effectByName.set(name, style);
        }
        style.name = name;
        style.effects = effects;
        return true;
      };
      let made = 0;
      let darkMade = 0;
      const unparsed = [];
      for (const [key, css] of Object.entries(tokens.shadows)) {
        if (upsertEffect(`Shadow/${key}`, css)) made++;
        else unparsed.push(key);
        const darkCss = (_t = tokens.shadowsDark) == null ? void 0 : _t[key];
        if (darkCss && darkCss !== css) {
          if (upsertEffect(`Shadow/${key} (Dark)`, darkCss)) darkMade++;
        }
      }
      if (made > 0) {
        log(`\u2713 Shadow effect styles (${made}${darkMade > 0 ? ` + ${darkMade} dark` : ""})`);
      }
      if (unparsed.length > 0) {
        log(`\u26A0 ${unparsed.length} shadow${unparsed.length > 1 ? "s" : ""} couldn't be converted to a Figma effect (${unparsed.join(", ")}) \u2014 unsupported CSS box-shadow form`);
      }
    }
    if ((_u = tokens.grid) == null ? void 0 : _u.columns) {
      const name = `Grid/${tokens.grid.columns} columns`;
      const gridByName = new Map(
        (await figma.getLocalGridStylesAsync()).map((s) => [s.name, s])
      );
      const existing = gridByName.get(name);
      const style = existing != null ? existing : figma.createGridStyle();
      if (!existing) count++;
      style.name = name;
      style.layoutGrids = [{
        pattern: "COLUMNS",
        alignment: "STRETCH",
        count: parseInt(tokens.grid.columns) || 12,
        gutterSize: pxToFloat((_v = tokens.grid.gutter) != null ? _v : "24px"),
        offset: pxToFloat((_w = tokens.grid.margin) != null ? _w : "32px")
      }];
      log(`\u2713 Grid style (${name})`);
    }
    return count;
  }
  var DOC = {
    // Figma page fill — charcoal, so the light boards read as slabs (matches
    // the ⬡ Documentation canvas). Not a token: chrome must stay readable in
    // every variable mode.
    page: "#1E1E1E",
    canvas: "#1E1E1E",
    card: "#FFFFFF",
    ink: "#0F0F10",
    text: "#111114",
    muted: "#6E6E76",
    border: "#E9E9EC",
    faint: "#FAFAFB",
    // Light board on the charcoal page — white is the most readable surface
    // for specimens and editorial chrome.
    board: "#FFFFFF",
    bar: "#E6E6F7",
    barText: "#26262E"
  };
  var PANEL_W = 380;
  var PANEL_PAD = 32;
  var PANEL_INNER = PANEL_W - PANEL_PAD * 2;
  function docChrome(fontFor, typo, sizes, chrome, modePin) {
    const docSolid = (hex, opacity = 1, v) => {
      let paint = { type: "SOLID", color: hexToRgb(hex), opacity };
      if ((v == null ? void 0 : v.resolvedType) === "COLOR") paint = figma.variables.setBoundVariableForPaint(paint, "color", v);
      return paint;
    };
    function docText(chars, size, style, hex, opacity = 1, v) {
      const t = figma.createText();
      const applyFont = (s) => {
        t.fontName = fontFor(s);
      };
      try {
        applyFont(style);
        t.characters = chars;
      } catch (e) {
        try {
          applyFont("Regular");
          t.characters = chars;
        } catch (e2) {
          t.characters = chars;
        }
      }
      t.fontSize = size;
      t.fills = [docSolid(hex, opacity, v)];
      if (typo && typo.size > 0) {
        bindAllTextFields(t, typo, {
          sizeKey: nearestTypeSizeKey(sizes, size),
          weightKey: weightKeyFromStyle(style),
          heading: size >= 20 && (style === "Semi Bold" || style === "Bold")
        });
      }
      return t;
    }
    function docFrame(name, dir, gapPx) {
      const f = figma.createFrame();
      f.name = name;
      f.layoutMode = dir;
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "AUTO";
      f.itemSpacing = gapPx;
      f.fills = [];
      return f;
    }
    function wrapText(t, w) {
      t.resize(w, t.height);
      t.textAutoResize = "HEIGHT";
      return t;
    }
    function docDivider(label) {
      const r = docFrame(`divider-${label.toLowerCase()}`, "HORIZONTAL", 10);
      r.primaryAxisSizingMode = "FIXED";
      r.counterAxisSizingMode = "FIXED";
      r.resize(PANEL_INNER, 20);
      r.counterAxisAlignItems = "CENTER";
      const chipF = docFrame("chip", "HORIZONTAL", 0);
      chipF.paddingLeft = 8;
      chipF.paddingRight = 8;
      chipF.paddingTop = 3;
      chipF.paddingBottom = 3;
      chipF.strokes = [docSolid(DOC.text, 0.8, chrome == null ? void 0 : chrome.borderStrong)];
      chipF.strokeWeight = 1;
      chipF.cornerRadius = 4;
      const t = docText(label, 9, "Medium", DOC.text, 1, chrome == null ? void 0 : chrome.text);
      t.letterSpacing = { value: 1, unit: "PIXELS" };
      chipF.appendChild(t);
      r.appendChild(chipF);
      const line = figma.createFrame();
      line.name = "line";
      line.resize(10, 1);
      line.fills = [docSolid(DOC.border, 1, chrome == null ? void 0 : chrome.border)];
      r.appendChild(line);
      line.layoutSizingHorizontal = "FILL";
      line.layoutSizingVertical = "FIXED";
      return r;
    }
    function docBullet(parent, title, desc) {
      const b = docFrame(`spec-${title.toLowerCase().replace(/\s+/g, "-")}`, "VERTICAL", 4);
      b.appendChild(docText(title, 12, "Medium", DOC.text, 1, chrome == null ? void 0 : chrome.text));
      b.appendChild(wrapText(docText(desc, 11, "Regular", DOC.muted, 1, chrome == null ? void 0 : chrome.muted), PANEL_INNER));
      parent.appendChild(b);
    }
    function docBoard(name, barLabel, project, contentW) {
      const b = docFrame(name, "VERTICAL", 24);
      b.fills = [docSolid(DOC.board, 1, chrome == null ? void 0 : chrome.board)];
      b.cornerRadius = 24;
      b.paddingTop = 48;
      b.paddingBottom = 48;
      b.paddingLeft = 48;
      b.paddingRight = 48;
      pinToLightMode(b, modePin);
      const bar = docFrame(`\xA7 ${barLabel}`, "HORIZONTAL", 8);
      bar.fills = [docSolid(DOC.bar, 1, chrome == null ? void 0 : chrome.card)];
      bar.cornerRadius = 12;
      bar.primaryAxisSizingMode = "FIXED";
      bar.counterAxisSizingMode = "FIXED";
      bar.resize(contentW, 56);
      bar.primaryAxisAlignItems = "SPACE_BETWEEN";
      bar.counterAxisAlignItems = "CENTER";
      bar.paddingLeft = 24;
      bar.paddingRight = 24;
      bar.appendChild(docText(barLabel, 12, "Medium", DOC.barText, 1, chrome == null ? void 0 : chrome.text));
      bar.appendChild(docText(`\u2B21 ${project}`, 12, "Semi Bold", DOC.barText, 1, chrome == null ? void 0 : chrome.text));
      b.appendChild(bar);
      return b;
    }
    return { docSolid, docText, docFrame, wrapText, docDivider, docBullet, docBoard };
  }
  var CIRCLE_DASHED_PATH = "M96.26 37.05a8 8 0 0 1 5.74-9.76a104.1 104.1 0 0 1 52 0a8 8 0 0 1-2 15.75a8.2 8.2 0 0 1-2-.26a88.1 88.1 0 0 0-44 0a8 8 0 0 1-9.74-5.73M53.79 55.14a104.05 104.05 0 0 0-26 45a8 8 0 0 0 15.42 4.27a88 88 0 0 1 22-38.09a8 8 0 0 0-11.42-11.18m-10.58 96.41a8 8 0 1 0-15.42 4.28a104.1 104.1 0 0 0 26 45a8 8 0 0 0 11.41-11.22a88.14 88.14 0 0 1-21.99-38.06M150 213.22a88 88 0 0 1-44 0a8 8 0 1 0-4 15.49a104.1 104.1 0 0 0 52 0a8 8 0 0 0-4-15.49M222.65 146a8 8 0 0 0-9.85 5.58a87.9 87.9 0 0 1-22 38.08a8 8 0 1 0 11.42 11.21a104 104 0 0 0 26-45a8 8 0 0 0-5.57-9.87m-9.86-41.54a8 8 0 0 0 15.42-4.28a104 104 0 0 0-26-45A8 8 0 1 0 190.8 66.4a88 88 0 0 1 21.99 38.05Z";
  var SQUARE_DASHED_PATH = "M80,48a8,8,0,0,1-8,8H40V72a8,8,0,0,1-16,0V56A16,16,0,0,1,40,40H72A8,8,0,0,1,80,48ZM32,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,32,152Zm40,48H40V184a8,8,0,0,0-16,0v16a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16Zm72,0H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Zm80-24a8,8,0,0,0-8,8v16H184a8,8,0,0,0,0,16h32a16,16,0,0,0,16-16V184A8,8,0,0,0,224,176Zm0-72a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,224,104Zm-8-64H184a8,8,0,0,0,0,16h32V72a8,8,0,0,0,16,0V56A16,16,0,0,0,216,40Zm-72,0H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16Z";
  var PLACEHOLDER_MASTER_SIZE = 24;
  var PLACEHOLDER_CIRCLE_NAME = "icon/circle-dashed";
  var PLACEHOLDER_SQUARE_NAME = "icon/square-dashed";
  async function importSample(tokens, includeFullCatalogue = false) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D;
    const allVars = await figma.variables.getLocalVariablesAsync();
    const allCols = await figma.variables.getLocalVariableCollectionsAsync();
    const colNameById = new Map(allCols.map((c) => [c.id, c.name]));
    const varsByCollection = /* @__PURE__ */ new Map();
    for (const v of allVars) {
      const cname = colNameById.get(v.variableCollectionId);
      if (!cname) continue;
      let m = varsByCollection.get(cname);
      if (!m) {
        m = /* @__PURE__ */ new Map();
        varsByCollection.set(cname, m);
      }
      if (!m.has(v.name)) m.set(v.name, v);
    }
    const findVar = (coll, name) => {
      var _a2;
      return (_a2 = varsByCollection.get(coll)) == null ? void 0 : _a2.get(name);
    };
    function bestVar(coll, ...names) {
      for (const n of names) {
        const v = findVar(coll, n);
        if (v) return v;
      }
      return void 0;
    }
    const sem = tokens.colors.semantic;
    const S = COLLECTIONS.semantics;
    const hexOf = (...keys) => {
      for (const k of keys) if (sem[k]) return sem[k];
      return "";
    };
    const P = (v, hex) => ({ v, hex });
    const semLookup = semLookupFor(tokens, allVars, allCols);
    const unboundRoles = [];
    const pair = (varNames, hexKeys, fallback) => {
      var _a2;
      const role = hexKeys[0];
      const hex = semLookup.hexFor(role) || hexOf(...hexKeys) || fallback;
      const v = (_a2 = semLookup.varFor(role, ...varNames)) != null ? _a2 : bestVar(S, ...varNames);
      if (!v && unboundRoles.indexOf(role) === -1) unboundRoles.push(role);
      return P(v, hex);
    };
    const p = {
      surface0: pair(["Surface/page", "background/primary", "surface/0", "bg/primary", "surface"], ["background-primary", "surface-0", "bg-primary", "surface"], "#0f0f0f"),
      surfaceInput: pair(["Surface/input", "surface/input", "background/primary", "surface/0"], ["background-input", "background-primary", "surface-0"], "#0f0f0f"),
      surface1: pair(["Surface/layer-1", "background/secondary", "surface/1", "bg/secondary"], ["background-secondary", "surface-1", "bg-secondary"], "#181818"),
      surface2: pair(["Surface/layer-2", "background/tertiary", "surface/2", "bg/tertiary"], ["background-tertiary", "surface-2", "bg-tertiary"], "#202020"),
      surface3: pair(["background/quaternary", "surface/3"], ["background-quaternary", "surface-3"], "#282828"),
      surface0Hover: pair(["background/primary-hover", "surface/0-hover", "surface/1", "bg/secondary"], ["background-primary-hover", "surface-0-hover", "surface-1"], "#181818"),
      surface1Hover: pair(["background/secondary-hover", "surface/1-hover", "surface/2", "bg/tertiary"], ["background-secondary-hover", "surface-1-hover", "surface-2"], "#202020"),
      surfaceSelected: pair(["Surface/selected", "background/active", "surface/selected", "surface/3"], ["background-active", "surface-selected", "surface-3"], "#2e2e2e"),
      surfaceInv: pair(["Surface/inverse", "surface/inverse", "background/overlay", "bg/inverse"], ["background-inverse", "background-overlay", "surface-inverse", "bg-inverse"], "#f5f5f5"),
      surfaceInvMuted: pair(["background/overlay", "surface/inverse-muted", "surface/inverse", "bg/inverse"], ["background-overlay", "surface-inverse-muted", "surface-inverse"], "#3a3a3a"),
      surfaceOverlay: pair(["background/overlay", "surface/overlay", "surface/inverse"], ["background-overlay", "surface-overlay", "surface-inverse"], "#0a0a0a"),
      brandSubtle: pair(["background/brand-primary", "surface/brand-subtle", "bg/accent-subtle"], ["background-brand-primary", "surface-brand-subtle", "bg-accent-subtle"], "#1c2340"),
      brandMuted: pair(["background/brand-secondary", "surface/brand-muted", "surface/brand-subtle", "bg/accent-subtle"], ["background-brand-secondary", "surface-brand-muted", "surface-brand-subtle"], "#243056"),
      action: pair(["Action/primary/default", "Action/primary.default", "action/primary/default", "action/primary.default", "background/brand-solid", "action/primary", "bg/accent-solid", "primary"], ["background-brand-solid", "action-primary", "bg-accent-solid", "primary"], "#3B82F6"),
      actionHover: pair(["Action/primary/hover", "Action/primary.hover", "action/primary/hover", "action/primary.hover", "background/brand-solid-hover", "action/primary-hover", "bg/accent-solid_hover"], ["background-brand-solid-hover", "action-primary-hover"], "#2f6fe0"),
      actionDisabled: pair(["background/disabled", "action/disabled"], ["background-disabled", "action-disabled"], "#2a2a2a"),
      actionDisabledSubtle: pair(["background/disabled-subtle", "action/disabled-subtle"], ["background-disabled-subtle", "action-disabled-subtle"], "#222222"),
      textPrimary: pair(["content/primary", "text/primary", "text"], ["content-primary", "text-primary", "text"], "#f5f5f5"),
      textSecondary: pair(["content/secondary", "text/secondary"], ["content-secondary", "text-secondary"], "#c9c9c9"),
      textTertiary: pair(["content/tertiary", "text/tertiary"], ["content-tertiary", "text-tertiary"], "#9a9a9a"),
      textQuaternary: pair(["content/quaternary", "text/quaternary", "text/tertiary"], ["content-quaternary", "text-quaternary", "text-tertiary"], "#8a8a8a"),
      // No dedicated placeholder role in the current catalogue — quaternary is
      // its lightest/weakest content tier, the closest match by intent.
      textPlaceholder: pair(["content/quaternary", "text/placeholder", "text/quaternary"], ["content-quaternary", "text-placeholder", "text-quaternary"], "#7a7a7a"),
      textDisabled: pair(["content/disabled", "text/disabled"], ["content-disabled", "text-disabled"], "#6a6a6a"),
      textOnBrand: pair(["Content/on-action", "content/on-action", "content/inverse", "text/on-brand", "text/primary_on-brand", "text/white"], ["content-on-brand", "content-inverse", "text-on-brand", "text-white"], "#ffffff"),
      textOnInverse: pair(["content/inverse", "text/on-inverse", "text/white"], ["content-inverse", "text-on-inverse", "text-white"], "#0f0f0f"),
      textBrand: pair(["content/brand", "text/brand-secondary", "text/brand", "text/accent-primary"], ["content-brand", "text-brand-secondary", "text-brand"], "#8ab4ff"),
      borderDefault: pair(["Border/control", "border/control", "border/primary", "border/default", "border"], ["border-primary", "border-default", "border"], "#333333"),
      // Control stroke, HOVER step — categorical `Border/control-hover` (WCAG
      // 1.4.11). `Border/strong` stays in the list because that is what this role
      // was called before the phase-1 split, so an older payload still resolves
      // to the same value. Flat catalogue still has `border-strong`;
      // content/primary is a last-resort darker ink.
      borderStrong: pair(["Border/control-hover", "border/control-hover", "Border/strong", "border/strong", "content/primary", "border/secondary"], ["border-strong", "content-primary", "border-secondary"], "#454545"),
      borderFocus: pair(["Border/focus", "border/focus", "border/brand", "border/accent"], ["border-focus", "border-brand"], "#3B82F6"),
      borderSubtle: pair(["border/tertiary", "border/subtle", "border/default", "border"], ["border-tertiary", "border-subtle", "border-default"], "#2a2a2a"),
      borderBrand: pair(["border/brand", "border/accent"], ["border-brand"], "#3B82F6"),
      borderDisabled: pair(["border/disabled"], ["border-disabled"], "#2e2e2e"),
      // Error-state control stroke. `border.critical` became
      // `status.critical.border-strong` (configurator audit F1) — a categorical
      // export now creates `Status/critical/border-strong`, so alias that first;
      // `border/error` stays as the pre-F1 / flat-catalogue name.
      borderError: pair(["Status/critical/border-strong", "Status/critical.border-strong", "status/critical/border-strong", "status/critical.border-strong", "border/error"], ["border-error"], "#f04438"),
      // Icon roles — no icon-* family exists any more; alias the matching
      // content-* role (Radix convention: icon and text share their tint).
      iconPrimary: pair(["content/primary", "icon/primary", "fg/primary", "text/primary"], ["content-primary", "icon-primary", "fg-primary", "text-primary"], "#f5f5f5"),
      iconSecondary: pair(["content/secondary", "icon/secondary", "fg/secondary", "text/secondary"], ["content-secondary", "icon-secondary", "fg-secondary", "text-secondary"], "#c9c9c9"),
      iconTertiary: pair(["content/tertiary", "icon/tertiary", "fg/tertiary", "text/tertiary"], ["content-tertiary", "icon-tertiary", "fg-tertiary", "text-tertiary"], "#9a9a9a"),
      iconQuaternary: pair(["content/quaternary", "icon/quaternary", "text/placeholder"], ["content-quaternary", "icon-quaternary", "text-placeholder"], "#8a8a8a"),
      iconDisabled: pair(["content/disabled", "icon/disabled", "text/disabled"], ["content-disabled", "icon-disabled", "text-disabled"], "#6a6a6a"),
      iconOnInverse: pair(["content/inverse", "icon/on-inverse", "text/on-inverse"], ["content-inverse", "icon-on-inverse", "text-on-inverse"], "#0f0f0f"),
      iconBrand: pair(["content/brand", "icon/brand", "text/brand-secondary", "text/brand"], ["content-brand", "icon-brand", "text-brand-secondary"], "#8ab4ff"),
      iconError: pair(["content/error", "icon/error", "text/error"], ["content-error", "icon-error", "text-error"], "#f97066"),
      iconWarning: pair(["content/warning", "icon/warning", "text/warning"], ["content-warning", "icon-warning", "text-warning"], "#fdb022"),
      iconSuccess: pair(["content/success", "icon/success", "text/success"], ["content-success", "icon-success", "text-success"], "#47cd89"),
      // No content-info role exists — left on its old-only keys (see file banner).
      iconInfo: pair(["icon/info", "text/info"], ["icon-info", "text-info"], "#53b1fd"),
      statusError: pair(["Status/critical/surface-solid", "Status/critical.surface-solid", "status/critical/surface-solid", "status/critical.surface-solid", "background/error-solid", "status/error"], ["background-error-solid", "status-error"], "#d92d20"),
      statusErrorOn: pair(["Status/critical/on-solid", "Status/critical.on-solid", "status/critical/on-solid", "status/critical.on-solid", "Content/on-action", "content/inverse"], ["status-on-solid", "content-on-brand", "content-inverse"], "#ffffff"),
      statusErrorSubtle: pair(["Status/critical/surface", "Status/critical.surface", "status/critical/surface", "status/critical.surface", "background/error-primary", "status/error-subtle"], ["background-error-primary", "status-error-subtle"], "#2a1513"),
      // No third "muted" tier — reuses Subtle's key, same as *Subtle above.
      statusErrorMuted: pair(["background/error-primary", "status/error-muted", "status/error-subtle"], ["background-error-primary", "status-error-muted", "status-error-subtle"], "#3a1d1a"),
      statusWarning: pair(["Status/warning/surface-solid", "Status/warning.surface-solid", "status/warning/surface-solid", "status/warning.surface-solid", "background/warning-solid", "status/warning"], ["background-warning-solid", "status-warning"], "#dc6803"),
      statusWarningOn: pair(["Status/warning/on-solid", "Status/warning.on-solid", "status/warning/on-solid", "status/warning.on-solid"], ["status-warning-on"], "#ffffff"),
      statusWarningSubtle: pair(["Status/warning.surface", "status/warning.surface", "background/warning-primary", "status/warning-subtle"], ["background-warning-primary", "status-warning-subtle"], "#2a2013"),
      statusWarningMuted: pair(["background/warning-primary", "status/warning-muted", "status/warning-subtle"], ["background-warning-primary", "status-warning-muted", "status-warning-subtle"], "#3a2d1a"),
      statusSuccess: pair(["Status/success/surface-solid", "Status/success.surface-solid", "status/success/surface-solid", "status/success.surface-solid", "background/success-solid", "status/success"], ["background-success-solid", "status-success"], "#079455"),
      statusSuccessOn: pair(["Status/success/on-solid", "Status/success.on-solid", "status/success/on-solid", "status/success.on-solid"], ["status-success-on"], "#ffffff"),
      statusSuccessSubtle: pair(["Status/success.surface", "status/success.surface", "background/success-primary", "status/success-subtle"], ["background-success-primary", "status-success-subtle"], "#132a1e"),
      statusSuccessMuted: pair(["background/success-primary", "status/success-muted", "status/success-subtle"], ["background-success-primary", "status-success-muted", "status-success-subtle"], "#1a3a2a"),
      // Info now has real Categorical roles (`Status/info/*`). Until it did, both
      // of these bound to nothing and painted the literals below — which is
      // exactly what shipped: an Info alert with a `#1570ef` stroke on `#131c2a`.
      statusInfo: pair(["Status/info/surface-solid", "Status/info.surface-solid", "status/info/surface-solid", "status/info.surface-solid", "status/info"], ["status-info"], "#1570ef"),
      statusInfoOn: pair(["Status/info/on-solid", "Status/info.on-solid", "status/info/on-solid", "status/info.on-solid"], ["status-info-on"], "#ffffff"),
      statusInfoSubtle: pair(["Status/info/surface", "Status/info.surface", "status/info/surface", "status/info.surface", "status/info-subtle"], ["status-info-subtle"], "#131c2a"),
      statusInfoMuted: pair(["Status/info/surface", "Status/info.surface", "status/info-muted", "status/info-subtle"], ["status-info-muted", "status-info-subtle"], "#1a2a3a"),
      // The stroke of a status surface — one alpha token per severity, replacing
      // a hardcoded 0.4 opacity applied to the SOLID fill. See ARCH_ROLE_MAP.
      statusErrorBorder: pair(["Status/critical/border", "Status/critical.border", "status/critical/border", "status/critical.border"], ["status-error-border"], "#f0443866"),
      statusWarningBorder: pair(["Status/warning/border", "Status/warning.border", "status/warning/border", "status/warning.border"], ["status-warning-border"], "#f7900966"),
      statusSuccessBorder: pair(["Status/success/border", "Status/success.border", "status/success/border", "status/success.border"], ["status-success-border"], "#17b26a66"),
      statusInfoBorder: pair(["Status/info/border", "Status/info.border", "status/info/border", "status/info.border"], ["status-info-border"], "#2e90fa66"),
      textError: pair(["Status/critical/content", "Status/critical.content", "status/critical/content", "status/critical.content", "content/error", "text/error"], ["content-error", "text-error"], "#f97066"),
      textWarning: pair(["Status/warning.content", "status/warning.content", "content/warning", "text/warning"], ["content-warning", "text-warning"], "#fdb022"),
      textSuccess: pair(["Status/success.content", "status/success.content", "content/success", "text/success"], ["content-success", "text-success"], "#47cd89"),
      // No content-info role exists — left on its old-only keys (see file banner).
      textInfo: pair(["Status/info/content", "Status/info.content", "status/info/content", "status/info.content", "text/info"], ["text-info"], "#53b1fd")
    };
    if (unboundRoles.length > 0) {
      log(`\u2139 ${unboundRoles.length} component role${unboundRoles.length > 1 ? "s have" : " has"} no token in "${COLLECTIONS.semantics}" (${unboundRoles.slice(0, 6).join(", ")}${unboundRoles.length > 6 ? `, +${unboundRoles.length - 6} more` : ""}) \u2014 painted from the system's value, unbound`);
    }
    const T = COLLECTIONS.typography;
    const sizeXs = bestVar(T, "size/text-xs", "size/xs");
    const sizeSm = bestVar(T, "size/text-sm", "size/sm");
    const sizeMd = bestVar(T, "size/text-md", "size/base", "size/md");
    const sizeLg = bestVar(T, "size/text-lg", "size/lg");
    const wRegular = bestVar(T, "weight/regular");
    const wMedium = bestVar(T, "weight/medium");
    const wSemibold = bestVar(T, "weight/semibold", "weight/semi-bold");
    const familyVar = bestVar(T, TYPOGRAPHY_FAMILY_VARS.body, TYPOGRAPHY_FAMILY_VARS.legacyBody);
    const previewRad = previewRadius(tokens);
    const radScale = previewRad.radius;
    const radRoles = previewRad.radiusRoles;
    const radXs = bestVar(COLLECTIONS.radius, "xs");
    const radSm = bestVar(COLLECTIONS.radius, "sm");
    const radMd = bestVar(COLLECTIONS.radius, "md");
    const radLg = bestVar(COLLECTIONS.radius, "lg");
    const radiusXs = pxToFloat((_c = (_b = radScale.xs) != null ? _b : (_a = tokens.radius) == null ? void 0 : _a.xs) != null ? _c : "4px");
    const radiusSm = pxToFloat((_f = (_e = radScale.sm) != null ? _e : (_d = tokens.radius) == null ? void 0 : _d.sm) != null ? _f : "4px");
    const radiusMd = pxToFloat((_i = (_h = radScale.md) != null ? _h : (_g = tokens.radius) == null ? void 0 : _g.md) != null ? _i : "8px");
    const radiusLg = pxToFloat((_l = (_k = radScale.lg) != null ? _k : (_j = tokens.radius) == null ? void 0 : _j.lg) != null ? _l : "12px");
    const radiusXl = pxToFloat((_o = (_n = radScale.xl) != null ? _n : (_m = tokens.radius) == null ? void 0 : _m.xl) != null ? _o : "16px");
    const rolePx = (role, fallbackStep, fallbackPx) => {
      var _a2, _b2, _c2;
      const step = (_a2 = radRoles == null ? void 0 : radRoles[role]) != null ? _a2 : fallbackStep;
      const raw = (_c2 = radScale[step]) != null ? _c2 : (_b2 = tokens.radius) == null ? void 0 : _b2[step];
      return raw !== void 0 ? pxToFloat(raw) : fallbackPx;
    };
    const radControl = (_p = findVar(COLLECTIONS.radius, "role/control")) != null ? _p : radXs;
    const radAction = (_q = findVar(COLLECTIONS.radius, "role/action")) != null ? _q : radSm;
    const radContainer = (_r = findVar(COLLECTIONS.radius, "role/container")) != null ? _r : radLg;
    const radOverlay = (_s = findVar(COLLECTIONS.radius, "role/overlay")) != null ? _s : radLg;
    const radPill = findVar(COLLECTIONS.radius, "role/pill");
    const radiusControl = rolePx("control", "xs", radiusXs);
    const radiusAction = rolePx("action", "sm", radiusSm);
    const radiusContainer = rolePx("container", "lg", radiusLg);
    const radiusOverlay = rolePx("overlay", "lg", radiusLg);
    function fillOf(v, hex, opacity = 1) {
      const { r, g, b, a } = hexToRgba(hex);
      let paint = { type: "SOLID", color: { r, g, b }, opacity: opacity * a };
      if ((v == null ? void 0 : v.resolvedType) === "COLOR") paint = figma.variables.setBoundVariableForPaint(paint, "color", v);
      return paint;
    }
    const fillP = (pr, opacity = 1) => fillOf(pr.v, pr.hex, opacity);
    function tryBind(node, field, v) {
      if (!v) return;
      try {
        ;
        node.setBoundVariable(field, v);
      } catch (e) {
      }
    }
    function bindRadius(node, v, fallback) {
      node.cornerRadius = fallback;
      if ((v == null ? void 0 : v.resolvedType) === "FLOAT") {
        tryBind(node, "topLeftRadius", v);
        tryBind(node, "topRightRadius", v);
        tryBind(node, "bottomLeftRadius", v);
        tryBind(node, "bottomRightRadius", v);
      }
    }
    const spacingCol = allCols.find((c) => c.name === COLLECTIONS.spacing);
    const spacingVars = varsByCollection.get(COLLECTIONS.spacing);
    function closestSpacing(px) {
      if (!spacingCol || !spacingVars) return void 0;
      let best, diff = Infinity;
      for (const v of spacingVars.values()) {
        if (v.resolvedType !== "FLOAT") continue;
        const val = v.valuesByMode[spacingCol.defaultModeId];
        if (typeof val === "number" && Math.abs(val - px) < diff) {
          diff = Math.abs(val - px);
          best = v;
        }
      }
      return best;
    }
    function pad(node, t, r, b, l) {
      node.paddingTop = t;
      node.paddingRight = r;
      node.paddingBottom = b;
      node.paddingLeft = l;
      tryBind(node, "paddingTop", closestSpacing(t));
      tryBind(node, "paddingRight", closestSpacing(r));
      tryBind(node, "paddingBottom", closestSpacing(b));
      tryBind(node, "paddingLeft", closestSpacing(l));
    }
    function gap(node, px) {
      node.itemSpacing = px;
      tryBind(node, "itemSpacing", closestSpacing(px));
    }
    function borderWidthVar() {
      return bestVar(COLLECTIONS.border, "width/default", "width/sm", "width/1");
    }
    function focusRing(node, hex) {
      node.effects = [{
        type: "DROP_SHADOW",
        color: __spreadProps(__spreadValues({}, hexToRgb(hex)), { a: 0.3 }),
        offset: { x: 0, y: 0 },
        radius: 0,
        spread: 3,
        visible: true,
        blendMode: "NORMAL"
      }];
    }
    const { bodyFamily, headingFamily, fontFor } = await createFontResolver(tokens);
    const fontFamily = bodyFamily;
    function txt(chars, o = {}) {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2;
      const t = figma.createText();
      const headingRole = !!o.roleKey && ((_c2 = (_b2 = (_a2 = tokens.typography.roles) == null ? void 0 : _a2[o.roleKey]) == null ? void 0 : _b2.desktop) == null ? void 0 : _c2.family) === "display";
      t.fontName = fontFor((_d2 = o.style) != null ? _d2 : "Regular", headingRole);
      t.characters = chars;
      t.fontSize = (_e2 = o.size) != null ? _e2 : 14;
      t.fills = [fillP((_f2 = o.colorP) != null ? _f2 : p.textPrimary, (_g2 = o.opacity) != null ? _g2 : 1)];
      if ((familyVar == null ? void 0 : familyVar.resolvedType) === "STRING") tryBind(t, "fontFamily", familyVar);
      if (o.sizeVar) {
        tryBind(t, "fontSize", o.sizeVar);
        const lh = findVar(T, o.sizeVar.name.replace("size/", "line-height/"));
        if (lh) tryBind(t, "lineHeight", lh);
        const ls = findVar(T, o.sizeVar.name.replace("size/", "letter-spacing/"));
        if (ls) tryBind(t, "letterSpacing", ls);
      }
      tryBind(t, "fontWeight", (_h2 = o.weightVar) != null ? _h2 : o.style === "Semi Bold" || o.style === "Bold" ? wSemibold : o.style === "Medium" ? wMedium : wRegular);
      if (o.roleKey) {
        const rFamily = findVar(T, `role/${o.roleKey}/family`);
        if ((rFamily == null ? void 0 : rFamily.resolvedType) === "STRING") tryBind(t, "fontFamily", rFamily);
        const rSize = findVar(T, `role/${o.roleKey}/size`);
        if (rSize) {
          tryBind(t, "fontSize", rSize);
          const step = (_k2 = (_j2 = (_i2 = tokens.typography.roles) == null ? void 0 : _i2[o.roleKey]) == null ? void 0 : _j2.desktop) == null ? void 0 : _k2.size;
          if (step) {
            const lh = findVar(T, `line-height/${step}`);
            if (lh) tryBind(t, "lineHeight", lh);
            const ls = findVar(T, `letter-spacing/${step}`);
            if (ls) tryBind(t, "letterSpacing", ls);
          }
        }
        const rWeight = findVar(T, `role/${o.roleKey}/weight`);
        if (rWeight) tryBind(t, "fontWeight", rWeight);
      }
      return t;
    }
    function row(name, gapPx) {
      const f = figma.createFrame();
      f.name = name;
      f.layoutMode = "HORIZONTAL";
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "AUTO";
      f.counterAxisAlignItems = "CENTER";
      f.fills = [];
      gap(f, gapPx);
      return f;
    }
    function col(name, gapPx) {
      const f = figma.createFrame();
      f.name = name;
      f.layoutMode = "VERTICAL";
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "AUTO";
      f.fills = [];
      gap(f, gapPx);
      return f;
    }
    function miniSpinner(size, colorPr) {
      const f = figma.createFrame();
      f.name = "spinner";
      f.fills = [];
      f.resize(size, size);
      const ring = figma.createEllipse();
      ring.resize(size, size);
      ring.fills = [fillP(colorPr, 0.25)];
      ring.arcData = { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 0.7 };
      const arc = figma.createEllipse();
      arc.resize(size, size);
      arc.fills = [fillP(colorPr)];
      arc.arcData = { startingAngle: -Math.PI / 2, endingAngle: 0, innerRadius: 0.7 };
      f.appendChild(ring);
      f.appendChild(arc);
      ring.x = 0;
      ring.y = 0;
      arc.x = 0;
      arc.y = 0;
      return f;
    }
    let circleMaster = null;
    let squareMaster = null;
    let iconSwapPreferred = [];
    function paintSolidTree(root, paint) {
      const nodes = "findAll" in root ? [root, ...root.findAll()] : [root];
      for (const n of nodes) {
        const g = n;
        if (!("fills" in g) || !Array.isArray(g.fills)) continue;
        if (!g.fills.some((f) => f.type === "SOLID")) continue;
        try {
          g.fills = [paint];
        } catch (e) {
        }
      }
    }
    function svgGlyphFromPath(path, size) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="#000000" d="${path}"/></svg>`;
      const glyph = figma.createNodeFromSvg(svg);
      if (glyph.width !== size && glyph.width > 0) glyph.rescale(size / glyph.width);
      return glyph;
    }
    function createPlaceholderMaster(name, path) {
      const comp = figma.createComponent();
      comp.name = name;
      comp.resize(PLACEHOLDER_MASTER_SIZE, PLACEHOLDER_MASTER_SIZE);
      comp.fills = [];
      const glyph = svgGlyphFromPath(path, PLACEHOLDER_MASTER_SIZE);
      glyph.name = "glyph";
      comp.appendChild(glyph);
      glyph.x = 0;
      glyph.y = 0;
      try {
        comp.description = name === PLACEHOLDER_CIRCLE_NAME ? "Empty circular icon slot (Phosphor circle-dashed). Swap this instance for any icon/<library>/\u2026 set." : "Empty square icon slot (Phosphor rectangle-dashed). Swap this instance for any icon/<library>/\u2026 set.";
      } catch (e) {
      }
      return comp;
    }
    function makeIconSlot(size, colorPr, name = "icon", kind = "circle") {
      const f = figma.createFrame();
      f.name = name;
      f.fills = [];
      f.resize(size, size);
      f.clipsContent = false;
      const master = kind === "square" ? squareMaster : circleMaster;
      if (master && !master.removed) {
        try {
          const inst = master.createInstance();
          inst.name = kind === "square" ? "square-dashed" : "circle-dashed";
          if (size !== PLACEHOLDER_MASTER_SIZE) inst.rescale(size / PLACEHOLDER_MASTER_SIZE);
          paintSolidTree(inst, fillP(colorPr));
          f.appendChild(inst);
          inst.x = 0;
          inst.y = 0;
          return { frame: f, instance: inst };
        } catch (e) {
        }
      }
      try {
        const path = kind === "square" ? SQUARE_DASHED_PATH : CIRCLE_DASHED_PATH;
        const glyph = svgGlyphFromPath(path, size);
        glyph.name = kind === "square" ? "square-dashed" : "circle-dashed";
        paintSolidTree(glyph, fillP(colorPr));
        f.appendChild(glyph);
        glyph.x = 0;
        glyph.y = 0;
      } catch (e) {
        const ring = kind === "square" ? figma.createRectangle() : figma.createEllipse();
        ring.name = kind === "square" ? "square-dashed" : "circle-dashed";
        ring.resize(size, size);
        if (kind === "square" && "cornerRadius" in ring) ring.cornerRadius = Math.max(2, size * 0.12);
        ring.fills = [];
        ring.strokes = [fillP(colorPr, 0.75)];
        ring.strokeWeight = Math.max(1, Math.round(size / 12 * 10) / 10);
        ring.dashPattern = [2.5, 2];
        f.appendChild(ring);
        ring.x = 0;
        ring.y = 0;
      }
      return { frame: f, instance: null };
    }
    function iconSlot(size, colorPr, name = "icon", kind = "circle") {
      return makeIconSlot(size, colorPr, name, kind).frame;
    }
    const FULL_CATALOGUE_BUDGET = 24;
    const STATES = ["Default", "Hover", "Pressed", "Focused", "Loading", "Disabled"];
    const BTN_COLORS = {
      Brand: {
        solid: p.action,
        hover: p.actionHover,
        on: p.textOnBrand,
        soft: p.brandSubtle,
        softText: p.textBrand,
        line: p.borderBrand,
        text: p.textBrand,
        ringHex: p.action.hex
      },
      Danger: {
        solid: p.statusError,
        hover: p.statusError,
        on: p.statusErrorOn,
        soft: p.statusErrorSubtle,
        softText: p.textError,
        line: p.borderError,
        text: p.textError,
        ringHex: p.statusError.hex
      },
      Success: {
        solid: p.statusSuccess,
        hover: p.statusSuccess,
        on: p.statusSuccessOn,
        soft: p.statusSuccessSubtle,
        softText: p.textSuccess,
        line: p.statusSuccess,
        text: p.textSuccess,
        ringHex: p.statusSuccess.hex
      }
    };
    const BTN_STYLES = ["Solid", "Outline", "Soft", "Ghost"];
    const BTN_SIZE_KEYS = ["MD", "SM", "LG", "XL"];
    const BTN_SIZES = {
      SM: { padV: 8, padH: 12, f: 13, fv: sizeSm, gap: 6 },
      MD: { padV: 10, padH: 16, f: 14, fv: sizeSm, gap: 8 },
      LG: { padV: 12, padH: 20, f: 15, fv: sizeMd, gap: 8 },
      XL: { padV: 14, padH: 24, f: 16, fv: sizeMd, gap: 10 }
    };
    function buildButton(c, out, color, style, state, size = "MD") {
      var _a2;
      const k = BTN_COLORS[color];
      const sz = (_a2 = BTN_SIZES[size]) != null ? _a2 : BTN_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      pad(c, sz.padV, sz.padH, sz.padV, sz.padH);
      gap(c, sz.gap);
      bindRadius(c, radAction, radiusAction);
      const disabled = state === "Disabled";
      const hoverish = state === "Hover" || state === "Pressed";
      const dim = state === "Pressed" ? 0.88 : 1;
      let textP;
      if (disabled) {
        textP = p.textDisabled;
        if (style === "Solid" || style === "Soft") c.fills = [fillP(p.actionDisabled)];
        else c.fills = [];
        if (style === "Outline") {
          c.strokes = [fillP(p.borderDisabled)];
          c.strokeWeight = 1;
          tryBind(c, "strokeWeight", borderWidthVar());
        }
      } else if (style === "Solid") {
        textP = k.on;
        c.fills = [fillP(hoverish ? k.hover : k.solid, dim)];
      } else if (style === "Outline") {
        textP = k.text;
        c.fills = hoverish ? [fillP(k.soft, 0.6 * dim)] : [];
        c.strokes = [fillP(k.line)];
        c.strokeWeight = 1;
        tryBind(c, "strokeWeight", borderWidthVar());
      } else if (style === "Soft") {
        textP = k.softText;
        c.fills = [fillP(k.soft, hoverish ? 0.8 * dim : 1)];
      } else {
        textP = k.text;
        c.fills = hoverish ? [fillP(k.soft, 0.5 * dim)] : [];
      }
      if (state === "Focused") focusRing(c, k.ringHex);
      const addIconSlot = (propPrefix, name) => {
        const { frame, instance } = makeIconSlot(sz.f, textP, name);
        c.appendChild(frame);
        out.push({ node: frame, prop: `${propPrefix} visible`, def: false });
        if (instance && circleMaster) {
          out.push({
            node: instance,
            prop: `${propPrefix} icon`,
            def: "",
            swapDefaultId: circleMaster.id,
            swapPreferred: iconSwapPreferred
          });
        }
        return frame;
      };
      if (state === "Loading") {
        c.appendChild(miniSpinner(sz.f, textP));
      } else {
        addIconSlot("Icon leading", "icon-leading");
      }
      const label = txt("Button", {
        roleKey: "button",
        style: "Medium",
        size: sz.f,
        sizeVar: sz.fv,
        weightVar: wMedium,
        colorP: textP,
        opacity: state === "Loading" ? 0.75 : 1
      });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Button" });
      if (state !== "Loading") {
        addIconSlot("Icon trailing", "icon-trailing");
      }
    }
    const INPUT_STATES = ["Default", "Hover", "Focused", "Filled", "Error", "Loading", "Disabled"];
    const INPUT_TYPES = ["Default", "Icon Leading", "Icon Trailing", "E-Mail", "Password", "Search", "Phone Number", "Website"];
    const INPUT_TYPE_META = {
      "Default": { label: "Default Input", text: "Placeholder Text.." },
      "Icon Leading": { label: "Default Input", text: "Placeholder Text..", lead: "\u2605" },
      "Icon Trailing": { label: "Default Input", text: "Placeholder Text..", trail: "\u2605" },
      "E-Mail": { label: "E-Mail Address", text: "hi@createui.co", lead: "\u2709" },
      "Password": { label: "Password", text: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", lead: "\u{1F512}" },
      "Search": { label: "Search", text: "Search anything..", lead: "\u{1F50D}" },
      "Phone Number": { label: "Phone Number", text: "171 39200 12", lead: "\u{1F1E9}\u{1F1EA}" },
      "Website": { label: "Website Address", text: "createui.co", lead: "\u{1F310}" }
    };
    const INPUT_SIZE_KEYS = ["MD", "SM", "XS"];
    const INPUT_SIZES = {
      MD: { h: 40, f: 14, fv: sizeSm, label: 13, meta: 12, padX: 12 },
      SM: { h: 36, f: 13, label: 12.5, meta: 11.5, padX: 10 },
      XS: { h: 32, f: 12, fv: sizeXs, label: 12, meta: 11, padX: 10 }
    };
    function circleGlyph(d, glyph, bg, fg) {
      const f = row("icon-circle", 0);
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "FIXED";
      f.primaryAxisAlignItems = "CENTER";
      f.counterAxisAlignItems = "CENTER";
      f.cornerRadius = 9999;
      f.fills = [fillP(bg)];
      f.appendChild(txt(glyph, { style: "Bold", size: Math.round(d * 0.58), colorP: fg }));
      f.resize(d, d);
      return f;
    }
    function buildInputField(c, out, sizeKey, type, state) {
      const s = INPUT_SIZES[sizeKey];
      const meta = INPUT_TYPE_META[type];
      const disabled = state === "Disabled";
      const error = state === "Error";
      const focused = state === "Focused";
      const loading = state === "Loading";
      const filled = state === "Filled" || focused;
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      c.resize(260, 100);
      gap(c, 6);
      c.fills = [];
      c.paddingTop = 0;
      c.paddingRight = 0;
      c.paddingBottom = 0;
      c.paddingLeft = 0;
      const labelP = disabled ? p.textDisabled : error ? p.textError : p.textPrimary;
      const metaP = disabled ? p.textDisabled : error ? p.textError : p.textTertiary;
      const iconP = disabled ? p.textDisabled : p.textTertiary;
      const labelRow = row("label-row", 4);
      const label = txt(meta.label, { style: "Medium", size: s.label, weightVar: wMedium, colorP: labelP });
      label.name = "label";
      labelRow.appendChild(label);
      labelRow.appendChild(txt("*", { style: "Medium", size: s.label, weightVar: wMedium, colorP: p.textError }));
      labelRow.appendChild(txt("(Optional)", { size: s.meta, colorP: metaP }));
      labelRow.appendChild(iconSlot(s.meta, metaP, "icon-hint", "circle"));
      c.appendChild(labelRow);
      out.push({ node: labelRow, prop: "Show Label", def: true });
      const desc = txt("Description or any kind of additional text.", { size: s.meta, colorP: metaP });
      desc.name = "description";
      c.appendChild(desc);
      desc.layoutSizingHorizontal = "FILL";
      desc.textAutoResize = "HEIGHT";
      out.push({ node: desc, prop: "Description", def: "Description or any kind of additional text." });
      out.push({ node: desc, prop: "Show Description", def: true });
      const box = row("input", 8);
      box.name = "input";
      box.counterAxisSizingMode = "FIXED";
      box.resize(236, s.h);
      c.appendChild(box);
      box.layoutSizingHorizontal = "FILL";
      box.counterAxisAlignItems = "CENTER";
      box.paddingLeft = s.padX;
      box.paddingRight = s.padX;
      tryBind(box, "paddingLeft", closestSpacing(s.padX));
      tryBind(box, "paddingRight", closestSpacing(s.padX));
      bindRadius(box, radAction, radiusAction);
      box.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surfaceInput)];
      const border = disabled ? p.borderDisabled : error ? p.borderError : focused || loading ? p.borderFocus : state === "Hover" ? p.borderStrong : p.borderStrong;
      box.strokes = [fillP(border)];
      box.strokeWeight = focused ? 1.5 : 1;
      if (!focused) tryBind(box, "strokeWeight", borderWidthVar());
      if (focused) focusRing(box, p.borderFocus.hex);
      const boxDivider = () => {
        const d = figma.createFrame();
        d.name = "divider";
        d.fills = [fillP(disabled ? p.borderDisabled : p.borderDefault)];
        return d;
      };
      const fixDivider = (d) => {
        d.layoutSizingHorizontal = "FIXED";
        d.layoutSizingVertical = "FIXED";
        d.resize(1, s.h - 14);
      };
      if (meta.lead) {
        const leadIsSlot = type === "Icon Leading" || type === "E-Mail" || type === "Password" || type === "Search";
        const lead = leadIsSlot ? iconSlot(s.f, iconP, "icon-leading", "circle") : txt(meta.lead, { size: s.f, colorP: iconP });
        lead.name = "icon-leading";
        box.appendChild(lead);
      }
      if (type === "Phone Number") {
        box.appendChild(txt("\u25BE", { size: Math.round(s.f * 0.75), colorP: iconP }));
        const d = boxDivider();
        box.appendChild(d);
        fixDivider(d);
        box.appendChild(txt("+49", { size: s.f, colorP: disabled ? p.textDisabled : p.textTertiary }));
      }
      if (type === "Website") {
        box.appendChild(txt("https://", { size: s.f, colorP: disabled ? p.textDisabled : p.textTertiary }));
        const d = boxDivider();
        box.appendChild(d);
        fixDivider(d);
      }
      const contentP = disabled ? p.textDisabled : filled ? p.textPrimary : p.textPlaceholder;
      const content = txt(meta.text, { roleKey: "placeholder", size: s.f, sizeVar: s.fv, colorP: contentP });
      content.name = filled ? "value" : "placeholder";
      const valueWrap = row("value", 2);
      valueWrap.appendChild(content);
      if (focused) {
        const caret = figma.createFrame();
        caret.name = "caret";
        caret.fills = [fillP(p.borderBrand)];
        caret.cornerRadius = 1;
        valueWrap.appendChild(caret);
        caret.layoutSizingHorizontal = "FIXED";
        caret.layoutSizingVertical = "FIXED";
        caret.resize(1.5, s.f + 4);
      }
      box.appendChild(valueWrap);
      valueWrap.layoutSizingHorizontal = "FILL";
      if (error) {
        box.appendChild(circleGlyph(14, "!", p.statusError, p.textOnBrand));
      } else if (!loading) {
        if (type === "E-Mail" && (state === "Hover" || focused)) {
          box.appendChild(circleGlyph(14, "\u2715", p.surface3, p.textSecondary));
        } else if (type === "Password") {
          const eye = iconSlot(s.f, iconP, "icon-eye", "square");
          box.appendChild(eye);
        } else if (type === "Phone Number") {
          box.appendChild(iconSlot(s.meta, iconP, "icon-info", "circle"));
        }
      }
      if (meta.trail) {
        const trail = type === "Icon Trailing" ? iconSlot(s.f, iconP, "icon-trailing", "square") : txt(meta.trail, { size: s.f, colorP: iconP });
        trail.name = "icon-trailing";
        box.appendChild(trail);
      }
      if (type === "Website") {
        const d = boxDivider();
        box.appendChild(d);
        fixDivider(d);
        box.appendChild(iconSlot(s.f, iconP, "icon-copy", "square"));
      }
      if (type === "Search") {
        if (!error) {
          const kbd = row("kbd", 2);
          kbd.paddingLeft = 5;
          kbd.paddingRight = 5;
          kbd.paddingTop = 2;
          kbd.paddingBottom = 2;
          kbd.strokes = [fillP(disabled ? p.borderDisabled : p.borderDefault)];
          kbd.strokeWeight = 1;
          kbd.cornerRadius = 4;
          kbd.appendChild(txt("\u2318 1", { size: Math.round(s.meta * 0.9), colorP: iconP }));
          box.appendChild(kbd);
        }
        if (loading) box.appendChild(miniSpinner(s.f, p.textBrand));
        const btnMuted = disabled || error || loading;
        const btn = row("search-button", 4);
        btn.counterAxisSizingMode = "FIXED";
        btn.primaryAxisAlignItems = "CENTER";
        btn.paddingLeft = 10;
        btn.paddingRight = 10;
        btn.fills = [fillP(btnMuted ? p.actionDisabledSubtle : p.surface3)];
        bindRadius(btn, radControl, radiusControl);
        btn.appendChild(txt("Search", {
          style: "Medium",
          size: s.f - 1,
          weightVar: wMedium,
          colorP: btnMuted ? p.textDisabled : p.textSecondary
        }));
        btn.resize(btn.width, s.h - 12);
        box.appendChild(btn);
      } else if (loading) {
        box.appendChild(miniSpinner(s.f, p.textBrand));
      }
      const helperRow = row("helper-row", 6);
      helperRow.appendChild(circleGlyph(s.meta + 2, "!", error ? p.statusError : p.surface3, error ? p.textOnBrand : p.textSecondary));
      const helper = txt("Helper hint text for you.", { size: s.meta, colorP: error ? p.textError : metaP });
      helper.name = "helper";
      helperRow.appendChild(helper);
      c.appendChild(helperRow);
      out.push({ node: helper, prop: "Helper Text", def: "Helper hint text for you." });
      out.push({ node: helperRow, prop: "Show Helper", def: true });
    }
    const SELECT_SIZES = {
      SM: { h: 36, padV: 8, f: 13, fv: sizeSm },
      MD: { h: 40, padV: 10, f: 14, fv: sizeSm },
      LG: { h: 44, padV: 12, f: 15, fv: sizeMd }
    };
    function buildSelectTrigger(c, out, state, size = "MD") {
      var _a2;
      const sz = (_a2 = SELECT_SIZES[size]) != null ? _a2 : SELECT_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.counterAxisAlignItems = "CENTER";
      c.primaryAxisAlignItems = "SPACE_BETWEEN";
      c.resize(240, sz.h);
      pad(c, sz.padV, 12, sz.padV, 12);
      gap(c, 8);
      bindRadius(c, radAction, radiusAction);
      const disabled = state === "Disabled";
      c.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surfaceInput)];
      const border = disabled ? p.borderDisabled : state === "Error" ? p.borderError : state === "Focused" ? p.borderFocus : p.borderStrong;
      c.strokes = [fillP(border)];
      c.strokeWeight = state === "Focused" ? 1.5 : 1;
      if (state !== "Focused") tryBind(c, "strokeWeight", borderWidthVar());
      if (state === "Focused") focusRing(c, p.borderFocus.hex);
      const content = txt("Placeholder\u2026", {
        size: sz.f,
        sizeVar: sz.fv,
        colorP: disabled ? p.textDisabled : p.textPlaceholder
      });
      content.name = "placeholder";
      c.appendChild(content);
      out.push({ node: content, prop: "Placeholder", def: "Placeholder\u2026" });
      const ch = txt("\u25BE", { size: 12, colorP: disabled ? p.textDisabled : p.textTertiary });
      ch.name = "chevron";
      c.appendChild(ch);
    }
    const selControl = (_t = findVar(COLLECTIONS.selector, "role/control")) != null ? _t : findVar(COLLECTIONS.selector, "md");
    const selCompact = (_u = findVar(COLLECTIONS.selector, "role/compact")) != null ? _u : findVar(COLLECTIONS.selector, "sm");
    const selIndicator = (_v = findVar(COLLECTIONS.selector, "role/indicator")) != null ? _v : findVar(COLLECTIONS.selector, "xs");
    const selectorMd = pxToFloat((_x = (_w = tokens.selector) == null ? void 0 : _w.md) != null ? _x : "18px");
    const selectorSm = pxToFloat((_z = (_y = tokens.selector) == null ? void 0 : _y.sm) != null ? _z : "15px");
    const selectorXs = pxToFloat((_B = (_A = tokens.selector) == null ? void 0 : _A.xs) != null ? _B : "12px");
    function bindBoxSize(node, v, fallback) {
      node.resize(fallback, fallback);
      tryBind(node, "width", v);
      tryBind(node, "height", v);
    }
    const CHECK_SIZES = {
      MD: { d: selectorMd, dv: selControl != null ? selControl : void 0, check: Math.max(9, Math.round(selectorMd * 0.6)), f: 14, fv: sizeSm },
      SM: { d: selectorSm, dv: selCompact != null ? selCompact : void 0, check: Math.max(8, Math.round(selectorSm * 0.6)), f: 13, fv: sizeSm }
    };
    function buildCheckbox(c, out, checked, state, size = "MD") {
      var _a2;
      const sz = (_a2 = CHECK_SIZES[size]) != null ? _a2 : CHECK_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 8);
      c.fills = [];
      const disabled = state === "Disabled";
      const box = figma.createFrame();
      box.name = "box";
      box.layoutMode = "HORIZONTAL";
      box.primaryAxisSizingMode = "FIXED";
      box.counterAxisSizingMode = "FIXED";
      box.primaryAxisAlignItems = "CENTER";
      box.counterAxisAlignItems = "CENTER";
      bindRadius(box, radControl, radiusControl);
      if (checked) {
        box.fills = [fillP(disabled ? p.actionDisabled : state === "Hover" ? p.actionHover : p.action)];
        const check = txt("\u2713", { style: "Bold", size: sz.check, colorP: disabled ? p.textDisabled : p.textOnBrand });
        check.name = "check";
        box.appendChild(check);
      } else {
        box.fills = [fillP(p.surface0)];
        box.strokes = [fillP(disabled ? p.borderDisabled : state === "Hover" ? p.borderStrong : p.borderDefault)];
        box.strokeWeight = 1;
        tryBind(box, "strokeWeight", borderWidthVar());
      }
      if (state === "Focused") focusRing(box, p.action.hex);
      c.appendChild(box);
      bindBoxSize(box, sz.dv, sz.d);
      const label = txt("Label", { roleKey: "label", size: sz.f, sizeVar: sz.fv, colorP: disabled ? p.textDisabled : p.textPrimary });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Label" });
    }
    const TOGGLE_SIZES = {
      MD: { w: selectorMd * 2 + 4, h: selectorMd, hv: selControl != null ? selControl : void 0, knob: Math.max(12, selectorMd - 4), f: 14, fv: sizeSm },
      SM: { w: selectorSm * 2 + 4, h: selectorSm, hv: selCompact != null ? selCompact : void 0, knob: Math.max(10, selectorSm - 4), f: 13, fv: sizeSm }
    };
    function buildToggle(c, out, on, state, size = "MD") {
      var _a2;
      const sz = (_a2 = TOGGLE_SIZES[size]) != null ? _a2 : TOGGLE_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 10);
      c.fills = [];
      const disabled = state === "Disabled";
      const track = figma.createFrame();
      track.name = "track";
      track.layoutMode = "HORIZONTAL";
      track.primaryAxisSizingMode = "FIXED";
      track.counterAxisSizingMode = "FIXED";
      track.primaryAxisAlignItems = on ? "MAX" : "MIN";
      track.counterAxisAlignItems = "CENTER";
      track.resize(sz.w, sz.h);
      tryBind(track, "height", sz.hv);
      track.paddingLeft = 2;
      track.paddingRight = 2;
      track.fills = [fillP(
        disabled ? p.actionDisabled : on ? state === "Hover" ? p.actionHover : p.action : state === "Hover" ? p.borderStrong : p.surface3
      )];
      bindRadius(track, radPill, 9999);
      const knob = figma.createFrame();
      knob.name = "knob";
      knob.resize(sz.knob, sz.knob);
      knob.cornerRadius = 9999;
      knob.fills = [fillP(p.textOnBrand, disabled ? 0.6 : 1)];
      track.appendChild(knob);
      knob.layoutSizingHorizontal = "FIXED";
      knob.layoutSizingVertical = "FIXED";
      if (state === "Focused") focusRing(track, p.action.hex);
      c.appendChild(track);
      const label = txt("Option", { roleKey: "label", size: sz.f, sizeVar: sz.fv, colorP: disabled ? p.textDisabled : p.textPrimary });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Option" });
    }
    const BADGE_COLORS = {
      Neutral: { solid: p.surfaceInv, on: p.textOnInverse, soft: p.surface2, text: p.textSecondary, line: p.borderStrong },
      Brand: { solid: p.action, on: p.textOnBrand, soft: p.brandSubtle, text: p.textBrand, line: p.borderBrand },
      Success: { solid: p.statusSuccess, on: p.statusSuccessOn, soft: p.statusSuccessSubtle, text: p.textSuccess, line: p.statusSuccess },
      Warning: { solid: p.statusWarning, on: p.statusWarningOn, soft: p.statusWarningSubtle, text: p.textWarning, line: p.statusWarning },
      Error: { solid: p.statusError, on: p.statusErrorOn, soft: p.statusErrorSubtle, text: p.textError, line: p.borderError },
      Info: { solid: p.statusInfo, on: p.statusInfoOn, soft: p.statusInfoSubtle, text: p.textInfo, line: p.statusInfo }
    };
    const BADGE_SIZES = {
      SM: { padV: 2, padH: 8, f: 11, fv: sizeXs },
      MD: { padV: 3, padH: 10, f: 12, fv: sizeXs },
      LG: { padV: 4, padH: 12, f: 13, fv: sizeSm }
    };
    const BADGE_ICON_POS = ["None", "Leading", "Trailing"];
    function buildBadge(c, out, style, color, size = "MD", iconPos = "None") {
      var _a2;
      const k = BADGE_COLORS[color];
      const sz = (_a2 = BADGE_SIZES[size]) != null ? _a2 : BADGE_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, Math.round(sz.padH * 0.4));
      pad(c, sz.padV, sz.padH, sz.padV, sz.padH);
      bindRadius(c, radPill, 9999);
      let textP;
      if (style === "Solid") {
        c.fills = [fillP(k.solid)];
        textP = k.on;
      } else if (style === "Soft") {
        c.fills = [fillP(k.soft)];
        textP = k.text;
      } else {
        c.fills = [];
        c.strokes = [fillP(k.line)];
        c.strokeWeight = 1;
        tryBind(c, "strokeWeight", borderWidthVar());
        textP = k.text;
      }
      const makeIcon = (name, kind = "circle") => iconSlot(Math.round(sz.f * 0.9), textP, name, kind);
      if (iconPos === "Leading") c.appendChild(makeIcon("icon-leading", "circle"));
      const label = txt("Badge", { roleKey: "label", style: "Medium", size: sz.f, sizeVar: sz.fv, weightVar: wMedium, colorP: textP });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Badge" });
      if (iconPos === "Trailing") c.appendChild(makeIcon("icon-trailing", "square"));
    }
    const AVATAR_SIZES = {
      XS: { d: 24, f: 10, sv: sizeXs },
      SM: { d: 32, f: 12, sv: sizeXs },
      MD: { d: 40, f: 14, sv: sizeSm },
      LG: { d: 48, f: 16, sv: sizeMd },
      XL: { d: 56, f: 18, sv: sizeLg }
    };
    function buildAvatar(c, out, size) {
      const s = AVATAR_SIZES[size];
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.primaryAxisAlignItems = "CENTER";
      c.counterAxisAlignItems = "CENTER";
      c.resize(s.d, s.d);
      c.fills = [fillP(p.action, 0.9)];
      bindRadius(c, radPill, 9999);
      const initials = txt("AV", { roleKey: "label", style: "Medium", size: s.f, sizeVar: s.sv, weightVar: wMedium, colorP: p.textOnBrand });
      c.appendChild(initials);
      out.push({ node: initials, prop: "Initials", def: "AV" });
    }
    const TOAST_STATUS = {
      Success: p.statusSuccess,
      Error: p.statusError,
      Warning: p.statusWarning,
      Info: p.statusInfo
    };
    function buildToast(c, out, status) {
      var _a2;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      c.resize(320, 10);
      pad(c, 12, 16, 12, 14);
      gap(c, 10);
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      bindRadius(c, radContainer, radiusContainer);
      const dot = figma.createFrame();
      dot.name = "status-dot";
      dot.resize(8, 8);
      dot.cornerRadius = 9999;
      dot.fills = [fillP((_a2 = TOAST_STATUS[status]) != null ? _a2 : p.statusSuccess)];
      c.appendChild(dot);
      dot.layoutSizingHorizontal = "FIXED";
      dot.layoutSizingVertical = "FIXED";
      const message = txt("Changes saved successfully", { roleKey: "body-sm", size: 14, sizeVar: sizeSm, colorP: p.textPrimary });
      c.appendChild(message);
      message.layoutSizingHorizontal = "FILL";
      out.push({ node: message, prop: "Message", def: "Changes saved successfully" });
      const action = txt("Undo", { roleKey: "label", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textBrand });
      c.appendChild(action);
      out.push({ node: action, prop: "Action", def: "Undo" });
      c.layoutSizingVertical = "HUG";
    }
    const ALERT_STATUS = {
      Neutral: { solid: p.surfaceInv, subtle: p.surface2, text: p.textSecondary, on: p.textOnInverse, border: p.borderSubtle },
      Info: { solid: p.statusInfo, subtle: p.statusInfoSubtle, text: p.textInfo, on: p.statusInfoOn, border: p.statusInfoBorder },
      Success: { solid: p.statusSuccess, subtle: p.statusSuccessSubtle, text: p.textSuccess, on: p.statusSuccessOn, border: p.statusSuccessBorder },
      Warning: { solid: p.statusWarning, subtle: p.statusWarningSubtle, text: p.textWarning, on: p.statusWarningOn, border: p.statusWarningBorder },
      Error: { solid: p.statusError, subtle: p.statusErrorSubtle, text: p.textError, on: p.statusErrorOn, border: p.statusErrorBorder }
    };
    function buildAlertBanner(c, out, status, style) {
      var _a2;
      const k = (_a2 = ALERT_STATUS[status]) != null ? _a2 : ALERT_STATUS.Info;
      const solid = style === "Solid";
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "MIN";
      c.resize(520, 10);
      pad(c, 14, 16, 14, 16);
      gap(c, 12);
      bindRadius(c, radContainer, radiusContainer);
      if (solid) {
        c.fills = [fillP(k.solid)];
      } else {
        c.fills = [fillP(k.subtle)];
        c.strokes = [fillP(k.border)];
        c.strokeWeight = 1;
        tryBind(c, "strokeWeight", borderWidthVar());
      }
      const onP = solid ? k.on : k.text;
      const icon = iconSlot(14, onP, "icon-status", "circle");
      c.appendChild(icon);
      const body = col("content", 2);
      const title = txt("Alert banner title", {
        style: "Semi Bold",
        size: 14,
        sizeVar: sizeSm,
        weightVar: wSemibold,
        colorP: solid ? onP : p.textPrimary
      });
      body.appendChild(title);
      out.push({ node: title, prop: "Title", def: "Alert banner title" });
      const message = txt("Short supporting message that explains what happened.", {
        size: 13,
        sizeVar: sizeSm,
        opacity: solid ? 0.85 : 1,
        colorP: solid ? onP : p.textSecondary
      });
      body.appendChild(message);
      message.layoutSizingHorizontal = "FILL";
      message.textAutoResize = "HEIGHT";
      out.push({ node: message, prop: "Message", def: "Short supporting message that explains what happened." });
      c.appendChild(body);
      body.layoutSizingHorizontal = "FILL";
      const action = txt("Learn more", { roleKey: "label", style: "Medium", size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: onP });
      action.name = "action";
      action.textDecoration = "UNDERLINE";
      c.appendChild(action);
      out.push({ node: action, prop: "Action", def: "Learn more" });
      const close = iconSlot(12, onP, "icon-close", "square");
      c.appendChild(close);
      out.push({ node: close, prop: "Show Close", def: true });
      c.layoutSizingVertical = "HUG";
    }
    function buildInlineAlert(c, out, status) {
      var _a2;
      const k = (_a2 = ALERT_STATUS[status]) != null ? _a2 : ALERT_STATUS.Info;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      c.resize(380, 10);
      pad(c, 10, 12, 10, 12);
      gap(c, 10);
      bindRadius(c, radContainer, radiusContainer);
      c.fills = [fillP(k.subtle)];
      c.strokes = [fillP(k.border)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      const icon = iconSlot(13, k.text, "icon-status", "circle");
      c.appendChild(icon);
      const message = txt("A short inline alert message.", { roleKey: "body-sm", size: 13, sizeVar: sizeSm, colorP: p.textSecondary });
      c.appendChild(message);
      message.layoutSizingHorizontal = "FILL";
      out.push({ node: message, prop: "Message", def: "A short inline alert message." });
      const close = iconSlot(11, k.text, "icon-close", "square");
      c.appendChild(close);
      out.push({ node: close, prop: "Show Close", def: true });
      c.layoutSizingVertical = "HUG";
    }
    const SPINNER_SIZES = { SM: 16, MD: 24, LG: 32 };
    function buildSpinner(c, _out, size) {
      const d = SPINNER_SIZES[size];
      c.layoutMode = "NONE";
      c.resize(d, d);
      c.fills = [];
      const sp = miniSpinner(d, p.action);
      c.appendChild(sp);
      sp.x = 0;
      sp.y = 0;
    }
    function buildDivider(c, _out, orientation) {
      c.layoutMode = "NONE";
      if (orientation === "Vertical") c.resize(1, 240);
      else c.resize(240, 1);
      c.fills = [fillP(p.borderDefault)];
    }
    function buildTooltip(c, out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      pad(c, 6, 10, 6, 10);
      c.fills = [fillP(p.surfaceInv)];
      bindRadius(c, radControl, radiusControl);
      const label = txt("Tooltip text", { roleKey: "caption", style: "Medium", size: 12, sizeVar: sizeXs, weightVar: wMedium, colorP: p.textOnInverse });
      c.appendChild(label);
      out.push({ node: label, prop: "Content", def: "Tooltip text" });
    }
    function buildCard(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      c.resize(280, 10);
      pad(c, 20, 20, 20, 20);
      gap(c, 8);
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      bindRadius(c, radContainer, radiusContainer);
      const title = txt("Card title", { roleKey: "heading-sm", style: "Semi Bold", size: 16, sizeVar: sizeMd, weightVar: wSemibold, colorP: p.textPrimary });
      c.appendChild(title);
      out.push({ node: title, prop: "Title", def: "Card title" });
      const desc = txt("Supporting description that explains the card content.", { roleKey: "body-md", size: 14, sizeVar: sizeSm, colorP: p.textTertiary });
      c.appendChild(desc);
      desc.layoutSizingHorizontal = "FILL";
      desc.textAutoResize = "HEIGHT";
      out.push({ node: desc, prop: "Description", def: "Supporting description that explains the card content." });
    }
    function buildModal(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      c.resize(360, 10);
      pad(c, 24, 24, 24, 24);
      gap(c, 12);
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      bindRadius(c, radOverlay, radiusOverlay);
      const title = txt("Modal title", { roleKey: "heading-md", style: "Semi Bold", size: 18, sizeVar: sizeLg, weightVar: wSemibold, colorP: p.textPrimary });
      c.appendChild(title);
      out.push({ node: title, prop: "Title", def: "Modal title" });
      const body = txt("Body content explaining what this dialog does and what happens next.", { roleKey: "body-md", size: 14, sizeVar: sizeSm, colorP: p.textTertiary });
      c.appendChild(body);
      body.layoutSizingHorizontal = "FILL";
      body.textAutoResize = "HEIGHT";
      out.push({ node: body, prop: "Body", def: "Body content explaining what this dialog does and what happens next." });
      const footer = row("footer", 8);
      footer.primaryAxisAlignItems = "MAX";
      const secondary = row("button-secondary", 8);
      pad(secondary, 8, 14, 8, 14);
      secondary.strokes = [fillP(p.borderDefault)];
      secondary.strokeWeight = 1;
      bindRadius(secondary, radAction, radiusAction);
      secondary.appendChild(txt("Cancel", { roleKey: "button", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary }));
      footer.appendChild(secondary);
      const primary = row("button-primary", 8);
      pad(primary, 8, 14, 8, 14);
      primary.fills = [fillP(p.action)];
      bindRadius(primary, radAction, radiusAction);
      primary.appendChild(txt("Confirm", { roleKey: "button", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textOnBrand }));
      footer.appendChild(primary);
      c.appendChild(footer);
      footer.layoutSizingHorizontal = "FILL";
    }
    function buildTabs(c, _out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 4);
      c.fills = [];
      const labels = ["Overview", "Details", "Settings"];
      labels.forEach((name, i) => {
        const active = i === 0;
        const tab = col(`tab-${name.toLowerCase()}`, 6);
        tab.counterAxisAlignItems = "CENTER";
        pad(tab, 8, 12, 0, 12);
        tab.appendChild(txt(name, {
          style: active ? "Medium" : "Regular",
          size: 14,
          sizeVar: sizeSm,
          weightVar: active ? wMedium : wRegular,
          colorP: active ? p.textPrimary : p.textTertiary
        }));
        const underline = figma.createFrame();
        underline.name = "indicator";
        underline.resize(10, 2);
        underline.fills = active ? [fillP(p.action)] : [];
        tab.appendChild(underline);
        underline.layoutSizingHorizontal = "FILL";
        underline.layoutSizingVertical = "FIXED";
        c.appendChild(tab);
      });
    }
    function buildBreadcrumb(c, _out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 8);
      c.fills = [];
      const parts = [["Home", false], ["Library", false], ["Current page", true]];
      parts.forEach(([name, last], i) => {
        if (i > 0) c.appendChild(txt("/", { size: 12, sizeVar: sizeXs, colorP: p.textPlaceholder }));
        c.appendChild(txt(name, {
          style: last ? "Medium" : "Regular",
          size: 14,
          sizeVar: sizeSm,
          weightVar: last ? wMedium : wRegular,
          colorP: last ? p.textPrimary : p.textTertiary
        }));
      });
    }
    function buildProgress(c, _out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.primaryAxisAlignItems = "MIN";
      c.resize(240, 8);
      c.fills = [fillP(p.surface3)];
      bindRadius(c, radPill, 9999);
      const bar = figma.createFrame();
      bar.name = "bar";
      bar.resize(144, 8);
      bar.fills = [fillP(p.action)];
      bar.cornerRadius = 9999;
      c.appendChild(bar);
      bar.layoutSizingHorizontal = "FIXED";
      bar.layoutSizingVertical = "FILL";
    }
    const CLOSE_SIZES = {
      MD: { d: 32, f: 14 },
      SM: { d: 24, f: 12 }
    };
    function buildCloseButton(c, _out, state, size = "MD") {
      var _a2;
      const sz = (_a2 = CLOSE_SIZES[size]) != null ? _a2 : CLOSE_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.primaryAxisAlignItems = "CENTER";
      c.counterAxisAlignItems = "CENTER";
      c.resize(sz.d, sz.d);
      bindRadius(c, radControl, radiusControl);
      const disabled = state === "Disabled";
      const hoverish = state === "Hover" || state === "Pressed";
      c.fills = hoverish ? [fillP(p.surface2, state === "Pressed" ? 1 : 0.8)] : [];
      if (state === "Focused") focusRing(c, p.action.hex);
      const icon = iconSlot(sz.f, disabled ? p.textDisabled : p.textSecondary, "icon", "circle");
      c.appendChild(icon);
    }
    const FAB_SIZES = {
      MD: { d: 48, f: 20 },
      LG: { d: 56, f: 24 }
    };
    function buildFab(c, _out, size, state) {
      const s = FAB_SIZES[size];
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.primaryAxisAlignItems = "CENTER";
      c.counterAxisAlignItems = "CENTER";
      c.resize(s.d, s.d);
      c.cornerRadius = 9999;
      c.fills = [fillP(state === "Hover" ? p.actionHover : p.action)];
      c.effects = [{
        type: "DROP_SHADOW",
        color: __spreadProps(__spreadValues({}, hexToRgb(p.action.hex)), { a: 0.35 }),
        offset: { x: 0, y: 4 },
        radius: 12,
        spread: 0,
        visible: true,
        blendMode: "NORMAL"
      }];
      const icon = iconSlot(s.f, p.textOnBrand, "icon", "circle");
      c.appendChild(icon);
    }
    const BTNGROUP_SIZES = {
      SM: { padV: 6, padH: 12, f: 13, fv: sizeSm },
      MD: { padV: 8, padH: 16, f: 14, fv: sizeSm },
      LG: { padV: 10, padH: 20, f: 15, fv: sizeMd }
    };
    function buildButtonGroup(c, _out, size = "MD") {
      var _a2;
      const sz = (_a2 = BTNGROUP_SIZES[size]) != null ? _a2 : BTNGROUP_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.fills = [];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      bindRadius(c, radAction, radiusAction);
      c.clipsContent = true;
      ["Day", "Week", "Month"].forEach((label, i) => {
        const seg = row(`segment-${label.toLowerCase()}`, 8);
        pad(seg, sz.padV, sz.padH, sz.padV, sz.padH);
        seg.fills = i === 0 ? [fillP(p.surface2)] : [];
        if (i > 0) {
          seg.strokes = [fillP(p.borderDefault)];
          seg.strokeWeight = 0;
          seg.strokeLeftWeight = 1;
        }
        seg.appendChild(txt(label, {
          style: i === 0 ? "Medium" : "Regular",
          size: sz.f,
          sizeVar: sz.fv,
          weightVar: i === 0 ? wMedium : wRegular,
          colorP: i === 0 ? p.textPrimary : p.textSecondary
        }));
        c.appendChild(seg);
      });
    }
    const SOCIAL_SIZES = {
      MD: { padV: 10, padH: 16, f: 14, fv: sizeSm },
      LG: { padV: 12, padH: 20, f: 15, fv: sizeMd }
    };
    function buildSocial(c, out, provider, state, size = "MD") {
      var _a2;
      const sz = (_a2 = SOCIAL_SIZES[size]) != null ? _a2 : SOCIAL_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      pad(c, sz.padV, sz.padH, sz.padV, sz.padH);
      gap(c, 10);
      bindRadius(c, radAction, radiusAction);
      c.fills = state === "Hover" ? [fillP(p.surface1)] : [fillP(p.surface0)];
      c.strokes = [fillP(state === "Hover" ? p.borderStrong : p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      const icon = txt(provider.charAt(0), { style: "Bold", size: sz.f, colorP: p.textPrimary });
      icon.name = "provider-icon";
      c.appendChild(icon);
      const label = txt(`Continue with ${provider}`, { roleKey: "button", style: "Medium", size: sz.f, sizeVar: sz.fv, weightVar: wMedium, colorP: p.textPrimary });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: `Continue with ${provider}` });
    }
    function buildTextLink(c, out, state) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 4);
      c.fills = [];
      const colorP = state === "Disabled" ? p.textDisabled : p.textBrand;
      const label = txt("Learn more", { roleKey: "label", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP });
      if (state === "Hover") label.textDecoration = "UNDERLINE";
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Learn more" });
      const arrow = txt("\u2192", { style: "Medium", size: 14, weightVar: wMedium, colorP });
      arrow.name = "icon";
      c.appendChild(arrow);
    }
    function buildStoreBadge(c, _out, store) {
      const apple = store === "App Store";
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      pad(c, 8, 16, 8, 14);
      gap(c, 8);
      c.fills = [fillP(p.surfaceInv)];
      c.strokes = [fillP(p.borderStrong)];
      c.strokeWeight = 1;
      bindRadius(c, radAction, radiusAction);
      const icon = txt(apple ? "" : "\u25B6", { size: 18, colorP: p.textOnInverse });
      icon.name = "store-icon";
      c.appendChild(icon);
      const lines = col("labels", 0);
      lines.appendChild(txt(apple ? "Download on the" : "GET IT ON", { size: 8, colorP: p.textOnInverse, opacity: 0.8 }));
      lines.appendChild(txt(apple ? "App Store" : "Google Play", { style: "Semi Bold", size: 14, weightVar: wSemibold, colorP: p.textOnInverse }));
      c.appendChild(lines);
    }
    function checkBoxSquare(checked) {
      const box = figma.createFrame();
      box.name = "box";
      box.layoutMode = "HORIZONTAL";
      box.primaryAxisSizingMode = "FIXED";
      box.counterAxisSizingMode = "FIXED";
      box.primaryAxisAlignItems = "CENTER";
      box.counterAxisAlignItems = "CENTER";
      bindRadius(box, radControl, radiusControl);
      if (checked) {
        box.fills = [fillP(p.action)];
        box.appendChild(txt("\u2713", { style: "Bold", size: 11, colorP: p.textOnBrand }));
      } else {
        box.fills = [fillP(p.surface0)];
        box.strokes = [fillP(p.borderDefault)];
        box.strokeWeight = 1;
        tryBind(box, "strokeWeight", borderWidthVar());
      }
      box.resize(18, 18);
      tryBind(box, "width", selControl);
      tryBind(box, "height", selControl);
      return box;
    }
    function buildCheckboxGroup(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 12);
      c.fills = [];
      const legend = txt("Group label", { roleKey: "label", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary });
      c.appendChild(legend);
      out.push({ node: legend, prop: "Legend", def: "Group label" });
      const options = [["Option one", true], ["Option two", false], ["Option three", false]];
      for (const [label, checked] of options) {
        const r = row(`option-${label.toLowerCase().replace(/\s+/g, "-")}`, 8);
        r.counterAxisAlignItems = "CENTER";
        r.appendChild(checkBoxSquare(checked));
        r.appendChild(txt(label, { roleKey: "label", size: 14, sizeVar: sizeSm, colorP: p.textPrimary }));
        c.appendChild(r);
      }
    }
    function radioCircle(selected, disabled = false, d = 18) {
      const o = figma.createFrame();
      o.name = "radio";
      o.layoutMode = "HORIZONTAL";
      o.primaryAxisSizingMode = "FIXED";
      o.counterAxisSizingMode = "FIXED";
      o.primaryAxisAlignItems = "CENTER";
      o.counterAxisAlignItems = "CENTER";
      o.cornerRadius = 9999;
      o.fills = [fillP(p.surface0)];
      o.strokes = [fillP(disabled ? p.borderDisabled : selected ? p.action : p.borderDefault)];
      o.strokeWeight = selected ? 2 : 1;
      if (selected) {
        const dot = figma.createFrame();
        dot.name = "dot";
        dot.cornerRadius = 9999;
        const dd = Math.round(d * 0.44);
        dot.resize(dd, dd);
        dot.fills = [fillP(disabled ? p.actionDisabled : p.action)];
        o.appendChild(dot);
        dot.layoutSizingHorizontal = "FIXED";
        dot.layoutSizingVertical = "FIXED";
      }
      o.resize(d, d);
      tryBind(o, "width", d === selectorSm ? selCompact : selControl);
      tryBind(o, "height", d === selectorSm ? selCompact : selControl);
      return o;
    }
    function buildRadio(c, out, selected, state, size = "MD") {
      var _a2;
      const sz = (_a2 = CHECK_SIZES[size]) != null ? _a2 : CHECK_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 8);
      c.fills = [];
      const disabled = state === "Disabled";
      const o = radioCircle(selected, disabled, sz.d);
      if (state === "Hover" && !selected) o.strokes = [fillP(p.borderStrong)];
      if (state === "Focused") focusRing(o, p.action.hex);
      c.appendChild(o);
      const label = txt("Label", { roleKey: "label", size: sz.f, sizeVar: sz.fv, colorP: disabled ? p.textDisabled : p.textPrimary });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Label" });
    }
    function buildRadioGroup(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 12);
      c.fills = [];
      const legend = txt("Group label", { roleKey: "label", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary });
      c.appendChild(legend);
      out.push({ node: legend, prop: "Legend", def: "Group label" });
      const options = [["Option one", true], ["Option two", false], ["Option three", false]];
      for (const [label, selected] of options) {
        const r = row(`option-${label.toLowerCase().replace(/\s+/g, "-")}`, 8);
        r.counterAxisAlignItems = "CENTER";
        r.appendChild(radioCircle(selected));
        r.appendChild(txt(label, { roleKey: "label", size: 14, sizeVar: sizeSm, colorP: p.textPrimary }));
        c.appendChild(r);
      }
    }
    function buildTextArea(c, out, state) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.resize(240, 96);
      pad(c, 10, 12, 10, 12);
      const disabled = state === "Disabled";
      c.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surfaceInput)];
      const border = disabled ? p.borderDisabled : state === "Error" ? p.borderError : state === "Focused" ? p.borderFocus : p.borderStrong;
      c.strokes = [fillP(border)];
      c.strokeWeight = state === "Focused" ? 1.5 : 1;
      if (state !== "Focused") tryBind(c, "strokeWeight", borderWidthVar());
      if (state === "Focused") focusRing(c, p.borderFocus.hex);
      if (state === "Error") focusRing(c, p.statusError.hex);
      bindRadius(c, radAction, radiusAction);
      const content = txt("Placeholder\u2026", { roleKey: "placeholder", size: 14, sizeVar: sizeSm, colorP: disabled ? p.textDisabled : p.textPlaceholder });
      content.name = "placeholder";
      c.appendChild(content);
      content.layoutSizingHorizontal = "FILL";
      content.textAutoResize = "HEIGHT";
      out.push({ node: content, prop: "Placeholder", def: "Placeholder\u2026" });
    }
    const OTP_SIZES = {
      SM: { w: 32, h: 40, f: 16 },
      MD: { w: 40, h: 48, f: 18 },
      LG: { w: 48, h: 56, f: 20 }
    };
    function buildOtp(c, _out, state, size = "MD") {
      var _a2;
      const sz = (_a2 = OTP_SIZES[size]) != null ? _a2 : OTP_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 8);
      c.fills = [];
      const digits = ["1", "2", "3", "4"];
      digits.forEach((d, i) => {
        const cell = figma.createFrame();
        cell.name = `digit-${i + 1}`;
        cell.layoutMode = "HORIZONTAL";
        cell.primaryAxisSizingMode = "FIXED";
        cell.counterAxisSizingMode = "FIXED";
        cell.primaryAxisAlignItems = "CENTER";
        cell.counterAxisAlignItems = "CENTER";
        cell.fills = [fillP(p.surface0)];
        const active = state === "Focused" && i === 0;
        cell.strokes = [fillP(active ? p.borderBrand : p.borderDefault)];
        cell.strokeWeight = active ? 1.5 : 1;
        if (!active) tryBind(cell, "strokeWeight", borderWidthVar());
        if (active) focusRing(cell, p.borderBrand.hex);
        bindRadius(cell, radAction, radiusAction);
        if (state === "Filled") {
          cell.appendChild(txt(d, { style: "Medium", size: sz.f, weightVar: wMedium, colorP: p.textPrimary }));
        }
        cell.resize(sz.w, sz.h);
        c.appendChild(cell);
      });
    }
    function buildStepperInput(c, out, state) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      c.fills = [];
      c.strokes = [fillP(state === "Disabled" ? p.borderDisabled : p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      bindRadius(c, radAction, radiusAction);
      c.clipsContent = true;
      const disabled = state === "Disabled";
      const stepBtn = (label, name) => {
        const b = row(name, 0);
        b.primaryAxisAlignItems = "CENTER";
        b.counterAxisAlignItems = "CENTER";
        pad(b, 8, 12, 8, 12);
        b.fills = [fillP(p.surface1)];
        b.appendChild(txt(label, { style: "Medium", size: 14, weightVar: wMedium, colorP: disabled ? p.textDisabled : p.textSecondary }));
        return b;
      };
      c.appendChild(stepBtn("\u2212", "decrement"));
      const value = row("value", 0);
      value.primaryAxisAlignItems = "CENTER";
      pad(value, 8, 16, 8, 16);
      value.fills = [fillP(disabled ? p.actionDisabledSubtle : p.surface0)];
      value.strokes = [fillP(state === "Disabled" ? p.borderDisabled : p.borderDefault)];
      value.strokeWeight = 0;
      value.strokeLeftWeight = 1;
      value.strokeRightWeight = 1;
      const vtxt = txt("10", { roleKey: "placeholder", size: 14, sizeVar: sizeSm, colorP: disabled ? p.textDisabled : p.textPrimary });
      value.appendChild(vtxt);
      c.appendChild(value);
      out.push({ node: vtxt, prop: "Value", def: "10" });
      c.appendChild(stepBtn("+", "increment"));
    }
    function buildTagInput(c, out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      c.resize(260, 44);
      pad(c, 8, 12, 8, 8);
      gap(c, 6);
      c.fills = [fillP(p.surface0)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      bindRadius(c, radAction, radiusAction);
      for (const t of ["Design", "Tokens"]) {
        const tag = row(`tag-${t.toLowerCase()}`, 4);
        tag.counterAxisAlignItems = "CENTER";
        pad(tag, 2, 6, 2, 8);
        tag.fills = [fillP(p.surface2)];
        bindRadius(tag, radControl, radiusControl);
        tag.appendChild(txt(t, { roleKey: "label", size: 12, sizeVar: sizeXs, colorP: p.textSecondary }));
        tag.appendChild(iconSlot(10, p.textTertiary, "remove", "square"));
        c.appendChild(tag);
      }
      const placeholder = txt("Add tag\u2026", { roleKey: "placeholder", size: 14, sizeVar: sizeSm, colorP: p.textPlaceholder });
      placeholder.name = "placeholder";
      c.appendChild(placeholder);
      out.push({ node: placeholder, prop: "Placeholder", def: "Add tag\u2026" });
      c.layoutSizingVertical = "HUG";
    }
    function buildFileUpload(c, out, state) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      c.counterAxisAlignItems = "CENTER";
      c.resize(280, 10);
      pad(c, 24, 24, 24, 24);
      gap(c, 10);
      c.fills = [fillP(p.surface0)];
      c.strokes = [fillP(state === "Hover" ? p.borderBrand : p.borderDefault)];
      c.strokeWeight = 1;
      c.dashPattern = [6, 6];
      bindRadius(c, radContainer, radiusContainer);
      const iconWrap = figma.createFrame();
      iconWrap.name = "icon";
      iconWrap.layoutMode = "HORIZONTAL";
      iconWrap.primaryAxisSizingMode = "FIXED";
      iconWrap.counterAxisSizingMode = "FIXED";
      iconWrap.primaryAxisAlignItems = "CENTER";
      iconWrap.counterAxisAlignItems = "CENTER";
      iconWrap.cornerRadius = 9999;
      iconWrap.fills = [fillP(p.surface2)];
      iconWrap.appendChild(txt("\u2191", { style: "Medium", size: 16, weightVar: wMedium, colorP: p.textSecondary }));
      iconWrap.resize(40, 40);
      c.appendChild(iconWrap);
      const title = row("title", 4);
      title.appendChild(txt("Click to upload", { roleKey: "label", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textBrand }));
      title.appendChild(txt("or drag and drop", { roleKey: "body-sm", size: 14, sizeVar: sizeSm, colorP: p.textSecondary }));
      c.appendChild(title);
      const hint = txt("SVG, PNG or JPG (max. 800\xD7400px)", { roleKey: "caption", size: 12, sizeVar: sizeXs, colorP: p.textTertiary });
      c.appendChild(hint);
      out.push({ node: hint, prop: "Hint", def: "SVG, PNG or JPG (max. 800\xD7400px)" });
    }
    const SEGMENTED_SIZES = {
      MD: { padV: 6, padH: 14, f: 13 },
      SM: { padV: 4, padH: 10, f: 12 }
    };
    function buildSegmented(c, _out, size = "MD") {
      var _a2;
      const sz = (_a2 = SEGMENTED_SIZES[size]) != null ? _a2 : SEGMENTED_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.paddingTop = 2;
      c.paddingBottom = 2;
      c.paddingLeft = 2;
      c.paddingRight = 2;
      c.itemSpacing = 2;
      c.fills = [fillP(p.surface2)];
      bindRadius(c, radAction, radiusAction);
      ["List", "Board", "Timeline"].forEach((label, i) => {
        const active = i === 0;
        const seg = row(`segment-${label.toLowerCase()}`, 8);
        seg.paddingTop = sz.padV;
        seg.paddingBottom = sz.padV;
        seg.paddingLeft = sz.padH;
        seg.paddingRight = sz.padH;
        if (active) {
          seg.fills = [fillP(p.surface0)];
          seg.strokes = [fillP(p.borderDefault, 0.7)];
          seg.strokeWeight = 1;
          bindRadius(seg, radControl, radiusControl);
        }
        seg.appendChild(txt(label, {
          style: active ? "Medium" : "Regular",
          size: sz.f,
          sizeVar: sizeSm,
          weightVar: active ? wMedium : wRegular,
          colorP: active ? p.textPrimary : p.textSecondary
        }));
        c.appendChild(seg);
      });
    }
    function buildSlider(c, _out, state) {
      c.layoutMode = "NONE";
      c.resize(240, 20);
      c.fills = [];
      const disabled = state === "Disabled";
      const track = figma.createFrame();
      track.name = "track";
      track.resize(240, 6);
      track.cornerRadius = 9999;
      track.fills = [fillP(p.surface3)];
      c.appendChild(track);
      track.x = 0;
      track.y = 7;
      const fillBar = figma.createFrame();
      fillBar.name = "fill";
      fillBar.resize(144, 6);
      fillBar.cornerRadius = 9999;
      fillBar.fills = [fillP(disabled ? p.actionDisabled : p.action)];
      c.appendChild(fillBar);
      fillBar.x = 0;
      fillBar.y = 7;
      const knob = figma.createFrame();
      knob.name = "knob";
      knob.resize(18, 18);
      knob.cornerRadius = 9999;
      knob.fills = [fillP(p.textOnBrand)];
      knob.strokes = [fillP(disabled ? p.actionDisabled : p.action)];
      knob.strokeWeight = 2;
      if (state === "Hover") focusRing(knob, p.action.hex);
      c.appendChild(knob);
      knob.x = 135;
      knob.y = 1;
    }
    function switchTrack(on) {
      const track = figma.createFrame();
      track.name = "track";
      track.layoutMode = "HORIZONTAL";
      track.primaryAxisSizingMode = "FIXED";
      track.counterAxisSizingMode = "FIXED";
      track.primaryAxisAlignItems = on ? "MAX" : "MIN";
      track.counterAxisAlignItems = "CENTER";
      track.resize(40, 22);
      track.paddingLeft = 2;
      track.paddingRight = 2;
      track.fills = [fillP(on ? p.action : p.surface3)];
      track.cornerRadius = 9999;
      const knob = figma.createFrame();
      knob.name = "knob";
      knob.resize(18, 18);
      knob.cornerRadius = 9999;
      knob.fills = [fillP(p.textOnBrand)];
      track.appendChild(knob);
      knob.layoutSizingHorizontal = "FIXED";
      knob.layoutSizingVertical = "FIXED";
      return track;
    }
    function buildSwitchGroup(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 12);
      c.fills = [];
      const legend = txt("Notification settings", { roleKey: "label", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary });
      c.appendChild(legend);
      out.push({ node: legend, prop: "Legend", def: "Notification settings" });
      const options = [["Email alerts", true], ["Push notifications", false], ["Weekly digest", false]];
      for (const [label, on] of options) {
        const r = row(`option-${label.toLowerCase().replace(/\s+/g, "-")}`, 10);
        r.counterAxisAlignItems = "CENTER";
        r.appendChild(switchTrack(on));
        r.appendChild(txt(label, { roleKey: "label", size: 14, sizeVar: sizeSm, colorP: p.textPrimary }));
        c.appendChild(r);
      }
    }
    const CHIP_SIZES = {
      SM: { padV: 2, padH: 8, f: 11, rm: 9 },
      MD: { padV: 4, padH: 10, f: 12, rm: 10 }
    };
    function buildChip(c, out, selected, state, size = "MD") {
      var _a2;
      const sz = (_a2 = CHIP_SIZES[size]) != null ? _a2 : CHIP_SIZES.MD;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      pad(c, sz.padV, sz.padH, sz.padV, sz.padH + 2);
      gap(c, 6);
      bindRadius(c, radPill, 9999);
      const disabled = state === "Disabled";
      if (selected) {
        c.fills = [fillP(p.brandSubtle, state === "Hover" ? 0.85 : 1)];
        c.strokes = [fillP(p.borderBrand)];
        c.strokeWeight = 1;
      } else {
        c.fills = [fillP(state === "Hover" ? p.surface3 : p.surface2)];
      }
      const colorP = disabled ? p.textDisabled : selected ? p.textBrand : p.textSecondary;
      const label = txt("Chip", { roleKey: "label", style: "Medium", size: sz.f, sizeVar: sizeXs, weightVar: wMedium, colorP });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Chip" });
      const remove = iconSlot(sz.rm, colorP, "remove", "square");
      c.appendChild(remove);
    }
    function buildStatusBadge(c, out, status) {
      var _a2;
      const k = (_a2 = BADGE_COLORS[status]) != null ? _a2 : BADGE_COLORS.Neutral;
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      pad(c, 3, 10, 3, 8);
      gap(c, 6);
      bindRadius(c, radPill, 9999);
      c.fills = [fillP(k.soft)];
      const dot = figma.createFrame();
      dot.name = "dot";
      bindBoxSize(dot, selIndicator, selectorXs);
      dot.cornerRadius = 9999;
      dot.fills = [fillP(k.solid)];
      c.appendChild(dot);
      dot.layoutSizingHorizontal = "FIXED";
      dot.layoutSizingVertical = "FIXED";
      const label = txt(status, { roleKey: "label", style: "Medium", size: 12, sizeVar: sizeXs, weightVar: wMedium, colorP: k.text });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: status });
    }
    function buildStepIndicator(c, _out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 8);
      c.fills = [];
      const steps = [["Account", "done"], ["Profile", "current"], ["Review", "next"]];
      steps.forEach(([label, kind], i) => {
        if (i > 0) {
          const connector = figma.createFrame();
          connector.name = "connector";
          connector.resize(32, 2);
          connector.fills = [fillP(kind === "next" ? p.borderDefault : p.action)];
          c.appendChild(connector);
          connector.layoutSizingHorizontal = "FIXED";
          connector.layoutSizingVertical = "FIXED";
        }
        const step = row(`step-${label.toLowerCase()}`, 8);
        step.counterAxisAlignItems = "CENTER";
        const circle = figma.createFrame();
        circle.name = "indicator";
        circle.layoutMode = "HORIZONTAL";
        circle.primaryAxisSizingMode = "FIXED";
        circle.counterAxisSizingMode = "FIXED";
        circle.primaryAxisAlignItems = "CENTER";
        circle.counterAxisAlignItems = "CENTER";
        circle.cornerRadius = 9999;
        if (kind === "done") {
          circle.fills = [fillP(p.action)];
          circle.appendChild(txt("\u2713", { style: "Bold", size: 12, colorP: p.textOnBrand }));
        } else if (kind === "current") {
          circle.fills = [fillP(p.brandSubtle)];
          circle.strokes = [fillP(p.action)];
          circle.strokeWeight = 2;
          circle.appendChild(txt(String(i + 1), { style: "Medium", size: 12, weightVar: wMedium, colorP: p.textBrand }));
        } else {
          circle.fills = [];
          circle.strokes = [fillP(p.borderDefault)];
          circle.strokeWeight = 1;
          circle.appendChild(txt(String(i + 1), { style: "Medium", size: 12, weightVar: wMedium, colorP: p.textTertiary }));
        }
        circle.resize(28, 28);
        step.appendChild(circle);
        step.appendChild(txt(label, {
          style: kind === "current" ? "Medium" : "Regular",
          size: 13,
          sizeVar: sizeSm,
          weightVar: kind === "current" ? wMedium : wRegular,
          colorP: kind === "next" ? p.textTertiary : p.textPrimary
        }));
        c.appendChild(step);
      });
    }
    function buildCombobox(c, out, state) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 6);
      c.fills = [];
      const open = state === "Open";
      const trigger = row("trigger", 8);
      trigger.primaryAxisSizingMode = "FIXED";
      trigger.counterAxisSizingMode = "FIXED";
      trigger.primaryAxisAlignItems = "SPACE_BETWEEN";
      trigger.fills = [fillP(p.surface0)];
      trigger.strokes = [fillP(open ? p.borderBrand : p.borderDefault)];
      trigger.strokeWeight = open ? 1.5 : 1;
      if (!open) tryBind(trigger, "strokeWeight", borderWidthVar());
      bindRadius(trigger, radAction, radiusAction);
      pad(trigger, 10, 12, 10, 12);
      if (open) focusRing(trigger, p.borderBrand.hex);
      const lead = row("lead", 8);
      lead.appendChild(iconSlot(12, p.iconQuaternary, "icon", "circle"));
      const query = txt(open ? "ber" : "Search options\u2026", {
        size: 14,
        sizeVar: sizeSm,
        colorP: open ? p.textPrimary : p.textPlaceholder
      });
      query.name = "query";
      lead.appendChild(query);
      trigger.appendChild(lead);
      trigger.appendChild(txt("\u25BE", { size: 12, colorP: p.iconTertiary }));
      c.appendChild(trigger);
      trigger.resize(260, 40);
      out.push({ node: query, prop: "Query", def: query.characters });
      if (open) {
        const panel = col("listbox", 2);
        panel.fills = [fillP(p.surface1)];
        panel.strokes = [fillP(p.borderDefault)];
        panel.strokeWeight = 1;
        bindRadius(panel, radOverlay, radiusOverlay);
        pad(panel, 6, 6, 6, 6);
        panel.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.12 }, offset: { x: 0, y: 4 }, radius: 16, spread: 0, visible: true, blendMode: "NORMAL" }];
        const options = [["Berlin", true], ["Bern", false], ["Beirut", false]];
        for (const [label, active] of options) {
          const opt = row(`option-${label.toLowerCase()}`, 8);
          opt.primaryAxisSizingMode = "FIXED";
          opt.fills = active ? [fillP(p.surfaceSelected)] : [];
          bindRadius(opt, radControl, radiusControl);
          pad(opt, 8, 10, 8, 10);
          opt.appendChild(txt(label, { roleKey: "label", size: 13, sizeVar: sizeSm, colorP: p.textPrimary }));
          panel.appendChild(opt);
          opt.layoutSizingHorizontal = "FILL";
        }
        c.appendChild(panel);
        panel.layoutSizingHorizontal = "FILL";
      }
    }
    function buildInputGroup(c, out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      c.itemSpacing = 0;
      c.fills = [fillP(p.surface0)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      tryBind(c, "strokeWeight", borderWidthVar());
      bindRadius(c, radAction, radiusAction);
      c.clipsContent = true;
      const prefix = row("prefix", 0);
      prefix.counterAxisSizingMode = "FIXED";
      prefix.counterAxisAlignItems = "CENTER";
      prefix.fills = [fillP(p.surface2)];
      pad(prefix, 10, 12, 10, 12);
      prefix.appendChild(txt("https://", { roleKey: "body-sm", size: 14, sizeVar: sizeSm, colorP: p.textTertiary }));
      c.appendChild(prefix);
      prefix.resize(prefix.width, 40);
      const field = row("field", 0);
      field.primaryAxisSizingMode = "FIXED";
      field.counterAxisSizingMode = "FIXED";
      pad(field, 10, 12, 10, 12);
      const value = txt("createui.co", { roleKey: "placeholder", size: 14, sizeVar: sizeSm, colorP: p.textPrimary });
      value.name = "value";
      field.appendChild(value);
      c.appendChild(field);
      field.resize(180, 40);
      out.push({ node: value, prop: "Value", def: "createui.co" });
      const suffix = row("suffix", 6);
      suffix.counterAxisSizingMode = "FIXED";
      suffix.counterAxisAlignItems = "CENTER";
      suffix.fills = [fillP(p.action)];
      pad(suffix, 10, 14, 10, 14);
      const go = txt("Copy", { roleKey: "button", style: "Medium", size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textOnBrand });
      suffix.appendChild(go);
      c.appendChild(suffix);
      suffix.resize(suffix.width, 40);
    }
    function buildDropzone(c, out, state) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.primaryAxisAlignItems = "CENTER";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 8);
      pad(c, 28, 24, 28, 24);
      const dragging = state === "Dragging";
      const error = state === "Error";
      c.fills = [fillP(dragging ? p.brandSubtle : error ? p.statusErrorSubtle : p.surface1)];
      c.strokes = [fillP(dragging ? p.borderBrand : error ? p.borderError : p.borderStrong)];
      c.strokeWeight = dragging ? 1.5 : 1;
      c.dashPattern = [6, 6];
      bindRadius(c, radContainer, radiusContainer);
      c.appendChild(txt(error ? "\u26A0" : "\u2912", { size: 20, colorP: error ? p.iconError : dragging ? p.iconBrand : p.iconTertiary }));
      const title = txt(
        dragging ? "Drop files to upload" : error ? "File type not accepted" : "Drag & drop or click to browse",
        { style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: error ? p.textError : p.textPrimary }
      );
      title.name = "title";
      c.appendChild(title);
      const hint = txt(error ? "PNG, JPG or PDF only \u2014 max 10 MB" : "PNG, JPG or PDF up to 10 MB", {
        size: 12,
        sizeVar: sizeXs,
        colorP: p.textTertiary
      });
      hint.name = "hint";
      c.appendChild(hint);
      c.resize(320, 140);
      out.push({ node: title, prop: "Title", def: title.characters });
      out.push({ node: hint, prop: "Hint", def: hint.characters });
    }
    function buildField(c, out, state) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 6);
      c.fills = [];
      const error = state === "Error";
      const labelRow = row("label-row", 4);
      const label = txt("Label", { roleKey: "label", style: "Medium", size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary });
      labelRow.appendChild(label);
      labelRow.appendChild(txt("*", { style: "Medium", size: 13, weightVar: wMedium, colorP: p.textError }));
      c.appendChild(labelRow);
      out.push({ node: label, prop: "Label", def: "Label" });
      const box = row("control", 8);
      box.primaryAxisSizingMode = "FIXED";
      box.counterAxisSizingMode = "FIXED";
      box.fills = [fillP(p.surface0)];
      box.strokes = [fillP(error ? p.borderError : p.borderDefault)];
      box.strokeWeight = 1;
      if (!error) tryBind(box, "strokeWeight", borderWidthVar());
      bindRadius(box, radAction, radiusAction);
      pad(box, 10, 12, 10, 12);
      box.appendChild(txt("Placeholder Text..", { roleKey: "placeholder", size: 14, sizeVar: sizeSm, colorP: p.textPlaceholder }));
      c.appendChild(box);
      box.resize(260, 40);
      const hint = txt(error ? "This field is required." : "Helper text goes here.", {
        size: 12,
        sizeVar: sizeXs,
        colorP: error ? p.textError : p.textTertiary
      });
      hint.name = error ? "error" : "hint";
      c.appendChild(hint);
      out.push({ node: hint, prop: error ? "Error" : "Hint", def: hint.characters });
    }
    function buildLabel(c, out, required) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 4);
      c.fills = [];
      const label = txt("Label", { roleKey: "label", style: "Medium", size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textSecondary });
      c.appendChild(label);
      out.push({ node: label, prop: "Label", def: "Label" });
      if (required) c.appendChild(txt("*", { style: "Medium", size: 13, weightVar: wMedium, colorP: p.textError }));
      else {
        const hint = txt("(optional)", { roleKey: "caption", size: 12, sizeVar: sizeXs, colorP: p.textPlaceholder });
        hint.name = "hint";
        c.appendChild(hint);
      }
    }
    function buildPasswordStrength(c, out, strength) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 6);
      c.fills = [];
      const score = strength === "Weak" ? 1 : strength === "Fair" ? 2 : 4;
      const tone = strength === "Weak" ? p.statusError : strength === "Fair" ? p.statusWarning : p.statusSuccess;
      const meter = row("meter", 4);
      for (let i = 0; i < 4; i++) {
        const seg = figma.createFrame();
        seg.name = `segment-${i + 1}`;
        seg.resize(56, 4);
        seg.cornerRadius = 999;
        seg.fills = [fillP(i < score ? tone : p.surface3)];
        meter.appendChild(seg);
        seg.layoutSizingHorizontal = "FIXED";
        seg.layoutSizingVertical = "FIXED";
      }
      c.appendChild(meter);
      const caption = txt(
        strength === "Weak" ? "Weak \u2014 add more characters" : strength === "Fair" ? "Fair \u2014 add a symbol or number" : "Strong password",
        { size: 12, sizeVar: sizeXs, colorP: strength === "Weak" ? p.textError : strength === "Fair" ? p.textWarning : p.textSuccess }
      );
      caption.name = "caption";
      c.appendChild(caption);
      out.push({ node: caption, prop: "Caption", def: caption.characters });
    }
    function buildRating(c, out, interactive) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 6);
      c.fills = [];
      const stars = row("stars", 2);
      for (let i = 0; i < 5; i++) {
        stars.appendChild(txt(i < 4 ? "\u2605" : "\u2606", {
          size: interactive ? 18 : 15,
          colorP: i < 4 ? p.statusWarning : p.iconDisabled
        }));
      }
      c.appendChild(stars);
      if (interactive) {
        const count = txt("4.0 \xB7 128 reviews", { roleKey: "caption", size: 12, sizeVar: sizeXs, colorP: p.textTertiary });
        count.name = "count";
        c.appendChild(count);
        out.push({ node: count, prop: "Count", def: "4.0 \xB7 128 reviews" });
      }
    }
    const FILE_FORMATS = {
      PDF: p.statusError,
      PNG: p.statusInfo,
      SVG: p.statusSuccess,
      ZIP: p.statusWarning
    };
    function buildFileFormat(c, _out, format) {
      var _a2;
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      c.itemSpacing = -8;
      c.fills = [];
      const sheet = figma.createFrame();
      sheet.name = "sheet";
      sheet.resize(34, 42);
      sheet.fills = [fillP(p.surface1)];
      sheet.strokes = [fillP(p.borderStrong)];
      sheet.strokeWeight = 1;
      sheet.topLeftRadius = 4;
      sheet.topRightRadius = 10;
      sheet.bottomLeftRadius = 4;
      sheet.bottomRightRadius = 4;
      c.appendChild(sheet);
      sheet.layoutSizingHorizontal = "FIXED";
      sheet.layoutSizingVertical = "FIXED";
      const plate = row("plate", 0);
      plate.primaryAxisAlignItems = "CENTER";
      plate.fills = [fillP((_a2 = FILE_FORMATS[format]) != null ? _a2 : p.statusInfo)];
      plate.cornerRadius = 4;
      pad(plate, 2, 6, 2, 6);
      plate.appendChild(txt(format, { style: "Bold", size: 9, colorP: p.textOnBrand }));
      c.appendChild(plate);
    }
    function buildAccordion(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      c.itemSpacing = 0;
      c.fills = [];
      const rows = [
        ["Is there a free trial available?", true],
        ["Can I change my plan later?", false],
        ["How does billing work?", false]
      ];
      rows.forEach(([q, openRow], i) => {
        const item = col(`item-${i + 1}`, 0);
        const head = row("header", 12);
        head.primaryAxisSizingMode = "FIXED";
        head.primaryAxisAlignItems = "SPACE_BETWEEN";
        pad(head, 14, 4, 14, 4);
        head.appendChild(txt(q, { roleKey: "label", style: "Medium", size: 14, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textPrimary }));
        head.appendChild(txt(openRow ? "\u25B4" : "\u25BE", { size: 12, colorP: p.iconTertiary }));
        item.appendChild(head);
        head.layoutSizingHorizontal = "FILL";
        if (openRow) {
          const body = col("panel", 0);
          pad(body, 0, 4, 14, 4);
          const bodyText = txt("Yes \u2014 every plan starts with a 30-day free trial. No credit card required until it ends.", {
            size: 13,
            sizeVar: sizeSm,
            colorP: p.textTertiary
          });
          body.appendChild(bodyText);
          item.appendChild(body);
          body.layoutSizingHorizontal = "FILL";
          bodyText.layoutSizingHorizontal = "FILL";
          bodyText.textAutoResize = "HEIGHT";
          out.push({ node: bodyText, prop: "Content", def: bodyText.characters });
        }
        if (i < rows.length - 1) {
          const rule = figma.createFrame();
          rule.name = "divider";
          rule.resize(100, 1);
          rule.fills = [fillP(p.borderSubtle)];
          item.appendChild(rule);
          rule.layoutSizingHorizontal = "FILL";
          rule.layoutSizingVertical = "FIXED";
        }
        c.appendChild(item);
        item.layoutSizingHorizontal = "FILL";
      });
      c.resize(360, c.height);
    }
    function buildAspectRatio(c, _out, ratio) {
      var _a2;
      const dims = { "16:9": [288, 162], "4:3": [240, 180], "1:1": [200, 200] };
      const [w, h] = (_a2 = dims[ratio]) != null ? _a2 : [288, 162];
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.primaryAxisAlignItems = "CENTER";
      c.counterAxisAlignItems = "CENTER";
      c.fills = [fillP(p.surface2)];
      c.strokes = [fillP(p.borderSubtle)];
      c.strokeWeight = 1;
      bindRadius(c, radContainer, radiusContainer);
      const tag = row("ratio", 0);
      tag.fills = [fillP(p.surfaceInv, 0.85)];
      tag.cornerRadius = 999;
      pad(tag, 4, 10, 4, 10);
      tag.appendChild(txt(ratio, { style: "Medium", size: 12, weightVar: wMedium, colorP: p.textOnInverse }));
      c.appendChild(tag);
      c.resize(w, h);
    }
    function buildPopover(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      gap(c, 8);
      pad(c, 16, 16, 16, 16);
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      bindRadius(c, radOverlay, radiusOverlay);
      c.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.14 }, offset: { x: 0, y: 6 }, radius: 24, spread: -4, visible: true, blendMode: "NORMAL" }];
      const title = txt("Share this view", { roleKey: "heading-sm", style: "Semi Bold", size: 14, sizeVar: sizeSm, weightVar: wSemibold, colorP: p.textPrimary });
      c.appendChild(title);
      out.push({ node: title, prop: "Title", def: "Share this view" });
      const body = txt("Anyone with the link can see the current filters and sorting.", { roleKey: "body-sm", size: 13, sizeVar: sizeSm, colorP: p.textTertiary });
      c.appendChild(body);
      body.layoutSizingHorizontal = "FILL";
      body.textAutoResize = "HEIGHT";
      out.push({ node: body, prop: "Body", def: body.characters });
      const action = row("action", 6);
      action.fills = [fillP(p.action)];
      bindRadius(action, radAction, radiusAction);
      pad(action, 8, 14, 8, 14);
      action.appendChild(txt("Copy link", { roleKey: "button", style: "Medium", size: 13, sizeVar: sizeSm, weightVar: wMedium, colorP: p.textOnBrand }));
      c.appendChild(action);
      c.resize(260, c.height);
    }
    function buildInfoTooltip(c, out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 8);
      c.fills = [];
      c.appendChild(iconSlot(14, p.iconQuaternary, "icon", "circle"));
      const bubble = row("bubble", 0);
      bubble.fills = [fillP(p.surfaceInv)];
      bindRadius(bubble, radControl, radiusControl);
      pad(bubble, 6, 10, 6, 10);
      const tip = txt("Shown on hover and focus", { roleKey: "caption", size: 12, sizeVar: sizeXs, colorP: p.textOnInverse });
      bubble.appendChild(tip);
      c.appendChild(bubble);
      out.push({ node: tip, prop: "Content", def: "Shown on hover and focus" });
    }
    function buildScrollArea(c, _out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "FIXED";
      c.itemSpacing = 4;
      pad(c, 8, 6, 8, 8);
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      bindRadius(c, radContainer, radiusContainer);
      c.clipsContent = true;
      const list = col("content", 2);
      list.primaryAxisSizingMode = "FIXED";
      for (const label of ["Getting started", "Foundations", "Components", "Patterns", "Releases"]) {
        const rowF = row(`row-${label.toLowerCase().replace(/\s+/g, "-")}`, 8);
        rowF.primaryAxisSizingMode = "FIXED";
        pad(rowF, 7, 10, 7, 10);
        bindRadius(rowF, radControl, radiusControl);
        rowF.appendChild(txt(label, { roleKey: "body-sm", size: 13, sizeVar: sizeSm, colorP: p.textSecondary }));
        list.appendChild(rowF);
        rowF.layoutSizingHorizontal = "FILL";
      }
      c.appendChild(list);
      list.layoutSizingHorizontal = "FILL";
      list.layoutSizingVertical = "FILL";
      const track = figma.createFrame();
      track.name = "scrollbar";
      track.layoutMode = "VERTICAL";
      track.primaryAxisSizingMode = "FIXED";
      track.counterAxisSizingMode = "FIXED";
      track.fills = [];
      const thumb = figma.createFrame();
      thumb.name = "thumb";
      thumb.resize(4, 48);
      thumb.cornerRadius = 999;
      thumb.fills = [fillP(p.borderStrong)];
      track.appendChild(thumb);
      thumb.layoutSizingHorizontal = "FIXED";
      thumb.layoutSizingVertical = "FIXED";
      c.appendChild(track);
      track.resize(4, 120);
      c.resize(240, 148);
    }
    function buildPagination(c, _out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      gap(c, 4);
      c.fills = [];
      function pageBtn(label, kind) {
        const b = row(`page-${label}`, 0);
        b.primaryAxisSizingMode = "FIXED";
        b.counterAxisSizingMode = "FIXED";
        b.primaryAxisAlignItems = "CENTER";
        b.counterAxisAlignItems = "CENTER";
        bindRadius(b, radControl, radiusControl);
        if (kind === "current") b.fills = [fillP(p.action)];
        b.appendChild(txt(label, {
          style: kind === "current" ? "Medium" : "Regular",
          size: 13,
          sizeVar: sizeSm,
          weightVar: kind === "current" ? wMedium : wRegular,
          colorP: kind === "current" ? p.textOnBrand : kind === "ellipsis" ? p.textPlaceholder : kind === "arrow" ? p.iconTertiary : p.textSecondary
        }));
        c.appendChild(b);
        b.resize(32, 32);
      }
      pageBtn("\u2039", "arrow");
      pageBtn("1", "page");
      pageBtn("2", "current");
      pageBtn("3", "page");
      pageBtn("\u2026", "ellipsis");
      pageBtn("8", "page");
      pageBtn("\u203A", "arrow");
    }
    function buildTabMenu(c, _out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "AUTO";
      gap(c, 4);
      c.fills = [];
      const items = [["Overview", true], ["Analytics", false], ["Reports", false], ["Settings", false]];
      for (const [label, active] of items) {
        const pill = row(`tab-${label.toLowerCase()}`, 0);
        pill.fills = active ? [fillP(p.brandSubtle)] : [];
        pill.cornerRadius = 999;
        pad(pill, 7, 14, 7, 14);
        pill.appendChild(txt(label, {
          style: active ? "Medium" : "Regular",
          size: 13,
          sizeVar: sizeSm,
          weightVar: active ? wMedium : wRegular,
          colorP: active ? p.textBrand : p.textTertiary
        }));
        c.appendChild(pill);
      }
    }
    function menuPanel(c, items) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      gap(c, 2);
      pad(c, 6, 6, 6, 6);
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      bindRadius(c, radAction, radiusAction);
      c.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.14 }, offset: { x: 0, y: 6 }, radius: 24, spread: -4, visible: true, blendMode: "NORMAL" }];
      for (const item of items) {
        if (item.kind === "separator") {
          const rule = figma.createFrame();
          rule.name = "separator";
          rule.resize(100, 1);
          rule.fills = [fillP(p.borderSubtle)];
          c.appendChild(rule);
          rule.layoutSizingHorizontal = "FILL";
          rule.layoutSizingVertical = "FIXED";
          continue;
        }
        const rowF = row(`item-${item.label.toLowerCase().replace(/\s+/g, "-")}`, 8);
        rowF.primaryAxisSizingMode = "FIXED";
        rowF.primaryAxisAlignItems = "SPACE_BETWEEN";
        pad(rowF, 8, 10, 8, 10);
        bindRadius(rowF, radControl, radiusControl);
        if (item.kind === "active") rowF.fills = [fillP(p.surface1Hover)];
        const colorP = item.kind === "danger" ? p.textError : p.textPrimary;
        rowF.appendChild(txt(item.label, { roleKey: "label", size: 13, sizeVar: sizeSm, colorP }));
        if (item.hint) rowF.appendChild(txt(item.hint, { roleKey: "caption", size: 12, sizeVar: sizeXs, colorP: p.textPlaceholder }));
        c.appendChild(rowF);
        rowF.layoutSizingHorizontal = "FILL";
      }
      c.resize(220, c.height);
    }
    function buildDropdownMenu(c, _out) {
      menuPanel(c, [
        { label: "Edit", kind: "active" },
        { label: "Duplicate" },
        { label: "Share\u2026" },
        { label: "", kind: "separator" },
        { label: "Delete", kind: "danger" }
      ]);
    }
    function buildContextMenu(c, _out) {
      menuPanel(c, [
        { label: "Cut", hint: "\u2318X" },
        { label: "Copy", hint: "\u2318C", kind: "active" },
        { label: "Paste", hint: "\u2318V" },
        { label: "", kind: "separator" },
        { label: "Select all", hint: "\u2318A" }
      ]);
    }
    function buildCommand(c, out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      c.itemSpacing = 0;
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      bindRadius(c, radOverlay, radiusOverlay);
      c.clipsContent = true;
      c.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.18 }, offset: { x: 0, y: 12 }, radius: 40, spread: -8, visible: true, blendMode: "NORMAL" }];
      const search = row("search", 10);
      search.primaryAxisSizingMode = "FIXED";
      pad(search, 14, 16, 14, 16);
      search.appendChild(iconSlot(13, p.iconQuaternary, "icon", "circle"));
      const query = txt("Type a command or search\u2026", { roleKey: "placeholder", size: 14, sizeVar: sizeSm, colorP: p.textPlaceholder });
      search.appendChild(query);
      query.layoutSizingHorizontal = "FILL";
      const kbd = row("kbd", 0);
      kbd.fills = [fillP(p.surface2)];
      kbd.strokes = [fillP(p.borderSubtle)];
      kbd.strokeWeight = 1;
      bindRadius(kbd, radControl, radiusControl);
      pad(kbd, 2, 6, 2, 6);
      kbd.appendChild(txt("\u2318K", { size: 11, colorP: p.textTertiary }));
      search.appendChild(kbd);
      c.appendChild(search);
      search.layoutSizingHorizontal = "FILL";
      out.push({ node: query, prop: "Placeholder", def: query.characters });
      const rule = figma.createFrame();
      rule.name = "divider";
      rule.resize(100, 1);
      rule.fills = [fillP(p.borderSubtle)];
      c.appendChild(rule);
      rule.layoutSizingHorizontal = "FILL";
      rule.layoutSizingVertical = "FIXED";
      const list = col("results", 2);
      pad(list, 8, 6, 8, 6);
      const group = txt("SUGGESTIONS", { style: "Medium", size: 10, weightVar: wMedium, colorP: p.textPlaceholder });
      group.name = "group";
      const groupPad = row("group-label", 0);
      pad(groupPad, 4, 10, 4, 10);
      groupPad.appendChild(group);
      list.appendChild(groupPad);
      const cmds = [
        ["New document", true],
        ["Invite teammate", false],
        ["Open settings", false]
      ];
      for (const [label, active] of cmds) {
        const rowF = row(`cmd-${label.toLowerCase().replace(/\s+/g, "-")}`, 10);
        rowF.primaryAxisSizingMode = "FIXED";
        pad(rowF, 9, 10, 9, 10);
        bindRadius(rowF, radControl, radiusControl);
        if (active) rowF.fills = [fillP(p.surface1Hover)];
        rowF.appendChild(iconSlot(13, p.iconTertiary, "icon", "circle"));
        rowF.appendChild(txt(label, { roleKey: "body-sm", size: 13, sizeVar: sizeSm, colorP: p.textPrimary }));
        list.appendChild(rowF);
        rowF.layoutSizingHorizontal = "FILL";
      }
      c.appendChild(list);
      list.layoutSizingHorizontal = "FILL";
      c.resize(420, c.height);
    }
    function buildNavbar(c, out) {
      c.layoutMode = "HORIZONTAL";
      c.primaryAxisSizingMode = "FIXED";
      c.counterAxisSizingMode = "AUTO";
      c.counterAxisAlignItems = "CENTER";
      c.primaryAxisAlignItems = "SPACE_BETWEEN";
      pad(c, 12, 24, 12, 24);
      c.fills = [fillP(p.surface0)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      c.strokeAlign = "INSIDE";
      const brand = row("brand", 8);
      const mark = figma.createFrame();
      mark.name = "logo";
      mark.resize(24, 24);
      mark.cornerRadius = 6;
      mark.fills = [fillP(p.action)];
      brand.appendChild(mark);
      mark.layoutSizingHorizontal = "FIXED";
      mark.layoutSizingVertical = "FIXED";
      const name = txt("Acme", { style: "Semi Bold", size: 15, weightVar: wSemibold, colorP: p.textPrimary });
      brand.appendChild(name);
      c.appendChild(brand);
      out.push({ node: name, prop: "Brand", def: "Acme" });
      const nav = row("nav", 4);
      const links = [["Home", true], ["Projects", false], ["Teams", false], ["Reports", false]];
      for (const [label, active] of links) {
        const link = row(`link-${label.toLowerCase()}`, 0);
        pad(link, 6, 12, 6, 12);
        bindRadius(link, radControl, radiusControl);
        if (active) link.fills = [fillP(p.surface1Hover)];
        link.appendChild(txt(label, {
          style: active ? "Medium" : "Regular",
          size: 13,
          sizeVar: sizeSm,
          weightVar: active ? wMedium : wRegular,
          colorP: active ? p.textPrimary : p.textTertiary
        }));
        nav.appendChild(link);
      }
      c.appendChild(nav);
      const cluster = row("actions", 10);
      cluster.appendChild(iconSlot(14, p.iconTertiary, "icon-search", "circle"));
      const avatar = figma.createFrame();
      avatar.name = "avatar";
      avatar.layoutMode = "HORIZONTAL";
      avatar.primaryAxisSizingMode = "FIXED";
      avatar.counterAxisSizingMode = "FIXED";
      avatar.primaryAxisAlignItems = "CENTER";
      avatar.counterAxisAlignItems = "CENTER";
      avatar.cornerRadius = 9999;
      avatar.fills = [fillP(p.brandSubtle)];
      avatar.appendChild(txt("AC", { style: "Medium", size: 10, weightVar: wMedium, colorP: p.textBrand }));
      cluster.appendChild(avatar);
      avatar.resize(28, 28);
      c.appendChild(cluster);
      c.resize(720, c.height);
    }
    function buildSidebar(c, _out) {
      c.layoutMode = "VERTICAL";
      c.primaryAxisSizingMode = "AUTO";
      c.counterAxisSizingMode = "FIXED";
      gap(c, 2);
      pad(c, 16, 10, 16, 10);
      c.fills = [fillP(p.surface1)];
      c.strokes = [fillP(p.borderDefault)];
      c.strokeWeight = 1;
      function groupLabel(label, topGap = false) {
        const g = row("group-label", 0);
        pad(g, topGap ? 16 : 4, 10, 6, 10);
        g.appendChild(txt(label, { style: "Medium", size: 10, weightVar: wMedium, colorP: p.textPlaceholder }));
        c.appendChild(g);
      }
      function navItem(label, active = false) {
        const rowF = row(`item-${label.toLowerCase()}`, 10);
        rowF.primaryAxisSizingMode = "FIXED";
        pad(rowF, 8, 10, 8, 10);
        bindRadius(rowF, radControl, radiusControl);
        if (active) rowF.fills = [fillP(p.brandSubtle)];
        rowF.appendChild(iconSlot(13, active ? p.iconBrand : p.iconTertiary, "icon", "circle"));
        rowF.appendChild(txt(label, {
          style: active ? "Medium" : "Regular",
          size: 13,
          sizeVar: sizeSm,
          weightVar: active ? wMedium : wRegular,
          colorP: active ? p.textBrand : p.textSecondary
        }));
        c.appendChild(rowF);
        rowF.layoutSizingHorizontal = "FILL";
      }
      groupLabel("WORKSPACE");
      navItem("Dashboard", true);
      navItem("Projects");
      navItem("Team");
      groupLabel("SYSTEM", true);
      navItem("Settings");
      navItem("Support");
      c.resize(220, c.height);
    }
    const SPECS = {
      Button: {
        cols: BTN_COLORS ? Object.keys(BTN_COLORS).length * BTN_STYLES.length : 12,
        description: "Universal action button. Size \xD7 Color \xD7 Style \xD7 State matrix, each variant carrying independent Icon leading / Icon trailing boolean + swap properties; fills \u2192 component tokens \u2192 semantics.",
        // Size/Style/State are what a designer actually picks between — a
        // button's height, its emphasis, and what it's doing. Color still
        // appears (every value ships, see budgetedCross), just not crossed
        // against the other three: a Danger XL Ghost Loading button is not a
        // combination anyone reaches for. Icon is NOT an axis at all any more —
        // see buildButton — so it never multiplies this matrix in the first
        // place; every variant below carries both icon slots as toggles.
        primaryAxes: ["Size", "Style", "State"],
        variants: BTN_SIZE_KEYS.flatMap(
          (size) => STATES.flatMap(
            (state) => Object.keys(BTN_COLORS).flatMap(
              (color) => BTN_STYLES.map((style) => ({
                props: { Size: size, Color: color, Style: style, State: state },
                build: (c, out) => buildButton(c, out, color, style, state, size)
              }))
            )
          )
        )
      },
      Input: {
        cols: INPUT_TYPES.length,
        description: "Text input field \u2014 Type \xD7 State \xD7 Size with label, description and helper rows. Every context ships its exact inner layout; styling bound to input/* tokens.",
        // Size × State is the interaction ladder; Type (icon-leading, password,
        // search…) is a content variation, still fully represented but only
        // against the Default size/state baseline.
        primaryAxes: ["Size", "State"],
        variants: INPUT_SIZE_KEYS.flatMap(
          (size) => INPUT_STATES.flatMap(
            (state) => INPUT_TYPES.map((type) => ({
              props: { Size: size, State: state, Type: type },
              build: (c, out) => buildInputField(c, out, size, type, state)
            }))
          )
        )
      },
      Select: {
        cols: 5,
        description: "Select trigger \u2014 Size \xD7 State. Shares the input/* tokens.",
        variants: ["MD", "SM", "LG"].flatMap(
          (size) => ["Default", "Hover", "Focused", "Error", "Disabled"].map((state) => ({
            props: { Size: size, State: state },
            build: (c, out) => buildSelectTrigger(c, out, state, size)
          }))
        )
      },
      Checkbox: {
        cols: 4,
        description: "Checkbox \u2014 Size \xD7 Checked \xD7 State. Box fill \u2192 checkbox/bg \u2192 action/primary.",
        variants: ["MD", "SM"].flatMap(
          (size) => ["True", "False"].flatMap(
            (checked) => ["Default", "Hover", "Focused", "Disabled"].map((state) => ({
              props: { Size: size, Checked: checked, State: state },
              build: (c, out) => buildCheckbox(c, out, checked === "True", state, size)
            }))
          )
        )
      },
      Toggle: {
        cols: 4,
        description: "Toggle switch \u2014 Size \xD7 On \xD7 State. Track \u2192 toggle/track-on|off tokens.",
        variants: ["MD", "SM"].flatMap(
          (size) => ["True", "False"].flatMap(
            (on) => ["Default", "Hover", "Focused", "Disabled"].map((state) => ({
              props: { Size: size, On: on, State: state },
              build: (c, out) => buildToggle(c, out, on === "True", state, size)
            }))
          )
        )
      },
      Badge: {
        cols: 6,
        description: "Badge \u2014 Size \xD7 Style (Solid/Soft/Outline) \xD7 Color (semantic status roles) \xD7 Icon (None/Leading/Trailing).",
        // Style × Color is the axis pair that actually needs to be SEEN
        // together — it's how a reviewer confirms every status colour looks
        // right in every treatment. Size and Icon still ship every value, just
        // against the MD/None baseline.
        primaryAxes: ["Style", "Color"],
        variants: ["MD", "SM", "LG"].flatMap(
          (size) => ["Solid", "Soft", "Outline"].flatMap(
            (style) => Object.keys(BADGE_COLORS).flatMap(
              (color) => BADGE_ICON_POS.map((iconPos) => ({
                props: { Size: size, Style: style, Color: color, Icon: iconPos },
                build: (c, out) => buildBadge(c, out, style, color, size, iconPos)
              }))
            )
          )
        )
      },
      Avatar: {
        cols: 5,
        description: "Avatar with initials \u2014 XS to XL sizes. Fill \u2192 avatar/bg token.",
        variants: Object.keys(AVATAR_SIZES).map((size) => ({
          props: { Size: size },
          build: (c, out) => buildAvatar(c, out, size)
        }))
      },
      Toast: {
        cols: 2,
        description: "Toast notification \u2014 one variant per semantic status.",
        variants: Object.keys(TOAST_STATUS).map((status) => ({
          props: { Status: status },
          build: (c, out) => buildToast(c, out, status)
        }))
      },
      Spinner: {
        cols: 3,
        description: "Loading spinner \u2014 SM/MD/LG. Arc \u2192 spinner/color token.",
        variants: Object.keys(SPINNER_SIZES).map((size) => ({
          props: { Size: size },
          build: (c, out) => buildSpinner(c, out, size)
        }))
      },
      Divider: {
        cols: 2,
        description: "Rule \u2014 Horizontal / Vertical. Fill \u2192 divider/color token.",
        variants: ["Horizontal", "Vertical"].map((o) => ({
          props: { Orientation: o },
          build: (c, out) => buildDivider(c, out, o)
        }))
      },
      // Single-variant components
      Tooltip: { cols: 1, description: "Tooltip. Fill \u2192 tooltip/bg \u2192 surface/inverse.", variants: [{ props: {}, build: buildTooltip }] },
      Card: { cols: 1, description: "Content card. Fill \u2192 card/bg \u2192 surface/1.", variants: [{ props: {}, build: buildCard }] },
      Modal: { cols: 1, description: "Dialog with footer actions.", variants: [{ props: {}, build: buildModal }] },
      Tabs: { cols: 1, description: "Tab bar. Indicator \u2192 tabs/indicator \u2192 action/primary.", variants: [{ props: {}, build: buildTabs }] },
      Breadcrumb: { cols: 1, description: "Breadcrumb trail.", variants: [{ props: {}, build: buildBreadcrumb }] },
      Progress: { cols: 1, description: "Progress bar, 60%. Bar \u2192 progress/bar \u2192 action/primary.", variants: [{ props: {}, build: buildProgress }] },
      // ── Extended catalog ──────────────────────────────────────────────────────
      ButtonClose: {
        cols: 5,
        description: "Icon-only dismiss button \u2014 Size \xD7 State, ghost interaction states.",
        variants: ["MD", "SM"].flatMap(
          (size) => ["Default", "Hover", "Pressed", "Focused", "Disabled"].map((state) => ({
            props: { Size: size, State: state },
            build: (c, out) => buildCloseButton(c, out, state, size)
          }))
        )
      },
      ButtonFab: {
        cols: 2,
        description: "Floating action button \u2014 Size \xD7 State. Fill \u2192 button/bg token.",
        variants: Object.keys(FAB_SIZES).flatMap(
          (size) => ["Default", "Hover"].map((state) => ({
            props: { Size: size, State: state },
            build: (c, out) => buildFab(c, out, size, state)
          }))
        )
      },
      ButtonGroup: {
        cols: 3,
        description: "Attached button group / segmented actions \u2014 one variant per Size.",
        variants: ["MD", "SM", "LG"].map((size) => ({
          props: { Size: size },
          build: (c, out) => buildButtonGroup(c, out, size)
        }))
      },
      ButtonSocial: {
        cols: 2,
        description: "SSO sign-in button \u2014 Size \xD7 Provider \xD7 State.",
        variants: ["MD", "LG"].flatMap(
          (size) => ["Google", "Apple", "GitHub"].flatMap(
            (provider) => ["Default", "Hover"].map((state) => ({
              props: { Size: size, Provider: provider, State: state },
              build: (c, out) => buildSocial(c, out, provider, state, size)
            }))
          )
        )
      },
      ButtonTextLink: {
        cols: 3,
        description: "Inline text link. Color \u2192 text/brand semantic role.",
        variants: ["Default", "Hover", "Disabled"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildTextLink(c, out, state)
        }))
      },
      StoreBadge: {
        cols: 2,
        description: "App store download badges (App Store / Google Play).",
        variants: ["App Store", "Google Play"].map((store) => ({
          props: { Store: store },
          build: (c, out) => buildStoreBadge(c, out, store)
        }))
      },
      CheckboxGroup: { cols: 1, description: "Checkbox group with legend \u2014 shares checkbox/* tokens.", variants: [{ props: {}, build: buildCheckboxGroup }] },
      Radio: {
        cols: 4,
        description: "Radio \u2014 Size \xD7 Checked \xD7 State. Ring \u2192 checkbox/bg \u2192 action/primary.",
        variants: ["MD", "SM"].flatMap(
          (size) => ["True", "False"].flatMap(
            (sel) => ["Default", "Hover", "Focused", "Disabled"].map((state) => ({
              props: { Size: size, Checked: sel, State: state },
              build: (c, out) => buildRadio(c, out, sel === "True", state, size)
            }))
          )
        )
      },
      RadioGroup: { cols: 1, description: "Radio group with legend \u2014 shares checkbox/* tokens.", variants: [{ props: {}, build: buildRadioGroup }] },
      TextArea: {
        cols: 2,
        description: "Multi-line input \u2014 shares the input/* tokens.",
        variants: ["Default", "Focused", "Error", "Disabled"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildTextArea(c, out, state)
        }))
      },
      InputOtp: {
        cols: 3,
        description: "One-time-code input \u2014 Size \xD7 State, 4 cells sharing the input/* tokens.",
        variants: ["MD", "SM", "LG"].flatMap(
          (size) => ["Default", "Focused", "Filled"].map((state) => ({
            props: { Size: size, State: state },
            build: (c, out) => buildOtp(c, out, state, size)
          }))
        )
      },
      InputStepper: {
        cols: 2,
        description: "Number input with increment/decrement \u2014 shares input/* tokens.",
        variants: ["Default", "Disabled"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildStepperInput(c, out, state)
        }))
      },
      InputTag: { cols: 1, description: "Tag input with removable chips \u2014 shares input/* tokens.", variants: [{ props: {}, build: buildTagInput }] },
      FileUpload: {
        cols: 2,
        description: "Dashed dropzone \u2014 border \u2192 input/border, accent on hover.",
        variants: ["Default", "Hover"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildFileUpload(c, out, state)
        }))
      },
      Segmented: {
        cols: 2,
        description: "Segmented control \u2014 one variant per Size; active segment on surface/0.",
        variants: ["MD", "SM"].map((size) => ({
          props: { Size: size },
          build: (c, out) => buildSegmented(c, out, size)
        }))
      },
      Slider: {
        cols: 3,
        description: "Slider at 60% \u2014 track/fill \u2192 progress tokens, knob \u2192 toggle/knob.",
        variants: ["Default", "Hover", "Disabled"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildSlider(c, out, state)
        }))
      },
      SwitchGroup: { cols: 1, description: "Switch group with legend \u2014 shares toggle/* tokens.", variants: [{ props: {}, build: buildSwitchGroup }] },
      Chip: {
        cols: 3,
        description: "Filter chip \u2014 Size \xD7 Selected \xD7 State. Selected \u2192 badge/bg + badge/text tokens.",
        variants: ["MD", "SM"].flatMap(
          (size) => ["True", "False"].flatMap(
            (sel) => ["Default", "Hover", "Disabled"].map((state) => ({
              props: { Size: size, Selected: sel, State: state },
              build: (c, out) => buildChip(c, out, sel === "True", state, size)
            }))
          )
        )
      },
      StatusBadge: {
        cols: 5,
        description: "Status badge \u2014 dot + label per semantic status role.",
        variants: ["Neutral", "Success", "Warning", "Error", "Info"].map((status) => ({
          props: { Status: status },
          build: (c, out) => buildStatusBadge(c, out, status)
        }))
      },
      StepIndicator: { cols: 1, description: "Step indicator \u2014 done / current / upcoming steps.", variants: [{ props: {}, build: buildStepIndicator }] },
      AlertBanner: {
        cols: 2,
        description: "Alert banner \u2014 Status \xD7 Style (Soft / Solid), tinted by the semantic status roles.",
        variants: Object.keys(ALERT_STATUS).flatMap(
          (status) => ["Soft", "Solid"].map((style) => ({
            props: { Status: status, Style: style },
            build: (c, out) => buildAlertBanner(c, out, status, style)
          }))
        )
      },
      InlineAlert: {
        cols: 2,
        description: "Inline alert \u2014 one variant per semantic status, soft tint + status border.",
        variants: Object.keys(ALERT_STATUS).map((status) => ({
          props: { Status: status },
          build: (c, out) => buildInlineAlert(c, out, status)
        }))
      },
      // ── Catalogue parity (configurator componentCatalogue.ts) ────────────────
      Combobox: {
        cols: 2,
        description: "Type-ahead select \u2014 an input that filters a dropdown list as the user types. Shares the input/* tokens.",
        variants: ["Default", "Open"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildCombobox(c, out, state)
        }))
      },
      InputGroup: {
        cols: 1,
        description: "Input with attached add-ons \u2014 prefix segment and action button sharing one border.",
        variants: [{ props: {}, build: buildInputGroup }]
      },
      Dropzone: {
        cols: 3,
        description: "Drag-and-drop file target \u2014 Default / Dragging / Error states with dashed border.",
        variants: ["Default", "Dragging", "Error"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildDropzone(c, out, state)
        }))
      },
      Field: {
        cols: 2,
        description: "The form-row composition \u2014 label, control slot and hint/error wired together.",
        variants: ["Default", "Error"].map((state) => ({
          props: { State: state },
          build: (c, out) => buildField(c, out, state)
        }))
      },
      Label: {
        cols: 2,
        description: "Standalone form label \u2014 Required True/False with * marker or optional hint.",
        variants: ["False", "True"].map((req) => ({
          props: { Required: req },
          build: (c, out) => buildLabel(c, out, req === "True")
        }))
      },
      PasswordStrength: {
        cols: 1,
        description: "Segmented meter + caption scoring a password \u2014 Weak / Fair / Strong.",
        variants: ["Weak", "Fair", "Strong"].map((strength) => ({
          props: { Strength: strength },
          build: (c, out) => buildPasswordStrength(c, out, strength)
        }))
      },
      Rating: {
        cols: 2,
        description: "Star row for a 1\u20135 score \u2014 read-only and interactive (with count label).",
        variants: ["False", "True"].map((i) => ({
          props: { Interactive: i },
          build: (c, out) => buildRating(c, out, i === "True")
        }))
      },
      FileFormat: {
        cols: 4,
        description: "Document glyph with a colored format plate \u2014 PDF, PNG, SVG, ZIP.",
        variants: Object.keys(FILE_FORMATS).map((format) => ({
          props: { Format: format },
          build: (c, out) => buildFileFormat(c, out, format)
        }))
      },
      Accordion: { cols: 1, description: "Stacked disclosure rows \u2014 first panel expanded, headers with chevrons.", variants: [{ props: {}, build: buildAccordion }] },
      AspectRatio: {
        cols: 3,
        description: "Layout primitive locking content to a fixed ratio \u2014 16:9, 4:3, 1:1.",
        variants: ["16:9", "4:3", "1:1"].map((ratio) => ({
          props: { Ratio: ratio },
          build: (c, out) => buildAspectRatio(c, out, ratio)
        }))
      },
      Popover: { cols: 1, description: "Anchored floating panel \u2014 title, body and one action over surface/1.", variants: [{ props: {}, build: buildPopover }] },
      InfoTooltip: { cols: 1, description: "The \u24D8 affordance + tooltip bubble pairing for inline explanations.", variants: [{ props: {}, build: buildInfoTooltip }] },
      ScrollArea: { cols: 1, description: "Bounded panel with custom scrollbar track and thumb.", variants: [{ props: {}, build: buildScrollArea }] },
      Pagination: { cols: 1, description: "Page switcher \u2014 arrows, numbered pages, overflow ellipsis; current page \u2192 button tokens.", variants: [{ props: {}, build: buildPagination }] },
      TabMenu: { cols: 1, description: "Pill-style horizontal menu \u2014 the softer sibling of Tabs.", variants: [{ props: {}, build: buildTabMenu }] },
      DropdownMenu: { cols: 1, description: "Action menu \u2014 items, separator and destructive zone on surface/1.", variants: [{ props: {}, build: buildDropdownMenu }] },
      ContextMenu: { cols: 1, description: "Right-click menu with keyboard shortcut hints.", variants: [{ props: {}, build: buildContextMenu }] },
      Command: { cols: 1, description: "Command palette \u2014 \u2318K search input over a grouped result list.", variants: [{ props: {}, build: buildCommand }] },
      Navbar: { cols: 1, description: "Top app bar \u2014 brand mark, primary destinations, account cluster.", variants: [{ props: {}, build: buildNavbar }] },
      Sidebar: { cols: 1, description: "Vertical navigation panel with grouped items and an active state.", variants: [{ props: {}, build: buildSidebar }] }
    };
    const CATALOG = [
      {
        category: "Button & Actions",
        entries: [
          { page: "Button [Default]", set: "Button", gate: "Button", spec: "Button" },
          { page: "Button [Close \u2013 Dismiss]", set: "Button Close", gate: "CloseButton", legacyGate: "Button", spec: "ButtonClose" },
          { page: "Button [Floating Action \u2013 FAB]", set: "Button FAB", gate: "FABButton", legacyGate: "Button", spec: "ButtonFab" },
          { page: "Button [Group]", set: "Button Group", gate: "ButtonGroup", legacyGate: "Button", spec: "ButtonGroup" },
          { page: "Button [Social \u2013 SSO]", set: "Button Social", gate: "SocialLoginButton", legacyGate: "Button", spec: "ButtonSocial" },
          { page: "Button [Text Link]", set: "Text Link", gate: "TextLink", legacyGate: "Button", spec: "ButtonTextLink" },
          { page: "Button [App Store Badges]", set: "Store Badge", gate: "AppStoreBadge", legacyGate: "Button", spec: "StoreBadge" }
        ]
      },
      {
        category: "Form Controls",
        entries: [
          { page: "Checkbox", set: "Checkbox", gate: "Checkbox", spec: "Checkbox" },
          { page: "Checkbox Group", set: "Checkbox Group", gate: "CheckboxGroup", legacyGate: "Checkbox", spec: "CheckboxGroup" },
          { page: "Combobox", set: "Combobox", gate: "Combobox", spec: "Combobox" },
          { page: "Dropzone", set: "Dropzone", gate: "Dropzone", spec: "Dropzone" },
          { page: "Field", set: "Field", gate: "Field", spec: "Field" },
          { page: "File Upload", set: "File Upload", gate: "FileUpload", legacyGate: "Input", spec: "FileUpload" },
          { page: "Input [OTP]", set: "Input OTP", gate: "InputOTP", legacyGate: "Input", spec: "InputOtp" },
          { page: "Input [Stepper \u2013 Number]", set: "Input Stepper", gate: "InputStepper", legacyGate: "Input", spec: "InputStepper" },
          { page: "Input [Tag]", set: "Input Tag", gate: "InputTag", legacyGate: "Input", spec: "InputTag" },
          { page: "Input [Text Area]", set: "Input Text Area", gate: "Textarea", legacyGate: "Input", spec: "TextArea" },
          { page: "Input [Text]", set: "Input", gate: "Input", spec: "Input" },
          { page: "Input Group", set: "Input Group", gate: "InputGroup", spec: "InputGroup" },
          { page: "Label", set: "Label", gate: "Label", spec: "Label" },
          { page: "Password Strength", set: "Password Strength", gate: "PasswordStrength", spec: "PasswordStrength" },
          { page: "Radio Group", set: "Radio", gate: "Radio", legacyGate: "Checkbox", spec: "Radio" },
          { page: "Radio Group", set: "Radio Group", gate: "RadioGroup", legacyGate: "Checkbox", spec: "RadioGroup" },
          { page: "Segmented Control", set: "Segmented Control", gate: "SegmentedControl", legacyGate: "Tabs", spec: "Segmented" },
          { page: "Select Field", set: "Select", gate: "Select", spec: "Select" },
          { page: "Slider", set: "Slider", gate: "Slider", legacyGate: "Input", spec: "Slider" },
          { page: "Switch", set: "Toggle", gate: "Toggle", spec: "Toggle" },
          { page: "Switch Group", set: "Switch Group", gate: "SwitchGroup", legacyGate: "Toggle", spec: "SwitchGroup" }
        ]
      },
      {
        category: "Indicators",
        entries: [
          { page: "Badge (Tag)", set: "Badge", gate: "Badge", spec: "Badge" },
          { page: "Chips", set: "Chip", gate: "Chip", legacyGate: "Badge", spec: "Chip" },
          { page: "File Format", set: "File Format", gate: "FileFormat", spec: "FileFormat" },
          { page: "Progress Indicators", set: "Progress", gate: "Progress", spec: "Progress" },
          { page: "Rating", set: "Rating", gate: "Rating", spec: "Rating" },
          { page: "Spinner \u2013 Loaders", set: "Spinner", gate: "Spinner", spec: "Spinner" },
          { page: "Status Badge", set: "Status Badge", gate: "StatusBadge", legacyGate: "Badge", spec: "StatusBadge" },
          { page: "Step Indicator", set: "Step Indicator", gate: "Stepper", legacyGate: "Progress", spec: "StepIndicator" }
        ]
      },
      {
        category: "Content & Surfaces",
        entries: [
          { page: "Accordion", set: "Accordion", gate: "Accordion", spec: "Accordion" },
          { page: "Aspect Ratio", set: "Aspect Ratio", gate: "AspectRatio", spec: "AspectRatio" },
          { page: "Avatar", set: "Avatar", gate: "Avatar", spec: "Avatar" },
          { page: "Card", set: "Card", gate: "Card", spec: "Card" },
          { page: "Divider", set: "Divider", gate: "Divider", spec: "Divider" },
          { page: "Modal", set: "Modal", gate: "Modal", spec: "Modal" },
          { page: "Popover", set: "Popover", gate: "Popover", spec: "Popover" },
          { page: "Scroll Area", set: "Scroll Area", gate: "ScrollArea", spec: "ScrollArea" },
          { page: "Tooltip", set: "Tooltip", gate: "Tooltip", spec: "Tooltip" },
          { page: "Tooltip [Info]", set: "Info Tooltip", gate: "InfoTooltip", spec: "InfoTooltip" }
        ]
      },
      {
        category: "Feedback",
        entries: [
          { page: "Alert Banner", set: "Alert Banner", gate: "AlertBanner", legacyGate: "Toast", spec: "AlertBanner" },
          { page: "Inline Alert", set: "Inline Alert", gate: "InlineAlert", legacyGate: "Toast", spec: "InlineAlert" },
          { page: "Toast \u2013 Snackbar", set: "Toast", gate: "Toast", spec: "Toast", legacyPage: "Toast" }
        ]
      },
      {
        category: "Navigation",
        entries: [
          { page: "Breadcrumb", set: "Breadcrumb", gate: "Breadcrumb", spec: "Breadcrumb" },
          { page: "Command", set: "Command", gate: "Command", spec: "Command" },
          { page: "Context Menu", set: "Context Menu", gate: "ContextMenu", spec: "ContextMenu" },
          { page: "Dropdown Menu", set: "Dropdown Menu", gate: "DropdownMenu", spec: "DropdownMenu" },
          { page: "Navbar", set: "Navbar", gate: "Navbar", spec: "Navbar" },
          { page: "Pagination", set: "Pagination", gate: "Pagination", spec: "Pagination" },
          { page: "Sidebar", set: "Sidebar", gate: "Sidebar", spec: "Sidebar" },
          { page: "Tab Menu", set: "Tab Menu", gate: "TabMenu", spec: "TabMenu" },
          { page: "Tabs", set: "Tabs", gate: "Tabs", spec: "Tabs" }
        ]
      }
    ];
    const CATEGORY_ORDER = CATALOG.map((c) => c.category);
    const CATEGORY_OF_SET = /* @__PURE__ */ new Map();
    for (const { category, entries } of CATALOG) {
      for (const e of entries) if (!CATEGORY_OF_SET.has(e.set)) CATEGORY_OF_SET.set(e.set, category);
    }
    const SAMPLE_PAGE = "\u2B21 Components Overview";
    const SAMPLE = [
      {
        set: "Button",
        spec: "Button",
        page: "Button",
        cols: 4,
        // Icon is no longer a variant prop at all (see buildButton — every
        // variant carries its own Icon leading/trailing boolean + swap
        // properties, always), so there's nothing left to sweep or pin for it
        // here. Size=MD keeps the Color×Style×State sweep readable; full State
        // ladder for Brand Solid so Loading/Focused show up, other Color×Style
        // stay Default. The one remaining sweep is Size itself (every size, at
        // the resting Brand/Solid/Default combo) — otherwise Size pins to MD
        // and `sampleSpec` below strips it as a property.
        keep: (p2) => p2.Size === "MD" && (p2.Color === "Brand" && p2.Style === "Solid" && (p2.State === "Default" || p2.State === "Hover" || p2.State === "Pressed" || p2.State === "Focused" || p2.State === "Loading" || p2.State === "Disabled") || p2.State === "Default" && !(p2.Color === "Brand" && p2.Style === "Solid")) || p2.Color === "Brand" && p2.Style === "Solid" && p2.State === "Default"
      },
      {
        set: "Input",
        spec: "Input",
        page: "Input",
        cols: 4,
        // Playbook: Size × State × Type. Include icon types + the full state
        // ladder so the variant panel matches Docs, not a 4-cell stub.
        keep: (p2) => p2.Size === "MD" && (p2.Type === "Default" && (p2.State === "Default" || p2.State === "Hover" || p2.State === "Focused" || p2.State === "Filled" || p2.State === "Error" || p2.State === "Loading" || p2.State === "Disabled") || (p2.Type === "Icon Leading" || p2.Type === "Icon Trailing" || p2.Type === "Search" || p2.Type === "Password" || p2.Type === "E-Mail") && p2.State === "Default")
      },
      {
        set: "Select",
        spec: "Select",
        page: "Select",
        cols: 2,
        keep: (p2) => p2.Size === "MD" && (p2.State === "Default" || p2.State === "Focused")
      },
      {
        set: "Checkbox",
        spec: "Checkbox",
        page: "Checkbox",
        cols: 4,
        keep: (p2) => p2.Size === "MD" && (p2.State === "Default" || p2.State === "Disabled")
      },
      {
        set: "Toggle",
        spec: "Toggle",
        page: "Switch",
        cols: 4,
        keep: (p2) => p2.Size === "MD" && (p2.State === "Default" || p2.State === "Disabled")
      },
      {
        // Every semantic status × all three styles — this is the one that makes
        // a colour change legible, so its matrix stays wide (18).
        set: "Badge",
        spec: "Badge",
        page: "Badge",
        cols: 6,
        keep: (p2) => p2.Size === "MD" && p2.Icon === "None"
      },
      { set: "Status Badge", spec: "StatusBadge", page: "Status Badge", cols: 5 },
      { set: "Toast", spec: "Toast", page: "Toast", cols: 2 },
      { set: "Avatar", spec: "Avatar", page: "Avatar", cols: 5 }
    ];
    function sampleSpec(e) {
      var _a2;
      const base = SPECS[e.spec];
      if (!base) return void 0;
      const kept = e.keep ? base.variants.filter((v) => e.keep(v.props)) : base.variants;
      if (kept.length === 0) return void 0;
      const seen = /* @__PURE__ */ new Map();
      for (const v of kept) {
        for (const [k, val] of Object.entries(v.props)) {
          let bucket = seen.get(k);
          if (!bucket) {
            bucket = /* @__PURE__ */ new Set();
            seen.set(k, bucket);
          }
          bucket.add(val);
        }
      }
      const drop = new Set([...seen].filter(([, vals]) => vals.size <= 1).map(([k]) => k));
      const variants = drop.size === 0 ? kept : kept.map((v) => __spreadProps(__spreadValues({}, v), {
        props: Object.fromEntries(Object.entries(v.props).filter(([k]) => !drop.has(k)))
      }));
      return { cols: (_a2 = e.cols) != null ? _a2 : base.cols, variants, description: base.description };
    }
    function budgetedCross(base, primaryAxes) {
      const axisOrder = Object.keys(base.variants[0].props);
      const sig = (props) => axisOrder.map((a) => props[a]).join("\0");
      const bySig = new Map(base.variants.map((v) => [sig(v.props), v]));
      const defaultProps = base.variants[0].props;
      const orderedValues = (axis) => {
        const seen = /* @__PURE__ */ new Set();
        const out = [];
        for (const v of base.variants) {
          const val = v.props[axis];
          if (val !== void 0 && !seen.has(val)) {
            seen.add(val);
            out.push(val);
          }
        }
        return out;
      };
      let primaryCombos = [{}];
      for (const axis of primaryAxes) {
        const next = [];
        for (const combo of primaryCombos) {
          for (const val of orderedValues(axis)) next.push(__spreadProps(__spreadValues({}, combo), { [axis]: val }));
        }
        primaryCombos = next;
      }
      const chosen = [];
      const chosenSigs = /* @__PURE__ */ new Set();
      const take = (props) => {
        const key = sig(props);
        if (chosenSigs.has(key)) return;
        const v = bySig.get(key);
        if (!v) return;
        chosen.push(v);
        chosenSigs.add(key);
      };
      for (const combo of primaryCombos) take(__spreadValues(__spreadValues({}, defaultProps), combo));
      const secondaryAxes = axisOrder.filter((a) => !primaryAxes.includes(a));
      for (const axis of secondaryAxes) {
        for (const val of orderedValues(axis)) {
          if (val === defaultProps[axis]) continue;
          take(__spreadProps(__spreadValues({}, defaultProps), { [axis]: val }));
        }
      }
      return chosen;
    }
    function representativeSpec(specKey) {
      const base = SPECS[specKey];
      if (!base || base.variants.length === 0) return void 0;
      if (base.variants.length <= FULL_CATALOGUE_BUDGET) return __spreadProps(__spreadValues({}, base), { representative: true });
      if (base.primaryAxes && base.primaryAxes.length > 0) {
        const variants = budgetedCross(base, base.primaryAxes);
        if (variants.length > 0) return __spreadProps(__spreadValues({}, base), { variants, representative: true });
      }
      const uncovered = /* @__PURE__ */ new Set();
      for (const variant of base.variants) {
        for (const [key, value] of Object.entries(variant.props)) uncovered.add(`${key}\0${value}`);
      }
      const chosen = [];
      const remaining = [...base.variants];
      while (uncovered.size > 0 && remaining.length > 0) {
        let bestIndex = 0;
        let bestGain = -1;
        for (let i = 0; i < remaining.length; i++) {
          let gain = 0;
          for (const [key, value] of Object.entries(remaining[i].props)) {
            if (uncovered.has(`${key}\0${value}`)) gain++;
          }
          if (gain > bestGain) {
            bestGain = gain;
            bestIndex = i;
          }
        }
        const [picked] = remaining.splice(bestIndex, 1);
        chosen.push(picked);
        for (const [key, value] of Object.entries(picked.props)) uncovered.delete(`${key}\0${value}`);
      }
      return __spreadProps(__spreadValues({}, base), { variants: chosen, representative: true });
    }
    const ITEM_PREFIX = "   \u21B3 ";
    const oldPage = figma.root.children.find((pg) => pg.name === "\u2B21 Components");
    const existingSets = /* @__PURE__ */ new Map();
    const existingSingles = /* @__PURE__ */ new Map();
    const harvested = /* @__PURE__ */ new Set();
    async function harvest(pg) {
      if (harvested.has(pg.id)) return;
      harvested.add(pg.id);
      await pg.loadAsync();
      for (const child of [...pg.children]) {
        if (child.type === "FRAME" && (/ — Atoms$/.test(child.name) || child.name.startsWith("docs/") || /^\d{2} · /.test(child.name))) {
          for (const inner of child.findAll(
            (n) => {
              var _a2;
              return n.type === "COMPONENT_SET" || n.type === "COMPONENT" && ((_a2 = n.parent) == null ? void 0 : _a2.type) !== "COMPONENT_SET";
            }
          )) {
            if (inner.type === "COMPONENT_SET") {
              pg.appendChild(inner);
              if (!existingSets.has(inner.name)) existingSets.set(inner.name, inner);
            } else if (inner.type === "COMPONENT") {
              pg.appendChild(inner);
              if (!existingSingles.has(inner.name)) existingSingles.set(inner.name, inner);
            }
          }
          child.remove();
        } else if (child.type === "TEXT" && child.name.startsWith("label/")) child.remove();
        else if (child.type === "COMPONENT_SET" && !existingSets.has(child.name)) existingSets.set(child.name, child);
        else if (child.type === "COMPONENT" && !existingSingles.has(child.name)) existingSingles.set(child.name, child);
      }
    }
    if (oldPage) await harvest(oldPage);
    const pageByName = (name) => figma.root.children.find((pg) => pg.name.trim() === name.trim());
    let pageLimitHit = false;
    function makePage(name) {
      const found = pageByName(name);
      if (found) return found;
      if (pageLimitHit) return void 0;
      try {
        const pg = figma.createPage();
        pg.name = name;
        return pg;
      } catch (e) {
        pageLimitHit = true;
        return void 0;
      }
    }
    const variantName = (props) => Object.keys(props).sort().map((k) => `${k}=${props[k]}`).join(", ");
    const normName = (s) => s.split(",").map((x) => x.trim()).filter(Boolean).sort().join(", ");
    const GAP_X = 24;
    const GAP_Y = 24;
    const MARGIN = 80;
    const BOARD_GAP = 160;
    const STAGE_STEP = 900;
    let builtVariants = 0;
    let builtAtoms = 0;
    let boardX = 0;
    let boardIndex = 0;
    let boardY = 0;
    let rowH = 0;
    let rowCategory;
    const CATEGORY_GAP = 240;
    const HEAD_GAP = 48;
    const BAND_W = 560;
    const cursorByPage = /* @__PURE__ */ new Map();
    let inFlight = [];
    let firstBuiltPage;
    const sampleTypo = await typoVarMap();
    const sampleChrome = docChromeVarsFrom(semLookup);
    const sampleModePin = docModePin(tokens, allCols);
    const componentThemePin = componentModePin(tokens, allCols);
    const { docSolid, docText, docFrame, wrapText, docDivider, docBullet, docBoard } = docChrome(fontFor, sampleTypo, tokens.typography.sizes, sampleChrome, sampleModePin);
    const DOC_INTRO = {
      Button: "The core action component of the system. It covers primary, destructive and success intents across four visual styles and the full interaction lifecycle, so a generic button never has to be rebuilt.",
      Input: "The core text entry component. It covers every common input context out of the box \u2014 plain text, e-mail, password, search, phone number and website \u2014 each variant shipping with the exact inner layout its context demands, across three sizes and the full input lifecycle with token-mapped styling at every step.",
      Select: "Dropdown trigger that shares the input tokens, with full state coverage for forms and filters.",
      Checkbox: "Binary selection control with checked and unchecked matrices across every interaction state.",
      Toggle: "On/off switch with token-driven track and knob, covering hover, focus and disabled states.",
      Badge: "Compact label for statuses and metadata \u2014 three visual styles across the semantic status roles.",
      Chip: "Filter chip with selected and unselected states, built on the badge tokens.",
      Progress: "Linear progress indicator; track and bar reference the progress tokens.",
      Spinner: "Loading indicator in three sizes, tinted by the spinner color token.",
      AlertBanner: "Prominent page-level alert for system feedback. Soft and solid styles across the semantic status roles, with title, message, action link and dismiss \u2014 all status colors resolve through the imported tokens.",
      InlineAlert: "Compact contextual alert that sits inside forms and content flows. One variant per semantic status with a soft tint and matching border.",
      Toast: "Transient snackbar notification with status dot, message and action \u2014 one variant per semantic status role.",
      // Catalogue parity — intros mirror the configurator's componentCatalogue descriptions.
      Combobox: "Type-ahead select \u2014 an input that filters a dropdown list as the user types. Use when options exceed ~10 items or need search; for short lists, plain Select is enough.",
      InputGroup: "An input with attached add-ons \u2014 prefix segments, selects or buttons sharing one border. Use for values with a fixed context (URLs, amounts, handles).",
      Dropzone: "Drag-and-drop target area for files, with active-drag and error states. Pair with a click-to-browse fallback \u2014 drag alone is not discoverable on touch.",
      Field: "The form-row composition \u2014 label, control slot, hint and error wired together. Wrap every form control in a Field so spacing, labels and errors stay consistent.",
      Label: "Standalone form label with optional required marker and secondary hint. Always visible \u2014 placeholder text is not a label.",
      PasswordStrength: "Segmented meter + caption that scores a password as the user types. Pair the meter with concrete guidance, not just a score.",
      Rating: "Star row for displaying or collecting a 1\u20135 score. Read-only by default; make interactive only where the user actually rates.",
      FileFormat: "Document glyph with a format plate (PDF, PNG, SVG, ZIP\u2026) for file lists \u2014 formats scan at a glance inside upload rows and attachment lists.",
      Accordion: "Vertically stacked disclosure rows \u2014 headers that expand one panel of content each. For secondary content like FAQs and advanced settings.",
      AspectRatio: "Layout primitive that locks its content to a fixed ratio (16:9, 4:3, 1:1\u2026). Wrap media so layouts never shift while content loads.",
      Popover: "Anchored floating panel for rich contextual content \u2014 richer than a tooltip, lighter than a modal. Open on click, not hover.",
      InfoTooltip: "The \u24D8 affordance + tooltip pairing for inline explanations next to labels \u2014 one sentence of context where hint text would be too much.",
      ScrollArea: "Custom-scrollbar container that keeps overflow styling consistent cross-platform. For panels and menus with bounded height.",
      Pagination: "Page switcher with previous/next arrows, numbered pages and overflow ellipsis. The current page stays visually unmistakable via the button tokens.",
      TabMenu: "Pill-style horizontal menu \u2014 the softer sibling of Tabs for page-level sections where an underline bar feels too heavy.",
      DropdownMenu: 'Action menu opened from a trigger \u2014 items, separators and a destructive zone. For 3+ secondary actions behind a "\u22EF" or button.',
      ContextMenu: "Right-click menu with shortcut hints \u2014 the pointer-positioned sibling of Dropdown Menu. Every action here must also exist somewhere visible.",
      Command: "Command palette \u2014 a searchable action list summoned with \u2318K. Index every significant action and destination.",
      Navbar: "Top app bar \u2014 brand mark, primary destinations and the account cluster. Keep to 5\xB12 destinations with the current page visibly marked.",
      Sidebar: "Vertical navigation panel with grouped items and an active state. For app-level sections when destinations exceed what a navbar holds."
    };
    const docIntro = (entry) => {
      var _a2;
      return (_a2 = DOC_INTRO[entry.spec]) != null ? _a2 : `${entry.page} ships ready to use: every fill, stroke, radius and text style references the imported design tokens (component \u2192 semantic \u2192 primitive), so it re-themes automatically and stays consistent across the product.`;
    };
    function buildDocPanel(entry, spec, category, propNames, toggleNames = []) {
      var _a2;
      const panel = docFrame(`docs/${entry.set}-panel`, "VERTICAL", 20);
      panel.fills = [docSolid(DOC.card, 1, sampleChrome.board)];
      panel.strokes = [docSolid(DOC.border, 1, sampleChrome.border)];
      panel.strokeWeight = 1;
      panel.cornerRadius = 16;
      panel.paddingTop = PANEL_PAD;
      panel.paddingBottom = PANEL_PAD;
      panel.paddingLeft = PANEL_PAD;
      panel.paddingRight = PANEL_PAD;
      vStack(panel, PANEL_W);
      const crumb = docFrame("breadcrumb", "HORIZONTAL", 8);
      crumb.primaryAxisSizingMode = "FIXED";
      crumb.counterAxisSizingMode = "FIXED";
      crumb.resize(PANEL_INNER, 18);
      crumb.primaryAxisAlignItems = "SPACE_BETWEEN";
      crumb.counterAxisAlignItems = "CENTER";
      crumb.appendChild(docText(`Components  /  ${category}  /  ${entry.page}`, 9, "Regular", DOC.muted, 1, sampleChrome.secondary));
      crumb.appendChild(docText("v1.0 \u2013 LAUNCH", 8, "Medium", DOC.muted, 0.9, sampleChrome.secondary));
      panel.appendChild(crumb);
      panel.appendChild(wrapText(docText(entry.page, 26, "Semi Bold", DOC.text, 1, sampleChrome.text), PANEL_INNER));
      const intro = wrapText(docText(docIntro(entry), 12, "Regular", DOC.muted, 1, sampleChrome.muted), PANEL_INNER);
      intro.lineHeight = { value: 150, unit: "PERCENT" };
      panel.appendChild(intro);
      panel.appendChild(docDivider("SPECS"));
      const specs = docFrame("specs", "VERTICAL", 14);
      const axes = /* @__PURE__ */ new Map();
      for (const vd of spec.variants) {
        for (const [k, v] of Object.entries(vd.props)) {
          const arr = (_a2 = axes.get(k)) != null ? _a2 : [];
          if (!arr.includes(v)) arr.push(v);
          axes.set(k, arr);
        }
      }
      if (spec.variants.length > 1) {
        const axisDesc = [...axes.entries()].map(([k, vals]) => `${k}: ${vals.join(", ")}`).join("  \xB7  ");
        docBullet(specs, `${spec.variants.length} variants`, axisDesc || spec.description);
      } else {
        docBullet(specs, "Single component", spec.description);
      }
      const states = axes.get("State");
      if (states && states.length > 1) {
        docBullet(specs, `${states.length} interaction states`, `${states.join(", ")} \u2014 the full lifecycle with token-mapped styling at every step.`);
      }
      docBullet(specs, "Token-driven throughout", "Fills, strokes, radius, spacing and typography reference the imported variables \u2014 component \u2192 semantic \u2192 primitive \u2014 so the component re-themes system-wide.");
      if (propNames.length > 0) {
        docBullet(specs, "Editable text properties", `${propNames.join(", ")} \u2014 exposed on the parent instance, swap content without detaching.`);
      }
      if (toggleNames.length > 0) {
        docBullet(specs, "Visibility toggles", `${toggleNames.join(", ")} \u2014 show or hide parts of the component directly from the instance panel.`);
      }
      panel.appendChild(specs);
      panel.appendChild(docDivider("FEATURES"));
      const feats = ["Variable System", "Auto Layout", "Themable", "Dark Mode Native", "Font System", "AI Friendly"];
      const accent = p.action.hex;
      for (let i = 0; i < feats.length; i += 3) {
        const rw = docFrame(`features-${i / 3 + 1}`, "HORIZONTAL", 6);
        for (const f of feats.slice(i, i + 3)) {
          const chipF = docFrame(`feat-${f.toLowerCase().replace(/\s+/g, "-")}`, "HORIZONTAL", 4);
          chipF.paddingLeft = 8;
          chipF.paddingRight = 8;
          chipF.paddingTop = 4;
          chipF.paddingBottom = 4;
          chipF.cornerRadius = 999;
          chipF.strokes = [docSolid(accent, 0.45, sampleChrome.accentBorder)];
          chipF.strokeWeight = 1;
          chipF.appendChild(docText(f, 9, "Medium", accent, 1, sampleChrome.accentText));
          rw.appendChild(chipF);
        }
        panel.appendChild(rw);
      }
      const hint = docFrame("insert-hint", "VERTICAL", 6);
      hint.fills = [docSolid(DOC.faint, 1, sampleChrome.card)];
      hint.strokes = [docSolid(DOC.border, 1, sampleChrome.border)];
      hint.strokeWeight = 1;
      hint.cornerRadius = 10;
      hint.paddingTop = 14;
      hint.paddingBottom = 14;
      hint.paddingLeft = 16;
      hint.paddingRight = 16;
      vStack(hint, PANEL_INNER);
      hint.appendChild(wrapText(docText("Insert components easily to your canvas", 12, "Medium", DOC.text, 1, sampleChrome.text), PANEL_INNER - 32));
      hint.appendChild(wrapText(docText(`hold \u21E7 Shift + I, search \u201C${entry.set}\u201D and press insert \u2014 or drag it from Assets to the canvas`, 10.5, "Regular", DOC.muted, 1, sampleChrome.muted), PANEL_INNER - 32));
      panel.appendChild(hint);
      return panel;
    }
    const MATRIX_INK = "#9747FF";
    function computeDisplayAxes(variants) {
      const order = [];
      const seen = /* @__PURE__ */ new Map();
      for (const v of variants) {
        for (const [k, val] of Object.entries(v.props)) {
          if (!seen.has(k)) {
            seen.set(k, []);
            order.push(k);
          }
          const arr = seen.get(k);
          if (!arr.includes(val)) arr.push(val);
        }
      }
      return order.map((k) => ({ key: k, values: seen.get(k) }));
    }
    function buildVariantMatrix(entry, spec, nodes, set) {
      var _a2;
      if (spec.representative) {
        const cols = Math.max(1, Math.min(4, spec.cols, nodes.length));
        const rows = Math.ceil(nodes.length / cols);
        const LABEL_PAD = 16;
        const MIN_CELL_W = 216;
        const cellW2 = Math.max(MIN_CELL_W, Math.max(...nodes.map((n) => n.width)) + 48);
        const labelW = cellW2 - LABEL_PAD * 2;
        const labels = nodes.map((variant) => {
          const t = docText(variant.name, 10, "Medium", MATRIX_INK);
          t.lineHeight = { value: 140, unit: "PERCENT" };
          t.textAutoResize = "NONE";
          t.resize(labelW, 200);
          t.textAutoResize = "HEIGHT";
          return t;
        });
        const CAP_H = Math.max(...labels.map((t) => Math.ceil(t.height))) + 20;
        const cellH2 = Math.max(...nodes.map((n) => n.height)) + CAP_H + 28;
        const wrapper2 = figma.createFrame();
        wrapper2.name = `\u2756 ${entry.page}`;
        wrapper2.layoutMode = "NONE";
        wrapper2.fills = [];
        wrapper2.resize(cols * cellW2, rows * cellH2);
        wrapper2.appendChild(set);
        set.x = 0;
        set.y = 0;
        set.visible = false;
        nodes.forEach((variant, i) => {
          const x = i % cols * cellW2;
          const y = Math.floor(i / cols) * cellH2;
          const cell = figma.createFrame();
          cell.name = `cell-${i + 1}`;
          cell.layoutMode = "NONE";
          cell.fills = [];
          cell.strokes = [docSolid(MATRIX_INK, 0.4)];
          cell.strokeWeight = 1;
          try {
            cell.dashPattern = [3, 3];
          } catch (e) {
          }
          cell.resize(cellW2, cellH2);
          wrapper2.appendChild(cell);
          cell.x = x;
          cell.y = y;
          const label = labels[i];
          wrapper2.appendChild(label);
          label.x = x + LABEL_PAD;
          label.y = y + 10;
          const instance = variant.createInstance();
          wrapper2.appendChild(instance);
          instance.x = x + (cellW2 - instance.width) / 2;
          instance.y = y + CAP_H + (cellH2 - CAP_H - instance.height) / 2;
        });
        return wrapper2;
      }
      const axes = computeDisplayAxes(spec.variants);
      const colAxis = axes.length > 0 ? axes[axes.length - 1] : void 0;
      const rowAxes = axes.slice(0, Math.max(0, axes.length - 1));
      const colValues = colAxis ? colAxis.values : [""];
      const rowCombos = [];
      if (rowAxes.length === 0) {
        rowCombos.push({ sub: "", values: {} });
      } else if (rowAxes.length === 1) {
        for (const v of rowAxes[0].values) rowCombos.push({ sub: v, values: { [rowAxes[0].key]: v } });
      } else {
        const outer = rowAxes[0];
        const inner = rowAxes.slice(1);
        for (const ov of outer.values) {
          let combos = [{}];
          for (const ax of inner) {
            const next = [];
            for (const c of combos) for (const val of ax.values) next.push(__spreadProps(__spreadValues({}, c), { [ax.key]: val }));
            combos = next;
          }
          for (const c of combos) {
            rowCombos.push({ group: ov, sub: inner.map((ax) => c[ax.key]).join(" \xB7 "), values: __spreadValues({ [outer.key]: ov }, c) });
          }
        }
      }
      function findVariant(rowValues, colVal) {
        const want = colAxis ? __spreadProps(__spreadValues({}, rowValues), { [colAxis.key]: colVal }) : rowValues;
        const idx = spec.variants.findIndex((vd) => Object.entries(want).every(([k, v]) => vd.props[k] === v));
        return idx >= 0 ? nodes[idx] : void 0;
      }
      const cellW = Math.max(...nodes.map((n) => n.width)) + 50;
      const cellH = Math.max(...nodes.map((n) => n.height)) + 40;
      const hasGroups = rowAxes.length >= 2;
      const GROUP_W = hasGroups ? 56 : 0;
      const ROWLBL_W = rowAxes.length > 0 ? 76 : 0;
      const HEADER_H = colAxis ? 32 : 0;
      const gridX = GROUP_W + ROWLBL_W;
      const gridW = gridX + colValues.length * cellW;
      const gridH = HEADER_H + rowCombos.length * cellH;
      const wrapper = figma.createFrame();
      wrapper.name = `\u2756 ${entry.page}`;
      wrapper.layoutMode = "NONE";
      wrapper.fills = [];
      wrapper.resize(gridW, gridH);
      wrapper.appendChild(set);
      set.x = 0;
      set.y = 0;
      set.visible = false;
      if (colAxis) {
        colValues.forEach((cv, j) => {
          const cell = docFrame(`col-${cv}`, "HORIZONTAL", 0);
          cell.primaryAxisAlignItems = "CENTER";
          cell.counterAxisAlignItems = "CENTER";
          cell.primaryAxisSizingMode = "FIXED";
          cell.counterAxisSizingMode = "FIXED";
          cell.resize(cellW, HEADER_H);
          cell.appendChild(docText(cv, 12, "Medium", MATRIX_INK));
          wrapper.appendChild(cell);
          cell.x = gridX + j * cellW;
          cell.y = 0;
        });
      }
      rowCombos.forEach((rc, i) => {
        const y = HEADER_H + i * cellH;
        if (rc.sub) {
          const lbl = docFrame(`row-${rc.sub}`, "HORIZONTAL", 0);
          lbl.primaryAxisAlignItems = "CENTER";
          lbl.counterAxisAlignItems = "CENTER";
          lbl.primaryAxisSizingMode = "FIXED";
          lbl.counterAxisSizingMode = "FIXED";
          lbl.resize(ROWLBL_W, cellH);
          lbl.appendChild(docText(rc.sub, 11, "Medium", MATRIX_INK));
          wrapper.appendChild(lbl);
          lbl.x = GROUP_W;
          lbl.y = y;
        }
        colValues.forEach((cv, j) => {
          const cellFrame = figma.createFrame();
          cellFrame.name = `cell-${rc.sub || "x"}-${cv || "x"}`;
          cellFrame.layoutMode = "NONE";
          cellFrame.fills = [];
          cellFrame.strokes = [docSolid(MATRIX_INK, 0.4)];
          cellFrame.strokeWeight = 1;
          try {
            cellFrame.dashPattern = [3, 3];
          } catch (e) {
          }
          cellFrame.resize(cellW, cellH);
          wrapper.appendChild(cellFrame);
          cellFrame.x = gridX + j * cellW;
          cellFrame.y = y;
          const variant = findVariant(rc.values, cv);
          if (variant) {
            const inst = variant.createInstance();
            wrapper.appendChild(inst);
            inst.x = cellFrame.x + (cellW - inst.width) / 2;
            inst.y = cellFrame.y + (cellH - inst.height) / 2;
          }
        });
      });
      if (hasGroups) {
        let runStart = 0;
        for (let i = 1; i <= rowCombos.length; i++) {
          const boundary = i === rowCombos.length || rowCombos[i].group !== rowCombos[runStart].group;
          if (!boundary) continue;
          const runEnd = i - 1;
          const yTop = HEADER_H + runStart * cellH;
          const yBot = HEADER_H + (runEnd + 1) * cellH;
          const spine = figma.createFrame();
          spine.name = "group-spine";
          spine.layoutMode = "NONE";
          spine.fills = [docSolid(MATRIX_INK, 0.6)];
          spine.resize(1.5, Math.max(1, yBot - yTop - 20));
          wrapper.appendChild(spine);
          spine.x = GROUP_W - 14;
          spine.y = yTop + 10;
          const label = docText((_a2 = rowCombos[runStart].group) != null ? _a2 : "", 11, "Medium", MATRIX_INK);
          wrapper.appendChild(label);
          label.x = 0;
          label.y = yTop + (yBot - yTop) / 2 - label.height / 2;
          runStart = i;
        }
      }
      return wrapper;
    }
    function applyPendingProps(owner, pending) {
      var _a2, _b2, _c2;
      for (const pp of pending) {
        try {
          const defs = owner.componentPropertyDefinitions;
          let id = Object.keys(defs).find((k) => k === pp.prop || k.startsWith(`${pp.prop}#`));
          const refs = __spreadValues({}, (_a2 = pp.node.componentPropertyReferences) != null ? _a2 : {});
          if (pp.swapDefaultId) {
            if (!id) {
              id = owner.addComponentProperty(
                pp.prop,
                "INSTANCE_SWAP",
                pp.swapDefaultId,
                ((_b2 = pp.swapPreferred) == null ? void 0 : _b2.length) ? { preferredValues: pp.swapPreferred } : void 0
              );
            } else if ((_c2 = pp.swapPreferred) == null ? void 0 : _c2.length) {
              try {
                owner.editComponentProperty(id, { preferredValues: pp.swapPreferred });
              } catch (e) {
              }
            }
            refs.mainComponent = id;
          } else if (typeof pp.def === "boolean") {
            if (!id) id = owner.addComponentProperty(pp.prop, "BOOLEAN", pp.def);
            refs.visible = id;
          } else {
            if (!id) id = owner.addComponentProperty(pp.prop, "TEXT", pp.def);
            refs.characters = id;
          }
          pp.node.componentPropertyReferences = refs;
        } catch (e) {
        }
      }
      try {
        const wanted = new Set(pending.map((pp) => pp.prop));
        const defs = owner.componentPropertyDefinitions;
        for (const key of Object.keys(defs)) {
          if (defs[key].type === "VARIANT") continue;
          if (!wanted.has(key.split("#")[0])) owner.deleteComponentProperty(key);
        }
      } catch (e) {
      }
    }
    function buildEntry(entry, spec, pg, category) {
      var _a2, _b2, _c2;
      const pending = [];
      const isVariantSet = spec.variants.length > 1;
      const cursorY = (_a2 = cursorByPage.get(pg.id)) != null ? _a2 : 120;
      cursorByPage.set(pg.id, cursorY + STAGE_STEP);
      let placedNode;
      let variantNodes;
      if (isVariantSet) {
        let existingSet = existingSets.get(entry.set);
        if (existingSet) {
          const wantedAxes = new Set(Object.keys((_c2 = (_b2 = spec.variants[0]) == null ? void 0 : _b2.props) != null ? _c2 : {}));
          const existingAxes = /* @__PURE__ */ new Set();
          try {
            for (const [key, def] of Object.entries(existingSet.componentPropertyDefinitions)) {
              if (def.type === "VARIANT") existingAxes.add(key.split("#")[0]);
            }
          } catch (e) {
          }
          const axesMatch = wantedAxes.size === existingAxes.size && [...wantedAxes].every((a) => existingAxes.has(a));
          if (!axesMatch) {
            log(`\u21BB ${entry.set}: variant axes changed (${[...existingAxes].sort().join(", ") || "\u2205"} \u2192 ${[...wantedAxes].sort().join(", ")}) \u2014 rebuilding set`);
            try {
              existingSet.remove();
            } catch (e) {
            }
            existingSets.delete(entry.set);
            existingSet = void 0;
          }
        }
        const childByName = /* @__PURE__ */ new Map();
        if (existingSet) {
          for (const ch of existingSet.children) {
            if (ch.type === "COMPONENT") childByName.set(normName(ch.name), ch);
          }
        }
        const legacySingle = !existingSet ? existingSingles.get(entry.set) : void 0;
        const nodes = [];
        spec.variants.forEach((vd, i) => {
          const name = variantName(vd.props);
          let comp = childByName.get(normName(name));
          if (!comp && i === 0 && legacySingle) {
            comp = legacySingle;
            comp.name = name;
          }
          if (comp) {
            for (const ch of [...comp.children]) ch.remove();
            comp.effects = [];
            comp.strokes = [];
            comp.fills = [];
          } else {
            comp = figma.createComponent();
            comp.name = name;
            pg.appendChild(comp);
          }
          try {
            vd.build(comp, pending);
            builtVariants++;
          } catch (e) {
            log(`\u26A0 ${entry.set} ${name}: ${e instanceof Error ? e.message : String(e)}`);
          }
          nodes.push(comp);
        });
        inFlight.push(...nodes);
        const widths = nodes.map((n) => n.width).filter((w) => Number.isFinite(w) && w > 0);
        const heights = nodes.map((n) => n.height).filter((h) => Number.isFinite(h) && h > 0);
        const cellW = (widths.length ? Math.max(...widths) : 80) + GAP_X;
        const cellH = (heights.length ? Math.max(...heights) : 40) + GAP_Y;
        let set = existingSet;
        if (!set) {
          nodes.forEach((n, i) => {
            if (n.parent !== pg) try {
              pg.appendChild(n);
            } catch (e) {
            }
            n.x = MARGIN + i % spec.cols * cellW;
            n.y = cursorY + Math.floor(i / spec.cols) * cellH;
          });
          try {
            set = figma.combineAsVariants(nodes, pg);
          } catch (e) {
            const m = e instanceof Error ? e.message : String(e);
            log(`\u21BB ${entry.set}: combineAsVariants failed (${m}) \u2014 retrying`);
            nodes.forEach((n, i) => {
              try {
                pg.appendChild(n);
              } catch (e2) {
              }
              n.x = MARGIN + i % spec.cols * cellW;
              n.y = cursorY + Math.floor(i / spec.cols) * cellH;
            });
            set = figma.combineAsVariants(nodes, pg);
          }
          set.name = entry.set;
          existingSets.set(entry.set, set);
        } else {
          if (set.parent !== pg) pg.appendChild(set);
          try {
            for (const n of nodes) {
              if (n.parent !== set) set.appendChild(n);
            }
          } catch (e) {
            const m = e instanceof Error ? e.message : String(e);
            log(`\u21BB ${entry.set}: could not reuse set (${m}) \u2014 rebuilding`);
            try {
              set.remove();
            } catch (e2) {
            }
            existingSets.delete(entry.set);
            nodes.forEach((n, i) => {
              if (n.parent) try {
                pg.appendChild(n);
              } catch (e2) {
              }
              n.x = MARGIN + i % spec.cols * cellW;
              n.y = cursorY + Math.floor(i / spec.cols) * cellH;
            });
            set = figma.combineAsVariants(nodes, pg);
            set.name = entry.set;
            existingSets.set(entry.set, set);
          }
          const expected = new Set(spec.variants.map((vd) => normName(variantName(vd.props))));
          for (const ch of [...set.children]) {
            if (ch.type === "COMPONENT" && !expected.has(normName(ch.name))) ch.remove();
          }
          nodes.forEach((n, i) => {
            n.x = 20 + i % spec.cols * cellW;
            n.y = 20 + Math.floor(i / spec.cols) * cellH;
          });
        }
        try {
          set.description = spec.description;
        } catch (e) {
        }
        inFlight.push(set);
        set.x = MARGIN;
        set.y = cursorY;
        applyPendingProps(set, pending);
        placedNode = set;
        variantNodes = nodes;
      } else {
        let comp = existingSingles.get(entry.set);
        if (comp) {
          if (comp.parent !== pg) pg.appendChild(comp);
          for (const ch of [...comp.children]) ch.remove();
          comp.effects = [];
          comp.strokes = [];
          comp.fills = [];
        } else {
          comp = figma.createComponent();
          comp.name = entry.set;
          pg.appendChild(comp);
        }
        try {
          spec.variants[0].build(comp, pending);
          builtVariants++;
        } catch (e) {
          log(`\u26A0 ${entry.set}: ${e instanceof Error ? e.message : String(e)}`);
        }
        try {
          comp.description = spec.description;
        } catch (e) {
        }
        inFlight.push(comp);
        applyPendingProps(comp, pending);
        comp.x = MARGIN;
        comp.y = cursorY;
        placedNode = comp;
      }
      if (!spec.representative) pinToLightMode(placedNode, componentThemePin);
      const propNames = [...new Set(pending.filter((pp) => typeof pp.def === "string").map((pp) => pp.prop))];
      const toggleNames = [...new Set(pending.filter((pp) => typeof pp.def === "boolean").map((pp) => pp.prop))];
      const panel = buildDocPanel(entry, spec, category, propNames, toggleNames);
      const barW = Math.ceil(panel.width);
      const bar = docFrame(`\xA7 ${category}  /  ${entry.page}`, "HORIZONTAL", 8);
      bar.fills = [docSolid(DOC.bar, 1, sampleChrome.card)];
      bar.cornerRadius = 12;
      bar.primaryAxisSizingMode = "FIXED";
      bar.counterAxisSizingMode = "FIXED";
      bar.resize(barW, 56);
      bar.primaryAxisAlignItems = "SPACE_BETWEEN";
      bar.counterAxisAlignItems = "CENTER";
      bar.paddingLeft = 24;
      bar.paddingRight = 24;
      bar.appendChild(docText(`${category}  /  ${entry.page}`, 12, "Medium", DOC.barText, 1, sampleChrome.text));
      bar.appendChild(docText(`\u2B21 ${tokens.project || "Design System"}`, 12, "Semi Bold", DOC.barText, 1, sampleChrome.text));
      const leftCol = docFrame("leftCol", "VERTICAL", 24);
      leftCol.appendChild(bar);
      leftCol.appendChild(panel);
      let rightContent = placedNode;
      if (isVariantSet && variantNodes) {
        try {
          rightContent = buildVariantMatrix(entry, spec, variantNodes, placedNode);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          log(`\u26A0 ${entry.set} matrix layout failed (${m}) \u2014 showing raw set`);
          placedNode.visible = true;
          if (placedNode.parent !== pg) {
            try {
              pg.appendChild(placedNode);
            } catch (e2) {
            }
          }
          rightContent = placedNode;
        }
      }
      const idx = String(++boardIndex).padStart(2, "0");
      const board = docFrame(`${idx} \xB7 ${entry.page}`, "HORIZONTAL", 24);
      board.fills = [docSolid(DOC.board, 1, sampleChrome.board)];
      board.cornerRadius = 24;
      board.paddingTop = 48;
      board.paddingBottom = 48;
      board.paddingLeft = 48;
      board.paddingRight = 48;
      board.counterAxisAlignItems = "MIN";
      pinToLightMode(board, sampleModePin);
      pg.appendChild(board);
      inFlight.push(board);
      board.appendChild(leftCol);
      board.appendChild(rightContent);
      board.x = boardX;
      board.y = boardY;
      boardX += Math.ceil(board.width) + BOARD_GAP;
      rowH = Math.max(rowH, Math.ceil(board.height));
      builtAtoms++;
      inFlight = [];
    }
    function startCategoryRow(category, pg, count, index, total) {
      if (rowCategory !== void 0) boardY += rowH + CATEGORY_GAP;
      rowCategory = category;
      rowH = 0;
      boardX = 0;
      const band = docFrame(`docs/category \xB7 ${category}`, "VERTICAL", 12);
      band.fills = [docSolid(DOC.board, 1, sampleChrome.board)];
      band.cornerRadius = 24;
      band.paddingTop = 36;
      band.paddingBottom = 36;
      band.paddingLeft = 44;
      band.paddingRight = 44;
      vStack(band, BAND_W);
      pinToLightMode(band, sampleModePin);
      const eyebrow = docText(
        `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}  \xB7  CATEGORY`,
        10,
        "Medium",
        DOC.muted,
        1,
        sampleChrome.muted
      );
      eyebrow.letterSpacing = { value: 1.4, unit: "PIXELS" };
      band.appendChild(eyebrow);
      band.appendChild(docText(category, 34, "Semi Bold", DOC.text, 1, sampleChrome.text));
      band.appendChild(docText(
        `${count} element${count === 1 ? "" : "s"} \xB7 ${tokens.project || "Design System"}`,
        12,
        "Regular",
        DOC.muted,
        1,
        sampleChrome.muted
      ));
      const rule = figma.createFrame();
      rule.name = "rule";
      rule.resize(360, 3);
      rule.cornerRadius = 999;
      rule.fills = [docSolid(DOC.ink, 1, sampleChrome.inverse)];
      band.appendChild(rule);
      pg.appendChild(band);
      band.x = 0;
      band.y = boardY;
      boardY += Math.ceil(band.height) + HEAD_GAP;
    }
    const ORPHAN_GAP = 40;
    function sweepOrphans(pg) {
      const orphans = pg.children.filter(
        (n) => n.type === "COMPONENT_SET" || n.type === "COMPONENT"
      );
      if (orphans.length === 0) return;
      let bottom = 0;
      for (const n of pg.children) {
        if (n.type === "COMPONENT_SET" || n.type === "COMPONENT") continue;
        bottom = Math.max(bottom, n.y + n.height);
      }
      const cellW = Math.max(...orphans.map((n) => n.width)) + ORPHAN_GAP;
      const cellH = Math.max(...orphans.map((n) => n.height)) + ORPHAN_GAP;
      const cols = Math.max(1, Math.min(4, orphans.length));
      const rows = Math.ceil(orphans.length / cols);
      const PAD = 48;
      const HEAD = 96;
      const slab = figma.createFrame();
      slab.name = `docs/retired \xB7 not in this import`;
      slab.clipsContent = false;
      slab.fills = [docSolid(DOC.board, 1, sampleChrome.board)];
      slab.cornerRadius = 24;
      slab.resize(cols * cellW - ORPHAN_GAP + PAD * 2, HEAD + rows * cellH - ORPHAN_GAP + PAD);
      pg.appendChild(slab);
      slab.x = 0;
      slab.y = bottom + CATEGORY_GAP;
      pinToLightMode(slab, sampleModePin);
      try {
        const title = docText("NOT IN THIS IMPORT", 10, "Medium", DOC.muted, 1, sampleChrome.muted);
        title.letterSpacing = { value: 1.4, unit: "PIXELS" };
        slab.appendChild(title);
        title.x = PAD;
        title.y = PAD;
        const sub = docText(
          `${orphans.length} element${orphans.length === 1 ? "" : "s"} built by an earlier import. Kept so existing instances stay linked \u2014 re-import them to bring them back into the sheet.`,
          12,
          "Regular",
          DOC.muted,
          1,
          sampleChrome.muted
        );
        sub.textAutoResize = "HEIGHT";
        sub.resize(Math.min(560, slab.width - PAD * 2), sub.height);
        slab.appendChild(sub);
        sub.x = PAD;
        sub.y = PAD + 20;
      } catch (e) {
      }
      orphans.forEach((n, i) => {
        slab.appendChild(n);
        n.x = PAD + i % cols * cellW;
        n.y = HEAD + Math.floor(i / cols) * cellH;
      });
      log(`\u21B3 ${pg.name}: parked ${orphans.length} element${orphans.length === 1 ? "" : "s"} not part of this import`);
    }
    const planned = includeFullCatalogue ? CATALOG.flatMap(({ category, entries }) => entries.map((entry) => ({
      entry,
      spec: representativeSpec(entry.spec),
      category
    }))).filter((x) => x.spec !== void 0) : SAMPLE.map((e) => {
      var _a2;
      return {
        entry: { page: e.page, set: e.set, gate: e.set, spec: e.spec },
        spec: sampleSpec(e),
        // The real catalogue category, so the sample sheet groups by the same
        // roles the full catalogue (and the configurator's rail) does.
        category: (_a2 = CATEGORY_OF_SET.get(e.set)) != null ? _a2 : "Components Overview"
      };
    }).filter((x) => x.spec !== void 0);
    const catRank = (c) => {
      const i = CATEGORY_ORDER.indexOf(c);
      return i === -1 ? CATEGORY_ORDER.length : i;
    };
    planned.sort((a, b) => catRank(a.category) - catRank(b.category));
    const plannedTotal = planned.length;
    let plannedDone = 0;
    const byCategory = /* @__PURE__ */ new Map();
    for (const p2 of planned) {
      let bucket = byCategory.get(p2.category);
      if (!bucket) {
        bucket = [];
        byCategory.set(p2.category, bucket);
      }
      bucket.push(p2);
    }
    const categoryList = [...byCategory.keys()];
    for (const legacyName of ["\u2B21 Sample", SAMPLE_PAGE]) {
      const p2 = pageByName(legacyName);
      if (p2) await harvest(p2);
    }
    for (const { entry } of planned) {
      const legacy = pageByName(ITEM_PREFIX + entry.page);
      if (legacy) await harvest(legacy);
    }
    try {
      const PLACEHOLDERS_PAGE = "\u2B21 Icon Placeholders";
      let host = pageByName(PLACEHOLDERS_PAGE);
      if (!host) host = makePage(PLACEHOLDERS_PAGE);
      if (!host) host = figma.currentPage;
      await harvest(host);
      const take = (name) => {
        const hit = existingSingles.get(name);
        return hit && !hit.removed ? hit : null;
      };
      circleMaster = take(PLACEHOLDER_CIRCLE_NAME);
      squareMaster = take(PLACEHOLDER_SQUARE_NAME);
      if (!circleMaster) {
        circleMaster = createPlaceholderMaster(PLACEHOLDER_CIRCLE_NAME, CIRCLE_DASHED_PATH);
        existingSingles.set(PLACEHOLDER_CIRCLE_NAME, circleMaster);
      }
      if (!squareMaster) {
        squareMaster = createPlaceholderMaster(PLACEHOLDER_SQUARE_NAME, SQUARE_DASHED_PATH);
        existingSingles.set(PLACEHOLDER_SQUARE_NAME, squareMaster);
      }
      for (const ch of [...host.children]) {
        if (ch.type === "FRAME" && ch.name === "placeholder-library") ch.remove();
        else if (ch.type === "TEXT" && ch.name.startsWith("label/placeholder")) ch.remove();
      }
      try {
        host.backgrounds = [docSolid(DOC.page)];
      } catch (e) {
      }
      pinToLightMode(host, sampleModePin);
      const project = tokens.project || "Design System";
      const SLOT = 160;
      const board = docBoard("docs/icon-placeholders", "Icon placeholders", project, SLOT * 2 + 32);
      host.appendChild(board);
      board.x = MARGIN;
      board.y = MARGIN;
      board.appendChild(wrapText(
        docText(
          "Reference marks (circle-dashed \xB7 square-dashed). Component slots draw the same paths inline \u2014 swap in a real glyph from Assets when you need one.",
          12,
          "Regular",
          DOC.muted,
          1,
          sampleChrome.muted
        ),
        SLOT * 2 + 32
      ));
      const row2 = docFrame("placeholder-slots", "HORIZONTAL", 32);
      board.appendChild(row2);
      const placeSlot = (master, label) => {
        const well = docFrame(`slot/${label}`, "VERTICAL", 12);
        well.fills = [docSolid(DOC.card, 1, sampleChrome.card)];
        well.cornerRadius = 16;
        well.paddingTop = 24;
        well.paddingBottom = 20;
        well.paddingLeft = 24;
        well.paddingRight = 24;
        well.primaryAxisAlignItems = "CENTER";
        well.counterAxisAlignItems = "CENTER";
        well.appendChild(master);
        well.appendChild(docText(label, 11, "Medium", DOC.text, 1, sampleChrome.text));
        row2.appendChild(well);
      };
      placeSlot(circleMaster, "circle-dashed");
      placeSlot(squareMaster, "square-dashed");
      log("\u2713 Icon placeholders: circle-dashed \xB7 square-dashed (Assets reference)");
    } catch (e) {
      log(`\u26A0 Icon placeholders page skipped: ${e instanceof Error ? e.message : String(e)}`);
    }
    try {
      const iconsPage = pageByName("\u2B21 Icons");
      if (iconsPage) {
        await iconsPage.loadAsync();
        const sets = iconsPage.children.filter(
          (n) => n.type === "COMPONENT_SET" && n.name.startsWith("icon/")
        );
        iconSwapPreferred = sets.slice(0, 40).map((s) => ({ type: "COMPONENT_SET", key: s.key }));
      }
    } catch (e) {
    }
    const catPageName = (c) => `\u2B21 Components \xB7 ${c}`;
    const builtCatPages = [];
    let firstCatPage;
    let capFallbackPage;
    let lastPage;
    for (const category of categoryList) {
      const entries = byCategory.get(category);
      const made = makePage(catPageName(category));
      const pg = (_D = (_C = made != null ? made : capFallbackPage) != null ? _C : oldPage) != null ? _D : figma.currentPage;
      if (made) capFallbackPage = made;
      firstCatPage = firstCatPage != null ? firstCatPage : pg;
      if (!builtCatPages.includes(pg)) builtCatPages.push(pg);
      if (pg !== lastPage) {
        await harvest(pg);
        figma.root.appendChild(pg);
        try {
          pg.backgrounds = [docSolid(DOC.page)];
        } catch (e) {
        }
        pinToLightMode(pg, sampleModePin);
        boardX = 0;
        boardY = 0;
        rowH = 0;
        rowCategory = void 0;
        boardIndex = 0;
      }
      lastPage = pg;
      try {
        startCategoryRow(category, pg, entries.length, categoryList.indexOf(category), categoryList.length);
      } catch (e) {
        const m = e instanceof Error ? e.message : String(e);
        log(`\u26A0 Category band "${category}" skipped: ${m}`);
        if (rowCategory !== void 0) boardY += rowH + CATEGORY_GAP;
        rowCategory = category;
        rowH = 0;
        boardX = 0;
      }
      for (const { entry, spec } of entries) {
        progress("Components", plannedDone, plannedTotal, entry.page);
        try {
          buildEntry(entry, spec, pg, category);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          log(`\u2717 ${entry.set} failed: ${m}`);
          for (const leftover of inFlight) {
            try {
              if (!leftover.removed) leftover.remove();
            } catch (e2) {
            }
          }
          inFlight = [];
          existingSets.delete(entry.set);
          existingSingles.delete(entry.set);
        }
        plannedDone++;
        await yieldToUI();
      }
    }
    progress("Components", plannedTotal, plannedTotal);
    for (const pg of figma.root.children) {
      if (!harvested.has(pg.id) && !builtCatPages.includes(pg)) continue;
      if (pg.name === "\u2B21 Icon Placeholders") continue;
      try {
        sweepOrphans(pg);
      } catch (e) {
        log(`\u26A0 ${pg.name}: could not park leftovers (${e instanceof Error ? e.message : String(e)})`);
      }
    }
    firstBuiltPage = firstCatPage;
    for (const legacyName of ["\u2B21 Sample", SAMPLE_PAGE, "\u2B21 Components"]) {
      const p2 = pageByName(legacyName);
      if (p2 && p2 !== figma.currentPage && !builtCatPages.includes(p2) && p2.children.length === 0) {
        try {
          p2.remove();
        } catch (e) {
        }
      }
    }
    if (pageLimitHit) {
      log(`\u26A0 This file's page limit was reached \u2014 some categories share a page instead of getting their own.`);
    }
    if (firstBuiltPage) {
      await figma.setCurrentPageAsync(firstBuiltPage);
      const placed = firstBuiltPage.children.filter((n) => /^\d{2} · /.test(n.name) || n.name.startsWith("docs/category \xB7 "));
      if (placed.length > 0) figma.viewport.scrollAndZoomIntoView(placed);
    }
    log(`\u2713 Components \u2014 ${builtAtoms} elements (${builtVariants} variants) across ${builtCatPages.length} categor${builtCatPages.length === 1 ? "y" : "ies"}, every fill, radius, spacing and text bound to your tokens`);
    return builtVariants;
  }
  async function importDocumentation(tokens) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B;
    namingCtx = tokens;
    const allVars = await figma.variables.getLocalVariablesAsync();
    const allCols = await figma.variables.getLocalVariableCollectionsAsync();
    const colNameById = new Map(allCols.map((c) => [c.id, c.name]));
    const varsByCollection = /* @__PURE__ */ new Map();
    for (const v of allVars) {
      const cname = colNameById.get(v.variableCollectionId);
      if (!cname) continue;
      let m = varsByCollection.get(cname);
      if (!m) {
        m = /* @__PURE__ */ new Map();
        varsByCollection.set(cname, m);
      }
      if (!m.has(v.name)) m.set(v.name, v);
    }
    const findVar = (coll, name) => {
      var _a2;
      return (_a2 = varsByCollection.get(coll)) == null ? void 0 : _a2.get(name);
    };
    function bestVar(coll, ...names) {
      for (const n of names) {
        const v = findVar(coll, n);
        if (v) return v;
      }
      return void 0;
    }
    function boundFill(v, hexFallback, opacity = 1) {
      let paint = { type: "SOLID", color: hexToRgb(hexFallback), opacity };
      if ((v == null ? void 0 : v.resolvedType) === "COLOR") paint = figma.variables.setBoundVariableForPaint(paint, "color", v);
      return paint;
    }
    function bindField(node, field, v) {
      if (!v) return;
      try {
        ;
        node.setBoundVariable(field, v);
      } catch (e) {
      }
    }
    const sem = tokens.colors.semantic;
    const surfaceHex = "#FFFFFF";
    const cardHex = "#FFFFFF";
    const textHex = "#111114";
    const mutedHex = "#6E6E76";
    const borderHex = "#E9E9EC";
    const inkHex = "#0A0A0B";
    const accentHex = archHexFor(tokens, "background-brand-solid", ((_a = tokens.colors.themeOrder) != null ? _a : ["light"])[0]) || sem["background-brand-solid"] || sem["content-brand"] || sem["action-primary"] || sem["bg-accent-solid"] || sem.primary || "#3B82F6";
    const S = COLLECTIONS.semantics;
    const docSem = semLookupFor(tokens, allVars, allCols);
    const accentVar = docSem.varFor("background-brand-solid", "Action/primary/default", "Action/primary.default", "action/primary/default", "action/primary.default", "action/primary", "bg/accent-solid", "primary");
    const docChromeVars = docChromeVarsFrom(docSem);
    const docModeVars = docModePin(tokens, allCols);
    const surfaceVar = docChromeVars.board;
    const cardVar = docChromeVars.card;
    const textVar = docChromeVars.text;
    const mutedVar = docChromeVars.muted;
    const borderVar = docChromeVars.border;
    const familyVar = bestVar(COLLECTIONS.typography, TYPOGRAPHY_FAMILY_VARS.body, TYPOGRAPHY_FAMILY_VARS.legacyBody);
    const typoBind = /* @__PURE__ */ new Map();
    {
      const typoColVars = varsByCollection.get(COLLECTIONS.typography);
      if (typoColVars) for (const [n, v] of typoColVars) typoBind.set(n, v);
    }
    const themesMap = tokens.colors.themes && Object.keys(tokens.colors.themes).length > 0 ? tokens.colors.themes : __spreadValues({ light: sem }, tokens.colors.semanticDark ? { dark: tokens.colors.semanticDark } : {});
    const themeOrdered = ((_b = tokens.colors.themeOrder) != null ? _b : []).filter((t) => themesMap[t]);
    const themeNames = [...themeOrdered, ...Object.keys(themesMap).filter((t) => !themeOrdered.includes(t))];
    const lightTheme = (_c = themesMap[themeNames[0]]) != null ? _c : {};
    const darkThemeName = themesMap.dark ? "dark" : themeNames[1];
    const darkTheme = darkThemeName && darkThemeName !== themeNames[0] ? themesMap[darkThemeName] : void 0;
    const docArch = tokens.colors.architecture;
    const docNorm = docArch ? normalizeArchitecture(docArch, themeNames) : null;
    const primByHex = /* @__PURE__ */ new Map();
    const primKeyByHex = /* @__PURE__ */ new Map();
    for (const [key, hex] of Object.entries(tokens.colors.primitive)) {
      if (!hex) continue;
      const v = findVar(COLLECTIONS.primitives, primitiveVarName(key));
      if (v && !primByHex.has(normHex(hex))) primByHex.set(normHex(hex), v);
      if (!primKeyByHex.has(normHex(hex))) primKeyByHex.set(normHex(hex), key);
    }
    const fontFamily = ((_d = tokens.typography) == null ? void 0 : _d.fontFamily) || "Inter";
    const loadedStyles = /* @__PURE__ */ new Set();
    for (const style of ["Regular", "Medium", "Semi Bold", "Bold"]) {
      try {
        await figma.loadFontAsync({ family: fontFamily, style });
        loadedStyles.add(style);
      } catch (e) {
        try {
          await figma.loadFontAsync({ family: "Inter", style });
          loadedStyles.add(`Inter:${style}`);
        } catch (e2) {
        }
      }
    }
    function fontFor(style) {
      if (loadedStyles.has(style)) return { family: fontFamily, style };
      return { family: "Inter", style };
    }
    function weightStyle(weightKey) {
      var _a2, _b2;
      const val = (_b2 = (_a2 = tokens.typography.weights) == null ? void 0 : _a2[weightKey]) != null ? _b2 : weightKey === "bold" ? 700 : weightKey === "semibold" ? 600 : weightKey === "medium" ? 500 : 400;
      if (val >= 700) return "Bold";
      if (val >= 600) return "Semi Bold";
      if (val >= 500) return "Medium";
      return "Regular";
    }
    let page = figma.root.children.find((p) => p.name === "\u2B21 Documentation");
    if (!page) {
      page = figma.createPage();
      page.name = "\u2B21 Documentation";
    } else {
      await page.loadAsync();
      for (const child of [...page.children]) child.remove();
    }
    try {
      page.backgrounds = [{ type: "SOLID", color: hexToRgb(DOC.page) }];
    } catch (e) {
    }
    pinToLightMode(page, docModeVars);
    function mkText(chars, opts = {}) {
      var _a2, _b2, _c2, _d2, _e2, _f2;
      const t = figma.createText();
      t.fontName = fontFor((_a2 = opts.style) != null ? _a2 : "Regular");
      t.characters = chars;
      t.fontSize = (_b2 = opts.size) != null ? _b2 : 12;
      t.fills = [boundFill(opts.colorVar, (_c2 = opts.colorHex) != null ? _c2 : textHex, (_d2 = opts.opacity) != null ? _d2 : 1)];
      const sizePx = (_e2 = opts.size) != null ? _e2 : 12;
      const sizeKey = nearestTypeSizeKey(tokens.typography.sizes, sizePx);
      const heading = (opts.style === "Semi Bold" || opts.style === "Bold") && sizePx >= 20;
      if (opts.bindFamily !== false) {
        bindAllTextFields(t, typoBind, {
          sizeKey,
          weightKey: weightKeyFromStyle((_f2 = opts.style) != null ? _f2 : "Regular"),
          heading
        });
      }
      return t;
    }
    function autoFrame(name, dir, gap) {
      const f = figma.createFrame();
      f.name = name;
      f.layoutMode = dir;
      f.primaryAxisSizingMode = "AUTO";
      f.counterAxisSizingMode = "AUTO";
      f.itemSpacing = gap;
      f.fills = [];
      return f;
    }
    const CARD_W = 1180;
    const INNER_W = CARD_W - 80;
    const solid = (hex, opacity = 1) => ({ type: "SOLID", color: hexToRgb(hex), opacity });
    function onColor(hex) {
      const { r, g, b } = hexToRgb(hex);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.55 ? "#FFFFFF" : "#18181B";
    }
    function section(title, subtitle) {
      const card = autoFrame(title, "VERTICAL", 24);
      card.fills = [boundFill(cardVar, cardHex)];
      card.strokes = [boundFill(borderVar, borderHex)];
      card.strokeWeight = 1;
      card.cornerRadius = 16;
      card.paddingTop = 36;
      card.paddingBottom = 44;
      card.paddingLeft = 40;
      card.paddingRight = 40;
      vStack(card, CARD_W);
      const head = autoFrame(`${title}__head`, "VERTICAL", 8);
      head.appendChild(mkText(title, { size: 24, style: "Semi Bold", colorVar: textVar, colorHex: textHex }));
      const sub = mkText(subtitle, { size: 12, colorVar: mutedVar, colorHex: mutedHex });
      sub.textAutoResize = "NONE";
      sub.resize(INNER_W, 200);
      sub.textAutoResize = "HEIGHT";
      head.appendChild(sub);
      card.appendChild(head);
      const body = autoFrame(`${title}__body`, "VERTICAL", 20);
      card.appendChild(body);
      return { card, body };
    }
    function sectionBar(label) {
      const bar = autoFrame(`\xA7 ${label}`, "HORIZONTAL", 8);
      bar.fills = [boundFill(cardVar, "#E6E6F7")];
      bar.cornerRadius = 12;
      bar.primaryAxisSizingMode = "FIXED";
      bar.counterAxisSizingMode = "FIXED";
      bar.resize(CARD_W, 56);
      bar.primaryAxisAlignItems = "SPACE_BETWEEN";
      bar.counterAxisAlignItems = "CENTER";
      bar.paddingLeft = 24;
      bar.paddingRight = 24;
      bar.appendChild(mkText(label, { size: 12, style: "Medium", colorVar: textVar, colorHex: "#26262E" }));
      bar.appendChild(mkText(`\u2B21 ${tokens.project || "Design System"}`, { size: 12, style: "Semi Bold", colorVar: textVar, colorHex: "#26262E" }));
      return bar;
    }
    let sections = 0;
    const docPage = page;
    const BOARD_W = CARD_W + 96;
    const BOARD_GAP = 160;
    let boardX = 0;
    const boards = [];
    let root;
    async function newBoard(label) {
      progress("Documentation", boards.length, 0, label);
      await yieldToUI();
      const idx = String(boards.length + 1).padStart(2, "0");
      const b = autoFrame(`${idx} \xB7 ${label}`, "VERTICAL", 24);
      b.fills = [boundFill(surfaceVar, surfaceHex)];
      b.paddingTop = 48;
      b.paddingBottom = 96;
      b.paddingLeft = 48;
      b.paddingRight = 48;
      b.cornerRadius = 24;
      pinToLightMode(b, docModeVars);
      docPage.appendChild(b);
      b.x = boardX;
      b.y = 0;
      boardX += BOARD_W + BOARD_GAP;
      boards.push(b);
      root = b;
      return b;
    }
    {
      let coverCol2 = function(name, w, fillHex) {
        const c = autoFrame(name, "VERTICAL", 14);
        c.counterAxisSizingMode = "FIXED";
        c.primaryAxisSizingMode = "FIXED";
        c.resize(w, COVER_H);
        c.paddingTop = 36;
        c.paddingBottom = 36;
        c.paddingLeft = 32;
        c.paddingRight = 32;
        if (fillHex) c.fills = [solid(fillHex)];
        cols.appendChild(c);
        return c;
      }, bullet2 = function(parent, w, title, desc, dark) {
        const b = autoFrame(title, "VERTICAL", 3);
        b.appendChild(mkText(title, { size: 11, style: "Medium", colorHex: dark ? "#F4F4F6" : textHex }));
        const d = mkText(desc, { size: 10, colorHex: dark ? "#9C9CA6" : mutedHex });
        d.resize(w - 64, d.height);
        d.textAutoResize = "HEIGHT";
        b.appendChild(d);
        parent.appendChild(b);
      };
      var coverCol = coverCol2, bullet = bullet2;
      await newBoard("Overview");
      const project = tokens.project || "Design System";
      const themeCount = themeNames.length;
      const famTones = /* @__PURE__ */ new Map();
      for (const key of Object.keys(tokens.colors.primitive)) {
        const dash = key.lastIndexOf("-");
        const fam = dash === -1 ? key : key.slice(0, dash);
        famTones.set(fam, ((_e = famTones.get(fam)) != null ? _e : 0) + 1);
      }
      const steps = Math.max(0, ...famTones.values());
      const cover = autoFrame("cover", "VERTICAL", 0);
      cover.fills = [boundFill(cardVar, cardHex)];
      cover.strokes = [boundFill(borderVar, borderHex)];
      cover.strokeWeight = 1;
      cover.cornerRadius = 16;
      cover.clipsContent = true;
      vStack(cover, CARD_W);
      root.appendChild(cover);
      const bar = autoFrame("cover__bar", "HORIZONTAL", 8);
      bar.fills = [solid(inkHex)];
      bar.primaryAxisSizingMode = "FIXED";
      bar.counterAxisSizingMode = "FIXED";
      bar.resize(CARD_W, 56);
      bar.primaryAxisAlignItems = "SPACE_BETWEEN";
      bar.counterAxisAlignItems = "CENTER";
      bar.paddingLeft = 24;
      bar.paddingRight = 24;
      const brand = autoFrame("cover__brand", "HORIZONTAL", 8);
      brand.counterAxisAlignItems = "CENTER";
      brand.appendChild(mkText(`\u2B21 ${project}`, { size: 13, style: "Semi Bold", colorHex: "#FFFFFF" }));
      const vChip = autoFrame("cover__version", "HORIZONTAL", 0);
      vChip.paddingLeft = 8;
      vChip.paddingRight = 8;
      vChip.paddingTop = 3;
      vChip.paddingBottom = 3;
      vChip.cornerRadius = 999;
      vChip.strokes = [solid("#3A3A40")];
      vChip.strokeWeight = 1;
      vChip.appendChild(mkText("v1.0", { size: 9, style: "Medium", colorHex: "#C9C9D2" }));
      brand.appendChild(vChip);
      bar.appendChild(brand);
      const barMid = mkText("DESIGN TOKENS \xB7 FOUNDATIONS", { size: 10, style: "Medium", colorHex: "#9C9CA6" });
      barMid.letterSpacing = { value: 1.2, unit: "PIXELS" };
      bar.appendChild(barMid);
      bar.appendChild(mkText("escalatokens.com", { size: 10, colorHex: "#9C9CA6" }));
      cover.appendChild(bar);
      const COVER_H = 400;
      const cols = autoFrame("cover__cols", "HORIZONTAL", 0);
      cover.appendChild(cols);
      const main = coverCol2("cover__intro", 590);
      main.paddingLeft = 40;
      main.appendChild(mkText("Foundations  /  Color System  /  Tokens", { size: 10, colorVar: mutedVar, colorHex: mutedHex }));
      main.appendChild(mkText("Color System", { size: 30, style: "Semi Bold", colorVar: textVar, colorHex: textHex }));
      const para = mkText(
        `${project}'s color foundation is built on primitive ramps \u2014 raw, unopinionated values that feed every semantic token in the system. Primitives never appear in components directly; they exist solely as the source of truth that the semantic layer references.`,
        { size: 13, colorVar: mutedVar, colorHex: mutedHex }
      );
      para.resize(500, para.height);
      para.textAutoResize = "HEIGHT";
      para.lineHeight = { value: 150, unit: "PERCENT" };
      main.appendChild(para);
      const midCol = coverCol2("cover__primitives", 295, "#FAFAFB");
      midCol.appendChild(mkText("Primitive Colors", { size: 18, style: "Semi Bold", colorVar: textVar, colorHex: textHex }));
      const midSub = mkText("The raw ramps \u2014 every family, every step.", { size: 11, colorVar: mutedVar, colorHex: mutedHex });
      midSub.resize(231, midSub.height);
      midSub.textAutoResize = "HEIGHT";
      midCol.appendChild(midSub);
      bullet2(midCol, 295, `${famTones.size} color families`, "Accent, neutral and state ramps imported from the configurator.", false);
      bullet2(midCol, 295, `${steps}-step scale`, "Every family runs a consistent tonal scale for precise control.", false);
      bullet2(midCol, 295, "Never used directly", "Components consume semantic tokens only \u2014 primitives stay refactorable and theme-safe.", false);
      bullet2(midCol, 295, "Single source of truth", "Change a primitive and every semantic alias updates system-wide.", false);
      const inkCol = coverCol2("cover__variables", 295, inkHex);
      inkCol.appendChild(mkText(`${project} Variables`, { size: 18, style: "Semi Bold", colorHex: "#FFFFFF" }));
      const inkSub = mkText("Everything below is bound to Figma variables \u2014 a live mirror of the token source.", { size: 11, colorHex: "#9C9CA6" });
      inkSub.resize(231, inkSub.height);
      inkSub.textAutoResize = "HEIGHT";
      inkCol.appendChild(inkSub);
      bullet2(inkCol, 295, `${allVars.length} variables`, "Split into one collection per token category.", true);
      bullet2(inkCol, 295, `${themeCount} theme mode${themeCount > 1 ? "s" : ""}`, "Switch the page's variable mode to preview each theme.", true);
      bullet2(inkCol, 295, "Live sync", "Re-imports rebuild this page in place, bindings intact.", true);
      const btn = autoFrame("cover__btn", "HORIZONTAL", 0);
      btn.fills = [solid("#FFFFFF")];
      btn.cornerRadius = 8;
      btn.primaryAxisSizingMode = "FIXED";
      btn.counterAxisSizingMode = "FIXED";
      btn.resize(231, 40);
      btn.primaryAxisAlignItems = "CENTER";
      btn.counterAxisAlignItems = "CENTER";
      btn.appendChild(mkText("Open configurator \u2197", { size: 11, style: "Medium", colorVar: textVar, colorHex: textHex }));
      inkCol.appendChild(btn);
    }
    {
      await newBoard("Primitive Colors");
      root.appendChild(sectionBar("Primitive Colors"));
      const { card, body } = section("Primitives", "The raw color ramps \u2014 unopinionated source values that every semantic token aliases. Never used directly in designs.");
      const families = /* @__PURE__ */ new Map();
      for (const [key, hex] of Object.entries(tokens.colors.primitive)) {
        if (!hex) continue;
        const name = primitiveVarName(key);
        const slash = name.lastIndexOf("/");
        const fam = slash === -1 ? name : name.slice(0, slash);
        const tone = slash === -1 ? "" : name.slice(slash + 1);
        if (!families.has(fam)) families.set(fam, []);
        families.get(fam).push({ tone, hex, v: findVar(COLLECTIONS.primitives, name) });
      }
      for (const [fam, tones] of families) {
        const famRow = autoFrame(fam, "VERTICAL", 8);
        famRow.appendChild(mkText(fam, { size: 12, style: "Medium", colorVar: mutedVar, colorHex: mutedHex }));
        const ramp = autoFrame(`${fam}__ramp`, "HORIZONTAL", 8);
        for (const { tone, hex, v } of tones) {
          const cell = autoFrame(`${fam}/${tone}`, "VERTICAL", 6);
          cell.counterAxisAlignItems = "CENTER";
          const sw = figma.createFrame();
          sw.name = "swatch";
          sw.resize(56, 56);
          sw.cornerRadius = 8;
          sw.fills = [boundFill(v, hex)];
          sw.strokes = [boundFill(borderVar, borderHex, 0.4)];
          sw.strokeWeight = 1;
          cell.appendChild(sw);
          cell.appendChild(mkText(tone || "\u2014", { size: 10, style: "Medium", colorVar: textVar, opacity: 0.9 }));
          cell.appendChild(mkText(hex.toUpperCase(), { size: 9, colorVar: mutedVar, colorHex: mutedHex, opacity: 0.9 }));
          ramp.appendChild(cell);
        }
        famRow.appendChild(ramp);
        body.appendChild(famRow);
      }
      root.appendChild(card);
      sections++;
    }
    {
      let collect2 = function(match, strip) {
        const out = [];
        for (const key of allSemKeys) {
          if (claimed.has(key) || !match(key)) continue;
          const light = lightTheme[key] || (darkTheme == null ? void 0 : darkTheme[key]);
          if (!light) continue;
          claimed.add(key);
          out.push({
            key,
            label: (strip ? key.replace(strip, "") : key) || key,
            v: docSem.varFor(key),
            light,
            dark: darkTheme ? darkTheme[key] || light : void 0
          });
        }
        return out;
      }, rankOf2 = function(label) {
        var _a2;
        const last = (_a2 = label.split(/[-_/]/).pop()) != null ? _a2 : "";
        if (last in EMPHASIS) return EMPHASIS[last];
        const n = parseInt(last, 10);
        return isNaN(n) ? 50 : 3 + n;
      }, archSections2 = function() {
        var _a2;
        if (!docNorm || !docArch) return null;
        const palettes = docArch.palettes;
        const lookup = docArch.kind === "tonal" ? (fam, tone) => {
          var _a3;
          return (_a3 = palettes == null ? void 0 : palettes[fam]) == null ? void 0 : _a3[tone];
        } : (fam, tone) => primitiveRefHex(tokens, fam, tone);
        const modeKeys = docNorm.modes.map(([k]) => k);
        const lightKey = modeKeys[0];
        const darkKey = modeKeys.indexOf("dark") > 0 ? "dark" : modeKeys[1];
        const hexAt = (tok, mode) => {
          var _a3;
          if (!mode) return void 0;
          const rgba = archValueRgba((_a3 = tok.byMode[mode]) != null ? _a3 : "", lookup);
          return rgba ? `#${rgbaToHex(rgba)}` : void 0;
        };
        const label = (_a2 = ARCH_LABEL[docArch.kind]) != null ? _a2 : docArch.kind;
        const cards = [];
        for (const group of docNorm.groups) {
          const entries = [];
          for (const tok of group.tokens) {
            const light = hexAt(tok, lightKey);
            if (!light) continue;
            entries.push({
              key: archFigmaName(group.label, tok.key),
              label: tok.key,
              v: findVar(S, archFigmaName(group.label, tok.key)),
              light,
              dark: hexAt(tok, darkKey)
            });
          }
          if (entries.length === 0) continue;
          cards.push({
            title: group.label,
            desc: `The ${group.label} group of the ${label} contract \u2014 ${entries.length} token${entries.length > 1 ? "s" : ""}, one value per mode, resolved from the primitive ramps.`,
            entries
          });
        }
        return cards.length > 0 ? [{ bar: `${label} Semantics`, cards }] : null;
      }, chip2 = function(hex, label, width, dark, bindVar) {
        const c = autoFrame(`chip-${label}`, "HORIZONTAL", 8);
        c.primaryAxisSizingMode = "FIXED";
        c.counterAxisSizingMode = "FIXED";
        c.resize(width, 28);
        c.counterAxisAlignItems = "CENTER";
        c.paddingLeft = 8;
        c.paddingRight = 8;
        c.cornerRadius = 6;
        c.fills = [solid(dark ? "#19191C" : "#FAFAFB")];
        c.strokes = [solid(dark ? "#2C2C30" : "#EDEDF0")];
        c.strokeWeight = 1;
        const sw = figma.createFrame();
        sw.name = "swatch";
        sw.resize(20, 14);
        sw.cornerRadius = 4;
        sw.fills = [boundFill(bindVar, hex)];
        sw.strokes = [solid(dark ? "#FFFFFF" : "#000000", 0.08)];
        sw.strokeWeight = 1;
        c.appendChild(sw);
        c.appendChild(mkText(label, { size: 10, style: "Medium", colorHex: dark ? "#EAEAEE" : "#3A3A42" }));
        return c;
      }, headCell2 = function(label, width, padLeft = 0) {
        const c = autoFrame(`h-${label}`, "HORIZONTAL", 0);
        c.primaryAxisSizingMode = "FIXED";
        c.resize(width, 14);
        c.paddingLeft = padLeft;
        const t = mkText(label, { size: 9, style: "Medium", colorVar: mutedVar, colorHex: mutedHex });
        t.letterSpacing = { value: 0.8, unit: "PIXELS" };
        c.appendChild(t);
        return c;
      }, categoryCard2 = function(def) {
        var _a2;
        const { card, body } = section(def.title, def.desc);
        const n = def.entries.length;
        const SEG_H = 48;
        const perRow = Math.min(n, 6);
        const stripRows = Math.ceil(n / perRow);
        const segW = Math.floor(INNER_W / perRow);
        const strip = autoFrame(`${def.title}__scale`, "HORIZONTAL", 0);
        strip.layoutWrap = "WRAP";
        strip.counterAxisSpacing = 0;
        strip.clipsContent = true;
        strip.cornerRadius = 10;
        for (const e of def.entries) {
          const seg = autoFrame(e.label, "HORIZONTAL", 0);
          seg.primaryAxisSizingMode = "FIXED";
          seg.counterAxisSizingMode = "FIXED";
          seg.resize(segW, SEG_H);
          seg.primaryAxisAlignItems = "CENTER";
          seg.counterAxisAlignItems = "CENTER";
          seg.fills = [boundFill(e.v, e.light)];
          seg.appendChild(mkText(e.label, { size: 10, style: "Medium", colorHex: onColor(e.light) }));
          strip.appendChild(seg);
        }
        strip.primaryAxisSizingMode = "FIXED";
        strip.counterAxisSizingMode = "FIXED";
        strip.resize(INNER_W, stripRows * SEG_H);
        body.appendChild(strip);
        const hasDark = def.entries.some((e) => e.dark !== void 0);
        const head = autoFrame(`${def.title}__thead`, "HORIZONTAL", W.gap);
        head.appendChild(headCell2("TOKEN NAMES", W.name));
        head.appendChild(headCell2("PRIMITIVES \xB7 LIGHT", W.prim));
        head.appendChild(headCell2("HEX \xB7 LIGHT", W.hex));
        if (hasDark) {
          head.appendChild(headCell2("PRIMITIVES \xB7 DARK", W.dark + W.pad, W.pad));
          head.appendChild(headCell2("HEX \xB7 DARK", W.dark));
        }
        body.appendChild(head);
        const ROW_H = 28, ROW_GAP = 8;
        const rowsH = n * ROW_H + (n - 1) * ROW_GAP;
        const cols = autoFrame(`${def.title}__cols`, "HORIZONTAL", W.gap);
        const vcol = (name, w, padded) => {
          const c = autoFrame(name, "VERTICAL", ROW_GAP);
          if (padded) c.paddingTop = W.pad;
          c.primaryAxisSizingMode = "FIXED";
          c.counterAxisSizingMode = "FIXED";
          c.resize(w, rowsH + (padded ? W.pad : 0));
          return c;
        };
        const names = vcol("names", W.name, hasDark);
        const prims = vcol("primitives-light", W.prim, hasDark);
        const hexes = vcol("hex-light", W.hex, hasDark);
        for (const e of def.entries) {
          const cell = autoFrame(e.key, "HORIZONTAL", 8);
          cell.primaryAxisSizingMode = "FIXED";
          cell.counterAxisSizingMode = "FIXED";
          cell.resize(W.name, 28);
          cell.counterAxisAlignItems = "CENTER";
          const dot = figma.createFrame();
          dot.name = "dot";
          dot.resize(10, 10);
          dot.cornerRadius = 3;
          dot.fills = [boundFill(e.v, e.light)];
          dot.strokes = [solid("#000000", 0.1)];
          dot.strokeWeight = 1;
          cell.appendChild(dot);
          cell.appendChild(mkText(e.label, { size: 11, style: "Medium", colorVar: textVar, colorHex: textHex }));
          names.appendChild(cell);
          const lightKey = primKeyByHex.get(normHex(e.light));
          prims.appendChild(chip2(e.light, lightKey != null ? lightKey : "\u2014", W.prim, false, primByHex.get(normHex(e.light))));
          hexes.appendChild(chip2(e.light, `#${normHex(e.light).toUpperCase()}`, W.hex, false, primByHex.get(normHex(e.light))));
        }
        cols.appendChild(names);
        cols.appendChild(prims);
        cols.appendChild(hexes);
        if (hasDark) {
          const panel = autoFrame("dark-panel", "HORIZONTAL", W.gap);
          panel.fills = [solid(inkHex)];
          panel.cornerRadius = 12;
          panel.paddingTop = W.pad;
          panel.paddingBottom = W.pad;
          panel.paddingLeft = W.pad;
          panel.paddingRight = W.pad;
          const dPrims = vcol("primitives-dark", W.dark, false);
          const dHexes = vcol("hex-dark", W.dark, false);
          for (const e of def.entries) {
            const dark = (_a2 = e.dark) != null ? _a2 : e.light;
            const darkKey = primKeyByHex.get(normHex(dark));
            dPrims.appendChild(chip2(dark, darkKey != null ? darkKey : "\u2014", W.dark, true, primByHex.get(normHex(dark))));
            dHexes.appendChild(chip2(dark, `#${normHex(dark).toUpperCase()}`, W.dark, true, primByHex.get(normHex(dark))));
          }
          panel.appendChild(dPrims);
          panel.appendChild(dHexes);
          panel.primaryAxisSizingMode = "FIXED";
          panel.counterAxisSizingMode = "FIXED";
          panel.resize(2 * W.dark + W.gap + 2 * W.pad, rowsH + 2 * W.pad);
          cols.appendChild(panel);
        }
        const colsW = W.name + W.prim + W.hex + 3 * W.gap + (hasDark ? 2 * W.dark + W.gap + 2 * W.pad : -W.gap);
        const colsH = rowsH + (hasDark ? 2 * W.pad : 0);
        cols.primaryAxisSizingMode = "FIXED";
        cols.counterAxisSizingMode = "FIXED";
        cols.resize(colsW, colsH);
        body.appendChild(cols);
        root.appendChild(card);
        sections++;
      };
      var collect = collect2, rankOf = rankOf2, archSections = archSections2, chip = chip2, headCell = headCell2, categoryCard = categoryCard2;
      const claimed = /* @__PURE__ */ new Set();
      const allSemKeys = Array.from(/* @__PURE__ */ new Set([
        ...Object.keys(lightTheme),
        ...darkTheme ? Object.keys(darkTheme) : []
      ]));
      const EMPHASIS = {
        static: 0,
        weakest: 1,
        subtle: 1,
        weak: 2,
        light: 3,
        placeholder: 3,
        medium: 4,
        base: 5,
        default: 5,
        primary: 5,
        solid: 5,
        body: 5,
        secondary: 6,
        heavy: 6,
        strong: 7,
        tertiary: 7,
        strongest: 8,
        inverse: 9,
        disabled: 10
      };
      const sorted = (list) => list.map((e, i) => ({ e, i })).sort((a, b) => rankOf2(a.e.label) - rankOf2(b.e.label) || a.i - b.i).map(({ e }) => e);
      const STRIP = /^(action|status|bg|fg|surface|text|border|icon)-/;
      const stateCard = (name, desc) => ({
        title: `State ${name.charAt(0).toUpperCase()}${name.slice(1)}`,
        desc,
        entries: sorted(collect2((k) => new RegExp(`(^|-)${name}(-|$)`).test(k), /^status-/))
      });
      const flatSections = [
        {
          bar: "Brand Colors",
          cards: [{
            title: "Primary",
            desc: "Primary colors establish the core brand identity of the interface, from weakest tints to strongest emphasis levels \u2014 used for primary actions, focus states and recognizable visual consistency across the product.",
            entries: sorted(collect2((k) => /accent|brand|^action-|^primary$/.test(k), STRIP))
          }]
        },
        {
          bar: "State Colors",
          cards: [
            stateCard("error", "Error state colors provide clear visual signaling for failures, invalid inputs and critical system feedback, ensuring immediate recognition and strong contrast across all themes."),
            stateCard("success", "Success state colors communicate positive outcomes, confirmations and completed actions, delivering reassuring feedback with clarity and consistency across the interface."),
            stateCard("warning", "Warning state colors highlight caution, pending risks and notices that need attention without signaling failure, staying legible across all themes."),
            stateCard("info", "Info state colors communicate neutral, helpful information \u2014 hints, tips and system notices \u2014 with a calm, recognizable accent across the interface.")
          ]
        },
        {
          bar: "Foundation Colors",
          cards: [
            {
              title: "Background",
              desc: "Background colors define the foundational surfaces of the interface, from the base canvas to a layered elevation hierarchy that adapts to light and dark themes.",
              entries: sorted(collect2((k) => /^(bg|surface)(-|$)/.test(k), STRIP))
            },
            {
              title: "Text",
              desc: "Text colors deliver clear hierarchy and readability across all themes, from primary copy down to placeholder and disabled emphasis levels.",
              entries: sorted(collect2((k) => /^text(-|$)/.test(k), STRIP))
            },
            {
              title: "Icon",
              desc: "Icon colors deliver clear hierarchy and recognizability across all themes, mirroring the text emphasis scale.",
              entries: sorted(collect2((k) => /^(fg|icon)(-|$)/.test(k), STRIP))
            },
            {
              title: "Border",
              desc: "Border colors define edges, dividers and outlines with consistent contrast across themes, from subtle separators to strong emphasis strokes.",
              entries: sorted(collect2((k) => /^border(-|$)/.test(k), STRIP))
            },
            {
              title: "Other",
              desc: "Remaining semantic roles that fall outside the standard categories.",
              entries: sorted(collect2(() => true))
            }
          ]
        }
      ];
      const docSections = (_f = archSections2()) != null ? _f : flatSections;
      const W = { name: 190, prim: 180, hex: 160, dark: 180, gap: 12, pad: 16 };
      for (const s of docSections) {
        const cards = s.cards.filter((c) => c.entries.length > 0);
        if (cards.length === 0) continue;
        await newBoard(s.bar);
        root.appendChild(sectionBar(s.bar));
        for (const c of cards) categoryCard2(c);
      }
    }
    {
      await newBoard("Typography");
      root.appendChild(sectionBar("Typography"));
      const { card, body } = section("Typography", `Family \u201C${fontFamily}\u201D${tokens.typography.headingFontFamily && tokens.typography.headingFontFamily !== fontFamily ? ` \xB7 headings \u201C${tokens.typography.headingFontFamily}\u201D` : ""} \u2014 sizes, weights, line-heights bound to Typography variables.`);
      const sizes = Object.entries(tokens.typography.sizes).map(([k, v]) => [k, pxToFloat(v)]).filter(([, px]) => px > 0).sort((a, b) => b[1] - a[1]);
      for (const [key, px] of sizes) {
        const row = autoFrame(key, "HORIZONTAL", 24);
        row.counterAxisAlignItems = "CENTER";
        const label = mkText(`${key} \xB7 ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
        row.appendChild(label);
        label.resize(150, label.height);
        label.textAutoResize = "HEIGHT";
        const spec = mkText("Almost before we knew it, we had left the ground.", {
          style: px >= 28 ? "Semi Bold" : "Regular",
          colorVar: textVar
        });
        spec.fontSize = px;
        const sv = bestVar(COLLECTIONS.typography, `size/${key}`);
        if (sv) bindField(spec, "fontSize", sv);
        const lh = (_g = tokens.typography.lineHeights) == null ? void 0 : _g[key];
        if (lh) spec.lineHeight = { value: pxToFloat(lh), unit: "PIXELS" };
        const lhv = bestVar(COLLECTIONS.typography, `line-height/${key}`);
        if (lhv) bindField(spec, "lineHeight", lhv);
        row.appendChild(spec);
        body.appendChild(row);
      }
      const wRow = autoFrame("weights", "HORIZONTAL", 32);
      for (const [wKey, wVal] of Object.entries((_h = tokens.typography.weights) != null ? _h : {})) {
        const cell = autoFrame(wKey, "VERTICAL", 4);
        const style = wVal >= 700 ? "Bold" : wVal >= 600 ? "Semi Bold" : wVal >= 500 ? "Medium" : "Regular";
        const s = mkText("Ag", { size: 28, style, colorVar: textVar });
        bindField(s, "fontWeight", bestVar(COLLECTIONS.typography, `weight/${wKey}`));
        cell.appendChild(s);
        cell.appendChild(mkText(`${wKey} \xB7 ${wVal}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }));
        wRow.appendChild(cell);
      }
      body.appendChild(wRow);
      root.appendChild(card);
      sections++;
      const typeRoles = tokens.typography.roles;
      if (typeRoles && Object.keys(typeRoles).length > 0) {
        const { card: roleCard, body: roleBody } = section(
          "Type roles",
          "Semantic text roles \u2014 each line aliases a size, weight and family primitive (desktop). Bound to Typography role/* variables."
        );
        for (const [key, modes] of Object.entries(typeRoles)) {
          const d = modes == null ? void 0 : modes.desktop;
          if (!d) continue;
          const px = pxToFloat((_i = tokens.typography.sizes[d.size]) != null ? _i : "");
          if (!px) continue;
          const row = autoFrame(`role-${key}`, "HORIZONTAL", 24);
          row.counterAxisAlignItems = "CENTER";
          const label = mkText(`${key}  \u2192  ${d.size} / ${d.weight}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
          row.appendChild(label);
          label.resize(220, label.height);
          label.textAutoResize = "HEIGHT";
          label.layoutSizingHorizontal = "FIXED";
          label.layoutSizingVertical = "HUG";
          const spec = mkText("Almost before we knew it, we had left the ground.", {
            style: weightStyle(d.weight),
            colorVar: textVar,
            colorHex: textHex
          });
          spec.fontSize = px;
          spec.lineHeight = { value: 120, unit: "PERCENT" };
          spec.textAutoResize = "WIDTH_AND_HEIGHT";
          bindField(spec, "fontSize", bestVar(COLLECTIONS.typography, `role/${key}/size`, `size/${d.size}`));
          bindField(spec, "fontWeight", bestVar(COLLECTIONS.typography, `role/${key}/weight`, `weight/${d.weight}`));
          bindField(spec, "fontFamily", bestVar(COLLECTIONS.typography, `role/${key}/family`, d.family === "display" ? TYPOGRAPHY_FAMILY_VARS.display : TYPOGRAPHY_FAMILY_VARS.body));
          row.appendChild(spec);
          spec.layoutSizingHorizontal = "HUG";
          spec.layoutSizingVertical = "HUG";
          roleBody.appendChild(row);
          row.layoutSizingHorizontal = "HUG";
          row.layoutSizingVertical = "HUG";
        }
        root.appendChild(roleCard);
        sections++;
      }
    }
    {
      const entries = Object.entries(tokens.spacing).map(([k, v]) => [k, pxToFloat(v)]).filter(([, px]) => px > 0).sort((a, b) => a[1] - b[1]);
      if (entries.length > 0) {
        await newBoard("Spacing");
        root.appendChild(sectionBar("Spacing"));
        const { card, body } = section("Spacing", "Spacing scale \u2014 bar widths are bound to the Spacing variables.");
        for (const [key, px] of entries) {
          const row = autoFrame(key, "HORIZONTAL", 16);
          row.counterAxisAlignItems = "CENTER";
          const label = mkText(`${key} \xB7 ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
          row.appendChild(label);
          label.resize(90, label.height);
          const bar = figma.createFrame();
          bar.name = `bar-${key}`;
          bar.resize(Math.max(px, 2), 14);
          bar.cornerRadius = 3;
          bar.fills = [boundFill(accentVar, accentHex, 0.9)];
          bindField(bar, "width", (_j = findVar(COLLECTIONS.spacing, figmaVarName(key))) != null ? _j : findVar(COLLECTIONS.spacing, key));
          row.appendChild(bar);
          body.appendChild(row);
        }
        const spacingRoles = tokens.spacingRoles;
        if (spacingRoles) {
          for (const [role, step] of Object.entries(spacingRoles)) {
            const px = pxToFloat((_k = tokens.spacing[step]) != null ? _k : "");
            const row = autoFrame(`role-${role}`, "HORIZONTAL", 16);
            row.counterAxisAlignItems = "CENTER";
            const label = mkText(`${role}  \u2192  ${step}${px ? ` \xB7 ${px}px` : ""}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
            row.appendChild(label);
            label.resize(200, label.height);
            const bar = figma.createFrame();
            bar.name = `role-bar-${role}`;
            bar.resize(Math.max(px, 2), 14);
            bar.cornerRadius = 3;
            bar.fills = [boundFill(accentVar, accentHex, 0.55)];
            bindField(bar, "width", findVar(COLLECTIONS.spacing, figmaVarName(`role/${role}`)));
            row.appendChild(bar);
            body.appendChild(row);
          }
        }
        root.appendChild(card);
        sections++;
      }
    }
    {
      const entries = Object.entries((_l = tokens.radius) != null ? _l : {});
      if (entries.length > 0) {
        await newBoard("Border Radius");
        root.appendChild(sectionBar("Border Radius"));
        const { card, body } = section("Border Radius", "Corner radii \u2014 each specimen's corners are bound to the Radius variables.");
        const row = autoFrame("radii", "HORIZONTAL", 24);
        for (const [key, val] of entries) {
          const px = pxToFloat(val);
          const cell = autoFrame(key, "VERTICAL", 8);
          cell.counterAxisAlignItems = "CENTER";
          const sq = figma.createFrame();
          sq.name = `radius-${key}`;
          sq.resize(72, 72);
          sq.cornerRadius = Math.min(px, 36);
          sq.fills = [boundFill(cardVar, cardHex)];
          sq.strokes = [boundFill(accentVar, accentHex, 0.9)];
          sq.strokeWeight = 2;
          const rv = findVar(COLLECTIONS.radius, key);
          if ((rv == null ? void 0 : rv.resolvedType) === "FLOAT") {
            sq.setBoundVariable("topLeftRadius", rv);
            sq.setBoundVariable("topRightRadius", rv);
            sq.setBoundVariable("bottomLeftRadius", rv);
            sq.setBoundVariable("bottomRightRadius", rv);
          }
          cell.appendChild(sq);
          cell.appendChild(mkText(`${key} \xB7 ${px >= 9999 ? "full" : `${px}px`}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }));
          row.appendChild(cell);
        }
        body.appendChild(row);
        const radiusRoles = tokens.radiusRoles;
        if (radiusRoles) {
          const roleRow = autoFrame("radius-roles", "HORIZONTAL", 24);
          for (const [role, step] of Object.entries(radiusRoles)) {
            const px = pxToFloat((_m = tokens.radius[step]) != null ? _m : "");
            const cell = autoFrame(`role-${role}`, "VERTICAL", 8);
            cell.counterAxisAlignItems = "CENTER";
            const sq = figma.createFrame();
            sq.name = `role-radius-${role}`;
            sq.resize(56, 56);
            sq.cornerRadius = Math.min(px || 0, 28);
            sq.fills = [boundFill(cardVar, cardHex)];
            sq.strokes = [boundFill(accentVar, accentHex, 0.7)];
            sq.strokeWeight = 2;
            const rv = (_n = findVar(COLLECTIONS.radius, figmaVarName(`role/${role}`))) != null ? _n : findVar(COLLECTIONS.radius, step);
            if ((rv == null ? void 0 : rv.resolvedType) === "FLOAT") {
              sq.setBoundVariable("topLeftRadius", rv);
              sq.setBoundVariable("topRightRadius", rv);
              sq.setBoundVariable("bottomLeftRadius", rv);
              sq.setBoundVariable("bottomRightRadius", rv);
            }
            cell.appendChild(sq);
            cell.appendChild(mkText(`${role} \u2192 ${step}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }));
            roleRow.appendChild(cell);
          }
          body.appendChild(roleRow);
        }
        root.appendChild(card);
        sections++;
      }
    }
    {
      const strokeMap = tokens.stroke && Object.keys(tokens.stroke).length > 0 ? tokens.stroke : (_o = tokens.borders) == null ? void 0 : _o.width;
      const entries = Object.entries(strokeMap != null ? strokeMap : {});
      if (entries.length > 0) {
        await newBoard("Stroke");
        root.appendChild(sectionBar("Stroke"));
        const { card, body } = section("Stroke", "Stroke widths \u2014 primitives and semantic roles, bound to the Border collection.");
        for (const [key, val] of entries) {
          const px = pxToFloat(val);
          const row = autoFrame(key, "HORIZONTAL", 16);
          row.counterAxisAlignItems = "CENTER";
          const label = mkText(`${key} \xB7 ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
          row.appendChild(label);
          label.resize(90, label.height);
          const line = figma.createFrame();
          line.name = `border-${key}`;
          line.resize(220, Math.max(px * 2, 12));
          line.fills = [];
          line.strokes = [boundFill(textVar, textHex, 0.85)];
          line.strokeWeight = px;
          line.cornerRadius = 4;
          bindField(line, "strokeWeight", (_p = findVar(COLLECTIONS.border, key)) != null ? _p : findVar(COLLECTIONS.border, `width/${key}`));
          row.appendChild(line);
          body.appendChild(row);
        }
        if (tokens.strokeRoles) {
          for (const [role, step] of Object.entries(tokens.strokeRoles)) {
            const px = pxToFloat((_q = (strokeMap != null ? strokeMap : {})[step]) != null ? _q : "");
            const row = autoFrame(`role-${role}`, "HORIZONTAL", 16);
            row.counterAxisAlignItems = "CENTER";
            const label = mkText(`${role}  \u2192  ${step}${px ? ` \xB7 ${px}px` : ""}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
            row.appendChild(label);
            label.resize(200, label.height);
            const line = figma.createFrame();
            line.name = `role-border-${role}`;
            line.resize(220, Math.max(px * 2, 12));
            line.fills = [];
            line.strokes = [boundFill(accentVar, accentHex, 0.85)];
            line.strokeWeight = px || 1;
            line.cornerRadius = 4;
            bindField(line, "strokeWeight", findVar(COLLECTIONS.border, figmaVarName(`role/${role}`)));
            row.appendChild(line);
            body.appendChild(row);
          }
        }
        root.appendChild(card);
        sections++;
      }
    }
    {
      const entries = Object.entries((_r = tokens.opacity) != null ? _r : {}).map(([k, v]) => [k, parseFloat(v) || 0]).sort((a, b) => a[1] - b[1]);
      if (entries.length > 0) {
        await newBoard("Opacity");
        root.appendChild(sectionBar("Opacity"));
        const { card, body } = section("Opacity", "Opacity steps \u2014 layer opacity bound to the Opacity variables.");
        const row = autoFrame("opacity", "HORIZONTAL", 20);
        for (const [key, pct] of entries) {
          const cell = autoFrame(key, "VERTICAL", 8);
          cell.counterAxisAlignItems = "CENTER";
          const sw = figma.createFrame();
          sw.name = `opacity-${key}`;
          sw.resize(56, 56);
          sw.cornerRadius = 8;
          sw.fills = [boundFill(accentVar, accentHex)];
          sw.opacity = pct / 100;
          bindField(sw, "opacity", findVar(COLLECTIONS.opacity, key));
          cell.appendChild(sw);
          cell.appendChild(mkText(`${key} \xB7 ${pct}%`, { size: 10, colorVar: mutedVar, colorHex: mutedHex }));
          row.appendChild(cell);
        }
        body.appendChild(row);
        root.appendChild(card);
        sections++;
      }
    }
    {
      const entries = Object.entries((_s = tokens.shadows) != null ? _s : {});
      if (entries.length > 0) {
        await newBoard("Shadows");
        root.appendChild(sectionBar("Shadows"));
        const { card, body } = section("Shadows", "Elevation levels \u2014 matching Effect Styles are created under Styles.");
        const row = autoFrame("shadows", "HORIZONTAL", 28);
        for (const [key, css] of entries) {
          const effects = parseBoxShadow(css);
          if (effects.length === 0) continue;
          const cell = autoFrame(key, "VERTICAL", 10);
          cell.counterAxisAlignItems = "CENTER";
          const sw = figma.createFrame();
          sw.name = `shadow-${key}`;
          sw.resize(96, 64);
          sw.cornerRadius = 10;
          sw.fills = [boundFill(cardVar, cardHex)];
          sw.effects = effects;
          cell.appendChild(sw);
          cell.appendChild(mkText(key, { size: 10, colorVar: mutedVar, colorHex: mutedHex }));
          row.appendChild(cell);
        }
        body.appendChild(row);
        root.appendChild(card);
        sections++;
      }
    }
    {
      const grid = (_t = tokens.grid) != null ? _t : {};
      const sizes = Object.entries((_u = tokens.sizes) != null ? _u : {}).map(([k, v]) => [k, pxToFloat(v)]).filter(([, px]) => px > 0).sort((a, b) => a[1] - b[1]);
      const selectors = Object.entries((_v = tokens.selector) != null ? _v : {}).map(([k, v]) => [k, pxToFloat(v)]).filter(([, px]) => px > 0).sort((a, b) => a[1] - b[1]);
      if (Object.keys(grid).length > 0 || sizes.length > 0 || selectors.length > 0) {
        await newBoard("Grid & Sizes");
        root.appendChild(sectionBar("Grid & Sizes"));
        const { card, body } = section("Grid & Sizes", "Layout grid settings, component heights, and selector glyph sizes.");
        if (Object.keys(grid).length > 0) {
          const spec = Object.entries(grid).map(([k, v]) => `${k} ${v}`).join("   \xB7   ");
          body.appendChild(mkText(spec, { size: 12, colorVar: textVar, opacity: 0.9 }));
        }
        for (const [key, px] of sizes) {
          const row = autoFrame(key, "HORIZONTAL", 16);
          row.counterAxisAlignItems = "CENTER";
          const label = mkText(`${key} \xB7 ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
          row.appendChild(label);
          label.resize(90, label.height);
          const bar = figma.createFrame();
          bar.name = `size-${key}`;
          bar.resize(180, px);
          bar.cornerRadius = 6;
          bar.fills = [boundFill(cardVar, cardHex)];
          bar.strokes = [boundFill(borderVar, borderHex, 0.7)];
          bar.strokeWeight = 1;
          bindField(bar, "height", findVar(COLLECTIONS.size, key));
          row.appendChild(bar);
          body.appendChild(row);
        }
        if (tokens.sizeRoles) {
          for (const [role, step] of Object.entries(tokens.sizeRoles)) {
            const px = pxToFloat((_x = (_w = tokens.sizes) == null ? void 0 : _w[step]) != null ? _x : "");
            const row = autoFrame(`role-${role}`, "HORIZONTAL", 16);
            row.counterAxisAlignItems = "CENTER";
            const label = mkText(`${role}  \u2192  ${step}${px ? ` \xB7 ${px}px` : ""}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
            row.appendChild(label);
            label.resize(200, label.height);
            const bar = figma.createFrame();
            bar.name = `role-size-${role}`;
            bar.resize(180, Math.max(px, 8));
            bar.cornerRadius = 6;
            bar.fills = [boundFill(accentVar, accentHex, 0.35)];
            bindField(bar, "height", findVar(COLLECTIONS.size, figmaVarName(`role/${role}`)));
            row.appendChild(bar);
            body.appendChild(row);
          }
        }
        if (selectors.length > 0) {
          body.appendChild(mkText("Selector glyphs \u2014 checkbox / radio / switch track height", { size: 11, colorVar: mutedVar, colorHex: mutedHex }));
          for (const [key, px] of selectors) {
            const row = autoFrame(`selector-${key}`, "HORIZONTAL", 16);
            row.counterAxisAlignItems = "CENTER";
            const label = mkText(`${key} \xB7 ${px}px`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
            row.appendChild(label);
            label.resize(90, label.height);
            const sq = figma.createFrame();
            sq.name = `selector-${key}`;
            sq.resize(px, px);
            sq.cornerRadius = Math.min(4, px / 4);
            sq.fills = [boundFill(accentVar, accentHex, 0.55)];
            bindField(sq, "width", findVar(COLLECTIONS.selector, key));
            bindField(sq, "height", findVar(COLLECTIONS.selector, key));
            row.appendChild(sq);
            body.appendChild(row);
          }
          if (tokens.selectorRoles) {
            for (const [role, step] of Object.entries(tokens.selectorRoles)) {
              const px = pxToFloat((_z = (_y = tokens.selector) == null ? void 0 : _y[step]) != null ? _z : "");
              const row = autoFrame(`role-selector-${role}`, "HORIZONTAL", 16);
              row.counterAxisAlignItems = "CENTER";
              const label = mkText(`${role}  \u2192  ${step}${px ? ` \xB7 ${px}px` : ""}`, { size: 10, colorVar: mutedVar, colorHex: mutedHex });
              row.appendChild(label);
              label.resize(200, label.height);
              const sq = figma.createFrame();
              sq.name = `role-selector-${role}`;
              sq.resize(Math.max(px, 8), Math.max(px, 8));
              sq.cornerRadius = 4;
              sq.fills = [boundFill(accentVar, accentHex, 0.35)];
              bindField(sq, "width", findVar(COLLECTIONS.selector, figmaVarName(`role/${role}`)));
              bindField(sq, "height", findVar(COLLECTIONS.selector, figmaVarName(`role/${role}`)));
              row.appendChild(sq);
              body.appendChild(row);
            }
          }
        }
        root.appendChild(card);
        sections++;
      }
    }
    {
      const entries = Object.entries((_A = tokens.gradients) != null ? _A : {});
      if (entries.length > 0) {
        await newBoard("Gradients");
        root.appendChild(sectionBar("Gradients"));
        const { card, body } = section("Gradients", 'Named gradients from the configurator. Tags mark the surface each one is assigned to \u2014 the "cover" gradient paints the \u2B21 Cover page.');
        const assigned = (_B = tokens.gradientAssignments) != null ? _B : {};
        const row = autoFrame("gradients", "HORIZONTAL", 24);
        row.layoutWrap = "WRAP";
        row.counterAxisSpacing = 24;
        row.primaryAxisSizingMode = "FIXED";
        row.counterAxisSizingMode = "AUTO";
        row.resize(INNER_W, 100);
        for (const [slug, css] of entries) {
          const paint = parseCssGradient(css);
          if (!paint) continue;
          const cell = autoFrame(slug, "VERTICAL", 8);
          const sw = figma.createFrame();
          sw.name = `gradient-${slug}`;
          sw.resize(248, 140);
          sw.cornerRadius = 12;
          sw.strokes = [boundFill(borderVar, borderHex)];
          sw.strokeWeight = 1;
          sw.fills = [paint];
          cell.appendChild(sw);
          const tags = ["cover", "avatar"].filter((s) => assigned[s] === slug);
          cell.appendChild(mkText(slug + (tags.length ? `  \xB7  ${tags.join(" + ")}` : ""), { size: 11, style: "Medium", colorVar: textVar, colorHex: textHex }));
          row.appendChild(cell);
        }
        body.appendChild(row);
        root.appendChild(card);
        sections++;
      }
    }
    await figma.setCurrentPageAsync(docPage);
    figma.viewport.scrollAndZoomIntoView(boards);
    log(`\u2713 Documentation rebuilt: ${boards.length} boards / ${sections} sections, all bound to variables, on "\u2B21 Documentation"`);
    return boards.length;
  }
  var ICONIFY_PREFIXES = {
    lucide: "lucide",
    heroicons: "heroicons",
    phosphor: "ph",
    radix: "radix-icons",
    material: "material-symbols"
  };
  var ICON_FIGMA_FILES = {
    phosphor: {
      label: "Phosphor Icons \u2014 Figma Community",
      url: "https://www.figma.com/community/file/903830135544202908/phosphor-icons"
    }
  };
  function iconLibrarySource(libKey, libName) {
    var _a;
    return (_a = ICON_FIGMA_FILES[libKey]) != null ? _a : {
      label: `${libName || "Icon libraries"} \u2014 Figma Community`,
      url: `https://www.figma.com/community/search?resource_type=files&q=${encodeURIComponent(libName || "icons")}`
    };
  }
  var ICON_CORE = [
    // Navigation
    { name: "home", alias: { lucide: "house", ph: "house" } },
    { name: "menu", alias: { heroicons: "bars-3", ph: "list", "radix-icons": "hamburger-menu" } },
    { name: "more-horizontal", alias: { lucide: "ellipsis", heroicons: "ellipsis-horizontal", ph: "dots-three", "radix-icons": "dots-horizontal", "material-symbols": "more-horiz" } },
    { name: "more-vertical", alias: { lucide: "ellipsis-vertical", heroicons: "ellipsis-vertical", ph: "dots-three-vertical", "radix-icons": "dots-vertical", "material-symbols": "more-vert" } },
    { name: "chevron-left", alias: { ph: "caret-left" } },
    { name: "chevron-right", alias: { ph: "caret-right" } },
    { name: "chevron-up", alias: { ph: "caret-up", "material-symbols": "expand-less" } },
    { name: "chevron-down", alias: { ph: "caret-down", "material-symbols": "expand-more" } },
    { name: "arrow-left", alias: { "material-symbols": "arrow-back" } },
    { name: "arrow-right", alias: { "material-symbols": "arrow-forward" } },
    { name: "arrow-up", alias: { "material-symbols": "arrow-upward" } },
    { name: "arrow-down", alias: { "material-symbols": "arrow-downward" } },
    { name: "arrow-up-right", alias: { "radix-icons": "arrow-top-right", "material-symbols": "north-east" } },
    { name: "external-link", alias: { heroicons: "arrow-top-right-on-square", ph: "arrow-square-out", "material-symbols": "open-in-new" } },
    { name: "log-in", alias: { ph: "sign-in", "radix-icons": "enter", "material-symbols": "login" } },
    { name: "log-out", alias: { ph: "sign-out", "radix-icons": "exit", "material-symbols": "logout" } },
    // Actions
    { name: "search", alias: { heroicons: "magnifying-glass", ph: "magnifying-glass", "radix-icons": "magnifying-glass" } },
    { name: "settings", alias: { heroicons: "cog-6-tooth", ph: "gear", "radix-icons": "gear" } },
    { name: "plus", alias: { "material-symbols": "add" } },
    { name: "minus", alias: { "material-symbols": "remove" } },
    { name: "x", alias: { heroicons: "x-mark", "radix-icons": "cross-2", "material-symbols": "close" } },
    { name: "check" },
    { name: "circle-dashed" },
    { name: "square-dashed", alias: { ph: "rectangle-dashed", lucide: "square-dashed" } },
    { name: "check-circle", alias: { lucide: "circle-check", "radix-icons": "check-circled" } },
    { name: "x-circle", alias: { lucide: "circle-x", "radix-icons": "cross-circled", "material-symbols": "cancel" } },
    { name: "plus-circle", alias: { lucide: "circle-plus", "radix-icons": "plus-circled", "material-symbols": "add-circle" } },
    { name: "edit", alias: { lucide: "pencil", heroicons: "pencil", ph: "pencil-simple", "radix-icons": "pencil-1" } },
    { name: "trash", alias: { "material-symbols": "delete" } },
    { name: "copy", alias: { heroicons: "document-duplicate", "material-symbols": "content-copy" } },
    { name: "save", alias: { ph: "floppy-disk" } },
    { name: "download", alias: { heroicons: "arrow-down-tray", ph: "download-simple" } },
    { name: "upload", alias: { heroicons: "arrow-up-tray", ph: "upload-simple" } },
    { name: "share-2", alias: { heroicons: "share", ph: "share-network", "radix-icons": "share-1", "material-symbols": "share" } },
    { name: "undo", alias: { heroicons: "arrow-uturn-left", ph: "arrow-u-up-left" } },
    { name: "redo", alias: { heroicons: "arrow-uturn-right", ph: "arrow-u-up-right" } },
    { name: "refresh-cw", alias: { heroicons: "arrow-path", ph: "arrows-clockwise", "radix-icons": "reload", "material-symbols": "refresh" } },
    { name: "repeat", alias: { "radix-icons": "loop" } },
    { name: "archive", alias: { heroicons: "archive-box" } },
    { name: "bookmark", alias: { ph: "bookmark-simple" } },
    { name: "zoom-in", alias: { heroicons: "magnifying-glass-plus", ph: "magnifying-glass-plus" } },
    { name: "zoom-out", alias: { heroicons: "magnifying-glass-minus", ph: "magnifying-glass-minus" } },
    { name: "filter", alias: { heroicons: "funnel", ph: "funnel", "material-symbols": "filter-alt" } },
    { name: "sliders", alias: { lucide: "sliders-horizontal", heroicons: "adjustments-horizontal", ph: "sliders-horizontal", "radix-icons": "mixer-horizontal", "material-symbols": "tune" } },
    { name: "pin", alias: { ph: "push-pin", "radix-icons": "drawing-pin", "material-symbols": "push-pin" } },
    // Communication
    { name: "mail", alias: { heroicons: "envelope", ph: "envelope-simple", "radix-icons": "envelope-closed" } },
    { name: "send", alias: { heroicons: "paper-airplane", ph: "paper-plane-tilt", "radix-icons": "paper-plane" } },
    { name: "message-circle", alias: { heroicons: "chat-bubble-oval-left", ph: "chat-circle", "radix-icons": "chat-bubble", "material-symbols": "chat" } },
    { name: "at-sign", alias: { heroicons: "at-symbol", ph: "at", "material-symbols": "alternate-email" } },
    { name: "phone", alias: { "material-symbols": "call" } },
    { name: "paperclip", alias: { heroicons: "paper-clip", "material-symbols": "attach-file" } },
    { name: "inbox", alias: { ph: "tray" } },
    // People
    { name: "user", alias: { "radix-icons": "person", "material-symbols": "person" } },
    { name: "users", alias: { "material-symbols": "group" } },
    { name: "user-plus", alias: { "material-symbols": "person-add" } },
    // Media
    { name: "image", alias: { heroicons: "photo" } },
    { name: "camera", alias: { "material-symbols": "photo-camera" } },
    { name: "video", alias: { heroicons: "video-camera", ph: "video-camera", "material-symbols": "videocam" } },
    { name: "mic", alias: { heroicons: "microphone", ph: "microphone" } },
    { name: "play", alias: { "material-symbols": "play-arrow" } },
    { name: "pause" },
    { name: "volume-2", alias: { heroicons: "speaker-wave", ph: "speaker-high", "material-symbols": "volume-up" } },
    { name: "music", alias: { heroicons: "musical-note", ph: "music-notes", "material-symbols": "music-note" } },
    // Files
    { name: "file", alias: { heroicons: "document", "material-symbols": "description" } },
    { name: "file-text", alias: { heroicons: "document-text", "material-symbols": "article" } },
    { name: "folder" },
    { name: "folder-open" },
    { name: "clipboard", alias: { "material-symbols": "content-paste" } },
    { name: "printer", alias: { "material-symbols": "print" } },
    // Status
    { name: "info", alias: { heroicons: "information-circle", "radix-icons": "info-circled" } },
    { name: "alert-triangle", alias: { lucide: "triangle-alert", heroicons: "exclamation-triangle", ph: "warning", "radix-icons": "exclamation-triangle", "material-symbols": "warning" } },
    { name: "alert-circle", alias: { lucide: "circle-alert", heroicons: "exclamation-circle", ph: "warning-circle", "material-symbols": "error" } },
    { name: "help-circle", alias: { lucide: "circle-help", heroicons: "question-mark-circle", ph: "question", "radix-icons": "question-mark-circled", "material-symbols": "help" } },
    { name: "bell", alias: { "material-symbols": "notifications" } },
    { name: "bell-off", alias: { heroicons: "bell-slash", ph: "bell-slash", "material-symbols": "notifications-off" } },
    { name: "shield", alias: { heroicons: "shield-check" } },
    { name: "thumbs-up", alias: { heroicons: "hand-thumb-up", "material-symbols": "thumb-up" } },
    { name: "thumbs-down", alias: { heroicons: "hand-thumb-down", "material-symbols": "thumb-down" } },
    { name: "star" },
    { name: "heart", alias: { "material-symbols": "favorite" } },
    // Commerce
    { name: "shopping-cart" },
    { name: "shopping-bag", alias: { ph: "bag" } },
    { name: "credit-card" },
    { name: "tag", alias: { "material-symbols": "sell" } },
    { name: "gift", alias: { "material-symbols": "redeem" } },
    { name: "dollar-sign", alias: { heroicons: "currency-dollar", ph: "currency-dollar", "material-symbols": "attach-money" } },
    { name: "percent" },
    // Time
    { name: "calendar", alias: { ph: "calendar-blank", "material-symbols": "calendar-today" } },
    { name: "clock", alias: { "material-symbols": "schedule" } },
    // Visibility & security
    { name: "eye", alias: { "radix-icons": "eye-open", "material-symbols": "visibility" } },
    { name: "eye-off", alias: { heroicons: "eye-slash", ph: "eye-slash", "radix-icons": "eye-closed", "material-symbols": "visibility-off" } },
    { name: "lock", alias: { heroicons: "lock-closed", "radix-icons": "lock-closed" } },
    { name: "unlock", alias: { lucide: "lock-open", heroicons: "lock-open", ph: "lock-open", "radix-icons": "lock-open-1", "material-symbols": "lock-open" } },
    { name: "key" },
    { name: "link", alias: { "radix-icons": "link-2" } },
    // Tech & devices
    { name: "globe", alias: { heroicons: "globe-alt", "material-symbols": "public" } },
    { name: "map-pin", alias: { "material-symbols": "location-on" } },
    { name: "map", alias: { ph: "map-trifold" } },
    { name: "wifi", alias: { ph: "wifi-high" } },
    { name: "cloud" },
    { name: "database", alias: { heroicons: "circle-stack" } },
    { name: "server", alias: { "material-symbols": "dns" } },
    { name: "code", alias: { heroicons: "code-bracket", "radix-icons": "code" } },
    { name: "terminal", alias: { heroicons: "command-line" } },
    { name: "cpu", alias: { heroicons: "cpu-chip", "material-symbols": "memory" } },
    { name: "smartphone", alias: { heroicons: "device-phone-mobile", ph: "device-mobile", "radix-icons": "mobile" } },
    { name: "monitor", alias: { heroicons: "computer-desktop", "radix-icons": "desktop" } },
    { name: "battery", alias: { heroicons: "battery-100", ph: "battery-full", "material-symbols": "battery-full" } },
    // Layout & misc
    { name: "grid", alias: { lucide: "layout-grid", heroicons: "squares-2x2", ph: "squares-four", "material-symbols": "grid-view" } },
    { name: "list", alias: { heroicons: "list-bullet", ph: "list-bullets", "radix-icons": "list-bullet" } },
    { name: "dashboard", alias: { lucide: "layout-dashboard", ph: "layout", "material-symbols": "dashboard" } },
    { name: "sun", alias: { "material-symbols": "light-mode" } },
    { name: "moon", alias: { "material-symbols": "dark-mode" } },
    { name: "zap", alias: { heroicons: "bolt", ph: "lightning", "radix-icons": "lightning-bolt", "material-symbols": "bolt" } },
    { name: "layers", alias: { heroicons: "square-3-stack-3d", ph: "stack" } },
    { name: "package", alias: { heroicons: "cube", "radix-icons": "cube", "material-symbols": "package-2" } },
    { name: "truck", alias: { "material-symbols": "local-shipping" } },
    { name: "flag" }
  ];
  var ICON_SIZES = [["Large", 24], ["Medium", 20], ["Small", 16]];
  async function importIcons(tokens) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    const custom = (_b = (_a = tokens.icons) == null ? void 0 : _a.custom) != null ? _b : [];
    const libKey = (_d = (_c = tokens.icons) == null ? void 0 : _c.library) != null ? _d : "";
    const libName = (_f = (_e = tokens.icons) == null ? void 0 : _e.name) != null ? _f : libKey;
    const prefix = (_h = (_g = tokens.icons) == null ? void 0 : _g.prefix) != null ? _h : ICONIFY_PREFIXES[libKey];
    if (custom.length === 0 && !prefix) return 0;
    let page = figma.root.children.find((p) => p.name === "\u2B21 Icons");
    if (!page) {
      page = figma.createPage();
      page.name = "\u2B21 Icons";
    } else {
      await page.loadAsync();
    }
    const pg = page;
    const prevPage = figma.currentPage;
    if (prevPage !== pg) await figma.setCurrentPageAsync(pg);
    for (const other of figma.root.children) {
      if (other === pg) continue;
      await other.loadAsync();
      const strays = other.findAll((n) => (n.type === "COMPONENT" || n.type === "COMPONENT_SET") && n.name.startsWith("icon/"));
      for (const s of strays) {
        if (((_i = s.parent) == null ? void 0 : _i.type) === "COMPONENT_SET") continue;
        pg.appendChild(s);
      }
      if (strays.length > 0) log(`\u2713 Moved ${strays.length} stray icon${strays.length > 1 ? "s" : ""} from "${other.name}" to "\u2B21 Icons"`);
    }
    const fontFamily = ((_j = tokens.typography) == null ? void 0 : _j.fontFamily) || "Inter";
    const loadedStyles = /* @__PURE__ */ new Set();
    for (const style of ["Regular", "Medium", "Semi Bold", "Bold"]) {
      try {
        await figma.loadFontAsync({ family: fontFamily, style });
        loadedStyles.add(style);
      } catch (e) {
        try {
          await figma.loadFontAsync({ family: "Inter", style });
        } catch (e2) {
        }
      }
    }
    const fontFor = (style) => loadedStyles.has(style) ? { family: fontFamily, style } : { family: "Inter", style };
    const iconsTypo = await typoVarMap();
    const iconsAllVars = await figma.variables.getLocalVariablesAsync();
    const iconsAllCols = await figma.variables.getLocalVariableCollectionsAsync();
    const iconsChrome = docChromeVarsFrom(semLookupFor(tokens, iconsAllVars, iconsAllCols));
    const iconsModePin = docModePin(tokens, iconsAllCols);
    const { docSolid, docText, docFrame, wrapText, docDivider, docBullet, docBoard } = docChrome(fontFor, iconsTypo, tokens.typography.sizes, iconsChrome, iconsModePin);
    try {
      pg.backgrounds = [docSolid(DOC.page)];
    } catch (e) {
    }
    pinToLightMode(pg, iconsModePin);
    const MARGIN = 80;
    const TOP = 120;
    const SHOWCASE_X = MARGIN + (PANEL_W + 96) + 60;
    const GRID_W = 960;
    const existingComponents = /* @__PURE__ */ new Map();
    for (const n of pg.findAll((nn) => nn.type === "COMPONENT")) {
      if (!existingComponents.has(n.name)) existingComponents.set(n.name, n);
    }
    const existingIconSets = /* @__PURE__ */ new Set();
    for (const n of pg.findAll((nn) => nn.type === "COMPONENT_SET")) existingIconSets.add(n.name);
    for (const child of [...pg.children]) {
      if (child.type === "FRAME" && child.name.startsWith("docs/")) child.remove();
    }
    function sectionCard(name, label) {
      let card = pg.children.find((n) => n.type === "FRAME" && n.name === name);
      if (!card) {
        card = figma.createFrame();
        card.name = name;
        card.layoutMode = "VERTICAL";
        vStack(card, GRID_W);
        card.itemSpacing = 16;
        card.paddingTop = 24;
        card.paddingBottom = 24;
        card.paddingLeft = 24;
        card.paddingRight = 24;
        card.cornerRadius = 16;
        pg.appendChild(card);
      }
      card.fills = [docSolid(DOC.card, 1, iconsChrome.card)];
      card.strokes = [docSolid(DOC.border, 1, iconsChrome.border)];
      card.strokeWeight = 1;
      const oldLabel = card.children.find((n) => n.type === "TEXT" && n.name === "label");
      if (oldLabel) oldLabel.remove();
      const lbl = docText(label.toUpperCase(), 10, "Medium", DOC.muted, 1, iconsChrome.muted);
      lbl.name = "label";
      lbl.letterSpacing = { value: 1, unit: "PIXELS" };
      card.insertChild(0, lbl);
      let grid = card.children.find((n) => n.type === "FRAME" && n.name === "grid");
      if (!grid) {
        grid = figma.createFrame();
        grid.name = "grid";
        grid.layoutMode = "HORIZONTAL";
        grid.primaryAxisSizingMode = "FIXED";
        grid.counterAxisSizingMode = "AUTO";
        grid.layoutWrap = "WRAP";
        grid.itemSpacing = 20;
        grid.counterAxisSpacing = 20;
        grid.fills = [];
        card.appendChild(grid);
        grid.layoutSizingHorizontal = "FILL";
      }
      return { card, grid };
    }
    const allVars = await figma.variables.getLocalVariablesAsync();
    const allCols = await figma.variables.getLocalVariableCollectionsAsync();
    const tintCandidate = semLookupFor(tokens, allVars, allCols).varFor("content-primary", "text/primary", "text");
    const tintVar = (tintCandidate == null ? void 0 : tintCandidate.resolvedType) === "COLOR" ? tintCandidate : void 0;
    function tint(root) {
      if (!tintVar) return;
      const nodes = [root, ...root.findAll()];
      for (const n of nodes) {
        const g = n;
        if ("fills" in g && Array.isArray(g.fills) && g.fills.some((f) => f.type === "SOLID")) {
          g.fills = g.fills.map((f) => f.type === "SOLID" ? figma.variables.setBoundVariableForPaint(f, "color", tintVar) : f);
        }
        if ("strokes" in g && g.strokes.some((f) => f.type === "SOLID")) {
          g.strokes = g.strokes.map((f) => f.type === "SOLID" ? figma.variables.setBoundVariableForPaint(f, "color", tintVar) : f);
        }
      }
    }
    let created = 0;
    let libCard;
    let libGrid;
    let libCount = 0;
    if (prefix) {
      const { card, grid } = sectionCard(`icons/lib-${libKey}`, `${libName} \u2014 Core UI Set`);
      libCard = card;
      libGrid = grid;
      for (const [name, comp] of existingComponents) {
        if (name.startsWith(`icon/${libKey}/`) && comp.parent !== grid) grid.appendChild(comp);
      }
      const wanted = ICON_CORE.map((def) => {
        var _a2, _b2;
        return { canonical: def.name, source: (_b2 = (_a2 = def.alias) == null ? void 0 : _a2[prefix]) != null ? _b2 : def.name };
      }).filter((w) => !existingIconSets.has(`icon/${libKey}/${w.canonical}`));
      if (wanted.length > 0) {
        try {
          const url = `https://api.iconify.design/${prefix}.json?icons=${wanted.map((w) => w.source).join(",")}`;
          const res = await fetchWithTimeout(url);
          if (!res.ok) throw new Error(`Iconify responded ${res.status}`);
          const data = await res.json();
          const icons = (_k = data.icons) != null ? _k : {};
          const aliases = (_l = data.aliases) != null ? _l : {};
          let libCreated = 0;
          let iconSeen = 0;
          for (const w of wanted) {
            if (iconSeen % 8 === 0) {
              progress("Icons", iconSeen, wanted.length, w.canonical);
              await yieldToUI();
            }
            iconSeen++;
            const resolvedKey = icons[w.source] ? w.source : (_m = aliases[w.source]) == null ? void 0 : _m.parent;
            const ic = resolvedKey ? icons[resolvedKey] : void 0;
            if (!ic) continue;
            try {
              const setName = `icon/${libKey}/${w.canonical}`;
              const iw = (_o = (_n = ic.width) != null ? _n : data.width) != null ? _o : 24;
              const ih = (_q = (_p = ic.height) != null ? _p : data.height) != null ? _q : 24;
              const body = ic.body.replace(/currentColor/g, "#000000");
              const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iw}" height="${ih}" viewBox="0 0 ${iw} ${ih}">${body}</svg>`;
              const legacy = existingComponents.get(setName);
              const variants = [];
              let set;
              try {
                for (const [sizeName, px] of ICON_SIZES) {
                  if (sizeName === "Large" && legacy) {
                    legacy.name = "Size=Large";
                    variants.push(legacy);
                    continue;
                  }
                  const frame = figma.createNodeFromSvg(svg);
                  if (frame.width !== px) frame.rescale(px / frame.width);
                  tint(frame);
                  const comp = figma.createComponentFromNode(frame);
                  comp.name = `Size=${sizeName}`;
                  variants.push(comp);
                }
                set = figma.combineAsVariants(variants, grid);
              } catch (buildErr) {
                for (const v of variants) {
                  if (v !== legacy && !v.removed) try {
                    v.remove();
                  } catch (e) {
                  }
                }
                throw buildErr;
              }
              set.name = setName;
              set.layoutMode = "HORIZONTAL";
              set.primaryAxisSizingMode = "AUTO";
              set.counterAxisSizingMode = "AUTO";
              set.counterAxisAlignItems = "CENTER";
              set.itemSpacing = 12;
              set.paddingTop = 12;
              set.paddingBottom = 12;
              set.paddingLeft = 12;
              set.paddingRight = 12;
              try {
                set.description = `${libName} \u2014 ${w.source} (Large 24 / Medium 20 / Small 16)`;
              } catch (e) {
              }
              libCreated++;
            } catch (iconErr) {
              log(`\u26A0 Could not build icon "${w.source}" from ${prefix} \u2014 ${iconErr instanceof Error ? iconErr.message : String(iconErr)}`);
            }
          }
          created += libCreated;
          const missing = (_s = (_r = data.not_found) == null ? void 0 : _r.length) != null ? _s : 0;
          if (libCreated > 0) {
            log(`\u2713 Imported ${libCreated} ${libName} icon sets (Large/Medium/Small) on page "\u2B21 Icons"${missing ? ` (${missing} not in this set)` : ""}`);
          } else {
            log(`\u26A0 Iconify responded but matched 0 of ${wanted.length} requested "${prefix}" icons \u2014 the collection prefix may be wrong, or the API response shape changed.`);
          }
        } catch (e) {
          log(`\u26A0 Icon library fetch failed (${e instanceof Error ? e.message : String(e)}) \u2014 if this is a network/permission error, the plugin likely needs a full reload to pick up api.iconify.design from the manifest: in Figma, Plugins \u2192 Development \u2192 right-click "Escala DS" \u2192 Remove, then Import plugin from manifest\u2026 again (editing manifest.json alone isn't always enough for a running dev session). Custom icons and tokens are unaffected.`);
        }
      }
      libCount = grid.children.length;
      const legacyLib = pg.children.find((n) => n.type === "FRAME" && n.name === "icons/library");
      if (legacyLib && legacyLib.findAll((n) => n.type === "COMPONENT").length === 0) legacyLib.remove();
    }
    const libNamespaces = Object.keys(ICONIFY_PREFIXES).map((k) => `icon/${k}/`);
    const isCustomName = (n) => n.startsWith("icon/") && !libNamespaces.some((ns) => n.startsWith(ns));
    const hasCustom = custom.length > 0 || [...existingComponents.keys()].some(isCustomName);
    let customCard;
    let customCount = 0;
    if (hasCustom) {
      const { card, grid } = sectionCard("icons/custom", "Custom Icons");
      customCard = card;
      for (const [name, comp] of existingComponents) {
        if (isCustomName(name) && comp.parent !== grid) grid.appendChild(comp);
      }
      let customCreated = 0;
      for (const icon of custom) {
        const name = `icon/${icon.name}`;
        if (existingComponents.has(name)) continue;
        try {
          const frame = figma.createNodeFromSvg(icon.svg);
          const comp = figma.createComponentFromNode(frame);
          comp.name = name;
          grid.appendChild(comp);
          customCreated++;
        } catch (e) {
          log(`\u26A0 Could not import icon "${icon.name}" \u2014 invalid SVG`);
        }
      }
      created += customCreated;
      if (customCreated > 0) log(`\u2713 Imported ${customCreated} custom icon${customCreated > 1 ? "s" : ""} on page "\u2B21 Icons"`);
      customCount = grid.children.length;
    }
    const header = docFrame("docs/icons-header", "HORIZONTAL", 8);
    header.fills = [docSolid(DOC.ink)];
    header.cornerRadius = 10;
    header.primaryAxisSizingMode = "FIXED";
    header.counterAxisSizingMode = "FIXED";
    header.resize(GRID_W, 48);
    header.counterAxisAlignItems = "CENTER";
    header.primaryAxisAlignItems = "SPACE_BETWEEN";
    header.paddingLeft = 24;
    header.paddingRight = 24;
    header.appendChild(docText("Icons", 13, "Semi Bold", "#FFFFFF"));
    header.appendChild(docText(tokens.project || "Design System", 10, "Medium", "#9C9CA6"));
    pg.appendChild(header);
    header.x = SHOWCASE_X;
    header.y = TOP;
    const otherLibCards = pg.children.filter((n) => n.type === "FRAME" && n.name.startsWith("icons/lib-") && n !== libCard);
    let y = TOP + 76;
    for (const cardF of [libCard, ...otherLibCards, customCard]) {
      if (!cardF) continue;
      cardF.x = SHOWCASE_X;
      cardF.y = y;
      y += cardF.height + 40;
    }
    const panel = docFrame("docs/icons-panel", "VERTICAL", 20);
    panel.fills = [docSolid(DOC.card, 1, iconsChrome.board)];
    panel.strokes = [docSolid(DOC.border, 1, iconsChrome.border)];
    panel.strokeWeight = 1;
    panel.cornerRadius = 16;
    panel.paddingTop = PANEL_PAD;
    panel.paddingBottom = PANEL_PAD;
    panel.paddingLeft = PANEL_PAD;
    panel.paddingRight = PANEL_PAD;
    vStack(panel, PANEL_W);
    const crumb = docFrame("breadcrumb", "HORIZONTAL", 8);
    crumb.primaryAxisSizingMode = "FIXED";
    crumb.counterAxisSizingMode = "FIXED";
    crumb.resize(PANEL_INNER, 18);
    crumb.primaryAxisAlignItems = "SPACE_BETWEEN";
    crumb.counterAxisAlignItems = "CENTER";
    crumb.appendChild(docText("Foundations  /  Icons", 9, "Regular", DOC.muted, 1, iconsChrome.secondary));
    crumb.appendChild(docText("v1.0 \u2013 LAUNCH", 8, "Medium", DOC.muted, 0.9, iconsChrome.secondary));
    panel.appendChild(crumb);
    panel.appendChild(wrapText(docText("Icons", 26, "Semi Bold", DOC.text, 1, iconsChrome.text), PANEL_INNER));
    const intro = wrapText(docText(
      `${libName || "The icon set"} is the icon language of this design system. The core UI set is imported straight from the official collection, normalized to a 24px grid and tinted through the text/primary variable \u2014 custom brand glyphs live alongside it.`,
      12,
      "Regular",
      DOC.muted,
      1,
      iconsChrome.muted
    ), PANEL_INNER);
    intro.lineHeight = { value: 150, unit: "PERCENT" };
    panel.appendChild(intro);
    panel.appendChild(docDivider("SPECS"));
    const specs = docFrame("specs", "VERTICAL", 14);
    docBullet(
      specs,
      `Library \u2014 ${libName || "custom only"}`,
      ((_t = tokens.icons) == null ? void 0 : _t.package) ? `Ships as ${tokens.icons.package} in code, so design and engineering draw from the same set.` : "Selected in the configurator and stored as the Icons/library variable."
    );
    if (libCount > 0) {
      docBullet(
        specs,
        `${libCount} core UI glyphs`,
        "Navigation, actions, forms, status, commerce, media and device icons \u2014 insert as icon/<library>/<name>. Missing concepts in a set are skipped gracefully."
      );
      docBullet(
        specs,
        "3 sizes per glyph",
        "Every icon is a variant set \u2014 Large 24, Medium 20 and Small 16 \u2014 switch sizes from the instance panel without swapping components."
      );
    }
    if (customCount > 0) {
      docBullet(
        specs,
        `${customCount} custom icons`,
        "Uploaded in the configurator; imported as-is so multicolor brand marks keep their fills."
      );
    }
    docBullet(
      specs,
      "Token-tinted",
      "Library glyphs bind fills and strokes to the primary ink semantic variable \u2014 switch the page's variable mode and every icon follows the theme."
    );
    docBullet(
      specs,
      "Empty slots, not stand-in glyphs",
      'Components render instances of icon/circle-dashed and icon/square-dashed wherever an icon belongs. Swap those for a real glyph from Assets. See "Bring your own icons" below.'
    );
    panel.appendChild(specs);
    panel.appendChild(docDivider("FEATURES"));
    const sem = (_v = (_u = tokens.colors) == null ? void 0 : _u.semantic) != null ? _v : {};
    const accent = archHexFor(tokens, "background-brand-solid", ((_x = (_w = tokens.colors) == null ? void 0 : _w.themeOrder) != null ? _x : ["light"])[0]) || sem["background-brand-solid"] || sem["content-brand"] || sem["action-primary"] || sem["bg-accent-solid"] || sem.primary || "#3B82F6";
    const feats = ["Variable Tinted", "Auto Layout", "Themable", "24px Grid", "Iconify Sourced", "AI Friendly"];
    for (let i = 0; i < feats.length; i += 3) {
      const rw = docFrame(`features-${i / 3 + 1}`, "HORIZONTAL", 6);
      for (const f of feats.slice(i, i + 3)) {
        const chipF = docFrame(`feat-${f.toLowerCase().replace(/\s+/g, "-")}`, "HORIZONTAL", 4);
        chipF.paddingLeft = 8;
        chipF.paddingRight = 8;
        chipF.paddingTop = 4;
        chipF.paddingBottom = 4;
        chipF.cornerRadius = 999;
        chipF.strokes = [docSolid(accent, 0.45, iconsChrome.accentBorder)];
        chipF.strokeWeight = 1;
        chipF.appendChild(docText(f, 9, "Medium", accent, 1, iconsChrome.accentText));
        rw.appendChild(chipF);
      }
      panel.appendChild(rw);
    }
    const hint = docFrame("insert-hint", "VERTICAL", 6);
    hint.fills = [docSolid(DOC.faint, 1, iconsChrome.card)];
    hint.strokes = [docSolid(DOC.border, 1, iconsChrome.border)];
    hint.strokeWeight = 1;
    hint.cornerRadius = 10;
    hint.paddingTop = 14;
    hint.paddingBottom = 14;
    hint.paddingLeft = 16;
    hint.paddingRight = 16;
    vStack(hint, PANEL_INNER);
    hint.appendChild(wrapText(docText("Insert icons easily to your canvas", 12, "Medium", DOC.text, 1, iconsChrome.text), PANEL_INNER - 32));
    hint.appendChild(wrapText(docText("hold \u21E7 Shift + I, search \u201Cicon/\u201D and press insert \u2014 or drag any glyph from Assets to the canvas", 10.5, "Regular", DOC.muted, 1, iconsChrome.muted), PANEL_INNER - 32));
    panel.appendChild(hint);
    const board = docBoard(
      "docs/board \xB7 Icons",
      "Foundations  /  Icons",
      tokens.project || "Design System",
      PANEL_W
    );
    board.appendChild(panel);
    pg.appendChild(board);
    board.x = MARGIN;
    board.y = TOP;
    {
      const source = iconLibrarySource(libKey, libName);
      const swap = docFrame("docs/icons-swap-panel", "VERTICAL", 20);
      swap.fills = [docSolid(DOC.card, 1, iconsChrome.board)];
      swap.strokes = [docSolid(DOC.border, 1, iconsChrome.border)];
      swap.strokeWeight = 1;
      swap.cornerRadius = 16;
      swap.paddingTop = PANEL_PAD;
      swap.paddingBottom = PANEL_PAD;
      swap.paddingLeft = PANEL_PAD;
      swap.paddingRight = PANEL_PAD;
      vStack(swap, PANEL_W);
      swap.appendChild(docText("Foundations  /  Icons  /  Library", 9, "Regular", DOC.muted, 1, iconsChrome.secondary));
      swap.appendChild(wrapText(docText("Bring your own icons", 22, "Semi Bold", DOC.text, 1, iconsChrome.text), PANEL_INNER));
      const swapIntro = wrapText(docText(
        "Buttons, inputs, alerts and nav rows ship with an empty slot \u2014 circle-dashed or square-dashed \u2014 never a real glyph. Swap the instance for any icon/<library>/\u2026 set from this page or Community.",
        12,
        "Regular",
        DOC.muted,
        1,
        iconsChrome.muted
      ), PANEL_INNER);
      swapIntro.lineHeight = { value: 150, unit: "PERCENT" };
      swap.appendChild(swapIntro);
      const demo = docFrame("slot-specimen", "HORIZONTAL", 16);
      demo.counterAxisAlignItems = "CENTER";
      demo.paddingTop = 14;
      demo.paddingBottom = 14;
      demo.paddingLeft = 16;
      demo.paddingRight = 16;
      demo.cornerRadius = 10;
      demo.fills = [docSolid(DOC.faint, 1, iconsChrome.card)];
      demo.strokes = [docSolid(DOC.border, 1, iconsChrome.border)];
      demo.strokeWeight = 1;
      const paint = docSolid(DOC.text, 1, iconsChrome.text);
      const showPath = (path, label) => {
        const wrap = figma.createFrame();
        wrap.name = label;
        wrap.fills = [];
        wrap.resize(24, 24);
        try {
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="#000000" d="${path}"/></svg>`;
          const glyph = figma.createNodeFromSvg(svg);
          if (glyph.width !== 24) glyph.rescale(24 / glyph.width);
          glyph.name = label;
          for (const n of [glyph, ...glyph.findAll()]) {
            const g = n;
            if ("fills" in g && Array.isArray(g.fills) && g.fills.some((f) => f.type === "SOLID")) {
              try {
                g.fills = [paint];
              } catch (e) {
              }
            }
          }
          wrap.appendChild(glyph);
          glyph.x = 0;
          glyph.y = 0;
        } catch (e) {
        }
        demo.appendChild(wrap);
      };
      showPath(CIRCLE_DASHED_PATH, "circle-dashed");
      showPath(SQUARE_DASHED_PATH, "square-dashed");
      demo.appendChild(wrapText(docText(
        "Select the nested circle-dashed / square-dashed instance \u2192 Swap instance \u2192 pick icon/<library>/\u2026",
        10.5,
        "Regular",
        DOC.muted,
        1,
        iconsChrome.muted
      ), PANEL_INNER - 32 - 72));
      swap.appendChild(demo);
      swap.appendChild(docDivider("HOW TO"));
      const steps = docFrame("steps", "VERTICAL", 14);
      docBullet(
        steps,
        `1 \xB7 Open ${libName || "your icon library"} in the Community`,
        "Follow the link below, then \u201COpen in Figma\u201D \u2014 it lands as a separate file you can copy from."
      );
      docBullet(
        steps,
        "2 \xB7 Or use the sets on this page",
        libCount > 0 ? `The ${libCount} glyphs above are already components \u2014 right-click the placeholder instance \u2192 \u201CSwap instance\u201D and pick one of icon/${libKey}/\u2026` : "Once a library is selected in the configurator, its core set is imported here as swappable components."
      );
      docBullet(
        steps,
        "3 \xB7 Swap the placeholder",
        "Inside a component, select the nested circle-dashed or square-dashed instance and swap it for the glyph you need. Masters live on \u2B21 Icon Placeholders."
      );
      docBullet(
        steps,
        "4 \xB7 Paste from Community if you prefer",
        "Select a glyph in the Community file, \u2318C / Ctrl+C, paste over the placeholder, then delete the old instance."
      );
      swap.appendChild(steps);
      swap.appendChild(docDivider("SOURCE"));
      const linkBox = docFrame("community-link", "VERTICAL", 6);
      linkBox.fills = [docSolid(DOC.faint, 1, iconsChrome.card)];
      linkBox.strokes = [docSolid(DOC.border, 1, iconsChrome.border)];
      linkBox.strokeWeight = 1;
      linkBox.cornerRadius = 10;
      linkBox.paddingTop = 14;
      linkBox.paddingBottom = 14;
      linkBox.paddingLeft = 16;
      linkBox.paddingRight = 16;
      vStack(linkBox, PANEL_INNER);
      linkBox.appendChild(wrapText(docText(source.label, 12, "Medium", DOC.text, 1, iconsChrome.text), PANEL_INNER - 32));
      const url = wrapText(docText(source.url, 10.5, "Regular", accent, 1, iconsChrome.accentText), PANEL_INNER - 32);
      try {
        url.hyperlink = { type: "URL", value: source.url };
      } catch (e) {
      }
      linkBox.appendChild(url);
      swap.appendChild(linkBox);
      const swapBoard = docBoard(
        "docs/board \xB7 Icons \u2014 Library",
        "Foundations  /  Icons  /  Library",
        tokens.project || "Design System",
        PANEL_W
      );
      swapBoard.appendChild(swap);
      pg.appendChild(swapBoard);
      swapBoard.x = MARGIN;
      swapBoard.y = TOP + Math.ceil(board.height) + 64;
    }
    if (prevPage !== pg) {
      try {
        await figma.setCurrentPageAsync(prevPage);
      } catch (e) {
      }
    }
    return created;
  }
  async function importGettingStarted(tokens) {
    var _a;
    const PAGE = "\u2B21 Getting started";
    const project = tokens.project || "Design System";
    const SITE = "www.escalatokens.com";
    const REPO = "https://github.com/Duscenko/escala-tokens";
    const slug = project.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "design-system";
    const allVars = await figma.variables.getLocalVariablesAsync();
    const allCols = await figma.variables.getLocalVariableCollectionsAsync();
    const chrome = docChromeVarsFrom(semLookupFor(tokens, allVars, allCols));
    const modePin = docModePin(tokens, allCols);
    const typo = await typoVarMap();
    const fontFamily = ((_a = tokens.typography) == null ? void 0 : _a.fontFamily) || "Inter";
    const loaded = /* @__PURE__ */ new Set();
    for (const style of ["Regular", "Medium", "Semi Bold", "Bold"]) {
      try {
        await figma.loadFontAsync({ family: fontFamily, style });
        loaded.add(style);
      } catch (e) {
        try {
          await figma.loadFontAsync({ family: "Inter", style });
        } catch (e2) {
        }
      }
    }
    const fontFor = (s) => loaded.has(s) ? { family: fontFamily, style: s } : { family: "Inter", style: s };
    const { docSolid, docText, docFrame, wrapText, docBoard } = docChrome(fontFor, typo, tokens.typography.sizes, chrome, modePin);
    let page = figma.root.children.find((p) => p.name === PAGE);
    if (!page) {
      page = figma.createPage();
      page.name = PAGE;
    } else {
      await page.loadAsync();
      for (const child of [...page.children]) child.remove();
    }
    const pg = page;
    try {
      pg.backgrounds = [docSolid(DOC.page)];
    } catch (e) {
    }
    pinToLightMode(pg, modePin);
    const W = 640;
    const GAP = 96;
    let x = 120;
    function h2(parent, s) {
      parent.appendChild(wrapText(docText(s, 26, "Semi Bold", DOC.text, 1, chrome.text), W));
    }
    function para(parent, s) {
      const t = wrapText(docText(s, 13, "Regular", DOC.muted, 1, chrome.muted), W);
      t.lineHeight = { value: 155, unit: "PERCENT" };
      parent.appendChild(t);
    }
    function bullet(parent, title, desc, link) {
      const b = docFrame(`b-${title.toLowerCase().replace(/\W+/g, "-")}`, "VERTICAL", 4);
      b.appendChild(wrapText(docText(title, 13, "Medium", DOC.text, 1, chrome.text), W));
      const d = wrapText(docText(desc, 12, "Regular", DOC.muted, 1, chrome.muted), W);
      d.lineHeight = { value: 150, unit: "PERCENT" };
      if (link) {
        try {
          d.hyperlink = { type: "URL", value: link };
        } catch (e) {
        }
      }
      b.appendChild(d);
      parent.appendChild(b);
    }
    function divider(parent) {
      const r = figma.createFrame();
      r.name = "rule";
      r.resize(W, 1);
      r.fills = [docSolid(DOC.border, 1, chrome.border)];
      parent.appendChild(r);
      r.layoutSizingHorizontal = "FILL";
    }
    function board(barLabel, build) {
      const b = docBoard(`docs/gs \xB7 ${barLabel}`, `Getting started  /  ${barLabel}`, project, W);
      const body = docFrame("body", "VERTICAL", 16);
      vStack(body, W);
      b.appendChild(body);
      build(body);
      pg.appendChild(b);
      b.x = x;
      b.y = 120;
      x += Math.ceil(b.width) + GAP;
      return b;
    }
    board("Introduction", (body) => {
      h2(body, "This file is generated");
      para(body, `Every page here is built by the Escala plugin from a single payload published by Escala Tokens (${SITE}) \u2014 a configurator for design-token systems. You define a palette, type scale, spacing, radius and the rest once; Escala derives the full scales, keeps light and dark in step, and ships tokens.json, variables.css, a README and this Figma file, all from that one payload.`);
      para(body, "Nothing here is drawn by hand. Every fill, radius, gap and text style binds to a Figma Variable, so a re-sync updates the file in place and switching a variable mode previews a theme.");
      divider(body);
      bullet(body, "Source", `${REPO.replace("https://", "")} \u2014 MIT licence`, REPO);
    });
    board("Where this comes from", (body) => {
      h2(body, "Where this comes from");
      para(body, "Escala Tokens is the source of truth. It publishes your system as tokens.json to a per-project URL; the plugin fetches that JSON and writes it into this file as Variables, styles, components and docs.");
      divider(body);
      bullet(body, "1 \xB7 Configure", `${SITE} \u2014 edit the system on the web. Every export derives from one payload.`);
      bullet(body, "2 \xB7 Publish", `${SITE}/api/tokens?project=${slug} \u2014 the web app POSTs tokens.json to this scoped URL. This is the sync channel.`);
      bullet(body, "3 \xB7 Import", "This plugin. Paste the URL once; it reads the JSON and builds the file.");
      bullet(body, "4 \xB7 Live sync (optional)", "With auto-sync on, a web edit re-publishes and the plugin re-imports variables + styles ~1.5s after you stop.");
    });
    board("Two ways to work", (body) => {
      h2(body, "Two ways to work");
      para(body, "How you consume this file depends on how you plan to use the system.");
      divider(body);
      bullet(body, "Option 1 \xB7 Design inside this file", "Use it directly for exploration and early concepts. Simple, but it mixes system maintenance with product work \u2014 less suited to long-term product design.");
      bullet(body, "Option 2 \xB7 Publish as a library (recommended)", "Publish this file as a Figma library and build product screens in separate files. The system stays isolated and stable; product files stay light. Library updates are reviewed and applied selectively, so a product stays aligned without surprise breakage.");
    });
    board("The plugin & the JSON", (body) => {
      h2(body, "The plugin & the JSON");
      para(body, "An Import runs up to six phases \u2014 Variables, Styles, Components, Icons, Cover, Documentation. Each is independent: one failing never blocks the others.");
      para(body, "A Live Sync is not a full import. It refreshes Variables and Styles only, never pages. Everything the plugin draws is variable-bound, so updating the variables re-themes every placed instance automatically. New components, the cover and these boards come from a manual Import.");
      divider(body);
      bullet(body, "Sync URL", `${SITE}/api/tokens?project=${slug} \u2014 GET is public (that's what the plugin reads); POST is the web app only.`);
    });
    board("Save to GitHub", (body) => {
      h2(body, "Save to GitHub");
      para(body, "The sync URL is a delivery channel, not a backup. Treat it as disposable and keep the durable copy in a repo.");
      divider(body);
      bullet(body, "The slug is the project name", `Renaming the system changes its slug (${slug}) and its sync URL. Old links stop resolving.`);
      bullet(body, "The write key is local", "The first publish returns a claim, stored in that browser's localStorage. Clear the browser or move machines and you can no longer overwrite that slug.");
      bullet(body, "GitHub is the durable copy", "Pushing to a repo writes .escala/system.json \u2014 the full system plus the claim. It is the only way to recover the system, and its write access, from another machine or after a browser reset, and what future previews and updates should build from.");
    });
    board("Naming conventions", (body) => {
      h2(body, "Naming conventions");
      para(body, "Names describe intent, not appearance, so the system can change visually without a rename.");
      divider(body);
      bullet(body, "Primitives \u2014 1 to 12", "Every colour family is a 12-step Radix ramp: accent-1 \u2026 accent-12. Step 9 is the anchor (your input hex); 11\u201312 are the accessible text tones. Never referenced by a component directly.");
      bullet(body, "Semantics \u2014 by role", "Surface/page, Content/primary, Action/primary/default, Border/control \u2014 a role names what a value is for. Components bind here.");
      bullet(body, "One collection per category", "Color Primitives, Color Semantics, Typography, Spacing, Radius, Size, Selector, Border, Grid \u2014 each its own Figma collection. Color Semantics (and foundations that differ per theme) carry a mode per library theme.");
    });
    board("How this file is organized", (body) => {
      h2(body, "How this file is organized");
      para(body, "Pages run from foundational to applied \u2014 the same order the system is built in.");
      divider(body);
      bullet(body, "Getting started", "This page.");
      bullet(body, "Documentation", "Every foundation \u2014 colour, type, spacing, radius, shadow, grid, sizes \u2014 as live specimens bound to the variables.");
      bullet(body, "Components \xB7 <category>", "One page per catalogue category: Button & Actions, Form Controls, Indicators, Content & Surfaces, Feedback, Navigation. Splitting by role keeps each page scannable; every element is a documented, token-bound component set.");
      bullet(body, "Icons", "The chosen icon library as swappable components, plus how to bring your own.");
    });
    board("Repository & licence", (body) => {
      h2(body, "Repository & licence");
      para(body, "Escala Tokens and its source are the work of Cesar Durango.");
      divider(body);
      bullet(body, "GitHub", REPO.replace("https://", ""), REPO);
      bullet(body, "Licence", "MIT \xB7 \xA9 2026 Duscenko");
      bullet(body, "Contact", "duscenko.com");
    });
    log(`\u2713 Getting started page rebuilt on "${PAGE}" (8 boards)`);
    return true;
  }
  async function importCover(tokens) {
    var _a, _b, _c, _d, _e, _f;
    namingCtx = tokens;
    const project = tokens.project || "Design System";
    const coverType = previewTypography(tokens);
    const headingFamily = coverType.headingFontFamily || coverType.fontFamily || "Inter";
    const bodyFamily = coverType.fontFamily || "Inter";
    const loaded = /* @__PURE__ */ new Set();
    async function loadFont(family, style) {
      const key = `${family}:${style}`;
      if (!loaded.has(key)) {
        try {
          await figma.loadFontAsync({ family, style });
        } catch (e) {
          await figma.loadFontAsync({ family: "Inter", style });
          loaded.add(`Inter:${style}`);
          return { family: "Inter", style };
        }
        loaded.add(key);
      }
      return { family, style };
    }
    const headingFont = await loadFont(headingFamily, "Bold");
    const bodyFont = await loadFont(bodyFamily, "Regular");
    const mediumFont = await loadFont(bodyFamily, "Medium");
    const gradient = assignedGradient(tokens, "cover");
    const prim = tokens.colors.primitive;
    const tone = (fam, tones) => {
      for (const t of tones) {
        const hex = prim[`${fam}-${t}`];
        if (hex) return hex;
      }
      return void 0;
    };
    const brandFam = brandFamilyFromTokens(tokens);
    const deep = (_a = tone(brandFam, ["12", "1000", "11", "900"])) != null ? _a : "#111114";
    const solidTone = (_b = tone(brandFam, ["9", "600", "8", "500"])) != null ? _b : "#3B82F6";
    const fallback = {
      type: "GRADIENT_LINEAR",
      gradientStops: [
        { color: hexToRgba(deep), position: 0 },
        { color: hexToRgba(solidTone), position: 1 }
      ],
      gradientTransform: (() => {
        const rad = (135 - 90) * Math.PI / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        return [
          [cos, sin, 0.5 - 0.5 * cos - 0.5 * sin],
          [-sin, cos, 0.5 + 0.5 * sin - 0.5 * cos]
        ];
      })()
    };
    const bg = gradient != null ? gradient : fallback;
    let lum = 0;
    for (const s of bg.gradientStops) lum += 0.2126 * s.color.r + 0.7152 * s.color.g + 0.0722 * s.color.b;
    lum /= bg.gradientStops.length;
    const inkHex = lum < 0.55 ? "#FFFFFF" : "#18181B";
    const ink = (opacity = 1) => ({ type: "SOLID", color: hexToRgb(inkHex), opacity });
    let page = figma.root.children.find((p) => p.name === "\u2B21 Cover");
    if (!page) {
      page = figma.createPage();
      page.name = "\u2B21 Cover";
    } else {
      await page.loadAsync();
      for (const child of [...page.children]) child.remove();
    }
    const frame = figma.createFrame();
    frame.name = `${project} \u2014 Cover`;
    frame.resize(1600, 900);
    frame.fills = [bg];
    const coverSlug = (_c = tokens.gradientAssignments) == null ? void 0 : _c.cover;
    if (coverSlug && gradient) {
      const styleName = `Gradient/${coverSlug}`;
      const style = (await figma.getLocalPaintStylesAsync()).find((s) => s.name === styleName);
      if (style) {
        try {
          await frame.setFillStyleIdAsync(style.id);
        } catch (e) {
        }
      }
    }
    frame.cornerRadius = 0;
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisAlignItems = "SPACE_BETWEEN";
    frame.paddingTop = 72;
    frame.paddingBottom = 72;
    frame.paddingLeft = 96;
    frame.paddingRight = 96;
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "FIXED";
    page.appendChild(frame);
    const coverTypo = await typoVarMap();
    function text(chars, font, size, opacity = 1) {
      const t = figma.createText();
      t.fontName = font;
      t.characters = chars;
      t.fontSize = size;
      t.fills = [ink(opacity)];
      bindAllTextFields(t, coverTypo, {
        sizeKey: nearestTypeSizeKey(tokens.typography.sizes, size),
        weightKey: font.style === "Bold" || font.style === "Semi Bold" ? "semibold" : "regular",
        heading: size >= 28
      });
      return t;
    }
    const top = figma.createFrame();
    top.name = "cover__top";
    top.layoutMode = "HORIZONTAL";
    top.primaryAxisSizingMode = "FIXED";
    top.counterAxisSizingMode = "AUTO";
    top.layoutAlign = "STRETCH";
    top.resize(1600 - 192, 40);
    top.primaryAxisAlignItems = "SPACE_BETWEEN";
    top.counterAxisAlignItems = "CENTER";
    top.fills = [];
    top.appendChild(text(`\u2B21 ${project}`, mediumFont, 20));
    const chip = figma.createFrame();
    chip.name = "cover__version";
    chip.layoutMode = "HORIZONTAL";
    chip.primaryAxisSizingMode = "AUTO";
    chip.counterAxisSizingMode = "AUTO";
    chip.paddingLeft = 14;
    chip.paddingRight = 14;
    chip.paddingTop = 6;
    chip.paddingBottom = 6;
    chip.cornerRadius = 999;
    chip.fills = [];
    chip.strokes = [ink(0.4)];
    chip.strokeWeight = 1;
    chip.appendChild(text("DESIGN SYSTEM \xB7 v1.0", mediumFont, 12, 0.9));
    top.appendChild(chip);
    frame.appendChild(top);
    const mid = figma.createFrame();
    mid.name = "cover__title";
    mid.layoutMode = "VERTICAL";
    mid.itemSpacing = 20;
    mid.layoutAlign = "STRETCH";
    mid.primaryAxisSizingMode = "AUTO";
    mid.counterAxisSizingMode = "FIXED";
    mid.resize(1600 - 192, mid.height);
    mid.fills = [];
    const eyebrow = text("FOUNDATIONS \xB7 TOKENS \xB7 COMPONENTS", mediumFont, 14, 0.75);
    eyebrow.letterSpacing = { value: 3, unit: "PIXELS" };
    mid.appendChild(eyebrow);
    const title = text(project, headingFont, 128);
    title.resize(1600 - 192, title.height);
    title.textAutoResize = "HEIGHT";
    mid.appendChild(title);
    const themeCount = Object.keys((_d = tokens.colors.themes) != null ? _d : {}).length || (tokens.colors.semanticDark ? 2 : 1);
    const famCount = new Set(
      Object.keys(prim).map((k) => k.includes("-") ? k.slice(0, k.lastIndexOf("-")) : k)
    ).size;
    const atoms = (_f = (_e = tokens.atoms) != null ? _e : tokens.components) != null ? _f : [];
    const sub = text(
      `${famCount} color families \xB7 ${themeCount} theme${themeCount === 1 ? "" : "s"} \xB7 ${atoms.length} components \u2014 synced from the configurator`,
      bodyFont,
      18,
      0.85
    );
    mid.appendChild(sub);
    frame.appendChild(mid);
    const bottom = figma.createFrame();
    bottom.name = "cover__bottom";
    bottom.layoutMode = "HORIZONTAL";
    bottom.primaryAxisSizingMode = "FIXED";
    bottom.counterAxisSizingMode = "AUTO";
    bottom.layoutAlign = "STRETCH";
    bottom.resize(1600 - 192, 24);
    bottom.primaryAxisAlignItems = "SPACE_BETWEEN";
    bottom.counterAxisAlignItems = "CENTER";
    bottom.fills = [];
    bottom.appendChild(text("escalatokens.com", bodyFont, 14, 0.75));
    const now = /* @__PURE__ */ new Date();
    bottom.appendChild(text(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      bodyFont,
      14,
      0.6
    ));
    frame.appendChild(bottom);
    try {
      await figma.setFileThumbnailNodeAsync(frame);
    } catch (e) {
    }
    log(`\u2713 Cover page rebuilt on "\u2B21 Cover"${gradient ? " (using the assigned cover gradient)" : ""}`);
    return true;
  }
  function rgbToHexStr(c) {
    const to = (n) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, "0");
    const base = `#${to(c.r)}${to(c.g)}${to(c.b)}`;
    const a = "a" in c ? c.a : 1;
    return a >= 1 ? base : `${base}${to(a)}`;
  }
  async function exportVariablesJson() {
    const allCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const skipped = allCollections.filter((c) => !PLUGIN_COLLECTION_NAMES.has(c.name)).map((c) => c.name);
    if (skipped.length > 0) {
      log(`\u2139 Export skipped ${skipped.length} collection${skipped.length > 1 ? "s" : ""} not from this plugin (${skipped.slice(0, 4).join(", ")}${skipped.length > 4 ? "\u2026" : ""}) \u2014 leftover names like a previous project are not the synced system`);
    }
    const collections = allCollections.filter((c) => PLUGIN_COLLECTION_NAMES.has(c.name));
    const variables = await figma.variables.getLocalVariablesAsync();
    const varById = new Map(variables.map((v) => [v.id, v]));
    const colById = new Map(collections.map((c) => [c.id, c]));
    const pendingIds = [];
    const seenIds = /* @__PURE__ */ new Set();
    const enqueueAlias = (value) => {
      if (typeof value === "object" && value !== null && "type" in value && value.type === "VARIABLE_ALIAS" && !varById.has(value.id) && !seenIds.has(value.id)) {
        seenIds.add(value.id);
        pendingIds.push(value.id);
      }
    };
    for (const v of variables) for (const raw of Object.values(v.valuesByMode)) enqueueAlias(raw);
    while (pendingIds.length > 0) {
      const id = pendingIds.pop();
      try {
        const v = await figma.variables.getVariableByIdAsync(id);
        if (!v) continue;
        varById.set(v.id, v);
        if (!colById.has(v.variableCollectionId)) {
          const c = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
          if (c) colById.set(c.id, c);
        }
        for (const raw of Object.values(v.valuesByMode)) enqueueAlias(raw);
      } catch (e) {
      }
    }
    function resolve(value, modeId, depth = 0) {
      var _a;
      if (typeof value === "object" && value !== null && "type" in value && value.type === "VARIABLE_ALIAS") {
        const target = varById.get(value.id);
        if (!target || depth > 10) return { value: null };
        const tCol = colById.get(target.variableCollectionId);
        const tModeId = (tCol == null ? void 0 : tCol.modes.some((m) => m.modeId === modeId)) ? modeId : tCol == null ? void 0 : tCol.defaultModeId;
        const raw = tModeId !== void 0 ? target.valuesByMode[tModeId] : void 0;
        const inner = raw === void 0 ? { value: null } : resolve(raw, tModeId, depth + 1);
        return { value: inner.value, alias: `${(_a = tCol == null ? void 0 : tCol.name) != null ? _a : "?"} / ${target.name}` };
      }
      if (typeof value === "object" && value !== null && "r" in value) return { value: rgbToHexStr(value) };
      return { value };
    }
    let total = 0;
    const out = {
      source: "Escala DS Sync \u2014 Figma plugin",
      file: figma.root.name,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      collections: collections.map((col) => {
        const modeName = /* @__PURE__ */ new Map();
        const used = /* @__PURE__ */ new Set();
        for (const m of col.modes) {
          let n = m.name || "Mode";
          let i = 2;
          while (used.has(n)) n = `${m.name} (${i++})`;
          used.add(n);
          modeName.set(m.modeId, n);
        }
        const colVars = variables.filter((v) => v.variableCollectionId === col.id);
        total += colVars.length;
        return {
          name: col.name,
          modes: col.modes.map((m) => modeName.get(m.modeId)),
          variables: colVars.map((v) => {
            const values = {};
            const aliasOf = {};
            for (const m of col.modes) {
              const raw = v.valuesByMode[m.modeId];
              const r = raw === void 0 ? { value: null } : resolve(raw, m.modeId);
              values[modeName.get(m.modeId)] = r.value;
              if (r.alias) aliasOf[modeName.get(m.modeId)] = r.alias;
            }
            const entry = { name: v.name, type: v.resolvedType, values };
            if (Object.keys(aliasOf).length > 0) entry.aliasOf = aliasOf;
            if (v.description) entry.description = v.description;
            return entry;
          })
        };
      })
    };
    return { data: out, total };
  }
  figma.showUI(__html__, { width: 880, height: 620, themeColors: true });
  var COMPONENT_CATEGORY_ORDER = [
    "Button & Actions",
    "Form Controls",
    "Indicators",
    "Content & Surfaces",
    "Feedback",
    "Navigation"
  ];
  function ensureFoundationPageOrder() {
    let idx = 0;
    const place = (p) => {
      if (p) figma.root.insertChild(idx++, p);
    };
    const byName = (name) => figma.root.children.find((p) => p.name === name);
    place(byName("\u2B21 Cover"));
    place(byName("\u2B21 Documentation"));
    place(byName("\u2B21 Getting started"));
    place(byName("\u2B21 Components Overview"));
    for (const cat of COMPONENT_CATEGORY_ORDER) place(byName(`\u2B21 Components \xB7 ${cat}`));
    for (const p of figma.root.children.filter(
      (p2) => p2.name.startsWith("\u2B21 Components \xB7 ") && !COMPONENT_CATEGORY_ORDER.some((c) => p2.name === `\u2B21 Components \xB7 ${c}`)
    )) place(p);
    place(byName("\u2B21 Icon Placeholders"));
    place(byName("\u2B21 Icons"));
  }
  ensureFoundationPageOrder();
  var SETTINGS_KEY = "sd-sync-settings";
  var FILE_TOKENS_KEY = "sd-file-tokens";
  var FILE_PROJECTS_KEY = "sd-file-projects";
  var FILE_SYNC_KEY = "sd-file-sync";
  function readFileTokens() {
    try {
      const raw = figma.root.getPluginData(FILE_TOKENS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && parsed.tokens ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  function readImportedProjects() {
    try {
      const raw = figma.root.getPluginData(FILE_PROJECTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string" && x.length > 0) : [];
    } catch (e) {
      return [];
    }
  }
  function rememberImportedProject(name) {
    if (!name) return;
    const prev = readImportedProjects();
    if (prev.includes(name)) return;
    try {
      figma.root.setPluginData(FILE_PROJECTS_KEY, JSON.stringify([...prev, name].slice(-12)));
    } catch (e) {
    }
  }
  function leftoverProjectNames(currentProject) {
    var _a;
    const names = /* @__PURE__ */ new Set();
    if (currentProject) names.add(currentProject);
    const stored = (_a = readFileTokens()) == null ? void 0 : _a.tokens.project;
    if (stored) names.add(stored);
    for (const p of readImportedProjects()) names.add(p);
    return [...names];
  }
  function inheritedStylePrefix(name) {
    const parts = name.split("/");
    if (parts.length < 2) return null;
    if (PLUGIN_STYLE_ROOTS.has(parts[0])) return null;
    if (INHERITED_STYLE_FOLDERS.includes(parts[1])) return parts[0];
    return null;
  }
  async function scanInheritedStylePrefixes() {
    const found = /* @__PURE__ */ new Set();
    const note = (name) => {
      const p = inheritedStylePrefix(name);
      if (p) found.add(p);
    };
    try {
      for (const s of await figma.getLocalTextStylesAsync()) note(s.name);
    } catch (e) {
    }
    try {
      for (const s of await figma.getLocalPaintStylesAsync()) note(s.name);
    } catch (e) {
    }
    try {
      for (const s of await figma.getLocalEffectStylesAsync()) note(s.name);
    } catch (e) {
    }
    try {
      for (const s of await figma.getLocalGridStylesAsync()) note(s.name);
    } catch (e) {
    }
    return [...found];
  }
  async function removeInheritedStyles() {
    let dropped = 0;
    const drop = (s) => {
      if (!inheritedStylePrefix(s.name)) return;
      try {
        s.remove();
        dropped++;
      } catch (e) {
      }
    };
    for (const s of await figma.getLocalTextStylesAsync()) drop(s);
    for (const s of await figma.getLocalPaintStylesAsync()) drop(s);
    for (const s of await figma.getLocalEffectStylesAsync()) drop(s);
    try {
      for (const s of await figma.getLocalGridStylesAsync()) drop(s);
    } catch (e) {
    }
    return dropped;
  }
  function readDocsRev() {
    const n = parseInt(figma.root.getPluginData(FILE_DOCS_REV_KEY) || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }
  function writeDocsRev() {
    try {
      figma.root.setPluginData(FILE_DOCS_REV_KEY, String(DOCS_REV));
    } catch (e) {
    }
  }
  async function purgeInheritedCollections(currentProject) {
    const prefixes = /* @__PURE__ */ new Set([
      ...leftoverProjectNames(currentProject),
      ...await scanInheritedStylePrefixes()
    ]);
    if (currentProject.trim().toLowerCase() !== "jasdy") prefixes.add("Jasdy");
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const vars = await figma.variables.getLocalVariablesAsync();
    const protectedNames = /* @__PURE__ */ new Set([...Object.values(COLLECTIONS), ...Object.values(ARCH_LABEL)]);
    for (const col of cols) {
      if (protectedNames.has(col.name)) continue;
      const named = prefixes.has(col.name) || LEGACY_COLLECTIONS.indexOf(col.name) !== -1;
      const looksLikeLegacyDump = vars.some(
        (v) => v.variableCollectionId === col.id && v.resolvedType === "COLOR" && /^(Accent|Neutral|State)\//.test(v.name)
      );
      if (!named && !looksLikeLegacyDump) continue;
      const mine = vars.filter((v) => v.variableCollectionId === col.id);
      let droppedVars = 0;
      for (const v of mine) {
        try {
          v.remove();
          droppedVars++;
        } catch (e) {
        }
      }
      try {
        col.remove();
        log(`\u2713 Removed leftover "${col.name}" collection (${droppedVars} variables) after docs rebound`);
      } catch (e) {
        log(`\u26A0 Leftover "${col.name}" still referenced \u2014 removed ${droppedVars}/${mine.length} variables`);
      }
    }
  }
  function writeFileTokens(tokens) {
    try {
      const record = { tokens, importedAt: (/* @__PURE__ */ new Date()).toISOString() };
      figma.root.setPluginData(FILE_TOKENS_KEY, JSON.stringify(record));
      rememberImportedProject(tokens.project);
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      log(`\u26A0 Could not save this file's system for later (${m}) \u2014 the import itself is unaffected.`);
    }
  }
  function readFileSync() {
    try {
      const raw = figma.root.getPluginData(FILE_SYNC_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && typeof parsed.url === "string" ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  function writeFileSync(url, autoStart) {
    try {
      const record = { url, autoStart };
      figma.root.setPluginData(FILE_SYNC_KEY, JSON.stringify(record));
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      log(`\u26A0 Could not save this file's sync connection (${m}).`);
    }
  }
  function resetFile() {
    figma.root.setPluginData(FILE_TOKENS_KEY, "");
    figma.root.setPluginData(FILE_SYNC_KEY, "");
    figma.root.setPluginData(FILE_PROJECTS_KEY, "");
    figma.root.setPluginData(FILE_DOCS_REV_KEY, "");
    figma.root.setPluginData(FILE_SEM_ORDER_STUCK_KEY, "");
    figma.root.setPluginData(FILE_INHERITED_BLOCKED_KEY, "");
    figma.root.setPluginData(FILE_PROJECT_NAME_KEY, "");
  }
  async function collectLocalEdits(baseline) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    namingCtx = baseline;
    const rejected = [];
    const supported = {};
    let supportedCount = 0;
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const allVars = await figma.variables.getLocalVariablesAsync();
    const byColl = /* @__PURE__ */ new Map();
    for (const v of allVars) {
      const list = (_a = byColl.get(v.variableCollectionId)) != null ? _a : [];
      list.push(v);
      byColl.set(v.variableCollectionId, list);
    }
    const typoCol = cols.find((c) => c.name === COLLECTIONS.typography);
    if (typoCol) {
      const typoVars = (_b = byColl.get(typoCol.id)) != null ? _b : [];
      const knownPrefix = (name) => {
        const base = name.split("#")[0];
        return base === TYPOGRAPHY_FAMILY_VARS.body || base === TYPOGRAPHY_FAMILY_VARS.display || base === TYPOGRAPHY_FAMILY_VARS.legacyBody || base === TYPOGRAPHY_FAMILY_VARS.legacyDisplay || base.startsWith("size/") || base.startsWith("weight/") || base.startsWith("line-height/") || base.startsWith("letter-spacing/") || base.startsWith("role/");
      };
      for (const v of typoVars) {
        if (!knownPrefix(v.name)) {
          rejected.push({
            kind: "new-variable",
            detail: `Typography/${v.name} \u2014 new variables aren't system settings; add them in Escala first.`
          });
        }
      }
      const bodyVar = typoVars.find((v) => v.name === TYPOGRAPHY_FAMILY_VARS.body || v.name === TYPOGRAPHY_FAMILY_VARS.legacyBody);
      const displayVar = typoVars.find((v) => v.name === TYPOGRAPHY_FAMILY_VARS.display || v.name === TYPOGRAPHY_FAMILY_VARS.legacyDisplay);
      const mid = typoCol.defaultModeId;
      const bodyNow = bodyVar ? varStringAt(bodyVar, mid) : void 0;
      const displayNow = displayVar ? varStringAt(displayVar, mid) : void 0;
      const firstTheme = ((_c = baseline.colors.themeOrder) != null ? _c : [])[0];
      const bodyWant = normalizeFontFamilyName(
        firstTheme && ((_f = (_e = (_d = baseline.foundationsByTheme) == null ? void 0 : _d[firstTheme]) == null ? void 0 : _e.typography) == null ? void 0 : _f.fontFamily) || ((_g = baseline.typography) == null ? void 0 : _g.fontFamily)
      );
      const displayWant = normalizeFontFamilyName(
        firstTheme && ((_j = (_i = (_h = baseline.foundationsByTheme) == null ? void 0 : _h[firstTheme]) == null ? void 0 : _i.typography) == null ? void 0 : _j.headingFontFamily) || ((_k = baseline.typography) == null ? void 0 : _k.headingFontFamily) || bodyWant
      );
      if (bodyNow && normalizeFontFamilyName(bodyNow) !== bodyWant) {
        supported.typography = __spreadProps(__spreadValues({}, supported.typography), { fontFamily: normalizeFontFamilyName(bodyNow) });
        supportedCount++;
      }
      if (displayNow && normalizeFontFamilyName(displayNow) !== displayWant) {
        supported.typography = __spreadProps(__spreadValues({}, supported.typography), { headingFontFamily: normalizeFontFamilyName(displayNow) });
        supportedCount++;
      }
    }
    const TONE9_LABELS = ["9", "700", "90"];
    const PRIMITIVE_FAMILY_FIELD = {
      accent: "primaryColor",
      error: "errorColor",
      warning: "warningColor",
      success: "successColor",
      info: "infoColor"
    };
    const primCol = cols.find((c) => c.name === COLLECTIONS.primitives);
    if (primCol) {
      const primVars = (_l = byColl.get(primCol.id)) != null ? _l : [];
      const primByName = new Map(primVars.map((v) => [v.name, v]));
      const mid = primCol.defaultModeId;
      const primitives = (_n = (_m = baseline.colors) == null ? void 0 : _m.primitive) != null ? _n : {};
      const colorAt = (v) => {
        const raw = v.valuesByMode[mid];
        if (!raw || typeof raw !== "object" || !("r" in raw)) return void 0;
        return rgbaToHex(raw);
      };
      for (const [family, field] of Object.entries(PRIMITIVE_FAMILY_FIELD)) {
        const baseKey = TONE9_LABELS.map((t) => `${family}-${t}`).find((k) => typeof primitives[k] === "string");
        if (!baseKey) continue;
        const wantHex = normHex(primitives[baseKey]);
        const v = primByName.get(primitiveVarName(baseKey));
        const nowHex = v && colorAt(v);
        if (nowHex && nowHex !== wantHex) {
          supported.primitives = __spreadProps(__spreadValues({}, supported.primitives), { [field]: nowHex });
          supportedCount++;
        }
        for (const [key, hex] of Object.entries(primitives)) {
          if (!key.startsWith(`${family}-`) || key === baseKey) continue;
          const kv = primByName.get(primitiveVarName(key));
          const kNow = kv && colorAt(kv);
          if (kNow && typeof hex === "string" && kNow !== normHex(hex)) {
            rejected.push({
              kind: "unsupported-value",
              detail: `Colors Primitives/${primitiveVarName(key)} \u2014 only the family's anchor tone (${primitiveVarName(baseKey)}) round-trips; every other step is derived from it in Escala.`
            });
          }
        }
      }
    }
    for (const pg of figma.root.children) {
      if (pg.type !== "PAGE" || pg.name.startsWith("\u2B21")) continue;
      try {
        await pg.loadAsync();
      } catch (e) {
        continue;
      }
      const sets = pg.findAll((n) => n.type === "COMPONENT_SET");
      for (const s of sets) {
        rejected.push({
          kind: "new-component",
          detail: `"${s.name}" on page "${pg.name}" \u2014 components aren't read into Escala's catalogue. Add a plugin gate first.`
        });
      }
    }
    return {
      kind: "escala-figma-edits/v1",
      project: baseline.project || "design-system",
      checkedAt: (/* @__PURE__ */ new Date()).toISOString(),
      supported,
      rejected,
      summary: { supported: supportedCount, rejected: rejected.length }
    };
  }
  async function reportFileAssets() {
    const names = new Set(figma.root.children.map((p) => p.name.trim()));
    let variables = 0;
    let collections = 0;
    try {
      variables = (await figma.variables.getLocalVariablesAsync()).length;
      collections = (await figma.variables.getLocalVariableCollectionsAsync()).length;
    } catch (e) {
    }
    let sample = false;
    for (const pg of figma.root.children) {
      const n = pg.name.trim();
      if (n !== "\u2B21 Components Overview" && !n.startsWith("\u2B21 Components \xB7 ")) continue;
      try {
        await pg.loadAsync();
        if (pg.children.some(
          (ch) => ch.type === "COMPONENT_SET" || ch.type === "COMPONENT" || ch.type === "FRAME" && /^\d{2} · /.test(ch.name)
        )) {
          sample = true;
          break;
        }
      } catch (e) {
      }
    }
    return {
      cover: names.has("\u2B21 Cover"),
      documentation: names.has("\u2B21 Documentation"),
      gettingStarted: names.has("\u2B21 Getting started"),
      sample,
      icons: names.has("\u2B21 Icons"),
      variables,
      collections
    };
  }
  figma.ui.onmessage = async (msg) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (msg.type === "ping") {
      figma.ui.postMessage({ type: "pong" });
      return;
    }
    if (msg.type === "load-settings") {
      const settings = await figma.clientStorage.getAsync(SETTINGS_KEY);
      const record = readFileTokens();
      const fileSync = readFileSync();
      figma.ui.postMessage({
        type: "settings",
        settings: settings != null ? settings : null,
        hasTokens: !!record,
        tokens: (_a = record == null ? void 0 : record.tokens) != null ? _a : null,
        tokensImportedAt: (_b = record == null ? void 0 : record.importedAt) != null ? _b : null,
        fileSync: fileSync != null ? fileSync : null,
        assets: await reportFileAssets()
      });
      return;
    }
    if (msg.type === "report-assets") {
      figma.ui.postMessage({ type: "assets", assets: await reportFileAssets() });
      return;
    }
    if (msg.type === "check-local-edits") {
      const record = readFileTokens();
      const baseline = (_c = record == null ? void 0 : record.tokens) != null ? _c : msg.tokens;
      if (!baseline) {
        figma.ui.postMessage({
          type: "local-edits",
          error: "No imported system in this file \u2014 Import or Live Sync once first."
        });
        return;
      }
      try {
        const report = await collectLocalEdits(baseline);
        log(`Local edits: ${report.summary.supported} supported \xB7 ${report.summary.rejected} rejected`);
        figma.ui.postMessage({ type: "local-edits", report });
      } catch (e) {
        const m = e instanceof Error ? e.message : String(e);
        figma.ui.postMessage({ type: "local-edits", error: m });
      }
      return;
    }
    if (msg.type === "save-file-sync") {
      writeFileSync(typeof msg.url === "string" ? msg.url : "", !!msg.autoStart);
      return;
    }
    if (msg.type === "reset-file") {
      resetFile();
      log("\u2015 File reset \u2014 this file has no connected system or sync \u2015");
      figma.ui.postMessage({ type: "reset-file-done" });
      return;
    }
    if (msg.type === "open-external") {
      const url = typeof msg.url === "string" ? msg.url : "";
      if (!/^https:\/\//i.test(url)) {
        log("\u2717 Refused to open a non-https URL");
        return;
      }
      figma.openExternal(url);
      return;
    }
    if (msg.type === "save-settings") {
      if (msg.settings) await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings);
      return;
    }
    if (msg.type === "export-variables") {
      try {
        const { data, total } = await exportVariablesJson();
        figma.ui.postMessage({ type: "export-variables-data", data, total });
        if (total > 0) log(`\u2713 Exported ${total} variables from ${data.collections.length} collection${data.collections.length === 1 ? "" : "s"}`);
      } catch (err) {
        const m = err instanceof Error ? err.message : String(err);
        log(`\u2717 Variables export failed: ${m}`);
        figma.ui.postMessage({ type: "export-variables-data", data: null, total: 0 });
      }
      return;
    }
    if (msg.type === "export-tokens") {
      figma.ui.postMessage({ type: "export-tokens-data", tokens: (_e = (_d = readFileTokens()) == null ? void 0 : _d.tokens) != null ? _e : null });
      return;
    }
    if (msg.type === "import") {
      const { tokens, options } = msg;
      if (!tokens || !options) return;
      try {
        log(`\u2015 Starting import for "${tokens.project || "Untitled"}" \u2015`);
        checkSchema(tokens);
        try {
          const staleArtefacts = figma.root.children.find((p) => p.name === "\u2B21 Artefacts");
          if (staleArtefacts) {
            staleArtefacts.remove();
            log('\u2713 Removed the retired "\u2B21 Artefacts" page');
          }
        } catch (e) {
        }
        const blockedPrefixes = new Set(
          (figma.root.getPluginData(FILE_INHERITED_BLOCKED_KEY) || "").split("\n").filter(Boolean)
        );
        const presentPrefixes = await scanInheritedStylePrefixes();
        const inheritedPrefixes = presentPrefixes.filter((p) => !blockedPrefixes.has(p));
        const staleDocs = readDocsRev() < DOCS_REV;
        let docsMustRebuild = inheritedPrefixes.length > 0 || staleDocs;
        if (docsMustRebuild) {
          const why = inheritedPrefixes.length > 0 ? `inherited project folder${inheritedPrefixes.length > 1 ? "s" : ""} ${inheritedPrefixes.join(", ")}` : "documentation is from an older plugin";
          log(`\u21BB Documentation will rebuild \u2014 ${why}`);
        }
        if (!tokens.typography || typeof tokens.typography !== "object") {
          log(`\u26A0 Payload is missing "typography" \u2014 using a fallback (Inter, no custom sizes/weights).`);
          tokens.typography = { fontFamily: "Inter", sizes: {}, weights: {} };
        } else {
          if (!tokens.typography.sizes) tokens.typography.sizes = {};
          if (!tokens.typography.weights) tokens.typography.weights = {};
          if (!tokens.typography.fontFamily) tokens.typography.fontFamily = "Inter";
        }
        await warnUnavailableSystemFonts(tokens);
        let totalVars = 0;
        let totalStyles = 0;
        let totalComponents = 0;
        let totalIcons = 0;
        let totalDocs = 0;
        let hasCover = false;
        let hadError = false;
        let wantComponents = options.importComponents;
        let wantCover = (_f = options.importCover) != null ? _f : options.importDocs !== false;
        let wantDocumentation = (_g = options.importDocumentation) != null ? _g : options.importDocs !== false;
        const planned = [
          options.importVariables && "Variables",
          options.importStyles && "Styles",
          wantComponents && "Components",
          options.importIcons && "Icons",
          wantCover && "Cover",
          // Getting started rides with Documentation — same phase gate, no toggle
          // of its own (it's a fixed handoff page, like Cover).
          wantDocumentation && "Getting started",
          wantDocumentation && "Documentation"
        ].filter(Boolean);
        let phaseIdx = 0;
        async function phase(name, run) {
          progress(name, phaseIdx, planned.length);
          await yieldToUI();
          try {
            await run();
          } catch (err) {
            hadError = true;
            const m = err instanceof Error ? err.message : String(err);
            log(`\u2717 ${name} failed: ${m}`);
          }
          phaseIdx++;
          progress(name, phaseIdx, planned.length);
          await yieldToUI();
        }
        try {
          if (options.importVariables) {
            await phase("Variables", async () => {
              totalVars = await importVariables(tokens);
            });
            if (semanticsRebuilt || foundationsRebuilt || docsMustRebuild) {
              const added = [];
              const wasFullCatalogue = options.importAllComponents === true;
              if (wasFullCatalogue) {
                options.importAllComponents = false;
                log(`\u21BB Rebinding the core components only. The full catalogue (58 types) is not rebuilt automatically \u2014 re-run Import with "Full catalogue" ticked when you want those re-bound too.`);
              }
              if ((semanticsRebuilt || docsMustRebuild) && !wantComponents) {
                wantComponents = true;
                added.push("Components");
              }
              if (!wantCover) {
                wantCover = true;
                added.push("Cover");
              }
              if (!wantDocumentation) {
                wantDocumentation = true;
                added.push("Getting started", "Documentation");
              }
              if (added.length > 0) {
                planned.push(...added);
                const why = semanticsRebuilt ? "the new semantic variables" : docsMustRebuild ? "updated documentation (roles + leftover project folders)" : "the restacked Spacing / Radius / Type collections";
                log(`\u21BB Recalibrating: ${added.join(", ")} rebuilt too, so everything binds to ${why}`);
              }
            }
          }
          if (options.importStyles) {
            await phase("Styles", async () => {
              totalStyles = await importStyles(tokens);
            });
          }
          if (wantComponents) {
            await phase("Components", async () => {
              totalComponents = await importSample(tokens, options.importAllComponents === true);
            });
          }
          if (options.importIcons) {
            await phase("Icons", async () => {
              totalIcons = await importIcons(tokens);
            });
          }
          if (wantCover) {
            await phase("Cover", async () => {
              hasCover = await importCover(tokens);
            });
          }
          if (wantDocumentation) {
            await phase("Getting started", async () => {
              await importGettingStarted(tokens);
            });
            await phase("Documentation", async () => {
              totalDocs = await importDocumentation(tokens);
            });
            writeDocsRev();
          }
          await purgeInheritedCollections(tokens.project || "");
          const inheritedDropped = await removeInheritedStyles();
          if (inheritedDropped > 0) {
            log(`\u2713 Removed ${inheritedDropped} inherited style${inheritedDropped === 1 ? "" : "s"} prefixed with a previous project name`);
          }
          if (inheritedPrefixes.length > 0 && !hadError) {
            try {
              const survivors = (await scanInheritedStylePrefixes()).filter((p) => inheritedPrefixes.includes(p));
              const keep = [.../* @__PURE__ */ new Set([...survivors, ...[...blockedPrefixes].filter((p) => presentPrefixes.includes(p))])];
              figma.root.setPluginData(FILE_INHERITED_BLOCKED_KEY, keep.join("\n"));
              if (survivors.length > 0) {
                log(`\u26A0 Style folder${survivors.length > 1 ? "s" : ""} ${survivors.join(", ")} could not be removed \u2014 one of your own layers still uses ${survivors.length > 1 ? "them" : "it"}. Everything the plugin draws has been rebound; delete or re-style those layers to clear the folder. Not retried \u2014 retrying would rebuild the file on every sync.`);
              }
            } catch (e) {
            }
          }
          writeFileTokens(tokens);
          try {
            figma.root.setPluginData(FILE_PROJECT_NAME_KEY, tokens.project || "");
          } catch (e) {
          }
          const summary = [
            totalVars > 0 ? `${totalVars} variables` : null,
            totalStyles > 0 ? `${totalStyles} styles` : null,
            totalComponents > 0 ? `${totalComponents} components` : null,
            totalIcons > 0 ? `${totalIcons} icons` : null,
            hasCover ? "cover" : null,
            totalDocs > 0 ? `docs (${totalDocs} boards)` : null
          ].filter(Boolean).join(" \xB7 ");
          log(`\u2015 Done${summary ? `: ${summary}` : ""}${hadError ? " \u2014 some phases failed, see \u2717 lines above" : ""} \u2015`);
          figma.ui.postMessage({ type: "done", summary, hadError });
        } catch (err) {
          const msg2 = err instanceof Error ? err.message : String(err);
          log(`\u2717 Error: ${msg2}`);
          figma.ui.postMessage({ type: "error", message: msg2 });
        } finally {
          ensureFoundationPageOrder();
        }
      } catch (outerErr) {
        const outerErrMsg = outerErr instanceof Error ? outerErr.message : String(outerErr);
        log(`\u2717 Error: ${outerErrMsg}`);
        figma.ui.postMessage({ type: "error", message: outerErrMsg });
      }
    }
    if (msg.type === "close") {
      figma.closePlugin();
    }
  };
})();
