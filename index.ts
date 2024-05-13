import jetLogger from "jet-logger";
import { Server } from "socket.io";
import routes from "./routes";
import sockets from "./sockets";

const port = Number.parseInt(process.env.PORT || "5000");

const server = routes.listen(port, () =>{ jetLogger.info(`Express server started on port: ${port}`); });

sockets(new Server(server));