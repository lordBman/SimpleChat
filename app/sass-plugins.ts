import type { BunPlugin } from "bun";
import JetLogger from "jet-logger";
import * as sass from 'sass'


// Register SCSS loader
const sassPlugin: BunPlugin ={
    name: "scss loader",
    setup(build) {
        build.onResolve({ filter: /\.scss$/ }, (args) => {
            return null; // Let Bun handle resolution
        });
        
        build.onLoad({ filter: /\.scss$/, namespace: "file" }, async (args) => {
            try {
                JetLogger.info(`🎯 Compiling SCSS: ${args.path} with ${args.loader} Loader`);
                const result = await sass.compileAsync(args.path);
                
                return { 
                    contents: result.css, loader: "css" 
                };
            }catch (error) {
                JetLogger.err(`Error compiling SCSS: ${args.path}: ${error}`);
                return {
                    contents: `/* Error: ${error} */`, loader: "js" 
                };
            }
        });
    },
}

export default sassPlugin;