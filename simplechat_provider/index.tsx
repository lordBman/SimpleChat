import { PropsWithChildren, use, useCallback, useEffect, useState } from "react";
import { ChatContext, ClientContext, FriendsContext, MembersContext, useClientContext } from "./src/contexts";
import { ChatState, ClientContextType, FriendsState, MembersState } from "./src/models";
import { SimpleChatClient } from "simplechatjs"
import { useRequest, useCallbackRequest } from "./src/request";
import React from "react";
import { Friend, Member } from "@simplechat/shared/models";
import { SimpleChatConfig } from "@simplechat/shared";

interface MultiProviderProps extends React.PropsWithChildren{
    providers: React.FC<React.PropsWithChildren>[],
}
  
const MultiProvider: React.FC<MultiProviderProps> = ({ providers, children }) => {
    return providers.reduceRight((child, Provider) => <Provider>{child}</Provider>, children);
};

type SimpleChatContextType = {
    client?: SimpleChatClient
    loading: boolean;
    isError: boolean;
    message?: any;
};

const SimpleChatContext = React.createContext<SimpleChatContextType | null>(null);
const useSimpleChatContext = () => {
    const init = React.useContext(SimpleChatContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call SimpleChatContext");
    }
    return init;
}

const ClientProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { client, loading, isError, message } = useSimpleChatContext();
    const [clientState, setClientState] = useState<ClientContextType>({ loading: true, isError: false });

    const init = useCallback(()=>{
        if(client){
            setClientState({ loading: false, isError: false, client: client.client });
        }else if(isError){
            setClientState({ loading: false, isError: true, message: message });
        }else if(loading){
            setClientState({ loading: true, isError: false });
        }
    }, [client, loading]);

    useEffect(init, [ client, loading, init ]);

    return (
        <ClientContext.Provider value={{ ...clientState }}>{ children }</ClientContext.Provider>
    );
}

const FriendsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { client, loading, isError, message } = useSimpleChatContext();
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: true, isError: false, friends: client?.state.friends ?? [] });

    const init = useCallback(()=>{
        if(client){
            setFriendsState({ loading: false, isError: false, friends: client.state.friends });
            client.onFriendChange = (friends: Friend[]) => setFriendsState(init => { return { ...init, friends: friends }});
        }else if(isError){
            setFriendsState({ loading: false, isError: true, message: message, friends: [] });
        }else if(loading){
            setFriendsState({ loading: true, isError: false, friends: [] });
        }
    }, [client, loading]);

    useEffect(init, [ client, loading, init ]);

    const request = (userID: string) => client?.sendFriendRequest(userID);
    const accept = (friendID: string) =>client?.acceptFriendRequest(friendID);
    const cancel = (friendID: string) =>client?.cancelFriendRequest(friendID);

    const refreshFriendsMutation = useCallbackRequest<void, void>({
        request: () => client?.refreshFriends()!,
        onStart:()=> setFriendsState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        onDone(_) {
            setFriendsState(init => { return { ...init, loading: false, isError: false, message: "", friends: client?.state.friends! }});
        },
        onFail(error) {
            setFriendsState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    const refreshFriends = () => refreshFriendsMutation.start();

    return (
        <FriendsContext.Provider value={{ ...friendsState, loading: loading && friendsState.loading, friends: client?.state.friends ?? [], refreshFriends, accept, cancel, request }}>{ children }</FriendsContext.Provider>
    );
}

const MembersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { client, loading, isError, message} = useSimpleChatContext();
    const [membersState, setMembersState] = useState<MembersState>({ loading: false, isError: false, members: client?.state?.members ?? [] });
    
    const init = useCallback(()=>{
        if(client){
            setMembersState({ loading: false, isError: false, members: client.state.members });
            client.onMemberChange = (members) => setMembersState(init => { return { ...init, members}});
        }else if(isError){
            setMembersState({ loading: false, isError: true, message: message, members: [] });
        }else if(loading){
            setMembersState({ loading: true, isError: false, members: []});
        }
    }, [client, loading]);

    useEffect(init, [ client, loading, init ]);

    const refreshMembers = () => refreshMembersMutation.start();
    const create = (name: string) => client?.createGroup(name);
    const accept = (memberID: string) => client?.acceptGroupRequest(memberID);
    const decline = (memberID: string) => client?.declineGroupRequest(memberID);
    const assign = (memberID: string, role: "Member" | "Admin") => client?.assignMemberRole(memberID, role);
    const remove = (groupID: string) => {}
    const leave = (groupID: string)  => {}

    const refreshMembersMutation = useCallbackRequest<void, void>({
        request: () => client?.refreshMembers()!,
        onStart:()=> setMembersState(init => { return { ...init, loading: true, isError: false, messages: "refreshing friends list"}}),
        onDone(_) {
            setMembersState(init => { return { ...init, loading: false, isError: false, message: "", members: client?.state?.members ?? [] }});
        },
        onFail(error) {
            setMembersState(init => { return { ...init, isError: true, loading: false, message: error}});
        }
    });

    return (
        <MembersContext.Provider value={{ ...membersState, loading: loading && membersState.loading, refreshMembers, create, accept, decline, assign, leave, remove }}>{ children }</MembersContext.Provider>
    );
}

const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { client,loading, isError, message } = useSimpleChatContext();
    const [status, setStatus] = useState<{ room?:string, message?: string }>({});
    const [state, setState] = useState<ChatState>({ loading: false, isError: false, chats: client?.state.chats! });

    const init = useCallback(()=>{
        if(client){
            setState({ loading: false, isError: false, chats: client.state.chats });
            client.onChatsChange = (chats) => setState(init => { return { ...init, chats: chats } });
        }else if(isError){
            setState({ loading: false, isError: true, message: message, chats: {} });
        }else if(loading){
            setState({ loading: true, isError: false, chats: {} });
        }
    }, [client, loading]);

    useEffect(init, [ client, loading, init ]);

    const refreshChatsMutation = useCallbackRequest<void, void>({
        request: () => client?.refreshChats()!,
        onStart:()=> setState(init => { return { ...init, loading: true, isError: false, messages: "refreshing chats list"}}),
        onDone(_) {
            setState(init => {
                return { ...init, loading: false, isError: false, message: "", chats: client?.state.chats! }
            });
        },
        onFail(error) {
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

    const refreshChats = () => refreshChatsMutation.start();

    return (
        <ChatContext.Provider value={{ ...state, loading: loading && state.loading, status, refreshChats, send, typing, order }}>{ children }</ChatContext.Provider>
    );
}

export interface SimpleChatProviderProps extends PropsWithChildren{ 
    config?: SimpleChatConfig,
}

export const SimpleChatProvider: React.FC<SimpleChatProviderProps>  = (props) =>{
    const { data, error, loading } = useRequest({
        fn: () => {
            if(!props.config){
                return SimpleChatClient.connect(props.config!);
            }
            throw Error("Simple Chat provider requires a client Configuration");
        }
    });

    return (
        <SimpleChatContext.Provider value={{ client: data, isError: error, loading, message: error }}>
            <MultiProvider providers={[ ClientProvider, FriendsProvider, MembersProvider, ChatProvider ]}>
                {props.children}
            </MultiProvider>
        </SimpleChatContext.Provider>
    );
}

export default SimpleChatProvider;