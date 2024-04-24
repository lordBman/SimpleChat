import * as React from 'react';
import { Friend } from '@prisma/client';
export type FriendsContextType = {
    loading: boolean;
    isError: boolean;
    message?: any;
    friends: Friend[];
    refreshFriends: CallableFunction;
};
export declare const FriendsContext: React.Context<FriendsContextType | null>;
declare const FriendsProvider: React.FC<React.PropsWithChildren>;
export default FriendsProvider;
