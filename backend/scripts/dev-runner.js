const { execSync, spawn } = require('child_process');

const port = process.env.PORT || '5001';

try {
  const pids = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, {
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8',
  })
    .split('\n')
    .map((pid) => pid.trim())
    .filter(Boolean);

  if (pids.length > 0) {
    execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'ignore' });
  }
} catch {
  // No process was listening on the port.
}

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['nodemon', 'src/server.js'],
  {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
