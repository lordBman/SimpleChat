import * as React from 'react';
import { useState } from 'react';
import { useMutation } from 'react-query';
import { axiosInstance } from '../../utils';
import { AppContext, AppContextType } from './app-provider';
import { FriendResponse } from '../../responses';

interface FriendsState{
    loading: boolean,
    isError: boolean,
    message?: any, 
    friends: FriendResponse[],
}

export type FriendsContextType = {
    loading: boolean,
    isError: boolean,
    message?: any, 
    friends: FriendResponse[],
    refreshFriends: CallableFunction,
    request: (userID: string) =>void,
    accept: (friendID: string) =>void,
    cancel: (friendID: string) =>void
}

export const FriendsContext = React.createContext<FriendsContextType | null>(null);

const FriendsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data, socket } = React.useContext(AppContext) as AppContextType;
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: false, isError: false, friends: data?.friends!  });

    if(socket){
        socket.on("request", (response: FriendResponse) =>{
            const init = [response, ...friendsState.friends]
            setFriendsState(state => ({...state, friends: init }));
        });
    
        socket.on("accept", (response: FriendResponse) =>{
            console.log(JSON.stringify(`just recieved: ${response}`));
            
            const index = friendsState.friends.findIndex((value)=> response.id === value.id);
            const init = [...friendsState.friends].with(index, response);
    
            setFriendsState(state => ({...state, friends: init }));
        });
    
        socket.on("cancel", (response: FriendResponse) =>{
            const index = friendsState.friends.findIndex((value)=> response.id === value.id);
            const init = [...friendsState.friends];
            init.splice(index, 1);
    
            setFriendsState(state => ({...state, friends: init }));
        });
    }

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
        mutationFn: () => axiosInstance.get("/friends"),
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

export default FriendsProvider;