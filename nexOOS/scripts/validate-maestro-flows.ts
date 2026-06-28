import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const maestroDir = join(process.cwd(), '.maestro');

if (!existsSync(maestroDir)) {
  throw new Error('.maestro directory is missing.');
}

const flowFiles = readdirSync(maestroDir).filter((file: string) =>
  /\.(yaml|yml)$/i.test(file),
);

if (flowFiles.length === 0) {
  throw new Error('.maestro must contain at least one flow file.');
}

console.log(`Found ${flowFiles.length} Maestro flow file(s).`);
