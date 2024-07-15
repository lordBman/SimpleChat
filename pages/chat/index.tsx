import { Chats, Friends, Groups, Info, Notifications, Profile, Settings } from "./sections";

import Main from "./main";
import { QueryClient, QueryClientProvider } from "react-query";
import ProviderWraper, { AppProvider } from "../providers";
import { BottomNavigation, DashBoard, Loading, MobileHeader } from "../conponents";
import Options from "../conponents/dashboard/menu/options";
import React from "react";
import { MainContext, MainContextType } from "../providers/main-provider";


const App = () =>{
    const { section, setSection } = React.useContext(MainContext) as MainContextType;

    const chosen = (id: string)=> setSection(id);
    
    return (
        <DashBoard>
            <DashBoard.Menu initial={section} choose={chosen}>
                <Options>
                    <Options.Item id="profile" isMiddle icon="guidance--user-1" label="Profile" />
                    <Options.Item id="chats" isMiddle icon="fluent--chat-20-regular" label="Chats" />
                    <Options.Item id="notifications" isMiddle icon="solar--bell-linear" label="Notifications" />
                    <Options.Item id="groups" isMiddle icon="heroicons--user-group" label="Groups" />
                    <Options.Item id="friends" isMiddle icon="system-uicons--contacts" label="Friends" />
                </Options>
                <Options>
                    <Options.Item id="settings" icon="et--gears" label="Settings" />
                    <Options.Item id="logout" icon="solar--exit-outline" label="Logout" />
                    <Options.Item id="info" icon="clarity--help-info-line" label="Info" />
                </Options>
            </DashBoard.Menu>
            <DashBoard.Section>
                <MobileHeader />
                { section === "profile" && <Profile /> }
                { section === "chats" && <Chats /> }
                { section === "notifications" && <Notifications /> }
                { section === "groups" && <Groups /> }
                { section === "friends" && <Friends /> }
                { section === "settings" && <Settings /> }
                { section === "info" && <Info /> }
            </DashBoard.Section>
            <DashBoard.Content>
                <Main />
            </DashBoard.Content>
            <DashBoard.Bottom active={section}  choose={chosen}>
                <BottomNavigation.Item id="profile" icon="guidance--user-1" label="Profile" />
                <BottomNavigation.Item id="chats" icon="fluent--chat-20-regular" label="Chats" />
                <BottomNavigation.Item id="groups" icon="heroicons--user-group" label="Groups" />
                <BottomNavigation.Item id="friends" icon="system-uicons--contacts" label="Friends" />
                <BottomNavigation.Item id="settings" icon="et--gears" label="Settings" />
            </DashBoard.Bottom>
        </DashBoard>
    );
}


const Chat = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <ProviderWraper Loading={Loading}>
                    <App />
                </ProviderWraper>
            </AppProvider>
        </QueryClientProvider>
    );
}

export default Chat;
