import { Chats, Friends, Groups, Info, Notifications, Settings } from "./sections";

import Main from "./main";
import { QueryClient, QueryClientProvider } from "react-query";
import ProviderWraper, { AppProvider } from "../providers";
import { BottomNavigation, DashBoard as DashBoardView, Loading, MobileHeader } from "../conponents";
import Options from "../conponents/dashboard/menu/options";
import React from "react";
import { AppContext, AppContextType } from "../providers/app-provider";
import { Roles } from "@prisma/client";
import { BrowserRouter, Route, Switch, useHistory, useLocation } from "react-router-dom";


const App = () =>{
    const { user } = React.useContext(AppContext) as AppContextType;
    const location = useLocation();
    const history = useHistory();

    const chosen = (id: string)=> history.push(`dashbaord/${id}`);

    const current = location.pathname.split("/")[1];
    
    return (
        <DashBoardView>
            <DashBoardView.Menu initial={current} choose={chosen}>
                <Options>
                    <Options.Item id="profile" isMiddle icon="guidance--user-1" label="Profile" />
                    <Options.Item id="projects" isMiddle icon="hugeicons--code" label="Projects" hide={user?.role === Roles.Client} />
                    <Options.Item id="chats" isMiddle icon="fluent--chat-20-regular" label="Chats" />
                    <Options.Item id="notifications" isMiddle icon="solar--bell-linear" label="Notifications" />
                    <Options.Item id="developers" isMiddle icon="heroicons--user-group" label="Developers" hide={user?.role !== Roles.Admin} />
                    <Options.Item id="groups" isMiddle icon="heroicons--user-group" label="Groups" />
                    <Options.Item id="friends" isMiddle icon="system-uicons--contacts" label="Friends" />
                </Options>
                <Options>
                    <Options.Item id="settings" icon="et--gears" label="Settings" />
                    <Options.Item id="logout" icon="solar--exit-outline" label="Logout" />
                    <Options.Item id="info" icon="clarity--help-info-line" label="Info" />
                </Options>
            </DashBoardView.Menu>
            <DashBoardView.Section>
                <MobileHeader />
                <Switch>
                    <Route path="dashboard/chats">
                        <Chats />
                    </Route>
                        <Route path="dashboard/groups">
                    <Groups />
                    </Route>
                    <Route path="dashboard/friends">
                        <Friends />
                    </Route>
                    <Route path="dashboard/settings">
                        <Settings />
                    </Route>
                    <Route path="dashboard/info">
                        <Info />
                    </Route>
                </Switch>
            </DashBoardView.Section>
            <DashBoardView.Content>
                <Main />
            </DashBoardView.Content>
            <DashBoardView.Bottom active={current}  choose={chosen}>
                <BottomNavigation.Item id="profile" icon="guidance--user-1" label="Profile" />
                <BottomNavigation.Item id="chats" icon="fluent--chat-20-regular" label="Chats" />
                <BottomNavigation.Item id="groups" icon="heroicons--user-group" label="Groups" />
                <BottomNavigation.Item id="friends" icon="system-uicons--contacts" label="Friends" />
                <BottomNavigation.Item id="settings" icon="et--gears" label="Settings" />
            </DashBoardView.Bottom>
        </DashBoardView>
    );
}


const DashBoard = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <BrowserRouter>
                    <ProviderWraper Loading={Loading}>
                        <App />
                    </ProviderWraper>
                </BrowserRouter>
            </AppProvider>
        </QueryClientProvider>
    );
}

export default DashBoard;
