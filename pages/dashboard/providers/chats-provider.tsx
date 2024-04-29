import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { AppContext, AppContextType } from './app-provider';
import { axiosInstance, getCookie } from '../../utils';
import { io } from "socket.io-client";
import { ChannelResponse, ChatsResponse, FriendResponse, GroupResponse } from '../../responses';
//import { FriendsContext, FriendsContextType } from './friends-provider';

interface ChatState{
    chats: ChatsResponse;
    loading: boolean;
    isError: boolean;
    message?: any
}

export type ChatContextType = {
    chats: ChatsResponse;
    current?: ChannelResponse | GroupResponse | FriendResponse;
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
    //const { friends } = React.useContext(FriendsContext) as FriendsContextType;

    const [current, setCurrent] = useState<ChannelResponse | GroupResponse | FriendResponse>();

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

    const makeCurrent = (response: ChannelResponse | GroupResponse | FriendResponse)=> {
        if("acceptorID" in response){
            const friend = response as FriendResponse;

            const init = state.chats.find((chat)=>{
                if("friendID" in chat){
                    const channelResponse = chat as ChannelResponse;
                    return channelResponse.friendsID === friend.id;
                }
            });
            setCurrent(init || response);
        }else{
            setCurrent(response);
        }
    }

    const send = (message: string) =>{
        if("acceptorID" in current!){
            const friendResponse = current as FriendResponse;

            if(friendResponse.acceptorID === data?.id){
                socket.emit("chat", { message, receiverID: friendResponse.requesterID });
            }else{
                socket.emit("chat", { message, receiverID: friendResponse.acceptorID });
            }
        }else if("friendID" in current!){
            socket.emit("chat", { message }, (current as ChannelResponse).id);
        }
    }

    const typing = () =>{

    }

    const socket = React.useMemo(() => {
        return io("http://localhost:5000", { auth: { token: data?.token, access: "access-key" } });
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
        <ChatContext.Provider value={{ ...state, refreshChats, makeCurrent, send, typing, current }}>{ children }</ChatContext.Provider>
    );
}

export default ChatProvider;