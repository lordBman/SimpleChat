import Chat from "./chat";
import Home from "./home";
import Projects from "./projects";
import Developers from "./developers";
import React from "react";
import { usePageContext } from "../../providers/page-provider";

const Main = () =>{
    const { pageState } = usePageContext();

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