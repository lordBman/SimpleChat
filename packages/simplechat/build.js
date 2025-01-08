/*const esbuild = require('esbuild');

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
});*/

const { build } = require("esbuild");
const { dependencies } = require("./package.json");
const { Generator } = require('npm-dts');

new Generator({
    entry: 'src/index.ts',
    output: 'dist/index.d.ts'
}).generate();

const sharedConfig = {
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    format: 'cjs',                    // CommonJS for Node.js compatibility
    sourcemap: true,                 // Generate source map
};

build({
    ...sharedConfig,
    platform: "browser",
    outfile: "dist/index.js"
});

build({
    ...sharedConfig,
    platform: "neutral",
    format: "esm",
    outfile: "dist/index.esm.js",
    external: Object.keys(dependencies)
});