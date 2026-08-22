# Plan — El plugin como puente (arquitectura híbrida)

**Modelo mental:** la web es la **fuente de la verdad**. El plugin es el
**puente** entre esa fuente y el archivo de Figma. El plugin no genera nada:
muestra, trae, y lleva de vuelta.

Import, Export, Live Sync y Activity log no cambian.

---

## 1. ¿Es coherente para un plugin de Figma? Sí

Y por una razón concreta: **un plugin de Figma es una ventana de 500px sin
router, sin framework y sin persistencia real.** Este plugin son dos archivos
planos (`code.ts` 6.331 líneas, `ui.html` 1.652), sin dependencias en runtime.
Meter ahí un configurador de foundations es construir una segunda UI que hay que
mantener en paralelo a la web — con la garantía histórica de que se van a
desincronizar en silencio (ya pasó 3 veces en este repo).

Tu conclusión elimina ese problema de raíz: **una sola UI de creación, la web.**
El plugin hace lo único que la web no puede hacer — escribir dentro del archivo
de Figma.

**El costo, dicho claro:** hay un salto de contexto fuera de Figma. Lo aceptás a
cambio de cero duplicación. Me parece el trade correcto, y es reversible: si más
adelante querés un mini-editor de accent dentro del plugin, se agrega encima de
esta arquitectura sin rehacer nada.

---

## 2. Un ajuste a tu flujo

Vos lo describiste así:

> plugin → escalatokens → user **descarga** el JSON → user **sube** el JSON → el plugin lee

Ese paso de descargar/subir **ya existe** (el Step "Source" acepta drop de
archivo, paste y URL) y debe quedarse — pero como **fallback**, no como camino
principal. Para el camino principal ya hay algo mejor construido: **Live Sync**.
La web publica en `/api/tokens?project=<slug>` y el plugin lo lee solo. Sin
archivos, sin carpeta de Descargas, y con la propiedad que hace valioso todo
esto: **editás en la web y Figma se actualiza sin que nadie toque nada.**

Entonces el flujo real queda:

```
1. Usuario abre el plugin
   └─ ¿Ya hay sistema conectado?
      ├─ SÍ  → Overview: accent, rampa, tipografía, arquitectura, último sync
      │        [Editar en la web] · [Sincronizar ahora] · [Importar a este archivo]
      └─ NO  → "Creá tu sistema en escalatokens.com" → abre la web

2. Usuario configura en la web (todo el poder del configurador)

3. La web publica → el plugin lo detecta → importa

4. Vuelve a editar en la web cuando quiera → el plugin re-sincroniza
```

Descargar/subir JSON queda para: repos con `tokens.json` versionado, entornos
sin red, o compartir un sistema con alguien que no tiene el link.

---

## 3. Lo que muere del plan anterior

Esto es lo mejor de tu recalibración — desaparece el bloque más caro y más
riesgoso:

- ~~Extraer la derivación de los hooks de React a funciones puras~~ (era la fase
  con más riesgo de romper la web en silencio)
- ~~`POST /api/foundations`~~
- ~~Pantalla de creación de foundations dentro del plugin~~

No hace falta nada de eso si el usuario configura en la web.

---

## 4. Lo que queda por construir

### ✅ Fase 0 — Sanear el contrato *(hecha)*
`SUPPORTED_SCHEMA_VERSION` 4 → 5 en [code.ts](src/code.ts), con el changelog de
v5 en el comentario. Verificado antes de subirlo: el import de `opacity` está
guardado por `if (tokens.opacity)`, así que un payload viejo que todavía traiga
el campo sigue importando su colección Opacity.

### ✅ Fase 1 — La pantalla Overview *(hecha)*
El plugin ahora abre en **Overview** en vez del wizard de import.

- El sandbox manda el payload guardado junto con los settings (`load-settings`
  ahora incluye `tokens`), así que la vista se arma sin red y sin storage nuevo.
