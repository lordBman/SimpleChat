import { Err } from "../config";
import DeveloperModel from "../models/developer";
import jetLogger from "jet-logger";
import Elysia, { t } from "elysia";
import jwt from "@elysiajs/jwt";
import { keyAuthenicationPlugin } from "./plugins";
import { ClienitModel } from "../models";

const authRouter = new Elysia({ prefix: "/auth" }).use(jwt({ name: 'jwt', secret: process.env.SECRET || 'test'})).decorate({ "developerModel": new DeveloperModel(), "clientModel": new ClienitModel() });

authRouter.post("/", async({ jwt, status, body, developerModel, cookie: { token } }) =>{
    try{
        const user = await developerModel.create({ ...body });
        const value = await jwt.sign({ user });
        token?.set({ value, httpOnly: true, maxAge: 7 * 86400 });

        return status(201, { message: "Registration successful", ...user });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when creating user" });
        }
    }
}, { body: t.Object({ name: t.String(), surname: t.String(), email: t.String(), username: t.String(), password: t.String() }) })

authRouter.use(keyAuthenicationPlugin).post("/connect", async({ jwt, body, status, clientModel, cookie: { client_token } , project, organization }) =>{
    if(body.email || body.username){
        try{
            const client = await clientModel.connect({ ...body, project: project!, organization });
            const value = await jwt.sign({ client });
            client_token?.set({ value, httpOnly: true, maxAge: 7 * 86400 });

            return status(200, { message: "client connetion success", ...client });
        }catch(error){
            jetLogger.err(error);
            if(error instanceof Err){
                const err = error as Err;
                return status(err.code, { message: err.message });
            }else{
                return status(503, { message: "an internal server error occurred when creating user" });
            }
        }
    }else{
        return status(400, {message: "invalid req to server"});
    }
}, { body: t.Object({ id: t.String(), name: t.String(), surname: t.String(), email: t.Optional(t.String()), username: t.Optional(t.String()) }) })

authRouter.post("/login", async ({ jwt, body, status, developerModel, cookie: { token } }) =>{
    try{
        const user = await developerModel.signin({ ...body });
        const value = await jwt.sign({ user });
        token?.set({ value, httpOnly: true, maxAge: 7 * 86400 });

        return status(200, { message: "Login successful", ...user });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when signing in user" });
        }
    }
}, { body: t.Object({ email: t.String(), password: t.String() }) })

authRouter.get("/logout", async({ status, cookie: { token } }) =>{
    token?.set({ value: '', maxAge: 0, httpOnly: true });
    
    return status(200, { message: "Logout successful" });
});

export default authRouter;