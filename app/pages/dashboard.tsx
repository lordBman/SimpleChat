import ReactDOM from "react-dom/client";
import { DashBoard } from "simplechat-pages";
import React from "react";

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <DashBoard />);
}else{
    console.log("root element not found");
}