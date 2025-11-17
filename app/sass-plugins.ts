import type { BunPlugin } from "bun";

// Register SCSS loader
const sassPlugin: BunPlugin ={
  name: "scss loader",
  setup(build) {
    build.onResolve({ filter: /\.scss$/ }, (args) => {
      console.log(`🎯 Resolving SCSS: ${args.path} from ${args.importer}`);
      return null; // Let Bun handle resolution
    });

    build.onLoad({ filter: /\.scss$/, namespace: "file" }, async (args) => {
      try {
        const sass = await import('sass');
        const result = await sass.compileAsync(args.path);
      
        console.log(`Compiled SCSS: ${args.path}`);
        return {
            contents: result.css,
            loader: "css"
        };
      }catch (error) {
        console.error(`Error compiling SCSS: ${args.path}`, error);
        return {
          contents: `/* Error: ${error} */`,
          loader: "js"
        };
      }
    });
  },
}

export default sassPlugin;