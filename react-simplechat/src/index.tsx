import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { ChatContext, ClientContext, FriendsContext, MembersContext, useClientContext } from "./contexts";
import { ChatState, FriendsState, MembersState } from "./models";
import { Friend, Member, SimpleChatClientConfig, SimpleChatDeveloperConfig } from "@simplechat/shared";
import { Chat } from "@simplechat/shared/models";
import { SimpleChatClient } from "simplechatjs"
import { useRequest } from "./request";

const ClientProvider: React.FC<React.PropsWithChildren & { clientConfig?: SimpleChatClientConfig, developerConfig?: SimpleChatDeveloperConfig }> = ({ children, clientConfig, developerConfig }) => {
    const { data, error, loading, isError } = useRequest({
        fn: () => {
            if(developerConfig){
                return SimpleChatClient.init(developerConfig);
            }
            return SimpleChatClient.connect(clientConfig!);
        }
    });
    
    return (
        <ClientContext.Provider value={{ client: data, isError, loading, message: error }}>{ children }</ClientContext.Provider>
    );
}


const FriendsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { client } = useClientContext();
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: false, isError: false, friends: user?.friends!  });

    const initCallback = useCallback(()=>{
        if(socket){
            socket.on("friends/request", (response: Friend) =>{
                const init = [response, ...friendsState.friends]
                setFriendsState(state => ({...state, friends: init }));
            });
        
            socket.on("friends/accept", (response: Friend) =>{
                console.log(JSON.stringify(`just recieved: ${response}`));
                
                const index = friendsState.friends.findIndex((value)=> response.id === value.id);
                const init = [...friendsState.friends];
                init.splice(index, 1, response);
        
                setFriendsState(state => ({...state, friends: init }));
            });
        
            socket.on("friends/cancel", (response: Friend) =>{
                const index = friendsState.friends.findIndex((value)=> response.id === value.id);
                const init = [...friendsState.friends];
                init.splice(index, 1);
        
                setFriendsState(state => ({...state, friends: init }));
            });

            socket.on("friends/error", (error: any) =>{
                
            });
        }
    }, [socket]);

    useEffect(()=> initCallback(), [ initCallback, socket ]);

    const request = (userID: string) =>{
        if(socket)
            socket.emit("friends/request", { userID });
    }

    const accept = (friendID: string) =>{
        if(socket)
            socket.emit("friends/accept", { friendID }, friendID);
    }

    const cancel = (friendID: string) =>{
        if(socket)
            socket.emit("friends/cancel", { friendID }, friendID);
    }

    const refreshFriendsMutation = useRequestCallBack({
        fn: () => axiosInstance.get(`/friends?key=${accessKey}`),
        started:()=> setFriendsState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        success(data) {
            setFriendsState(init => { return { ...init, loading: false, isError: false, message: "", friends: data.data }});
        },
        failed(error) {
            setFriendsState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshFriends = () => refreshFriendsMutation.run();

    return (
        <FriendsContext.Provider value={{ ...friendsState, refreshFriends, accept, cancel, request }}>{ children }</FriendsContext.Provider>
    );
}

const MembersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { user, accessKey, socket } = useUserContext();
    const [membersState, setMembersState] = useState<MembersState>({ loading: false, isError: false, members: user?.members!  });

    const initCallback = useCallback(()=>{
        if(socket){
            socket.on("groups/request", (response: Member) =>{
                const init = [response, ...membersState.members]
                setMembersState(state => ({...state, members: init }));
            });
        
            socket.on("groups/accept", (response: Member) =>{
                console.log(JSON.stringify(`just recieved: ${response}`));
                
                const index = membersState.members.findIndex((value)=> response.credentialID === value.credentialID);
                const init = [...membersState.members];
                init.splice(index, 1, response);
        
                setMembersState(state => ({...state, members: init }));
            });
        
            socket.on("cancel", (response: Friend) =>{
                const index = membersState.members.findIndex((value)=> response.id === value.credentialID);
                const init = [...membersState.members];
                init.splice(index, 1);
        
                setMembersState(state => ({...state, members: init }));
            });
        }
    }, [socket]);

    useEffect(()=> initCallback(), [ initCallback, socket ]);

    const refreshMembersMutation = useRequestCallBack({
        fn: () => axiosInstance.get(`/groups?key=${accessKey}`),
        started:()=> setMembersState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        success(data) {
            setMembersState(init => { return { ...init, loading: false, isError: false, message: "", friends: data.data }});
        },
        failed(error) {
            setMembersState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshMembers = () => refreshMembersMutation.run();

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

    const initCallback = useCallback(()=>{
        if(socket){
            socket.on("chat", (data: any, room: any)=>{
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
    }, [socket]);

    useEffect(()=> initCallback(), [ initCallback, socket ]);

    const refreshChatsMutation = useRequestCallBack({
        fn: () => axiosInstance.get(`/chats?key=${accessKey}`),
        started:()=> setState(init => { return { ...init, loading: true, isError: false, messages: "refreshing chats list"}}),
        success(response) {
            setState(init => {
                return { ...init, loading: false, isError: false, message: "", chats: response.data }
            });
        },
        failed(error) {
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

    const refreshChats = () => refreshChatsMutation.run();

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

const SimpleChatProver: React.FC<PropsWithChildren & { clientConfig?: SimpleChatClientConfig, developerConfig?: SimpleChatDeveloperConfig }> = ({ children, clientConfig, developerConfig }) =>{
    if(!clientConfig  && !developerConfig){
        throw Error("Simple Chat provider requires a client or developer Configuration, but neither was provided");
    }
    return (
        <ClientProvider clientConfig={clientConfig} developerConfig={developerConfig}>
            <MultiProvider providers={[ FriendsProvider, MembersProvider, ChatProvider ]}>
                {children}
            </MultiProvider>
        </ClientProvider>
    );
}

export default SimpleChatProver;