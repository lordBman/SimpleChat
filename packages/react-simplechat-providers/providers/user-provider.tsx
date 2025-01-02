import * as React from 'react';
import { Socket, io } from "socket.io-client";
import { axiosInstance } from '../utils';
import { AccessKey, Chats, Friend, Member, Project } from '../models';
import { useQuery } from '@tanstack/react-query';

export type UserState = Credential & { 
    token: string, 
    members: Member[],
    adminID?: number,
    projects?: Array<Project & { keys: AccessKey[], userCount: number }>,
    developers?: Credential[], friends: Friend[], chats: Chats }

export type UserContextType = {
    user?: UserState
    loading: boolean;
    isError: boolean;
    message?: any;
    socket?: Socket;
};

export const UserContext = React.createContext<UserContextType>({ loading: false, isError: false });
export const useUserContext = () => {
    const init = React.useContext(UserContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call UserContext");
    }
    return init;
}

const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { data, error, isLoading, isError, isSuccess } = useQuery({
        queryKey:  ["data"],
        queryFn: () => axiosInstance.get(`/?key=${ProjectKey}`),
    });

    const socket = React.useMemo(() => {
        if(data?.data){
            const init = io("/", { auth: { token: data.data?.token, access: "access-key",  key: ProjectKey } });
            init.on("connected", ()=>{
                console.log(init.connected);
            });
            return init;
        }
    }, [data?.data]);
    
    return (
        <UserContext.Provider value={{ user: data?.data, isError, loading: isLoading, message: error, socket }}>{ children }</UserContext.Provider>
    );
}

export default UserProvider;