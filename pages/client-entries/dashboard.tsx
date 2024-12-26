import ReactDOMClient from "react-dom/client";
import DashBoard from "../dashboard";
import React from "react";

const root = ReactDOMClient.createRoot( document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <DashBoard />
    </React.StrictMode>
);