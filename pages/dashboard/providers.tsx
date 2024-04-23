import * as React from 'react';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../utils';
import { Friend, User } from '@prisma/client';

interface FriendsState{
    loading: boolean,
    isError: boolean,
    message?: any, 
    friends: Friend[],
}

interface GlobalState{
    user?: User;
    loading: boolean;
    isError: boolean;
    message?: any
}

export type AppContextType = {
    user?: User
    friendsState: FriendsState,
    loading: boolean;
    isError: boolean;
    message?: any;
    refreshFriends: CallableFunction
};

export const AppContext = React.createContext<AppContextType | null>(null);

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<GlobalState>({loading: true, isError: false});
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: false, isError: false, friends: [] });

    const initMutation = useMutation({
        mutationKey:  ["data"],
        mutationFn: () => axiosInstance.get("/users"),
        onMutate:()=>setState(init => { return { ...init, loading: true, isError: false, messages: "Getting users details"}}),
        onSuccess(data) {
            setState(init => { return { ...init, loading: false, isError: false, message: "", user: data.data }});
            setFriendsState(init => { return {...init, friends: data.data.friends } });
        },
        onError(error) {
            setState(init => { return { ...init, loading: false, isError: true, message: error}});
        },
    });

    const refreshFriendsMutation = useMutation({
        mutationKey:  ["data"],
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

    const init = React.useCallback(async ()=>{
        if(!state.user){
            initMutation.mutate();
        }
    }, [state.user]);

    React.useEffect(()=> { init() }, [init, state.user]);

    return (
        <AppContext.Provider value={{ ...state, friendsState, refreshFriends}}>{ children }</AppContext.Provider>
    );
}

export default AppProvider;