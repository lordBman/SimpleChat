import * as React from 'react';
import { useState } from 'react';

export enum MainPage{
    None,
    Chat
}

export type MainContextState = {
    main: MainPage;
    section: string;
};

export type MainContextType = {
    main: MainPage;
    section: string;
    clear: CallableFunction;
    set: (page: MainPage) => void, 
    setSection: (section: string) => void,
};

export const MainContext = React.createContext<MainContextType | undefined>(undefined);

const MainProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState<MainContextState>({ main: window.screen.width > 780 ? MainPage.Chat : MainPage.None, section: "chats" });

    const clear = () => setState(init => ({...init, main: MainPage.None }));
    const set = (page: MainPage) => setState(init => ({...init, main: page }));
    const setSection = (section: string) => setState(init => ({...init, section }));
    
    return (
        <MainContext.Provider value={{ ...state, clear, set, setSection }}>{ children }</MainContext.Provider>
    );
}

export default MainProvider;