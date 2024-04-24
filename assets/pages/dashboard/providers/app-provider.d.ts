import * as React from 'react';
import { Channel, Friend, Group, User } from '@prisma/client';
export type AppState = {
    data?: User & {
        friends: Friend[];
        chats: Array<Channel | Group>;
    };
    isError: boolean;
    message?: any;
};
export type AppContextType = {
    data?: User & {
        friends: Friend[];
        chats: Array<Channel | Group>;
    };
    loading: boolean;
    isError: boolean;
    message?: any;
};
export declare const AppContext: React.Context<AppContextType | null>;
declare const AppProvider: React.FC<React.PropsWithChildren>;
export default AppProvider;
