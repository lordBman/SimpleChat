import Chats from "./chats";
import Groups from "./connections";
import Info from "./info";
import Settings from "./settings";
import Connections from "./connections";
import React, { use } from "react";
import { useAppContext } from "../../providers/app-provider";

const Sections = () =>{
    const { pageState } = useAppContext();

    return (
        <>
            { pageState.section === "chats" && <Chats /> }
            { pageState.section === "connections" && <Connections /> }
            { pageState.section === "settings" && <Settings /> }
            { pageState.section === "info" && <Info /> }
        </>
    );
}

export default Sections;