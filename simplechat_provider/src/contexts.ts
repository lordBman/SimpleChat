import React from "react";
import { ChatContextType, FriendsContextType, MembersContextType, ClientContextType } from "./models";

export const ClientContext = React.createContext<ClientContextType>({ loading: false, isError: false });
export const useClientContext = () => {
    const init = React.useContext(ClientContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call ClientContext");
    }
    return init;
}

export const FriendsContext = React.createContext<FriendsContextType | null>(null);
export const useFriendsContext = () => {
    const init = React.useContext(FriendsContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to use FriendsContext");
    }
    return init;
}

export const ChatContext = React.createContext<ChatContextType | null>(null);
export const useChatContext = () => {
    const init = React.useContext(ChatContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call ChatContext");
    }
    return init;
}

export const MembersContext = React.createContext<MembersContextType | null>(null);
export const useMembersContext = () => {
    const init = React.useContext(MembersContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to use MembersContext");
    }
    return init;
}