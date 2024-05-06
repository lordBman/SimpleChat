import { staticPlugin } from '@elysiajs/static';
import path from "path";
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import userRouter from "./users";
import Elysia from 'elysia';

const routes = new Elysia();

routes.use(staticPlugin({assets: path.resolve(__dirname, "../assets"), prefix: "/assets"}));

nunjucks.configure(path.resolve(__dirname, "../views"), {
    express: routes,
    autoescape: true,
    noCache: false,
    watch: true
});

routes.group("/users", userRouter);

routes.get("/", async(req, res) =>{
    if(req.cookies && req.cookies.token){
        return res.render("homepage.njk", { title : "Simple Chat | Home", year: new Date().getFullYear() });
    }
    return res.redirect("/signin");
});

routes.get("/signin", async(req, res) =>{
    if(req.cookies && req.cookies.token){
        return res.redirect("/");
    }
    return res.render("signin.njk", { title : "Simple Chat | Signin", year: new Date().getFullYear() });
});

export default routes;