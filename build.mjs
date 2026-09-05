import esbuild from 'esbuild'
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const watch = process.argv.includes('--watch')
const root = dirname(fileURLToPath(import.meta.url))
const agentEntry = resolve(root, '../escala-tokens/src/lib/agentBundle/fromJson.ts')

mkdirSync('dist', { recursive: true })

// Build plugin sandbox
const sandboxCtx = await esbuild.context({
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'browser',
  // Figma's plugin VM (QuickJS) supports ES2017 natively. Keeping the target
  // at es6 made esbuild lower async/await into generator helpers, which hits
  // a QuickJS bytecode bug ("InternalError: stack underflow") once try/catch
  // sits inside loops inside those generators. Native async avoids it.
  target: 'es2017',
  logLevel: 'info',
})

/** Same Get code · Agent markdown the configurator ships — injected into ui.html. */
async function bundleAgentMarkdown() {
  if (!existsSync(agentEntry)) {
    console.warn('Agent markdown source missing — plugin Copy falls back to the envelope + tokens.json')
    return ''
  }
  const result = await esbuild.build({
    entryPoints: [agentEntry],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'EscalaAgent',
    platform: 'browser',
    target: 'es2017',
    logLevel: 'warning',
  })
  return result.outputFiles[0]?.text ?? ''
}

// Copy UI HTML (already self-contained) and inject the shared agent markdown
// builder so Copy / Download cannot drift from Get code on the web.
async function copyUI() {
  const html = readFileSync('src/ui.html', 'utf8')
  const agent = await bundleAgentMarkdown()
  const injected = agent
    ? html.replace('<!-- AGENT_MARKDOWN -->', `<script>\n${agent}\n</script>`)
    : html.replace('<!-- AGENT_MARKDOWN -->', '')
  writeFileSync('dist/ui.html', injected)
  console.log('UI copied → dist/ui.html')
}

await copyUI()

if (watch) {
  await sandboxCtx.watch()
  console.log('Watching for changes…')
} else {
  await sandboxCtx.rebuild()
  await sandboxCtx.dispose()
  console.log('Build complete.')
}
