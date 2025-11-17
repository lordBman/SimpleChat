import React from "react";
import ReactDOM from "react-dom/client";

const  Docs = () =>{
    return  (
        <div>Simple Chat Documetation</div>
    );
}

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <Docs />);
}else{
    console.log("root element not found");
}