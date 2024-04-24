import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { Channel, Friend, Group } from '@prisma/client';
import { AppContext, AppContextType } from './app-provider';
import { axiosInstance, getCookie } from '../../utils';
import { io } from "socket.io-client";

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

    const socket = React.useMemo(() => {
        const token = getCookie("token");

        return io("http://localhost:5000", { auth: { token, access: "access-key" } });
    }, [data?.id]);

    socket.on("chat", (data)=>{
        
    });

    socket.on("typing", (data)=>{
        
    });

    socket.on("connected", ()=>{
        console.log(socket.connected);
    });

    const init = React.useCallback(()=>{
        if(!current && data?.chats && data.chats.length > 0){
            setCurrent(data.chats[0]);
        }
    }, [current]);

    React.useEffect(()=> init(), [init, current]);

    const refreshChats = () => refreshChatsMutation.mutate();

    return (
        <ChatContext.Provider value={{ ...state, refreshChats, current }}>{ children }</ChatContext.Provider>
    );
}

export default ChatProvider;