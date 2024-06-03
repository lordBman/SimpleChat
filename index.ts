import { Server } from "socket.io";
import routes from "./routes";
import sockets from "./sockets";
import { seed } from "./config";
import jetLogger from "jet-logger";

seed().then(()=>{
    const port = Number.parseInt(process.env.PORT || "5000");
    const server = routes.listen(port, () =>{ jetLogger.info(`Express server started on port: ${port}`); });
    
    sockets(new Server(server)); 
}).catch((e) => {
    jetLogger.err(e);
    process.exit(1);
});