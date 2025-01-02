import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import pages from "./pages";
import api from "./api";

const routes = express();

routes.use(bodyParser.urlencoded({ extended: true }));
routes.use(bodyParser.json());
routes.use(cookieParser());

routes.use("/assets", express.static(path.resolve(__dirname, "./assets")));

routes.use("/api", api);
routes.use("/", pages);

export default routes;