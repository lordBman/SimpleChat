import ReactDOMClient from "react-dom/client";
import { Homepage } from "simplechat-pages";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Homepage />);