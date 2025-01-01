import * as React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { AccessKey, Credential, Project } from '@prisma/client';
import { Socket, io } from "socket.io-client";
import { ProjectKey, axiosInstance } from '../utils';
import { ChatsResponse, FriendResponse, MemberResponse } from '../responses';

export type UserState = Credential & { 
    token: string, 
    members: MemberResponse[],
    adminID?: number,
    projects?: Array<Project & { keys: AccessKey[], userCount: number }>,
    developers?: Credential[], friends: FriendResponse[], chats: ChatsResponse }

export type AppContextType = {
    user?: UserState
    loading: boolean;
    isError: boolean;
    message?: any;
    socket?: Socket;
};

export const AppContext = React.createContext<AppContextType>({ loading: false, isError: false });
export const useAppContext = () => {
    const init = React.useContext(AppContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call AppContext");
    }
    return init;
}

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<{ user?: UserState, message: any }>({ message: "" });

    const initQuery = useQuery({
        queryKey:  ["data"],
        queryFn: () => axiosInstance.get(`/?key=${ProjectKey}`),
        onSuccess: (data) => {
            setState({ user: data.data, message: ""});  
        },
        onError: (error) => {
            setState({ user: undefined, message: error });
        },
    });

    const socket = React.useMemo(() => {
        if(state){
            const init = io("/", { auth: { token: state.user?.token, access: "access-key",  key: ProjectKey } });
            init.on("connected", ()=>{
                console.log(init.connected);
            });
            return init;
        }
    }, [state]);
    
    return (
        <AppContext.Provider value={{ ...state, isError: initQuery.isError, loading: initQuery.isLoading, socket }}>{ children }</AppContext.Provider>
    );
}

export default AppProvider;