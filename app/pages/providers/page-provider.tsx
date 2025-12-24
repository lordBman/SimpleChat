import React, { useEffect, useState } from "react";

export type MainPage = "home" | "developers" | "projects"  | "chats";
export type Section = MainPage | "connections" | "settings" | "info" | "none";
export type PageState = {
    current: MainPage,
    section?: Section,
    params?: any
}

const extract = (url: string, previous: MainPage): [string, PageState] =>{
    const path = url.replace("/dashboard/", "/");
    const paths = path.split("/").filter((value) => value !== "");

    console.log(paths);

    let section: Section = "none";
    if(paths.length > 1 || paths[0] === "chats" || paths[0] === "connections"){
        section = paths[0] as Section;
    }

    const params = paths.length >= 2 ? paths[1] : undefined;
    let current: MainPage = paths[0] as MainPage;
    console.log(current);
    switch(paths[0]){
        case "connections":
            current = "chats";
            break;
    }

    return [`/dashboard${path}`, { current, section, params }];
}

export type PageContextType = {
    pageState: PageState;

    navigate: (title: string, url: string) => void;
    replace: (title: string, url: string) => void;
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
    const [pageState, setPageState] = useState<PageState>(extract(location.pathname, "home")[1]);

    useEffect(()=>{
        window.addEventListener('popstate', (event: PopStateEvent) => {
            if (event.state) {
                event.preventDefault();
                setPageState(event.state);
            }
        });
    });

    const value: PageContextType = {
        pageState,
        navigate(title, url) {
            const [path, state] = extract(url, pageState.current);

            history.pushState(state, title, path);
            setPageState(state);
        },
        replace(title, url) {
            const [path, state] = extract(url, pageState.current);

            history.replaceState(state, title, path);
            setPageState(state);
        },
    }
    
    return (
        <PageContext.Provider value={value}>
            {children}
        </PageContext.Provider>
    );
}

export default PageProvider;