- Muestra: proyecto, swatch + rampa completa del accent, tipografías,
  arquitectura semántica, temas, states y "último import".
- Acciones: **Edit on the web** · **Live Sync** · **Import into this file**.
- Estado vacío con **Create on escalatokens.com** / "I already have a
  tokens.json".
- Detalles que salieron del código real, no de suposiciones:
  - La rampa se lee con `^accent-(\d+)$` y se ordena numéricamente, porque el
    esquema de nombres de la web puede ser 1–12, 50–1000 o 10–120. De paso el
    regex excluye solo los twins `-dark-` y `-a-` sin tener que listarlos.
  - Un flag `booted` evita que se vea "No system connected yet" durante el
    instante entre el primer `render()` y la respuesta de clientStorage.
  - El aside (preview del payload *staged*) se oculta en Overview: son dos
    sistemas distintos y ponerlos lado a lado confunde.

### ✅ Fase 2 — El salto a la web *(hecha, sin deep-link)*
Handler `open-external` en el sandbox → `figma.openExternal()`, que **no se usaba
en ninguna parte** hasta ahora. Valida https antes de abrir (la URL se arma con
valores del payload, no es una constante).

**Pendiente, y a propósito:** el deep-link al proyecto. La web **no tiene ningún
soporte de query params** (`grep searchParams src/` → 0 resultados; no hay
router, el estado sale de localStorage). Mandar `?project=<slug>` hoy no haría
nada, así que el botón abre `escalatokens.com` a secas. El deep-link entra en la
Fase 3, junto con el cambio del lado web que lo hace real.

### Fase 3 — Handshake sin copiar y pegar
Hoy conectar un sistema significa pegar a mano la URL scoped
(`…/api/tokens?project=<name>`) en el panel de Sync. Funciona, pero es el punto
donde tu flujo se siente "manual".

- El plugin abre la web con `?from=figma&session=<uuid>`.
- La web, al detectar `from=figma`, muestra **"Enviar a Figma"**: publica y
  registra el slug contra esa sesión.
- El plugin, que **ya poletea**, ve la sesión resuelta y auto-completa la URL.
- Fallback intacto: pegar la URL a mano sigue funcionando igual.

Es un endpoint chico en la web (`/api/session`) + un botón. Mucho menos trabajo
que el `/api/foundations` que acabamos de descartar.

### Fase 4 — Importar `colors.architecture` *(la pieza grande, y ahora más importante)*
El plugin **ignora `colors.architecture` por completo** — `grep architecture
src/code.ts` da cero resultados relevantes. Solo importa la forma plana
(`colors.themes`).

Con tu arquitectura esto sube de prioridad: si la elección de **Astryx** o
**Categorical Semantic** se hace en la web, el plugin tiene que saber
materializarla, o esa decisión no llega nunca a Figma.

- Colección nueva de Figma (p. ej. `2b. Semantic — Astryx`) con modos
  light/dark, cada token **aliasado a la variable primitiva**, nunca a un hex
  suelto. El resolvedor hex→variable ya existe.
- Recorrer `colors.architecture` **genéricamente**, sin lista de keys
  hardcodeada — así un rename en la web cambia nombres de variables pero nunca
  deja fills sin bindear.
- **Invariante a proteger:** los componentes (`importComponents` / el mapa
  `pair()`) siguen resolviendo desde la forma **plana**. La colección de
  arquitectura es una capa expuesta al usuario, **no** una segunda fuente de
  verdad. Si `importComponents` empieza a leer de ahí, vuelve exactamente el bug
  de agosto donde los componentes salían con colores hardcodeados y sin binding.

### Fase 5 — Documentación
README del plugin (la vista Overview, el handshake) y CLAUDE.md de la web.

---

## 5. Orden y valor entregado

| Fase | Entrega |
|---|---|
| 0 | Deja de mentir en el log |
| 1 | **El plugin se siente como un sistema conectado, no como un importador** |
| 2 | El salto a la web es un botón |
| 3 | Conectar deja de ser copiar y pegar |
| 4 | **Astryx / Categorical llegan de verdad a Figma** |
| 5 | Docs |

