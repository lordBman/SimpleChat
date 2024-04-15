import ReactDOM from "react-dom";
import React from "react";
import Dashboard from "./dashboard";
import Signin from "./signin";

interface InitialData{
    name: string,
    email: string
}

declare global{
    interface Window{
        initialData: string
    }
}

const root = document.getElementById("root");

if(root?.dataset.page === "dashboard"){
    ReactDOM.hydrate( <Dashboard user={JSON.parse(window.initialData)}/>, root);
}else if(root?.dataset.page === "signin"){
    ReactDOM.hydrate( <Signin />, root);
}