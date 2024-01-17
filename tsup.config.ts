import { defineConfig } from 'tsup'

export const tsup = defineConfig((option) => ({
  entry: ['src/index.ts'],
  target: 'es2015',
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
  platform: 'browser',
  splitting: false,
  treeshake: true,
  minify: true,
  sourcemap: !!option.watch,
  tsconfig: option.watch ? 'tsconfig.dev.json' : 'tsconfig.json',
}))
