import { DBManager } from "../config";
import { UserModel } from "../models";
import { Elysia, t } from "elysia";

const userRouter = new Elysia().group("/users", init =>{
    return init.guard({ body: t.Object({ name: t.String(),  email: t.String(), password: t.String()  }) },
        inner => inner.post("/", async(context) =>{
            if(context.body.name && context.body.password){
                const model = new UserModel();
                const user = await model.signin(context.body);
                if(user){
                    res.cookie(`token`, user);
                    res.redirect(`/`);
                }
                return DBManager.instance().errorHandler.display(res);
            }
            return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
        })
    ).get("/", async(req, res) =>{
        if(req.cookies.token){
            const model = new UserModel();
            const response = await model.get(req.cookies);
            if(response){
                return res.status(HttpStatusCode.Ok).send(response);
            }
            return DBManager.instance().errorHandler.display(res);
        }
        return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
    }).get("/logout", async(req, res) =>{
        if(req.cookies.token){
            res.cookie(`token`, '');
            return res.redirect("/signin");
        }else{
            return res.status(HttpStatusCode.BadRequest).send({message: "invalid req to server"});
        }
    });
});

export default userRouter;