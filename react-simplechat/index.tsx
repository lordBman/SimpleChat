import { PropsWithChildren, useState } from "react";
import { ChatContext, ClientContext, FriendsContext, MembersContext, useClientContext } from "./contexts";
import { ChatState, FriendsState, MembersState } from "./models";
import { Friend, Member, SimpleChatClientConfig, SimpleChatDeveloperConfig } from "@simplechat/shared";
import { SimpleChatClient } from "simplechatjs"
import { useRequest, useRequestCallBack } from "./request";
import React from "react";
import { Chats } from "@simplechat/shared/models";

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
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: false, isError: false, friends: client?.state.friends ?? [] });

    const request = (userID: string) => client?.sendFriendRequest(userID);
    const accept = (friendID: string) =>client?.acceptFriendRequest(friendID);
    const cancel = (friendID: string) =>client?.cancelFriendRequest(friendID);
    if(client){
        client.onFriendChange = (friends: Friend[]) => setFriendsState(init => { return { ...init, friends: friends }});
    }

    const refreshFriendsMutation = useRequestCallBack({
        fn: () => client?.refreshFriends()!,
        started:()=> setFriendsState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        success(_) {
            setFriendsState(init => { return { ...init, loading: false, isError: false, message: "", friends: client?.state.friends! }});
        },
        failed(error) {
            setFriendsState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshFriends = () => refreshFriendsMutation.run();

    return (
        <FriendsContext.Provider value={{ ...friendsState, friends: client?.state.friends!, refreshFriends, accept, cancel, request }}>{ children }</FriendsContext.Provider>
    );
}

const MembersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { client } = useClientContext();
    const [membersState, setMembersState] = useState<MembersState>({ loading: false, isError: false, members: client?.state?.members ?? []  });

    const refreshMembers = () => refreshMembersMutation.run();

    const create = (name: string) => {}
    const accept = (userID: string, groupID: string) => {}
    const decline = (userID: string, groupID: string) => {}
    const assign = (userID: string, groupID: string, role: "Member" | "Admin") => {}
    const remove = (groupID: string) => {}
    const leave = (groupID: string)  => {}

    if(client){
        client.onMemberChange = (members: Member[]) => setMembersState(init => { return { ...init, members}});
    }

    const refreshMembersMutation = useRequestCallBack({
        fn: () => client?.refreshMembers()!,
        started:()=> setMembersState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        success(_) {
            setMembersState(init => { return { ...init, loading: false, isError: false, message: "", members: client?.state?.members ?? [] }});
        },
        failed(error) {
            setMembersState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    return (
        <MembersContext.Provider value={{ ...membersState, refreshMembers, create, accept, decline, assign, leave, remove }}>{ children }</MembersContext.Provider>
    );
}

const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { client } = useClientContext();
    const [status, setStatus] = useState<{ room?:string, message?: string }>({});
    const [state, setState] = useState<ChatState>({ loading: false, isError: false, chats: client?.state.chats! });

    if(client){
        client.onChatsChange = (chats: Chats) => setState(init => { return { ...init, chats: chats } });
    }

    const refreshChatsMutation = useRequestCallBack({
        fn: () => client?.refreshChats()!,
        started:()=> setState(init => { return { ...init, loading: true, isError: false, messages: "refreshing chats list"}}),
        success(_) {
            setState(init => {
                return { ...init, loading: false, isError: false, message: "", chats: client?.state.chats! }
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

    const send = (message: string, targert: Friend | Member) => client?.send(message, targert);
    const typing = (targert: Friend | Member) => client?.typing(targert);

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

interface SimpleChatProviderProps extends PropsWithChildren{ 
    clientConfig?: SimpleChatClientConfig, 
    developerConfig?: SimpleChatDeveloperConfig 
}

export const SimpleChatProvider: React.FC<SimpleChatProviderProps> = ({ children, clientConfig, developerConfig }) =>{
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

export default SimpleChatProvider;