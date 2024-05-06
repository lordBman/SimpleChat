import ReactDOMClient from "react-dom/client";
import App from "../dashboard";
import React from "react";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <App />);