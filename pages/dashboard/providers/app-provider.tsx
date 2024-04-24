import * as React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Channel, Friend, Group, User } from '@prisma/client';
import { axiosInstance } from '../../utils';

export type AppState = {
    data?: User & { friends: Friend[], chats: Array<Channel | Group> }
    isError: boolean;
    message?: any;
};

export type AppContextType = {
    data?: User & { friends: Friend[], chats: Array<Channel|Group> }
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