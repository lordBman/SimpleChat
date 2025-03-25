import * as React from 'react';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { Friend, Member, UserState } from '@simplechat/shared';
import { ProjectKey, axiosInstance } from '../utils';

export type AppContextType = {
    user?: UserState
    loading: boolean;
    isError: boolean;
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
    const [state, setState] = useState<{ user?: UserState, message: any }>({ message: "" });
    const [current, setCurrent] = useState<Member | Friend>();

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

    const makeCurrent = (response: Member | Friend)=> setCurrent(response);
    
    return (
        <AppContext.Provider value={{ ...state, makeCurrent, isError: initQuery.isError, current, loading: initQuery.isLoading }}>{ children }</AppContext.Provider>
    );
}

interface ProviderWraperProps extends React.PropsWithChildren{
    Loading: React.FC<React.PropsWithChildren>
    Error: React.FC<React.PropsWithChildren>
}

const AppProviderWraper: React.FC<ProviderWraperProps> = ({children, Loading, Error }) =>{
    const app = React.useContext(AppContext) as AppContextType;
    return (
        <>
            { app.loading && <Loading /> }
            { !app.loading && app.isError && <Error /> }
            { !app.loading && !app.isError && <AppProvider>{children}</AppProvider> }
        </>
    );
}

export default AppProviderWraper;