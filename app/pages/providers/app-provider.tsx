import { Friend, Member } from '@simplechat/shared/models';
import React from 'react';
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

    const makeCurrent = (response: Member | Friend)=> setCurrent(response);

    const init = useRequest<UserState>({
        fn: async () => {
            return await apiClientInstance.get<UserState>("/");
        },
    });

    const setPage = (page: { section?: Section, main?: MainPage, params?: any }) =>{
        setPageState(init => ({
            current: page.main ?? init.current,
            section: page.section ?? init.section,
            params: page.params,
        }));
    }
    
    return (
        <AppContext.Provider value={{  makeCurrent, pageState, setPage,  current, user: init.data, loading: init.loading, isError: init.error, error: init.error  }}>{ children }</AppContext.Provider>
    );
}

interface ProviderWraperProps extends React.PropsWithChildren{
    Loading: React.FC<React.PropsWithChildren>
    Error: React.FC<React.PropsWithChildren>
}

const ProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading, Error }) =>{
    const app = useAppContext();

    if(app.loading){
        return <Loading />;
    }

    if(app.isError && app.user === undefined){
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