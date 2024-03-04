import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import { UserModel } from "../models";

const userRouter = express.Router();

userRouter.post("/", async(req, res) =>{
    if(req.body.name && req.body.password){
        const model = new UserModel();
        const user = await model.signin(req.body);
        if(user){
            res.cookie(`token`, user);
            res.redirect(`/`);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

userRouter.get("/", async(req, res) =>{
    if(req.cookies.token){
        const model = new UserModel();
        const response = await model.get(req.cookies);
        if(response){
            return res.status(HttpStatusCode.Ok).send(response);
        }
        return DBManager.instance().errorHandler.display(res);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

userRouter.get("/logout", async(req, res) =>{
    if(req.cookies.token){
        res.cookie(`token`, '');
        return res.redirect("/signin");
    }else{
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }
});

export default userRouter;