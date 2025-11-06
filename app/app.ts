import pages from "./pages";
import api from "./api";
import Elysia from "elysia";
import staticPlugin from "@elysiajs/static";

const app = new Elysia().use(api);
app.use(staticPlugin({ assets: "/assets", prefix: "/assets" }));
app.use(pages);

export default app;