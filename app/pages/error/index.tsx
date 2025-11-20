import React from "react";
import ReactDOM from "react-dom/client";

const ErrorPage = () =>{
    return (
        <div>
            You do not have permission to access this page.
        </div>
    );
}

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <ErrorPage />);
}else{
    console.log("root element not found");
}