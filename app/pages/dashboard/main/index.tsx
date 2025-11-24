import Chat from "./chat";
import Home from "./home";
import Projects from "./projects";
import Developers from "./developers";
import React from "react";
import { useAppContext } from "../../providers/app-provider";

const Main = () =>{
    const { pageState } = useAppContext();

    switch(pageState.current){
        case "chat":
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