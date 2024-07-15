import express from "express";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";
import DeveloperModel from "../models/developer";

const developerRouter = express.Router();

developerRouter.get("/", async(req, res) =>{
    const model = new DeveloperModel();
    const response = await model.get(req.body.developer);
    if(response){
        return res.status(HttpStatusCode.Ok).send({ ...response, token: req.cookies.token });
    }
    return DBManager.instance().errorHandler.display(res);
});

export default developerRouter;