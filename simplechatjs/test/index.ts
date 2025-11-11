import staticPlugin from "@elysiajs/static";
import Elysia, { t } from "elysia";
import jetLogger from "jet-logger";

const app = new Elysia();
app.use(staticPlugin({ assets: "public", prefix: "/" }));
app.listen(5000, (config)=>{
     jetLogger.info(`🦊 Elysia is running at ${config?.hostname}:${config?.port}`);
});