Las fases 0–2 son chicas y juntas ya cambian por completo la sensación del
plugin. La 4 es la de trabajo real, y es independiente: se puede hacer antes o
después sin bloquear nada.

---

## 6. Riesgos

1. **La colección de arquitectura se vuelve segunda fuente de verdad.** Es el
   riesgo serio. Mitigación: la invariante de la Fase 4, escrita como comentario
   junto al código de import.
2. **El handshake por sesión falla en silencio** (usuario cierra la pestaña,
   nunca aprieta "Enviar a Figma"). Mitigación: timeout visible con el camino
   manual siempre a mano, nunca un spinner infinito.
3. **Vocabulario de roles.** El schema versiona la *forma* del payload, no el
   *vocabulario* de roles semánticos — un rename en `ALL_ROLES` no dispara
   ninguna alarma. Por eso la Fase 4 recorre genéricamente.

---

## 7. Bug encontrado — la selección de componentes no siempre se respeta

**Confirmado en código, no es percepción.** Al seleccionar en la web SOLO
componentes "base" (Button, Badge, Input, Card, Toast — sin ninguna variante
como `CloseButton` o `Textarea`), el plugin importa de más: todas las variantes
de esas mismas familias, no lo que se seleccionó.

### La causa

`code.ts` clasifica cada payload como "fine-grained" (respeta la selección al
pie de la letra) o "legacy/coarse" (una key base como `Button` significa
"traeme TODO lo de Button" — comportamiento pensado para tokens.json viejos de
antes de que existiera el catálogo fino):

```ts
const FINE_KEYS = new Set<string>()
for (const cat of CATALOG) for (const e of cat.entries) if (e.legacyGate) FINE_KEYS.add(e.gate)
const fineGrained = atoms.some((a) => FINE_KEYS.has(a))
const gateOpen = (e: CatalogEntry) =>
  atomSet.has(e.gate) || (!fineGrained && e.legacyGate !== undefined && atomSet.has(e.legacyGate))
```

`fineGrained` se decide mirando si la selección contiene alguna key que sea
**variante** de algo (`CloseButton`, `FABButton`, `Textarea`…). El problema:
`Button`, `Badge`, `Input`, `Card`, `Toast` son keys base — nunca aparecen en
`FINE_KEYS` aunque sean perfectamente válidas hoy. Una selección compuesta
*solo* por bases (que es exactamente lo que da una lista "essential") queda
mal clasificada como payload viejo, y el fallback `legacyGate` abre cada
variante de Button/Input/Checkbox/Toggle/Badge/Progress/Tabs/Toast aunque el
usuario nunca las haya tildado. Verificado con un payload real
(`test-amarillo`, `schemaVersion: 4`) — ahí no se dispara solo porque esa
selección conserva alguna variante (`CloseButton`) de pura casualidad.

### El fix

`schemaVersion` está en el payload desde siempre (los comentarios documentan
v2 en adelante) — mucho antes de que existiera el catálogo fino. Un payload
que trae `schemaVersion` es, en la práctica, siempre del catálogo actual; el
único caso realista de "de verdad viejo" es un tokens.json armado a mano sin
ese campo. Cambiar la heurística de contenido por una de procedencia:

```ts
const fineGrained = typeof tokens.schemaVersion === 'number'
```

Chico, sin tocar la web, y arregla exactamente el síntoma. **Es la Fase 0 de
todo lo que sigue en la sección 8** — sin esto, cualquier selección curada de
solo-bases sigue sobre-importando.

---

## 8. Reducir el alcance — un tier "Essential" para esta primera fase

