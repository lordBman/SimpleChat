import api from "./api";
import { Elysia, file } from "elysia";
import staticPlugin from "@elysiajs/static";
import sockets from "./sockets";
import PageAuthenicationPlugin from "./plugins/page-authentication";

const app = new Elysia().use(PageAuthenicationPlugin).onBeforeHandle(({ redirect, user, path })=>{
    console.log(path);
    if(path.toLocaleLowerCase().startsWith("/dashboard") && !user){
        return redirect("/signin");
    }else if(path.toLocaleLowerCase().startsWith("/signin") && user){
        return redirect("/dashboard")
    }
})

app.use(api)
app.use(sockets)
app.use(staticPlugin({ assets: "./assets", prefix: "/assets" }));
app.get('/', () => file('./public/index.html')).use(staticPlugin())

app.all("*", ({ status })=>{
    return status(404, { message: "page not found" });
});

export default app;