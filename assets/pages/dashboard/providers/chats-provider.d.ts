import * as React from 'react';
import { Channel, Friend, Group } from '@prisma/client';
export type ChatContextType = {
    chats: Array<Channel | Group>;
    current?: Channel | Group | Friend;
    loading: boolean;
    isError: boolean;
    message?: any;
    refreshChats: CallableFunction;
};
export declare const ChatContext: React.Context<ChatContextType | null>;
declare const ChatProvider: React.FC<React.PropsWithChildren>;
export default ChatProvider;
