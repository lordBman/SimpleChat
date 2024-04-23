import * as React from 'react';
import { Friend, User } from '@prisma/client';
interface FriendsState {
    loading: boolean;
    isError: boolean;
    message?: any;
    friends: Friend[];
}
export type AppContextType = {
    user?: User;
    friendsState: FriendsState;
    loading: boolean;
    isError: boolean;
    message?: any;
    refreshFriends: CallableFunction;
};
export declare const AppContext: React.Context<AppContextType | null>;
declare const AppProvider: React.FC<React.PropsWithChildren>;
export default AppProvider;
