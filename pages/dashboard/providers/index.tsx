import React, { useContext } from "react";
import { PropsWithChildren } from "react";
import ChatProvider from "./chats-provider";
import FriendsProvider from "./friends-provider";
import MultiProvider from "./multiple-provider";
import AppProvider, { AppContext, AppContextType } from "./app-provider";
import MembersProvider from "./members-provider";

const Provider: React.FC<PropsWithChildren> = ({children}) =>{
    return (
        <MultiProvider providers={[MembersProvider, FriendsProvider, ChatProvider]}>
            {children}
        </MultiProvider>
    );
}

const Error = () =>{
    return (
        <div>Error</div>
    );
}

interface ProviderWraperProps extends PropsWithChildren{
    Loading: React.FC<PropsWithChildren>
}

const ProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading }) =>{
    const app = useContext(AppContext) as AppContextType;
    return (
        <>
            { app.loading && <Loading /> }
            { !app.loading && app.isError && <Error /> }
            { !app.loading && !app.isError && <Provider>{children}</Provider> }
        </>
    );
}

export { AppProvider }

export default ProviderWraper;