import { Err } from "../config";
import DeveloperModel from "../models/developer";
import jetLogger from "jet-logger";
import { t, Elysia } from "elysia";
import { ClienitModel } from "../models";
import keyAuthenicationPlugin from "../plugins/key-authentication";
import JWTPlugin from "../plugins/jwt-plugin";

const authRouter = new Elysia({ prefix: "/auth" }).use(JWTPlugin)
.post("/", async({ encrypt, status, body, cookie: { token } }) =>{
    try{
        const user = await new DeveloperModel().create({ ...body });
        const value = await encrypt(user);
        token?.set({ value, httpOnly: true, maxAge: 7 * 86400 });

        return status(201, { message: "Registration successful", ...user });
    }catch(error){
        jetLogger.err(error);
        if(error instanceof Err){
            const err = error as Err;
            return status(err.code, { message: err.message });
        }else{
            return status(503, { message: "an internal server error occurred when creating user" })
        }
    }
}, { body: t.Object({ name: t.String(), surname: t.String(), email: t.String(), username: t.String(), password: t.String() }) })

.post("/login", async ({ encrypt, body, status, cookie: { token } }) =>{
    try{
        const user = await new DeveloperModel().signin({ ...body });
        const value = await encrypt(user);
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

.get("/logout", async({ status, cookie: { token } }) =>{
    token?.set({ value: '', maxAge: 0, httpOnly: true });
    
    return status(200, { message: "Logout successful" });
});

authRouter.use(new Elysia().use(keyAuthenicationPlugin).use(JWTPlugin).post("/connect", async({ encrypt, body, status, cookie: { client_token } , project, organization }) =>{
    if(body.email || body.username){
        try{
            const client = await new ClienitModel().connect({ ...body, project: project!, organization });
            const value = await encrypt(client);
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
}, { body: t.Object({ id: t.String(), name: t.String(), surname: t.String(), email: t.Optional(t.String()), username: t.Optional(t.String()) }) }));

export default authRouter;