import ReactDOMClient from "react-dom/client";
import Developer from "../developer";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Developer />);