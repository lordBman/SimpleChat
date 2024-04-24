import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { Channel, Friend, Group } from '@prisma/client';
import { AppContext, AppContextType } from './app-provider';
import { axiosInstance } from '../../utils';

interface ChatState{
    chats: Array<Channel | Group>;
    loading: boolean;
    isError: boolean;
    message?: any
}

export type ChatContextType = {
    chats: Array<Channel | Group>;
    current?: Channel | Group | Friend;
    loading: boolean,
    isError: boolean,
    message?: any, 
    refreshChats: CallableFunction;
}

export const ChatContext = React.createContext<ChatContextType | null>(null);

const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data } = React.useContext(AppContext) as AppContextType;
    const [current, setCurrent] = useState<Channel | Group | Friend>();

    const [state, setState] = useState<ChatState>({ loading: false, isError: false, chats: data?.chats! });

    const refreshChatsMutation = useMutation({
        mutationKey:  ["chats"],
        mutationFn: () => axiosInstance.get("/chats"),
        onMutate:()=> setState(init => { return { ...init, loading: true, isError: false, messages: "refreshing chats list"}}),
        onSuccess(response) {
            setState(init => {
                return { ...init, loading: false, isError: false, message: "", chats: response.data }
            });
        },
        onError(error) {
            setState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshChats = () => refreshChatsMutation.mutate();

    return (
        <ChatContext.Provider value={{ ...state, refreshChats, current }}>{ children }</ChatContext.Provider>
    );
}

export default ChatProvider;