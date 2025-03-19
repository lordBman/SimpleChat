import * as React from 'react';
import { useState } from 'react';
import { axiosInstance } from '@simplechat/shared/utils';
import { Friend } from '@simplechat/shared/models';
import { useUserContext } from './user-provider';
import { useMutation } from '@tanstack/react-query';

interface FriendsState{
    loading: boolean,
    isError: boolean,
    message?: any, 
    friends: Friend[],
}

export type FriendsContextType = {
    loading: boolean,
    isError: boolean,
    message?: any, 
    friends: Friend[],
    refreshFriends: CallableFunction,
    request: (userID: string) =>void,
    accept: (friendID: string) =>void,
    cancel: (friendID: string) =>void
}

export const FriendsContext = React.createContext<FriendsContextType | null>(null);
export const useFriendsContext = () => {
    const init = React.useContext(FriendsContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to use FriendsContext");
    }
    return init;
}

const FriendsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { user, socket } = useUserContext();
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: false, isError: false, friends: user?.friends!  });

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
        mutationFn: () => axiosInstance.get(`/friends?key=${ProjectKey}`),
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