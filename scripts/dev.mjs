import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'dev', '-w', '@affiliate/api']],
  ['npm', ['run', 'dev', '-w', '@affiliate/web']],
];

const children = commands.map(([command, args]) =>
  spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }),
);

function stop() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stop();
      process.exitCode = code;
    }
  });
}
