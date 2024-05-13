import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

let ctx = await esbuild.context({
    entryPoints: [
        "./pages/scripts/dashboard.tsx",
        "./pages/scripts/signin.tsx"
    ],
    bundle: true,
    outdir: "./assets",
    sourcemap: true,
    plugins: [ sassPlugin({ type: "style", cache: false }) ]
});

await ctx.watch();

const { host, port } = await ctx.serve({ servedir: "./assets" });
console.log(`EsBuild is runing on host: ${host}:${port}`);