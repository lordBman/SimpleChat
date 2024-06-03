import ReactDOMClient from "react-dom/client";
import Chat from "../chat";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Chat />);