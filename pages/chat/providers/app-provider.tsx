import * as React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { User } from '@prisma/client';
import { Socket, io } from "socket.io-client";
import { axiosInstance } from '../../utils';
import { ChatsResponse, FriendResponse, MemberResponse } from '../../responses';

export type AppState = {
    data?: User & { token: string } & { members: MemberResponse[], friends: FriendResponse[], chats: ChatsResponse }
    message?: any;
};

export type AppContextType = {
    data?: User & { token: string } & { members: MemberResponse[], friends: FriendResponse[], chats: ChatsResponse }
    loading: boolean;
    isError: boolean;
    message?: any;
    socket?: Socket;
};

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<AppState>();

    const initQuery = useQuery({
        queryKey:  ["data"],
        queryFn: () => axiosInstance.get(`/users?key=b791fa6f9ff96a4ced89de287456ad5baf3a`),
        onSuccess(data) {
            setState(init => { return { ...init, loading: false, isError: false, data: data.data }});  
        },
        onError(error) {
            setState(init => { return { ...init, loading: false, isError: true, message: error}});
        },
    });

    const socket = React.useMemo(() => {
        if(state?.data){
            const init = io("/", { auth: { token: state?.data.token, access: "access-key",  key: "b791fa6f9ff96a4ced89de287456ad5baf3a" } });
            init.on("connected", ()=>{
                console.log(init.connected);
            });
            return init;
        }
    }, [state?.data]);
    
    return (
        <AppContext.Provider value={{ ...state, isError: initQuery.isError, loading: initQuery.isLoading, socket }}>{ children }</AppContext.Provider>
    );
}

export default AppProvider;