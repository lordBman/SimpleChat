import Sections from "./sections";
import Main from "./main";
import { BottomNavigation, DashBoard as DashBoardView, ErrorPage, Loading, MobileHeader } from "../components";
import Options from "../components/dashboard/menu/options";
import { useMemo, useContext } from "react";
import { ToolBarItem } from "../components/dashboard/tool-bar";
import SimpleChatProvider from "simplechat_provider";
import AppProviderWraper, { AppContext, AppContextType, MainPage, Section, useAppContext } from "../providers/app-provider";
import React from "react";
import ReactDOM from "react-dom/client";
import { SimpleChatConfig } from "@simplechat/shared";


const App = () =>{
    const { user, pageState, setPage } = useAppContext();
    const [current, setCurrent] = React.useState<MainPage | Section>(pageState.section ?? pageState.current);

    const chosen = (id: string)=> {
        if(id === "logout"){
            window.location.href = "/logout";
            return;
        }

        setCurrent(id as MainPage | Section);

        switch(id){
            case "home":
            case "developers":
            case "projects":
                setPage({ main: id as MainPage ?? "home" });
                break;
            case "chats":
            case "connections":
                setPage({ section: id as Section, main: "chat" });
            case "settings":
            case "info":
                setPage({ section: id as Section });
                break;
        }
    };


    const simpleChatConfig: SimpleChatConfig | undefined = useMemo(()=>{
        if(!user || !user.defaults){
            throw Error("User is not defined");
        }
        return {
            id: user.details.id,
            projectToken: user!.defaults!.projectToken, accessKey: user!.defaults!.key.key, 
            name: user!.details.name, surname: user.details.surname, email: user!.details.email!, 
            username: user!.details.username!,
        };
    }, [user]);
    
    return (
        <SimpleChatProvider config={ simpleChatConfig }>
            <DashBoardView>
                <DashBoardView.Menu initial={current} choose={chosen}>
                    <Options>
                        <Options.Item id="home" isMiddle icon="hugeicons--dashboard-square-02" label="Home" />
                        <Options.Item id="developers" isMiddle icon="hugeicons--computer-programming-01" label="Developers" hide={user?.role !== "Admin"} />
                        <Options.Item id="projects" isMiddle icon="hugeicons--code" label="Projects" />
                        <Options.Item id="chats" isMiddle icon="fluent--chat-20-regular" label="Chats" />
                        <Options.Item id="connections" isMiddle icon="heroicons--user-group" label="Connections" />
                    </Options>
                    <Options>
                        <Options.Item id="settings" icon="et--gears" label="Settings" />
                        <Options.Item id="info" icon="clarity--help-info-line" label="Info" />
                    </Options>
                </DashBoardView.Menu>
                <DashBoardView.ToolBar title="Simple Chat">
                    <ToolBarItem id="settings/user" icon="guidance--user-1" label={`Hi, ${user?.details.name}`} choose={chosen} />
                    <ToolBarItem icon="solar--bell-linear" id="notifications" choose={chosen} />
                    <ToolBarItem icon="solar--exit-outline" id="logout" choose={chosen} />
                </DashBoardView.ToolBar>
                <DashBoardView.Section hide={pageState.section === undefined}>
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
    return (
        <AppProviderWraper Loading={Loading} Error={ErrorPage}>
            <App />
        </AppProviderWraper>
    );
}

const element = document.getElementById("root");
if(element){
    const root = ReactDOM.createRoot(element);
    root.render( <DashBoard />);
}else{
    console.log("root element not found");
}
