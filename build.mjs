import esbuild from 'esbuild'
import { readFileSync, mkdirSync, writeFileSync } from 'fs'

const watch = process.argv.includes('--watch')

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

// Copy UI HTML (already self-contained)
function copyUI() {
  const html = readFileSync('src/ui.html', 'utf8')
  writeFileSync('dist/ui.html', html)
  console.log('UI copied → dist/ui.html')
}

copyUI()

if (watch) {
  await sandboxCtx.watch()
  console.log('Watching for changes…')
} else {
  await sandboxCtx.rebuild()
  await sandboxCtx.dispose()
  console.log('Build complete.')
}
