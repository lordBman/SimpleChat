import React, { useState } from "react";

export type MainPage = "home" | "developers" | "projects"  | "chat";
export type Section = "chats" | "connections" | "settings" | "info" | "projects" | "none";
export type PageState = {
    current: MainPage,
    section?: Section,
    params?: any
}

export type PageContextType = {
    pageState: PageState;

    setPage: (page: { section?: Section, main?: MainPage, params?: any }) => void;
};

export const PageContext = React.createContext<PageContextType | null>(null);
export const usePageContext = () => {
    const init = React.useContext(PageContext);
    if(init === null){
        throw Error("Component has to be wrapped by PageProver in order to call PageContext");
    }
    return init;
}

const fetchSavedPageState = (): PageState => {
    const cachestorage = window.localStorage;
    if(cachestorage.getItem("pageState")){
        return JSON.parse(cachestorage.getItem("pageState")!);
    }
    return { current: "home", section: "none" };
}

const savePageState = (pageState: PageState) => {
    const cachestorage = window.localStorage;
    cachestorage.setItem("pageState", JSON.stringify(pageState));
}

const PageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [pageState, setPageState] = useState<PageState>(fetchSavedPageState());

    const setPage = (page: { section?: Section, main?: MainPage, params?: any }) =>{
        setPageState(init => {
            const newState = {
                current: page.main ?? init.current,
                section: page.section ?? init.section,
                params: page.params,
            };
            savePageState(newState);

            return newState;
        });
    }
    
    return (
        <PageContext.Provider value={{ pageState, setPage }}>
            {children}
        </PageContext.Provider>
    );
}

export default PageProvider;