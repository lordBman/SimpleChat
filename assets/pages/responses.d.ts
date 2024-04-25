import { User, Friend, Channel, Chat, Group, GroupChat } from "@prisma/client";
export type GroupChatResponse = GroupChat & {
    sender: User;
};
export type ChatResponse = Chat & {
    sender: User;
};
export type GroupResponse = Group & {
    chats: GroupChatResponse[];
    creator: User;
};
export type ChannelResponse = Channel & {
    chats: ChatResponse[];
};
export type ChatsResponse = Array<GroupResponse | ChannelResponse>;
export type FriendResponse = Friend & {
    acceptor: User;
    requester: User;
    channel?: Channel;
};
