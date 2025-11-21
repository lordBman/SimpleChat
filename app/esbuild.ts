import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import jetLogger from "jet-logger";

let ctx = await esbuild.context({
    entryPoints: [ "./pages/signin/index.tsx", "./pages/homepage/index.tsx"],
    bundle: true,
    outdir: "./public/js",
    sourcemap: true,
    plugins: [ sassPlugin({ type: "css", cssImports: true, cache: false }) ],
    loader:{
        ".jpg" : "dataurl",
        ".svg": "dataurl"
    }
});

await ctx.watch().then(()=>{
    jetLogger.info("esbuild is watching entry files");
}).catch((error)=>{
    jetLogger.err(error);
});