import express, { NextFunction, Response, Request } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import userRouter, { APIAuthenication } from "./users";
import jwt from "jsonwebtoken";
import jetLogger from "jet-logger";
import chatRouter from "./chat";
import friendRouter from "./friends";
import { dashboardRenderer, signinRenderer } from "../pages/renderer";

const routes = express();

routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());
routes.use(cookieParser());

routes.use("/assets", express.static(path.resolve(__dirname, "../assets")));

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
};

routes.use("/chats", APIAuthenication, chatRouter);
routes.use("/friends", APIAuthenication, friendRouter);
routes.use("/users", userRouter);

routes.get("/", secureRoute, async(req, res) =>{
    return dashboardRenderer(res);
});

export default routes;