import ReactDOMClient from "react-dom/client";
import Homepage from "../homepage";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <Homepage />);