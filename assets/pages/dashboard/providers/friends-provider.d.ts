import * as React from 'react';
import { FriendResponse } from '../../responses';
export type FriendsContextType = {
    loading: boolean;
    isError: boolean;
    message?: any;
    friends: FriendResponse[];
    refreshFriends: CallableFunction;
};
export declare const FriendsContext: React.Context<FriendsContextType | null>;
declare const FriendsProvider: React.FC<React.PropsWithChildren>;
export default FriendsProvider;
