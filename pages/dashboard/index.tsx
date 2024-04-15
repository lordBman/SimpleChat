import React, { Suspense, useState } from "react";

import "../../assets/css/icons.css";
import "../../assets/css/main.css";

import { Chats, Friends, Groups, Info, Notifications, Settings, Profile } from "./sections";

import Menu from "../conponents.tsx/menu";
import { Chat } from "./main";

const Loading = () =>{
    return (
        <div id="loading" style={{ display:"flex", alignItems: "center", justifyContent: "center" }}>
            <div className="loading"></div>
        </div>
    );
}


const Dashboard = (props:  { user: any }) =>{
    const [active, setActive] = useState("chats");

    const activeChange = (id: string) => setActive(id);

    return (
        <Suspense fallback={<Loading />}>
            <div id="content" className="content">
                <Menu active={active} onClicked={activeChange} />
                <div className="sections">
                    { active === "profile" && <Profile name={props.user.name} email={ props.user.email } /> }
                    { active === "chats" && <Chats /> }
                    { active === "notifications" && <Notifications /> }
                    { active === "groups" && <Groups /> }
                    { active === "friends" && <Friends /> }
                    { active === "settings" && <Settings /> }
                    { active === "info" && <Info /> }
                </div>
                <Chat />
            </div>
        </Suspense>
    );
}

export default Dashboard;