#!/usr/bin/env node
// demo bootstrap cross platform
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ENV = path.join(ROOT, '.env')
const ENV_EXAMPLE = path.join(ROOT, '.env.example')
const NODE_MODULES = path.join(ROOT, 'node_modules')

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'

function run(bin, args) {
  const isWin = process.platform === 'win32'
  const res = isWin
    ? spawnSync('cmd.exe', ['/c', bin, ...(args || [])], { stdio: 'inherit', cwd: ROOT })
    : spawnSync(bin, args || [], { stdio: 'inherit', cwd: ROOT })
  if (res.error) throw res.error
  if (typeof res.status === 'number' && res.status !== 0) {
    throw new Error(`${bin} ${args?.join(' ')} exited with code ${res.status}`)
  }
}

// copy .env if missing
if (!fs.existsSync(ENV) && fs.existsSync(ENV_EXAMPLE)) {
  fs.copyFileSync(ENV_EXAMPLE, ENV)
  console.log('[demo] created .env from .env.example')
}

// install deps if missing
if (!fs.existsSync(NODE_MODULES)) {
  console.log('[demo] installing dependencies')
  run(npmCmd, ['install'])
}

// migrate
console.log('[demo] running prisma migrate dev')
try {
  run(npxCmd, ['prisma', 'migrate', 'dev'])
} catch (e) {
  console.warn('[demo] prisma migrate failed, check DATABASE_URL in .env')
}

// seed
console.log('[demo] seeding demo data')
try {
  run(process.execPath, ['scripts/seed.js'])
} catch (e) {
  console.warn('[demo] seed failed, continuing')
}

// start server
console.log('[demo] starting server')
// this will block and show server logs
run(npmCmd, ['run', 'start'])
