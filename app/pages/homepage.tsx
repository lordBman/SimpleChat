import React from "react";
import {Homepage} from "simplechat-pages";
import ReactDOM from "react-dom/client";

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <Homepage />);
}else{
    console.log("root element not found");
}