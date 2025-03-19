import * as React from 'react';
import { useState } from 'react';
import { useUserContext } from './user-provider';
import { useMutation } from '@tanstack/react-query';
import { Chat, Chats, Friend, Group, Member } from '@simplechat/shared/models';
import { useFriendsContext } from './friend-provider';
import { axiosInstance } from '@simplechat/shared/utils';

interface ChatState{
    chats: Chats;
    loading: boolean;
    isError: boolean;
    message?: any
}

export type ChatContextType = {
    chats: Chats;
    order: string[],
    loading: boolean,
    isError: boolean,
    message?: any, 
    refreshChats: CallableFunction;
    send: (message: string, targetID: Member | Friend) => void;
    status: { message?: string, room?: string },
    typing: (targetID: Member | Friend) => void;
}

export const ChatContext = React.createContext<ChatContextType | null>(null);
export const useChatContext = () => {
    const init = React.useContext(ChatContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call ChatContext");
    }
    return init;
}

const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { user, socket } = useUserContext();
    const { friends } = useFriendsContext();
    const [status, setStatus] = useState<{ room?:string, message?: string }>({});
    const [state, setState] = useState<ChatState>({ loading: false, isError: false, chats: user?.chats! });

    if(socket){
        socket.on("chat", (data, room)=>{
            let reponse: Chat[] = [data];
    
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
    
        socket.on("typing", (message: string, room: string)=>{
            /*if(room === status.room){
                if(status.message !== message){
                    setStatus({ message, room });
                }                
            }else if(room === current?.id){
                setStatus({ message, room });
            }*/
        });
    }

    const refreshChatsMutation = useMutation({
        mutationKey:  ["chats"],
        mutationFn: () => axiosInstance.get(`/chats?key=${ProjectKey}`),
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

    const send = (message: string, targert: Friend | Member) =>{
        if("acceptorID" in targert){
            const friend = targert as Friend;
            if(socket && friend.accepted){
                socket.emit("chat", { message, friendID: friend.id }, friend.id);
            }
        }else{
            const member = targert as Member;
            if(socket && member.accepted){
                socket.emit("chat", { message, groupID: member.group.id }, member.group.id);
            }
        }
    }

    const typing = (targert: Friend | Member) => {
        if("acceptorID" in targert){
            const friend = targert as Friend;
            if(socket && friend.accepted){
                socket.emit("typing", { status: true }, friend.id);
            }
        }else{
            const member = targert as Member;
            if(socket && member.accepted){
                socket.emit("typing", { status: true }, member.group.id);
            }
        }
    }

    const refreshChats = () => refreshChatsMutation.mutate();

    return (
        <ChatContext.Provider value={{ ...state, status, refreshChats, send, typing, order }}>{ children }</ChatContext.Provider>
    );
}

export default ChatProvider;