import Sections from "./sections";

import Main from "./main";
import { QueryClient, QueryClientProvider } from "react-query";
import ProviderWraper, { AppProvider } from "./providers";
import "../css/chats/main.scss";
import { BottomNavigation, Menu, Loading } from "../conponents";

const Chat = () =>{
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <AppProvider>
                <ProviderWraper Loading={Loading}>
                    <div id="content" className="content">
                        <Menu />
                        <Sections />
                        <Main />
                        <BottomNavigation />
                    </div>
                </ProviderWraper>
            </AppProvider>
        </QueryClientProvider>
    );
}

export default Chat;
