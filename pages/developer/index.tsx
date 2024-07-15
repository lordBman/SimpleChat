import { QueryClient, QueryClientProvider } from "react-query";
import { DashBoard, Loading } from "../conponents";
import Options from "../conponents/dashboard/menu/options";
import ProviderWraper, { AppProvider } from "../providers";

const App = ()=>{
    return (
        <DashBoard>
            <DashBoard.Menu initial="home">
                <Options>
                    <Options.Item id="home" isMiddle icon="solar--home-linear" label="Home" />
                    <Options.Item id="projects" isMiddle icon="hugeicons--code" label="Projects" />
                    <Options.Item id="messanger" isMiddle icon="fluent--chat-20-regular" label="Messanger" />
                </Options>
                <Options>
                    <Options.Item id="settings" icon="et--gears" label="Settings" />
                    <Options.Item id="logout" icon="solar--exit-outline" label="Logout" />
                    <Options.Item id="info" icon="clarity--help-info-line" label="Info" />
                </Options>    
            </DashBoard.Menu>
            <DashBoard.Content>
                Dashboard 
            </DashBoard.Content>
        </DashBoard>
    );
}

const Developer = () =>{
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

export default Developer;