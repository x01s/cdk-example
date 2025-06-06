import { build } from 'esbuild';
import { readdirSync } from 'fs';
import { join, extname } from 'path';

const lambdaDir = 'lambda';
const entryPoints = readdirSync(lambdaDir)
  .filter((file) => extname(file) === '.ts')
  .map((file) => join(lambdaDir, file));

build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node18',
  outdir: 'dist/lambda',
  format: 'cjs',
  sourcemap: true,
}).catch(() => process.exit(1));
