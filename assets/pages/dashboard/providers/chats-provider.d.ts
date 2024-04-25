import * as React from 'react';
import { ChannelResponse, ChatsResponse, FriendResponse, GroupResponse } from '../../responses';
export type ChatContextType = {
    chats: ChatsResponse;
    current?: ChannelResponse | GroupResponse | FriendResponse;
    loading: boolean;
    isError: boolean;
    message?: any;
    refreshChats: CallableFunction;
};
export declare const ChatContext: React.Context<ChatContextType | null>;
declare const ChatProvider: React.FC<React.PropsWithChildren>;
export default ChatProvider;
