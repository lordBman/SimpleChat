import * as React from 'react';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Friend, User } from '@prisma/client';
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
    refreshFriends: CallableFunction
}

export const FriendsContext = React.createContext<FriendsContextType | null>(null);

const FriendsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data } = React.useContext(AppContext) as AppContextType;
    const [friendsState, setFriendsState] = useState<FriendsState>({ loading: false, isError: false, friends: data?.friends!  });

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
        <FriendsContext.Provider value={{ ...friendsState, refreshFriends}}>{ children }</FriendsContext.Provider>
    );
}

export default FriendsProvider;