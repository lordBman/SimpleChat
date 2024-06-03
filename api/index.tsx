import express from "express";
import chatRouter from "./chat";
import friendRouter from "./friends";
import userRouter, { APIAuthenication } from "./users";

const api = express.Router();

api.use("/chats", APIAuthenication, chatRouter);
api.use("/friends", APIAuthenication, friendRouter);
api.use("/users", userRouter);

export default api;