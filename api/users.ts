import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import { UserModel } from "../models";

const userRouter = express.Router();

userRouter.get("/", async(req, res) =>{
    const model = new UserModel();
    const response = await model.get(req.body);
    if(response){
        return res.status(HttpStatusCode.Ok).send({ ...response, token: req.cookies.token });
    }
    return DBManager.instance().errorHandler.display(res);
});


export default userRouter;