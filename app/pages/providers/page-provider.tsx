import React, { useState } from "react";

interface PageState {
  page: string;
  data?: Record<string, any>;
}

class URLManager {
  private currentState: PageState;

  constructor() {
    this.currentState = { page: 'home' };
    this.setupEventListeners();
  }

  // Navigate to a new URL
  navigate(url: string, title: string = '', stateData?: Partial<PageState>): void {
    const newState: PageState = {
      page: this.extractPageFromUrl(url),
      data: stateData?.data
    };

    history.pushState(newState, title, url);
    this.currentState = newState;
    this.updatePageContent();
  }

  // Replace current URL
  replace(url: string, title: string = '', stateData?: Partial<PageState>): void {
    const newState: PageState = {
      page: this.extractPageFromUrl(url),
      data: stateData?.data
    };

    history.replaceState(newState, title, url);
    this.currentState = newState;
  }

  // Handle browser back/forward buttons
  private setupEventListeners(): void {
    window.addEventListener('popstate', (event: PopStateEvent) => {
      if (event.state) {
        this.currentState = event.state;
        this.updatePageContent();
      }
    });
  }

  private extractPageFromUrl(url: string): string {
    const path = url.startsWith('/') ? url : new URL(url, window.location.origin).pathname;
    return path.split('/')[1] || 'home';
  }

  private updatePageContent(): void {
    // Update your page content based on currentState
    console.log('Page changed to:', this.currentState.page);
    // Add your logic to update DOM here
  }
}

/*// Usage
//const urlManager = new URLManager();

// Navigate to about page
urlManager.navigate('/about', 'About Us', { 
  data: { userId: 123 } 
});

// Replace current URL
urlManager.replace('/contact', 'Contact Page');*/

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
        history.pushState(page.params, "", `/dashboard/${page.main ?? pageState.current}${page.section ? `/${page.section}` : ""}${page.params ? `/${page.params}` : ""}`);
    }
    
    return (
        <PageContext.Provider value={{ pageState, setPage }}>
            {children}
        </PageContext.Provider>
    );
}

export default PageProvider;