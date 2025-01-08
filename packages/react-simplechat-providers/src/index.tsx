import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { SimpleChatClientConfig } from "simplechat/src";
import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Chat, Friend, Member } from "simplechat/src/models";
import { io } from "socket.io-client";
import { ChatState, FriendsState, MembersState } from "./models";
import { ChatContext, FriendsContext, MembersContext, UserContext, useUserContext } from "./contexts";
import axios from "axios";

const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true,
	baseURL: "/api" });

const UserProvider: React.FC<React.PropsWithChildren & { config: SimpleChatClientConfig }> = ({ children, config }) => {
    const { data, error, isLoading, isError } = useQuery({
        queryKey:  ["data"],
        queryFn: () => axiosInstance.get(`/?key=${config.accessKey}`),
    });

    const socket = React.useMemo(() => {
        if(data?.data){
            const init = io("/", { auth: { token: data.data?.token, access: "access-key",  key: config.accessKey } });
            init.on("connected", ()=>{
                console.log(init.connected);
            });
            return init;
        }
    }, [data?.data]);
    
    return (
        <UserContext.Provider value={{ user: data?.data, isError, loading: isLoading, message: error, socket, accessKey: config.accessKey }}>{ children }</UserContext.Provider>
    );
}


const FriendsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { user, socket, accessKey } = useUserContext();
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: false, isError: false, friends: user?.friends!  });

    const initCallback = useCallback(()=>{
        if(socket){
            socket.on("request", (response: Friend) =>{
                const init = [response, ...friendsState.friends]
                setFriendsState(state => ({...state, friends: init }));
            });
        
            socket.on("accept", (response: Friend) =>{
                console.log(JSON.stringify(`just recieved: ${response}`));
                
                const index = friendsState.friends.findIndex((value)=> response.id === value.id);
                const init = [...friendsState.friends];
                init.splice(index, 1, response);
        
                setFriendsState(state => ({...state, friends: init }));
            });
        
            socket.on("cancel", (response: Friend) =>{
                const index = friendsState.friends.findIndex((value)=> response.id === value.id);
                const init = [...friendsState.friends];
                init.splice(index, 1);
        
                setFriendsState(state => ({...state, friends: init }));
            });
        }
    }, [socket]);

    useEffect(()=> initCallback(), [ initCallback, socket ]);

    const request = (userID: string) =>{
        if(socket)
            socket.emit("request", { userID });
    }

    const accept = (friendID: string) =>{
        if(socket)
            socket.emit("accept", { friendID }, friendID);
    }

    const cancel = (friendID: string) =>{
        if(socket)
            socket.emit("cancel", { friendID }, friendID);
    }

    const refreshFriendsMutation = useMutation({
        mutationKey:  ["friend"],
        mutationFn: () => axiosInstance.get(`/friends?key=${accessKey}`),
        onMutate:()=> setFriendsState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        onSuccess(data) {
            setFriendsState(init => { return { ...init, loading: false, isError: false, message: "", friends: data.data }});
        },
        onError(error) {
            setFriendsState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshFriends = () => refreshFriendsMutation.mutate();

    return (
        <FriendsContext.Provider value={{ ...friendsState, refreshFriends, accept, cancel, request }}>{ children }</FriendsContext.Provider>
    );
}

const MembersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { user, accessKey, socket } = useUserContext();
    const [membersState, setMembersState] = useState<MembersState>({ loading: false, isError: false, members: user?.members!  });

    const refreshMembersMutation = useMutation({
        mutationKey:  ["groups"],
        mutationFn: () => axiosInstance.get(`/groups?key=${accessKey}`),
        onMutate:()=> setMembersState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        onSuccess(data) {
            setMembersState(init => { return { ...init, loading: false, isError: false, message: "", friends: data.data }});
        },
        onError(error) {
            setMembersState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshMembers = () => refreshMembersMutation.mutate();

    const create = (name: string) => {

    }

    const accept = (userID: string, groupID: string) => {

    }

    const decline = (userID: string, groupID: string) => {

    }

    const assign = (userID: string, groupID: string, role: "Member" | "Admin") => {

    }

    const remove = (groupID: string) => {

    }

    const leave = (groupID: string)  => {

    }

    return (
        <MembersContext.Provider value={{ ...membersState, refreshMembers, create, accept, decline, assign, leave, remove }}>{ children }</MembersContext.Provider>
    );
}

const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { user, socket, accessKey } = useUserContext();
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
        mutationFn: () => axiosInstance.get(`/chats?key=${accessKey}`),
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

interface MultiProviderProps extends React.PropsWithChildren{
    providers: React.FC<React.PropsWithChildren>[],
}
  
const MultiProvider: React.FC<MultiProviderProps> = ({ providers, children }) => {
    return providers.reduceRight((child, Provider) => <Provider>{child}</Provider>, children);
};

const SimpleChatProver: React.FC<PropsWithChildren & { config: SimpleChatClientConfig }> = ({ children, config }) =>{
    return (
        <UserProvider config={config}>
            <MultiProvider providers={[ FriendsProvider, MembersProvider, ChatProvider ]}>
                {children}
            </MultiProvider>
        </UserProvider>
    );
}

export default SimpleChatProver;