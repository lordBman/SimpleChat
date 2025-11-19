import api from "./api";
import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";
import sockets from "./sockets";

const app = new Elysia()
.use(api)
.use(sockets)
.use(staticPlugin({ assets: "./assets", prefix: "/assets" }))
.use(staticPlugin({ assets: "./public", prefix: "/" }))
.all("*", ({ status })=>{
    return status(404, { message: "page not found" });
});

export default app;