import Chats from "./chats";
import Info from "./info";
import Settings from "./settings";
import Connections from "./connections";
import React from "react";
import { usePageContext } from "../../providers/page-provider";
import Projects from "./projects";

const Sections = () =>{
    const { pageState } = usePageContext();

    return (
        <>
            { pageState.section === "chats" && <Chats /> }
            { pageState.section === "connections" && <Connections /> }
            { pageState.section === "settings" && <Settings /> }
            { pageState.section === "info" && <Info /> }
            { pageState.section === "projects" && <Projects /> }
        </>
    );
}

export default Sections;