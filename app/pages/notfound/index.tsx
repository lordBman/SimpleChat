import React from "react";
import { createRoot } from "react-dom/client";

const NotFound = () =>{
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center" }}>
            <h1 style={{ fontSize: "6rem", margin: 0 }}>404</h1>
            <h2 style={{ fontSize: "2rem", margin: "1rem 0" }}>Page Not Found</h2>
            <p style={{ fontSize: "1rem", color: "#666" }}>The page you are looking for does not exist.</p>
        </div>
    );
}

const element = document.getElementById("root");
if(element){
    const root = createRoot(element);
    root.render( <NotFound />);
}else{
    console.log("root element not found");
}