import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { AppContext, AppContextType } from './app-provider';
import { TypingManager, axiosInstance } from '../../utils';
import { ChatResponse, ChatsResponse, FriendResponse, GroupResponse } from '../../responses';
import { FriendsContext, FriendsContextType } from './friends-provider';
import { MainContext, MainContextType, MainPage } from './main-provider';

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
    status: { message?: string, room?: string },
    typing: CallableFunction;
    stoppedTyping: CallableFunction;
}

export const ChatContext = React.createContext<ChatContextType | null>(null);

const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data, socket } = React.useContext(AppContext) as AppContextType;
    const { friends } = React.useContext(FriendsContext) as FriendsContextType;
    const { main, set } = React.useContext(MainContext) as MainContextType;

    const [current, setCurrent] = useState<GroupResponse | FriendResponse>();
    const [status, setStatus] = useState<{ room?:string, message?: string }>({});
    const [state, setState] = useState<ChatState>({ loading: false, isError: false, chats: data?.chats! });

    if(socket){
        socket.on("chat", (data, room)=>{
            let reponse: ChatResponse[] = [data];
    
            console.log(JSON.stringify(data));
    
            if(state.chats[room]){
                reponse = state.chats[room].concat();
                reponse.push(data);
            }
            let chats = {...state.chats};
            chats[room] = reponse;
    
            setState((init)=> { return {...init, chats: chats } });
    
            console.log(`Recieved chat - ${JSON.stringify(room)}: ${JSON.stringify(data)}`);
        });
    
        socket.on("typing", (message, room)=>{
            if(room === status.room){
                if(status.message !== message){
                    setStatus({ message, room });
                }                
            }else if(room === current?.id){
                setStatus({ message, room });
            }
        });
    }

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

    const typingManager = React.useMemo(()=>{
        return new TypingManager(1000, ()=>{
            socket?.emit("typing", true , current?.id);
        });
    }, [current])

    const makeCurrent = (response: GroupResponse | FriendResponse)=> {
        setCurrent(response);
        if(main !== MainPage.Chat){
            set(MainPage.Chat);
        }
    }

    const send = (message: string) =>{
        if("acceptorID" in current!){
            const friendResponse = current as FriendResponse;

            if(socket){
                socket.emit("chat", { message, friendID: friendResponse.id }, friendResponse.id);
            }
        }
    }

    const typing = () => typingManager.run();

    const stoppedTyping = () =>{
        typingManager.stop();
        socket?.emit("typing", false, current?.id);
    }

    const init = React.useCallback(()=>{
        if(!current && order.length > 0){
            const init = friends.find((value)=> value.id === order[0])
            setCurrent(init);
        }
    }, [order]);

    React.useEffect(()=> init(), [init, order]);

    const refreshChats = () => refreshChatsMutation.mutate();

    return (
        <ChatContext.Provider value={{ ...state, status, refreshChats, makeCurrent, send, typing, stoppedTyping, current, order }}>{ children }</ChatContext.Provider>
    );
}

export default ChatProvider;