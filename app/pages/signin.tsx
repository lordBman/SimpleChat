import React from "react";
import {Signin} from "simplechat-pages";
import ReactDOM from "react-dom/client";

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <Signin />);
}else{
    console.log("root element not found");
}