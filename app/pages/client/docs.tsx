import ReactDOMClient from "react-dom/client";
import { Docs } from "simplechat-pages";
import React from "react";

const root = ReactDOMClient.createRoot( document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Docs />
    </React.StrictMode>
);