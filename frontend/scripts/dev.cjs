const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ENV = path.join(ROOT, '.env')
const ENV_EXAMPLE = path.join(ROOT, '.env.example')
const NODE_MODULES = path.join(ROOT, 'node_modules')

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(bin, args) {
  const res = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/c', bin, ...(args || [])], { stdio: 'inherit', cwd: ROOT })
    : spawnSync(bin, args || [], { stdio: 'inherit', cwd: ROOT })

  if (res.error) throw res.error
  if (typeof res.status === 'number' && res.status !== 0) {
    throw new Error(`${bin} ${args?.join(' ')} exited with code ${res.status}`)
  }
}

if (!fs.existsSync(ENV) && fs.existsSync(ENV_EXAMPLE)) {
  fs.copyFileSync(ENV_EXAMPLE, ENV)
  console.log('[frontend] created .env from .env.example')
}

if (!fs.existsSync(NODE_MODULES)) {
  console.log('[frontend] installing dependencies')
  run(npmCmd, ['install'])
}

console.log('[frontend] starting Vite dev server')
run(npmCmd, ['run', 'dev:serve'])

