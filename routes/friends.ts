import express from "express";
import { HttpStatusCode } from "axios";
import FriendModel from "../models/friends";

const friendRouter = express();

friendRouter.get("/search", async(req, res)=>{
    if(req.query.query){
        const query = req.query.query as string;

        const model = new FriendModel();
        const response = await model.find({ query, user: req.body.user  });

        return res.status(HttpStatusCode.Ok).send(response);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.post("/cancel", async(req, res)=>{
    if(req.body.id){
        const model = new FriendModel();
        const response = await model.reject(req.body);

        return res.status(HttpStatusCode.Ok).send(response);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.post("/accept", async(req, res)=>{
    if(req.body.id){
        const model = new FriendModel();
        const response = await model.accept(req.body);

        return res.status(HttpStatusCode.Ok).send(response);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.post("/", async(req, res)=>{
    if(req.body.userID){
        const model = new FriendModel();
        const response = await model.request(req.body);

        return res.status(HttpStatusCode.Created).send(response);
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.get("/", async(req, res)=>{
    const model = new FriendModel();
    const response = await model.all(req.body);

    return res.status(HttpStatusCode.Ok).send(response);
});

export default friendRouter;