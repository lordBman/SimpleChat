import ReactDOMClient from "react-dom/client";
import { Signin } from "simplechat-pages";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Signin />);