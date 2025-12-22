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
app.use(staticPlugin({ assets: "public/chunks", prefix: "/chunks" }));

app.get("/", () => file("./public/homepage.html"));
app.get("/signin", () => file("./public/signin.html"));
app.get("/dashboard/:path?/:sub?", async() =>{
    const file = Bun.file("./public/dashboard.html");
    const content = (await file.text()).replaceAll("./chunks", "/chunks");
    return new Response(content, {
        headers: {
            "Content-Type": "text/html"
        }
    });
});
app.get("/docs", () => file("./public/docs.html"));
app.get("/error", () => file("./public/error.html"));
app.get("/logout", ({ redirect, cookie: { token } }) =>{
    token?.set({ value: '', maxAge: 0, httpOnly: true });
    
    return redirect("/");
});

app.all("*", ()=> file("./public/notfound.html"));

export default app;