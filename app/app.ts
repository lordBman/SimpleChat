import api from "./api";
import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";
import sockets from "./sockets";

const app = new Elysia();
//app.use(api);
//app.use(sockets);
app.use(staticPlugin({ assets: "./assets", prefix: "/assets" }));
app.use(staticPlugin({ assets: "./public", prefix: "/" }));

export default app;