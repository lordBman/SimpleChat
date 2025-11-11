
import {Docs} from "simplechat-pages";
import React from "react";
import ReactDOM from "react-dom/client";

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <Docs />);
}else{
    console.log("root element not found");
}