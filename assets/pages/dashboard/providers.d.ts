import * as React from 'react';
export type AppContextType = {
    data?: any;
    loading: boolean;
    isError: boolean;
    message: any;
    refresh: () => void;
};
export declare const AppContext: React.Context<AppContextType | null>;
declare const AppProvider: React.FC<React.PropsWithChildren>;
export default AppProvider;
