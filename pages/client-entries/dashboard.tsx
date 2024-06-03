import ReactDOMClient from "react-dom/client";
import DashBoard from "../dashboard";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <DashBoard />);