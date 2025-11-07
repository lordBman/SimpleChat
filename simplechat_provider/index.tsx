import { PropsWithChildren, use, useCallback, useEffect, useState } from "react";
import { ChatContext, ClientContext, FriendsContext, MembersContext, useClientContext } from "./src/contexts";
import { ChatState, ClientContextType, FriendsState, MembersState } from "./src/models";
import { Friend, Member, SimpleChatClientConfig, SimpleChatDeveloperConfig } from "@simplechat/shared";
import { SimpleChatClient } from "simplechatjs"
import { useRequest, useRequestCallBack } from "./src/request";
import React from "react";

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
            setClientState({ loading: false, isError: false, credential: client.state });
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

    const refreshMembers = () => refreshMembersMutation.run();
    const create = (name: string) => {}
    const accept = (userID: string, groupID: string) => {}
    const decline = (userID: string, groupID: string) => {}
    const assign = (userID: string, groupID: string, role: "Member" | "Admin") => {}
    const remove = (groupID: string) => {}
    const leave = (groupID: string)  => {}

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
        <ChatContext.Provider value={{ ...state, loading: loading && state.loading, status, refreshChats, send, typing, order }}>{ children }</ChatContext.Provider>
    );
}

export interface SimpleChatProviderProps extends PropsWithChildren{ 
    clientConfig?: SimpleChatClientConfig,
    developerConfig?: SimpleChatDeveloperConfig 
}

export const SimpleChatProvider: React.FC<SimpleChatProviderProps>  = (props) =>{
    if(!props.clientConfig  && !props.developerConfig){
        throw Error("Simple Chat provider requires a client or developer Configuration, but neither was provided");
    }

    const { data, error, loading, isError } = useRequest({
        fn: () => {
            if(props.developerConfig){
                return SimpleChatClient.init(props.developerConfig);
            }
            return SimpleChatClient.connect(props.clientConfig!);
        }
    });

    return (
        <SimpleChatContext.Provider value={{ client: data, isError, loading, message: error }}>
            <MultiProvider providers={[ ClientProvider, FriendsProvider, MembersProvider, ChatProvider ]}>
                {props.children}
            </MultiProvider>
        </SimpleChatContext.Provider>
    );
}

export default SimpleChatProvider;