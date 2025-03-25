import Sections from "./sections";
import Main from "./main";
import { QueryClient, QueryClientProvider } from "react-query";
import { BottomNavigation, DashBoard as DashBoardView, ErrorPage, Loading, MobileHeader } from "../conponents";
import Options from "../conponents/dashboard/menu/options";
import { useMemo, useContext } from "react";
import { BrowserRouter, useHistory, useLocation } from "react-router-dom";
import { ToolBarItem } from "../conponents/dashboard/tool-bar";
import { SimpleChatProvider } from "simplechat_provider";
import AppProviderWraper, { AppContext, AppContextType } from "../providers/app-provider";


const App = () =>{
    const { user } = useContext(AppContext) as AppContextType;
    const location = useLocation();
    const history = useHistory();

    const chosen = (id: string)=> history.push(`/dashboard/${id}`);

    const [current, hideSection]  = useMemo(()=>{
        const paths =  location.pathname.split('/');

        let current = "home";
        if(paths[2] && paths[2] !== ""){
            current = paths[2];
        }

        let hideSection = false;
        if(paths.length === 2 || current === "" || current === "home"){
            hideSection = true;
        }

        if(paths.length === 3 && (current === "projects" || current === "developers")){
            hideSection = true;
        }
        return [current, hideSection];
    }, [location.pathname]);
    
    return (
        <SimpleChatProvider developerConfig={{ accessToken: user?.token!, accessKey: "" }}>
            <DashBoardView>
                <DashBoardView.Menu initial={current} choose={chosen}>
                    <Options>
                        <Options.Item id="home" isMiddle icon="hugeicons--dashboard-square-02" label="Home" />
                        <Options.Item id="developers" isMiddle icon="hugeicons--computer-programming-01" label="Developers" hide={user?.role !== "Admin"} />
                        <Options.Item id="projects" isMiddle icon="hugeicons--code" label="Projects" hide={user?.role === "Client"} />
                        <Options.Item id="chats" isMiddle icon="fluent--chat-20-regular" label="Chats" />
                        <Options.Item id="connections" isMiddle icon="heroicons--user-group" label="Connections" />
                    </Options>
                    <Options>
                        <Options.Item id="settings" icon="et--gears" label="Settings" />
                        <Options.Item id="info" icon="clarity--help-info-line" label="Info" />
                    </Options>
                </DashBoardView.Menu>
                <DashBoardView.ToolBar title="Simple Chat">
                    <ToolBarItem id="settings/user" icon="guidance--user-1" label={`Hi, ${user?.name}`} choose={chosen} />
                    <ToolBarItem icon="solar--bell-linear" id="notifications" choose={chosen} />
                    <ToolBarItem icon="solar--exit-outline" id="logout" choose={chosen} />
                </DashBoardView.ToolBar>
                <DashBoardView.Section hide={hideSection}>
                    <MobileHeader />
                    <Sections />
                </DashBoardView.Section>
                <DashBoardView.Content>
                    <Main />
                </DashBoardView.Content>
                <DashBoardView.Bottom active={current}  choose={chosen}>
                    <BottomNavigation.Item id="home" icon="hugeicons--dashboard-square-02" label="Home" />
                    <BottomNavigation.Item id="chats" icon="fluent--chat-20-regular" label="Chats" />
                    <BottomNavigation.Item id="groups" icon="heroicons--user-group" label="Groups" />
                    <BottomNavigation.Item id="friends" icon="system-uicons--contacts" label="Friends" />
                    <BottomNavigation.Item id="settings" icon="et--gears" label="Settings" />
                </DashBoardView.Bottom>
            </DashBoardView>
        </SimpleChatProvider>
    );
}


const DashBoard = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppProviderWraper Loading={Loading} Error={ErrorPage}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </AppProviderWraper>
        </QueryClientProvider>
    );
}

export default DashBoard;
