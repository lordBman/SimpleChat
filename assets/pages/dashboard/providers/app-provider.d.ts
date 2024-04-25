import * as React from 'react';
import { User } from '@prisma/client';
import { ChatsResponse, FriendResponse } from '../../responses';
export type AppState = {
    data?: User & {
        friends: FriendResponse[];
        chats: ChatsResponse;
    };
    isError: boolean;
    message?: any;
};
export type AppContextType = {
    data?: User & {
        friends: FriendResponse[];
        chats: ChatsResponse;
    };
    loading: boolean;
    isError: boolean;
    message?: any;
};
export declare const AppContext: React.Context<AppContextType | null>;
declare const AppProvider: React.FC<React.PropsWithChildren>;
export default AppProvider;
