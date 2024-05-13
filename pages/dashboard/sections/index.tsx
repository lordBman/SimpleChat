import React from "react";
import Chats from "./chats";
import Friends from "./friends";
import Groups from "./groups";
import Info from "./info";
import Notifications from "./notifications";
import Profile from "./profile";
import Settings from "./settings";
import { MainContext, MainContextType } from "../providers/main-provider";
import { MobileHeader } from "../../conponents";

const Sections = () =>{
    const { section } = React.useContext(MainContext) as MainContextType;

    return (
        <div className="sections">
            <MobileHeader />
            { section === "profile" && <Profile /> }
            { section === "chats" && <Chats /> }
            { section === "notifications" && <Notifications /> }
            { section === "groups" && <Groups /> }
            { section === "friends" && <Friends /> }
            { section === "settings" && <Settings /> }
            { section === "info" && <Info /> }
        </div>
    );
}

export default Sections;