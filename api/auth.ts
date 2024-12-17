import { HttpStatusCode } from "axios";
import express, { Response } from "express";
import { Err, SeedResult } from "../config";
import DeveloperModel from "../models/developer";
import jwt from "jsonwebtoken";
import ClientModel from "../models/clients";
import jetLogger from "jet-logger";

const cookieResponse = (res: Response<any>, result: any & { credential: Credential }) =>{
    const token = jwt.sign({ credential: result.credential }, process.env.SECRET || "test", { expiresIn: "7 days" } );
            
    res.cookie(`token`, token, { httpOnly: true });
    return res.status(HttpStatusCode.Accepted).send(result);
}

const authRouter = express.Router();

authRouter.post("/", async(req, res) =>{
    if(req.body.name && req.body.surname && (req.body.email || req.body.username) && req.body.password){
        try{
            const seed = SeedResult.instance();

            let model: ClientModel | DeveloperModel = new ClientModel();
            if(req.body.admin && req.body.organization && req.body.organization.id === seed.organizationID && req.body.project && req.body.project.id === seed.projectID){
                model = new DeveloperModel();
            }
            const client = await model.create(req.body);

            return cookieResponse(res, client);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when creating user" });
        }
    }
    return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
});

authRouter.post("/login", async(req, res) =>{
    if((req.body.email || req.body.username) && req.body.password){
        try{
            const model = new ClientModel();
            const client = await model.signin(req.body);

            return cookieResponse(res, client);
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return res.status(err.code).send({ message: err.message });
            }
            return res.status(HttpStatusCode.InternalServerError).send({ message: "an internal server error occurred when signing in user" });
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