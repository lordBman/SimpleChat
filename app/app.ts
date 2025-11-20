import api from "./api";
import { Elysia, file } from "elysia";
import staticPlugin from "@elysiajs/static";
import sockets from "./sockets";
import PageAuthenicationPlugin from "./plugins/page-authentication";

const app = new Elysia().use(PageAuthenicationPlugin).onBeforeHandle(async ({ redirect, user, path })=>{
    if(path.toLocaleLowerCase().startsWith("/dashboard") && !user){
        return redirect("/signin");
    }else if(path.toLocaleLowerCase().startsWith("/signin") && user){
        return redirect("/dashboard")
    }
});

app.use(api)
app.use(sockets)
app.use(staticPlugin({ assets: "./assets", prefix: "/assets" }));
app.use(staticPlugin({ assets: "./public/chunks", prefix: "/chunks" }));

app.get("/", () => file("./public/homepage.html"));
app.get("/signin", () => file("./public/signin.html"));
app.get("/dashboard", () => file("./public/dashboard.html"));
app.get("/docs", () => file("./public/docs.html"));
app.get("/error", () => file("./public/error.html"));

app.all("*", ({ status })=>{
    return status(404, { message: "page not found" });
});

export default app;