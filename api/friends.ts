import express from "express";
import { HttpStatusCode } from "axios";
import FriendModel from "../models/friends";
import { Err } from "../config";
import jetLogger from "jet-logger";

const friendRouter = express();

friendRouter.get("/search:query", async(req, res)=>{
    if(req.query.query){
        try{
            const query = req.query.query as string;

            const model = new FriendModel();
            const response = await model.find({ ...req.body, query });
            
            return res.status(HttpStatusCode.Ok).send(response);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred while searching for users" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.post("/cancel", async(req, res)=>{
    if(req.body.id){
        try{
            const model = new FriendModel();
            const response = await model.reject(req.body);
            
            return res.status(HttpStatusCode.Ok).send({ message: response });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred while canceling friend request" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.patch("/accept", async(req, res)=>{
    if(req.body.id ?? req.query.id){
        try{
            const model = new FriendModel();
            const response = await model.accept({ ...req.body, id: req.body.id ?? req.query.id });
            
            return res.status(HttpStatusCode.Ok).send(response );
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred while accepting friend request" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.patch("/reject", async(req, res)=>{
    if(req.body.id ?? req.query.id){
        try{
            const model = new FriendModel();
            const response = await model.reject({ ...req.body, id: req.body.id ?? req.query.id });
            
            return res.status(HttpStatusCode.Ok).send(response );
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred while rejecting friend request" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.post("/", async(req, res)=>{
    if(req.body.userID){
        try{
            const model = new FriendModel();
            const response = await model.request(req.body);

            return res.status(HttpStatusCode.Created).send(response);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred while sending friend request" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

friendRouter.get("/", async(req, res)=>{
    try{
        const model = new FriendModel();
        const response = await model.all(req.body);

        return res.status(HttpStatusCode.Ok).send(response);
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return res.status(err.code).send({ message: err.message });
        }
        return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred while getting list of friends" });
    }
});

export default friendRouter;