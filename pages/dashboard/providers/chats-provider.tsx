import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { AppContext, AppContextType } from './app-provider';
import { axiosInstance } from '../../utils';
import { io } from "socket.io-client";
import { ChatResponse, ChatsResponse, FriendResponse, GroupResponse } from '../../responses';
import { FriendsContext, FriendsContextType } from './friends-provider';

interface ChatState{
    chats: ChatsResponse;
    loading: boolean;
    isError: boolean;
    message?: any
}

export type ChatContextType = {
    chats: ChatsResponse;
    current?: GroupResponse | FriendResponse;
    order: string[],
    loading: boolean,
    isError: boolean,
    message?: any, 
    refreshChats: CallableFunction;
    makeCurrent: CallableFunction;
    send: CallableFunction;
    typing: CallableFunction;
}

export const ChatContext = React.createContext<ChatContextType | null>(null);

const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data } = React.useContext(AppContext) as AppContextType;
    const { friends } = React.useContext(FriendsContext) as FriendsContextType;

    const [current, setCurrent] = useState<GroupResponse | FriendResponse>();

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

    const order = React.useMemo(()=>{
        const map = new Map(Object.entries(state.chats));
        
        return Array.from(map.entries()).sort((entryA, entryB)=>{
            if(entryA[1].length > 0 && entryB[1].length > 0){
                return entryB[1][ entryB[1].length - 1].created.toString().localeCompare(entryA[1][  entryA[1].length - 1].created.toString());
            }else if(entryB[1].length > 0){
                return 1;
            }
            return -1;
        }).map((init)=> init[0]);
    }, [state.chats]);

    const makeCurrent = (response: GroupResponse | FriendResponse)=> {
        setCurrent(response);
    }

    const send = (message: string) =>{
        if("acceptorID" in current!){
            const friendResponse = current as FriendResponse;

            socket.emit("chat", { message, friendID: friendResponse.id }, friendResponse.id);
        }
    }

    const typing = () =>{

    }

    const socket = React.useMemo(() => {
        return io("http://localhost:5000", { auth: { token: data?.token, access: "access-key" } });
    }, [data?.id]);

    socket.on("chat", (data, room)=>{
        let reponse: ChatResponse[] = [data];

        if(state.chats[room]){
            reponse = state.chats[room].concat();
            reponse.push(data);
        }
        let chats = {...state.chats};
        chats[room] = reponse;

        setState((init)=> { return {...init, chats: chats } });

        console.log(`Recieved chat - ${JSON.stringify(room)}: ${JSON.stringify(data)}`);
    });

    socket.on("typing", (data)=>{
        
    });

    socket.on("connected", ()=>{
        console.log(socket.connected);
    });

    const init = React.useCallback(()=>{
        if(!current && order.length > 0){
            const init = friends.find((value)=> value.id === order[0])
            setCurrent(init);
        }
    }, [order]);

    React.useEffect(()=> init(), [init, order]);

    const refreshChats = () => refreshChatsMutation.mutate();

    return (
        <ChatContext.Provider value={{ ...state, refreshChats, makeCurrent, send, typing, current, order }}>{ children }</ChatContext.Provider>
    );
}

export default ChatProvider;