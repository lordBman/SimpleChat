import express, { NextFunction, Response, Request } from "express";
import path from "path";
import nunjucks from "nunjucks";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import userRouter, { APIAuthenication } from "./users";
import { UserModel } from "../models";
import jwt from "jsonwebtoken";
import jetLogger from "jet-logger";
import chatRouter from "./chat";
import friendRouter from "./friends";
import renderReact from "../pages/renderer";
import React from "react";
import Test from "../pages/dashboard";

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

const secureRoute = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token){
        try{
            req.body.user = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).user;

            return next();
        }catch(error){
            jetLogger.err(error);
        }
    }
    return res.render("signin.njk", { title : "Simple Chat | Signin", year: new Date().getFullYear() });
};

routes.use("/chats", APIAuthenication, chatRouter);
routes.use("/friends", APIAuthenication, friendRouter);
routes.use("/users", userRouter);



routes.get("/", secureRoute, async(req, res) =>{
    const data = await new UserModel().get(req.body.user);
    if(data){
        return res.render("homepage.njk", { title : "Simple Chat | Home", year: new Date().getFullYear(), user:data });
    }
    res.render("error.njk", { message: "Something went wrong, try again later" });
});

routes.get("/test", secureRoute, async(request, response) =>{
    const data = await new UserModel().get(request.body.user);
    if(data){
        return renderReact("dashboard", response, <Test user={data} />, data);
    }
    response.render("error.njk", { message: "Something went wrong, try again later" });
});

export default routes;