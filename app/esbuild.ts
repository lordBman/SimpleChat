import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { html } from '@esbuilder/html'
import jetLogger from "jet-logger";

let ctx = await esbuild.context({
    entryPoints: [ "./pages/signin.html"],
    bundle: true,
    outdir: "./public",
    sourcemap: true,
    plugins: [ html({
        // required in serve mode
        serve: false,
        /**
         * Output filename pattern for `src` attribute in `script` tag,
         * the default value is `[name].[hash]`,
         * you can override it here.
         */
        // entryNames: 'js/[name]',
      }), sassPlugin({ 
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

await ctx.watch().then(()=>{
    jetLogger.info("esbuild is watching entry files");
}).catch((error)=>{
    jetLogger.err(error);
});