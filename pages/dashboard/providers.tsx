import * as React from 'react';
import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { axiosInstance } from '../utils';

export type AppContextType = {
    data?: any;
    loading: boolean;
    isError: boolean;
    message: any;
    refresh: () => void;
};

export const AppContext = React.createContext<AppContextType | null>(null);

const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<{ data?: any, loading: boolean, isError: boolean, message: any }>({loading: true, isError: false, message: ""});

    const initMutation = useMutation({
        mutationKey:  ["data"],
        mutationFn: () => axiosInstance.get("/users"),
        onMutate:()=>setState(init => { return { ...init, loading: true, isError: false, messages: "Getting users details"}}),
        onSuccess(data) {
            //alert(JSON.stringify(data.data));
            setState(init => { return { ...init, loading: false, isError: false, message: "", data: data.data }});
        },
        onError(error) {
            setState(init => { return { ...init, loading: false, isError: true, message: error}});
        },
    });

    const refresh = async () =>{

    }

    const init = React.useCallback(async ()=>{
        if(!state.data){
            initMutation.mutate();
        }
    }, [state.data]);

    React.useEffect(()=> { init() }, [init, state.data]);

    return (
        <AppContext.Provider value={{ ...state, refresh}}>{ children }</AppContext.Provider>
    );
}

export default AppProvider;