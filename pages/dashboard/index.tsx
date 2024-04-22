import React, { Suspense, useContext, useState } from "react";

import { Chats, Friends, Groups, Info, Notifications, Settings, Profile } from "./sections";

import Menu from "../conponents.tsx/menu";
import { Chat } from "./main";
import AppProvider, { AppContext, AppContextType } from "./providers";
import { QueryClient, QueryClientProvider, useQueryClient } from "react-query";

const Loading = () =>{
    return (
        <div id="loading" style={{ display:"flex", alignItems: "center", justifyContent: "center" }}>
            <div className="loading">loadung</div>
        </div>
    );
}


const Dashboard = () =>{
    const [active, setActive] = useState("chats");

    const activeChange = (id: string) => setActive(id);

    const { loading, isError, message } = useContext(AppContext) as AppContextType;

    return (
        <>
            { !loading && !isError && <div id="content" className="content">
                <Menu active={active} onClicked={activeChange} />
                <div className="sections">
                    { active === "profile" && <Profile /> }
                    { active === "chats" && <Chats /> }
                    { active === "notifications" && <Notifications /> }
                    { active === "groups" && <Groups /> }
                    { active === "friends" && <Friends /> }
                    { active === "settings" && <Settings /> }
                    { active === "info" && <Info /> }
                </div>
                <Chat />
            </div> }

            { loading && <Loading /> }
            { !loading && isError && <div>Error: {message}</div> }
        </>
    );
}

const App = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <Dashboard />
            </AppProvider>
        </QueryClientProvider>
    );
}

export default App;