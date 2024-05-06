import { Elysia, t } from "elysia";
import jetLogger from "jet-logger";
import routes from "./routes";

const port = Number.parseInt(process.env.PORT || "5000");

const app = new Elysia();

app.use(routes);

app.ws('/ws', {
  body: t.Object({ message: t.String() }),
  open(ws){
    jetLogger.info(`user connected: ${ws.id}`);
  },
  message(ws, message) {
      ws.send(message)
  },
  close(ws){
    jetLogger.info(`user left: ${ws.id}`);
  }
})

app.onStart(()=>{
  jetLogger.info(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
});

app.listen(port);