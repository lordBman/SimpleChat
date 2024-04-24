import * as React from 'react';
import { Channel, Friend, Group, User } from '@prisma/client';
interface FriendsState {
    loading: boolean;
    isError: boolean;
    message?: any;
    friends: Friend[];
}
interface ChatState {
    chats: Array<Channel | Group>;
    current?: Channel | Group | Friend;
    loading: boolean;
    isError: boolean;
    message?: any;
}
export type AppContextType = {
    user?: User;
    friendsState: FriendsState;
    chatState: ChatState;
    loading: boolean;
    isError: boolean;
    message?: any;
    refreshFriends: CallableFunction;
};
export declare const AppContext: React.Context<AppContextType | null>;
declare const AppProvider: React.FC<React.PropsWithChildren>;
export default AppProvider;
