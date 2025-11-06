import { seed } from "./config";
import jetLogger from "jet-logger";
import app from "./app";

seed().then(()=>{
    const port = Number.parseInt(process.env.PORT || "5000");
    app.listen(port, (details)=>{
        jetLogger.info(details);
        jetLogger.info(`🦊 Elysia is running at ${details?.hostname}:${details?.port}`);
    });
}).catch((e) => {
    jetLogger.err(e);
    process.exit(1);
});