import { build } from 'esbuild';

build({
  entryPoints: ['lambda/hello.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outdir: 'dist/lambda',
  format: 'cjs',
}).catch(() => process.exit(1));
