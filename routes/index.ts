import express from "express";
import path from "path";
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import userRouter from "./users";

const routes = express();

routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());
routes.use(cookieParser());

routes.use("/assets", express.static(path.resolve(__dirname, "../assets")));

nunjucks.configure(path.resolve(__dirname, "../views"), {
    express: routes,
    autoescape: true,
    noCache: false,
    watch: true
});

routes.use("/users", userRouter);

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