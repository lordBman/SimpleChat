import React from "react";
import ReactDOMClient from "react-dom/client";
import ErrorPage from "simplechat-pages/src/error";

ReactDOMClient.hydrateRoot( document.getElementById("root")!, <ErrorPage />);