Objetivo: en vez de que un sistema nuevo arranque con los 58 componentes
seleccionados (`selectedComponents: [...COMPONENT_KEYS]`, el default actual en
`useDesignStore.ts:471`), que arranque con un puñado curado — denso mismo
significa "difícil de revisar, difícil de dar feedback, difícil de mantener
sincronizado con la marca." El catálogo completo sigue existiendo y sigue
funcionando para quien lo pida; deja de ser el default.

### ✅ Fase 0 — el fix de la sección 7 *(hecha)*

`fineGrained` pasó de inferirse del contenido de la selección a leerse de
`typeof tokens.schemaVersion === 'number'` — quién manda el payload dice
"esto es actual", en vez de que el plugin lo adivine mirando qué keys eligió el
usuario. Verificado con test standalone reproduciendo `gateOpen` (13
esenciales → exactamente 13 abiertos, cero variantes de más) y con el caso
"payload realmente viejo sin schemaVersion" (sigue ampliando por familia, sin
romper compatibilidad hacia atrás).

### ✅ Fase 1 — Curar el set "Essential" (web) *(hecha)*

Terminó en **13**, no 12 (contamos mal en la propuesta — Superficies son 5,
no 4):

| Familia | Componentes |
|---|---|
| Acciones | Button |
| Formulario | Input, Select, Checkbox, Toggle |
| Indicadores | Badge |
| Superficies | Card, Avatar, Modal, Tooltip, Divider |
| Feedback | Toast |
| Navegación | Tabs |

`ESSENTIAL_COMPONENT_KEYS` nuevo en `componentCatalogue.ts`, default de
`selectedComponents` en `useDesignStore.ts:471` cambiado a esa lista. **Los
sistemas existentes no se tocaron** — solo se editó el estado inicial de un
store nuevo (sin persistencia previa); las migraciones versionadas
(`v2→v3`, `v26→v27`) que reparan stores viejos siguen intactas y siguen
usando `COMPONENT_KEYS` completo, que es lo correcto para no vaciar por
sorpresa la selección de alguien que ya tenía un sistema armado.

Curiosidad al verificar: 12 de los 13 esenciales coinciden con el catálogo
"legacy" de 16 keys que ya vivía hardcodeado en la migración v26→v27 — buena
señal de que la curación no inventó nada raro, coincide con lo que el propio
historial del producto ya trataba como "lo básico".

Sin hacer, a propósito — opcional y no bloqueante: etiquetar visualmente los
13 en el picker de `ComponentsView.tsx` para que se vea cuáles son el
recomendado y cuáles el catálogo extendido.

### ✅ Fase 2 — Que el plugin lo diga *(hecha)*

`renderReview()` en `ui.html` ahora arma una descripción dinámica para la fila
Components: `"13 selected · 45 more in the full catalogue on
escalatokens.com, plus their icons"`. Bordes cubiertos: 0 seleccionados →
"No components selected — none will be created"; los 58 → sin la frase de
"más disponibles" (no tiene sentido invitar a un catálogo que ya está
completo). `FULL_CATALOGUE_SIZE = 58` queda como constante — mismo patrón de
"los repos se mantienen en espejo a mano" que ya usa el resto del plugin (ver
README). Es solo texto, sin link clickeable por ahora (para no pelear con el
`escapeHtml` de la descripción) — el camino a la web ya existe un click atrás,
en Overview.

### Fase 3 — Premium *(nombrada, no construida)*

**Verificado: no existe ninguna infraestructura de billing en este repo** —
sin Stripe, sin cuentas, sin entitlements. "Catálogo completo = opción
premium" hoy sería solo una promesa en el texto de la Fase 2, no una feature
real. Dejarlo nombrado como la costura donde algún día engancharía un check de
plan/cuenta, pero no construir nada de eso en esta pasada — sería trabajo sin
ningún sistema real detrás que lo sostenga.

### Orden

Fase 0 es innegociable y va primero — es el bug, no la curación. Fase 1 y 2
son independientes entre sí y chicas; se pueden hacer en cualquier orden una
vez que la Fase 0 esté. Fase 3 queda fuera de este plan.
