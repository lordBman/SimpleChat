import { Friend, Member, Project } from '@simplechat/shared/models';
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useRequest } from 'simplechat_provider/src/request';
import { apiClientInstance } from '../utils';
import { UserState } from '@simplechat/shared';

export type AppContextType = {
    user?: UserState
    loading: boolean;
    isError: boolean;
    error?: any;

    message?: any;
    current?: Member | Friend;

    makeCurrent : (response: Member | Friend) =>void

    createProject: (name: string) => Promise<void>
    deleteProject: (id: string) => Promise<void>
    renameProject: (id: string, name: string) => Promise<void>
};

export const AppContext = React.createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const init = React.useContext(AppContext);
    if(init === null){
        throw Error("Component has to be wrapped by SimpleChatProver in order to call AppContext");
    }
    return init;
}

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [current, setCurrent] = useState<Member | Friend>();
    const [ user, setUser ] = useState<UserState>()

    const makeCurrent = (response: Member | Friend)=> setCurrent(response);

    const { loading, error } = useRequest<UserState>({
        fn: async () => {
            const init = await apiClientInstance.get<UserState>("/");
            if(init){
                setUser(init);
            }
            return init;
        },
    });

    const createProject = async(name: string) => {
        const project: Project = await apiClientInstance.post("/projects", { data: { name } });

        setUser((init) =>{
            return { ...init!, projects: [...init!.projects,  { ...project,  userCount: 0 }] };
        })
    }

    const deleteProject = async(id: string) =>{

    }
    const renameProject = async(id: string, name: string) =>{

    }
    
    return (
        <AppContext.Provider value={{  
            makeCurrent, createProject, 
            deleteProject, renameProject,  
            current, user, loading, isError: error, error 
        }}>{ children }</AppContext.Provider>
    );
}

interface ProviderWraperProps extends React.PropsWithChildren{
    Loading: React.FC<React.PropsWithChildren>
    Error: React.FC<React.PropsWithChildren>
}

const ProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading, Error }) =>{
    const { loading, user, isError } = useAppContext();

    if(loading){
        return <Loading />;
    }

    if(isError && user === undefined){
        return <Error />;
    }

    return children;
}

const AppProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading, Error }) =>{
    return (
        <AppProvider>
            <ProviderWraper children={children} Loading={Loading} Error={Error} />
        </AppProvider>
    );
}

export default AppProviderWraper;