import ReactDOMClient from "react-dom/client";
import { DashBoard } from "simplechat-pages";
import React from "react";

const root = ReactDOMClient.createRoot( document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <DashBoard />
    </React.StrictMode>
);