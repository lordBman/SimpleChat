import Sections from "./sections";
import Main from "./main";
import { BottomNavigation, DashBoard as DashBoardView, ErrorPage, Loading, MobileHeader } from "../components";
import Options from "../components/dashboard/menu/options";
import { useMemo } from "react";
import { ToolBarItem } from "../components/dashboard/tool-bar";
import SimpleChatProvider from "simplechat_provider";
import AppProviderWraper, { useAppContext } from "../providers/app-provider";
import React from "react";
import ReactDOM from "react-dom/client";
import { SimpleChatConfig } from "@simplechat/shared";
import PageProvider, { MainPage, Section, usePageContext } from "../providers/page-provider";

const App = () =>{
    const { user } = useAppContext();
    const { pageState, navigate } = usePageContext();
    const [current, setCurrent] = React.useState<MainPage | Section>(pageState.section ?? pageState.current);

    const chosen = (id: string)=> {
        if(id === "logout"){
            window.location.href = "/logout";
            return;
        }

        setCurrent(id as MainPage | Section);
        navigate("", `/${id}`);
    };


    const simpleChatConfig: SimpleChatConfig | undefined = useMemo(()=>{
        if(!user || !user.defaults){
            throw Error("User is not defined");
        }
        return {
            id: user.details.id, organization: user!.defaults!.organization,
            projectToken: user!.defaults!.projectToken, accessKey: user!.defaults!.key.key, 
            name: user!.details.name, surname: user.details.surname, email: user!.details.email!
        };
    }, [user]);
    
    return (
        <SimpleChatProvider config={ simpleChatConfig }>
            <DashBoardView>
                <DashBoardView.Menu initial={current} choose={chosen}>
                    <Options key="kchdcvhifvbhvfibvfi">
                        <Options.Item id="home" key={"home"} isMiddle icon="hugeicons--dashboard-square-02" label="Home" />
                        <Options.Item id="developers" key={"developers"} isMiddle icon="hugeicons--computer-programming-01" label="Developers" hide={user?.role !== "Admin"} />
                        <Options.Item id="projects" key={"projects"} isMiddle icon="hugeicons--code" label="Projects" />
                        <Options.Item id="chats" key={"chats"} isMiddle icon="fluent--chat-20-regular" label="Chats" />
                        <Options.Item id="connections" key={"connections"} isMiddle icon="heroicons--user-group" label="Connections" />
                    </Options>
                    <Options key={"cmvbfjvbhfvhfivhfiv"}>
                        <Options.Item key={"settings"} id="settings" icon="et--gears" label="Settings" />
                        <Options.Item key={"info"} id="info" icon="clarity--help-info-line" label="Info" />
                    </Options>
                </DashBoardView.Menu>
                <DashBoardView.ToolBar title="Simple Chat">
                    <ToolBarItem id="settings/user" icon="guidance--user-1" label={`Hi, ${user?.details.name}`} choose={chosen} />
                    <ToolBarItem icon="solar--bell-linear" id="notifications" choose={chosen} />
                    <ToolBarItem icon="solar--exit-outline" id="logout" choose={chosen} />
                </DashBoardView.ToolBar>
                <DashBoardView.Section hide={pageState.section === undefined || pageState.section === "none"}>
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
            <PageProvider>
                <App />
            </PageProvider>
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
