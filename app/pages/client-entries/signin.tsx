import ReactDOMClient from "react-dom/client";
import Signin from "../signin";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Signin />);