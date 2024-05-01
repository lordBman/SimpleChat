import * as React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { User } from '@prisma/client';
import { axiosInstance } from '../../utils';
import { ChatsResponse, FriendResponse, MemberResponse } from '../../responses';

export type AppState = {
    data?: User & { token: string } & { members: MemberResponse[], friends: FriendResponse[], chats: ChatsResponse }
    isError: boolean;
    message?: any;
};

export type AppContextType = {
    data?: User & { token: string } & { friends: FriendResponse[], chats: ChatsResponse }
    loading: boolean;
    isError: boolean;
    message?: any;
};

export const AppContext = React.createContext<AppContextType | null>(null);

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<AppState>({ isError: false });

    const initQuery = useQuery({
        queryKey:  ["data"],
        queryFn: () => axiosInstance.get("/users"),
        onSuccess(data) {
            setState(init => { return { ...init, loading: false, isError: false, data: data.data }});  
        },
        onError(error) {
            setState(init => { return { ...init, loading: false, isError: true, message: error}});
        },
    });
    
    return (
        <AppContext.Provider value={{ ...state, loading: initQuery.isLoading }}>{ children }</AppContext.Provider>
    );
}

export default AppProvider;