#!/usr/bin/env node
// simple dev bootstrap without prompts
const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ENV = path.join(ROOT, '.env')
const ENV_EXAMPLE = path.join(ROOT, '.env.example')
const NODE_MODULES = path.join(ROOT, 'node_modules')

const NPM = 'npm'
const NPX = 'npx'

function run(cmd, args, opts = {}) {
  const bin = process.platform === 'win32' ? `${cmd}.cmd` : cmd
  return execSync([bin, ...(args || [])].join(' '), { stdio: 'inherit', cwd: ROOT, ...opts })
}

function main() {
  // copy .env if missing
  if (!fs.existsSync(ENV) && fs.existsSync(ENV_EXAMPLE)) {
    fs.copyFileSync(ENV_EXAMPLE, ENV)
    console.log('[dev] created .env from .env.example')
  }

  // install deps if node_modules missing
  if (!fs.existsSync(NODE_MODULES)) {
    console.log('[dev] installing dependencies')
    run(NPM, ['install'])
  }

  // run prisma migrate dev
  try {
    console.log('[dev] running prisma migrate dev')
    run(NPX, ['prisma', 'migrate', 'dev'])
  } catch (e) {
    console.warn('[dev] prisma migrate dev failed, check DATABASE_URL in .env')
  }

  // start server with ts-node-dev
  console.log('[dev] starting server')
  const child = spawn(NPM, ['run', 'start'], { stdio: 'inherit', cwd: ROOT })
  child.on('exit', (code) => process.exit(code ?? 0))
}

main()
