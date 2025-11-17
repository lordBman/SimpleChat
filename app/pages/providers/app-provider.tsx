import { Friend, Member, User } from '@simplechat/shared/models';
import React from 'react';
import { useState } from 'react';
import { useRequest } from 'simplechat_provider/src/request';
import { apiClientInstance } from '../utils';

export type AppContextType = {
    user?: User
    loading: boolean;
    isError: boolean;
    error?: any;

    message?: any;
    current?: Member | Friend;

    makeCurrent : (response: Member | Friend) =>void
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

    const makeCurrent = (response: Member | Friend)=> setCurrent(response);

    const init = useRequest<User>({
        fn: () => apiClientInstance.get("/api/auth/me")
    });
    
    return (
        <AppContext.Provider value={{  makeCurrent,  current, user: init.data, loading: init.loading, isError: init.error, error: init.error  }}>{ children }</AppContext.Provider>
    );
}

interface ProviderWraperProps extends React.PropsWithChildren{
    Loading: React.FC<React.PropsWithChildren>
    Error: React.FC<React.PropsWithChildren>
}

const ProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading, Error }) =>{
    const app = useAppContext();
    return (
        <>
            { app.loading && <Loading /> }
            { !app.loading && app.isError && <Error /> }
            { !app.loading && !app.isError && children }
        </>
    );
}

const AppProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading, Error }) =>{
    return (
        <AppProvider>
            <ProviderWraper children={children} Loading={Loading} Error={Error} />
        </AppProvider>
    );
}

export default AppProviderWraper;