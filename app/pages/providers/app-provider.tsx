import { Friend, Member, Project } from '@simplechat/shared/models';
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useRequest } from 'simplechat_provider/src/request';
import { apiClientInstance } from '../utils';
import { UserState } from '@simplechat/shared';

export type MainPage = "home" | "developers" | "projects"  | "chat";
export type Section = "chats" | "connections" | "settings" | "info";
export type PageState = {
    current: MainPage,
    section?: Section,
    params?: any
}

export type AppContextType = {
    user?: UserState
    loading: boolean;
    isError: boolean;
    error?: any;

    message?: any;
    current?: Member | Friend;
    pageState: PageState;

    makeCurrent : (response: Member | Friend) =>void
    setPage: (page: { section?: Section, main?: MainPage, params?: any }) => void;

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
    const [pageState, setPageState] = useState<PageState>({ current: "home" });
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

    const setPage = (page: { section?: Section, main?: MainPage, params?: any }) =>{
        setPageState(init => ({
            current: page.main ?? init.current,
            section: page.section ?? init.section,
            params: page.params,
        }));
    }

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
            makeCurrent, createProject, pageState, 
            deleteProject, renameProject, setPage,  
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