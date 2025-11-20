import sassPlugin from "./sass-plugins";
import JetLogger from "jet-logger";

Bun.build({
    entrypoints: ['./pages/homepage.html', "./pages/signin.html", "./pages/error.html"],
    outdir: './public',
    minify: true,
    sourcemap: "external",
    splitting: false,
    drop: ['console', 'debugger'],
    plugins: [ sassPlugin ],
    naming: {
        entry: '[name].[ext]',
        chunk: '[dir]/chunks/[name].[ext]',
        asset: '[dir]/assets/[name]-[hash].[ext]'
    }
}).then((init)=>{
    if (!init.success) {
        JetLogger.err(`Build failed: ${init.logs}`);
        process.exit(1);
    }
});