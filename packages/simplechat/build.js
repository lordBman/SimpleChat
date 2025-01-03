const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['./src/index.ts'], // Entry point
  bundle: true,                   // Bundle the code
  outfile: './dist/index.js',      // Output file
  platform: 'node',                // Node.js package
  target: 'es6',                   // Target JavaScript version
  sourcemap: true,                 // Generate source map
  minify: true,                    // Minify the output
  format: 'cjs'                    // CommonJS for Node.js compatibility
}).then(() => {
  console.log('Build succeeded!');
}).catch(() => {
  process.exit(1);
});