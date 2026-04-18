#!/usr/bin/env bun
const processes = [
  Bun.spawn(["bun", "run", "build:css:watch"], { stdout: "inherit", stderr: "inherit" }),
  Bun.spawn(["bun", "run", "build:client:watch"], { stdout: "inherit", stderr: "inherit" }),
  Bun.spawn(["bun", "run", "dev:server"], { stdout: "inherit", stderr: "inherit" }),
];

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const proc of processes) {
    proc.kill();
  }

  setTimeout(() => process.exit(code), 50);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => shutdown(0));
}

await Promise.race(processes.map(async (proc) => {
  const exitCode = await proc.exited;
  return { proc, exitCode };
})).then(({ exitCode }) => {
  shutdown(exitCode ?? 1);
});
