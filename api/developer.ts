import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import jetLogger from "jet-logger";
import { HttpStatusCode } from "axios";
import { DBManager } from "../config";

export const DeveloperAPIAuthenication = async (req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.token){
        try{
            req.body.user = (jwt.verify(req.cookies.token, process.env.SECRET || "test" ) as any).user;

            return next();
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