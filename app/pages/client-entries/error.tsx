import ReactDOMClient from "react-dom/client";
import ErrorPage from "../error";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <ErrorPage />);