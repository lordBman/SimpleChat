import * as React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Friend, Member, UserState } from '@simplechat/shared';
import { AccessKey, axiosInstance } from '../utils';
import SimpleChatProvider from 'simplechat_provider';

export type AppContextType = {
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
    con

    const makeCurrent = (response: Member | Friend)=> setCurrent(response);
    
    return (
        <AppContext.Provider value={{  makeCurrent,  current }}>{ children }</AppContext.Provider>
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
            { !app.loading && !app.isError && {children} }
        </>
    );
}

const AppProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading, Error }) =>{
    return (
        <SimpleChatProvider>
            <AppProvider>
                <ProviderWraper children={children} Loading={Loading} Error={Error} />
            </AppProvider>
        </SimpleChatProvider>
    );
}

export default AppProviderWraper;