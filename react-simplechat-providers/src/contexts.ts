import React from "react";
import { ChatContextType, FriendsContextType, MembersContextType, UserContextType } from "./models";

export const FriendsContext = React.createContext<FriendsContextType | null>(null);
export const useFriendsContext = () => {
    const init = React.useContext(FriendsContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to use FriendsContext");
    }
    return init;
}

export const UserContext = React.createContext<UserContextType>({ loading: false, isError: false });
export const useUserContext = () => {
    const init = React.useContext(UserContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call UserContext");
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