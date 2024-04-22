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
import React from "react";
import { dashboardRenderer, signinRenderer } from "../pages/renderer";

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
    return signinRenderer(res);
    //return res.render("signin.njk", { title : "Simple Chat | Signin", year: new Date().getFullYear() });
};

routes.use("/chats", APIAuthenication, chatRouter);
routes.use("/friends", APIAuthenication, friendRouter);
routes.use("/users", userRouter);

routes.get("/", secureRoute, async(req, res) =>{
    return dashboardRenderer(res);
});

export default routes;