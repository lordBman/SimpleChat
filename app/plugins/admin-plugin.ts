import Elysia from "elysia";
import APIAuthenicationPlugin from "./user-authentication";

const adminAuthenicationPlugin = new Elysia().use(APIAuthenicationPlugin).onBeforeHandle(async ({ status, user })=>{
    if(!user || user.role !== "Admin"){
        return status(401, {message: "You don't have permission to access this route" });
    }
});

export default adminAuthenicationPlugin;