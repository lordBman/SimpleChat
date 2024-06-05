import { HttpStatusCode } from "axios";
import express from "express";
import { DBManager } from "../config";
import { UserModel } from "../models";
import DeveloperModel from "../models/developer";
import AccessKeyModel from "../models/access-keys";

const authRouter = express.Router();

authRouter.post("/", async(req, res) =>{
    if(req.body.name && req.body.email && req.body.password){
        const model = new DeveloperModel();
        const developer = await model.create(req.body);
        if(developer){
            res.cookie(`token`, developer, { httpOnly: true });
            return res.status(HttpStatusCode.Accepted).send(developer);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

authRouter.post("/login", async(req, res) =>{
    if(req.body.email && req.body.password){
        const model = new DeveloperModel();
        const developer = await model.signin(req.body);
        if(developer){
            res.cookie(`token`, developer, {  httpOnly: true });
            return res.status(HttpStatusCode.Accepted).send(developer);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

authRouter.post("/user", async(req, res) =>{
    if(req.body.key && req.body.name && req.body.email && req.body.password){
        const accessKey = await new AccessKeyModel().get(req.body.key);
        if(accessKey){
            if(accessKey.enabled){
                req.body.key.project = accessKey.project;
    
                const model = new UserModel();
                const user = await model.create(req.body);
                if(user){
                    res.cookie(`token`, user, { httpOnly: true });
                    return res.status(HttpStatusCode.Accepted).send(user);
                }
                return DBManager.instance().errorHandler.display(res);
            }else{
                return res.status(HttpStatusCode.BadRequest).send({message: "API Access key found but has been deactivated"});
            }
        }else{
            return DBManager.instance().errorHandler.display(res);
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

authRouter.post("/user/login", async(req, res) =>{
    if(req.body.key && req.body.email && req.body.password){
        const accessKey = await new AccessKeyModel().get(req.body.key);
        if(accessKey){
            if(accessKey.enabled){
                req.body.key.project = accessKey.project;
                const model = new UserModel();
                const user = await model.signin(req.body);
                if(user){
                    res.cookie(`token`, user, {  httpOnly: true });
                    return res.status(HttpStatusCode.Accepted).send(user);
                }
                return DBManager.instance().errorHandler.display(res);
            }else{
                return res.status(HttpStatusCode.BadRequest).send({message: "API Access key found but has been deactivated"});
            }
        }else{
            return DBManager.instance().errorHandler.display(res);
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

authRouter.get("/logout", async(req, res) =>{
    if(req.cookies.token){
        res.cookie(`token`, '');
        return res.status(HttpStatusCode.Accepted).send({ message: "you have logged out successfully" });
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});


export default authRouter;