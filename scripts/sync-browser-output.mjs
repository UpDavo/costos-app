import { cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const source = 'dist/costos-app/browser';
const target = 'browser';

if (!existsSync(source)) {
  throw new Error(`Expected Angular browser output at ${source}`);
}

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
