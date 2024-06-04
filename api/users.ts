import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import jetLogger from "jet-logger";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import { UserModel } from "../models";
import AccessKeyModel from "../models/access-keys";

export const UserAPIAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token && req.cookies.key){
        try{
            req.body.user = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).user;
    
            const accessKey = await new AccessKeyModel().get(req.cookies.key);
            if(accessKey?.enabled){            
                req.body.project = accessKey.project;
    
                return next();
            }else{
                return res.status(HttpStatusCode.Unauthorized).send({message: "API Access key found but has been deactivated" });
            }
        }catch(error){
            jetLogger.err(error);
            if(error instanceof jwt.TokenExpiredError){
                return res.status(HttpStatusCode.Unauthorized).send({message: "access token expired, try refreshing or login again"});
            }else{
                return res.status(HttpStatusCode.InternalServerError).send({message: "error encountered when authenticating user"});
            }
        }
    }
    return res.status(HttpStatusCode.Unauthorized).send({message: "access token expired, try refreshing or login again"});
};

const userRouter = express.Router();

userRouter.post("/", async(req, res) =>{
    if(req.body.name && req.body.email && req.body.password){
        const model = new UserModel();
        const user = await model.create(req.body);
        if(user){
            res.cookie(`token`, user, { httpOnly: true });
            return res.status(HttpStatusCode.Accepted).send(user);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

userRouter.post("/login", async(req, res) =>{
    if(req.body.email && req.body.password){
        const model = new UserModel();
        const user = await model.signin(req.body);
        if(user){
            res.cookie(`token`, user, {  httpOnly: true });
            return res.status(HttpStatusCode.Accepted).send(user);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

userRouter.get("/", UserAPIAuthenication, async(req, res) =>{
    const model = new UserModel();
    const response = await model.get(req.body.user);
    if(response){
        return res.status(HttpStatusCode.Ok).send({ ...response, token: req.cookies.token });
    }
    return DBManager.instance().errorHandler.display(res);
});

userRouter.get("/logout", async(req, res) =>{
    if(req.cookies.token){
        res.cookie(`token`, '');
        res.cookie(`key`, '');
        return res.status(HttpStatusCode.Accepted).send({ message: "you have logged out successfully" });
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default userRouter;