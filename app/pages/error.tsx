import React from "react";
import ErrorPage from "simplechat-pages/src/error";
import ReactDOM from "react-dom/client";;

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <ErrorPage />);
}else{
    console.log("root element not found");
}