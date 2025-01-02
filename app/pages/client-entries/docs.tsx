import ReactDOMClient from "react-dom/client";
import Docs from "../docs";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Docs />);