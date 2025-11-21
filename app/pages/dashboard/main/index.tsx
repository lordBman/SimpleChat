import Chat from "./chat";
import Home from "./home";
import Projects from "./projects";
import Developers from "./developers";
import React from "react";
import { useLocation } from "react-router-dom";

const Main = () =>{
    const location = useLocation();

    const current: String = location.pathname.split("/")[2];

    switch(current){
        case "chats":
        case "connections":
            return <Chat />
        case "projects":
            return <Projects />
        case "developers":
            return <Developers />
        default:
            return <Home />;
    }
}

export default Main;