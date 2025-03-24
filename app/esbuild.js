import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

let ctx = await esbuild.context({
    entryPoints: [
        "./pages/client/dashboard.tsx",
        "./pages/client/signin.tsx",
        "./pages/client/docs.tsx",
        "./pages/client/homepage.tsx",
        "./pages/client/error.tsx"
    ],
    bundle: true,
    outdir: "./assets/dist",
    sourcemap: true,
    plugins: [ sassPlugin({ 
        type: "css",
        cssImports: true,
        cache: false,
        /*precompile: (source, pathname) =>{
            const basedir = path.dirname(pathname);
            return source.replace(/(url\(['"]?)(\.\.?\/)([^'")]+['"]?\))/g, `$1${basedir}/$2$3`);
        }
        //transform: postcssModules([ postcssUrl({ url: "inline" })] )*/
     }) ],
     loader:{
        ".jpg" : "dataurl",
        ".svg": "dataurl"
     }
});

await ctx.watch();

const { host, port } = await ctx.serve({ servedir: "./assets" });
console.log(`EsBuild is runing on host: ${host}:${port}`);