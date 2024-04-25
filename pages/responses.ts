import { User, Friend, Channel, Chat, Group, GroupChat } from "@prisma/client";
import { response } from "express";

export type GroupChatResponse = GroupChat & { sender: User };
export type ChatResponse = Chat & { sender: User }

export type GroupResponse = Group & { chats: GroupChatResponse[], creator: User };
export type ChannelResponse = Channel & { chats: ChatResponse[] }

export type ChatsResponse = Array<GroupResponse | ChannelResponse>;
export const isGroup = (response: ChatsResponse) => "name" in response;
export const isChannel = (response: GroupResponse) => "friendID" in response;

export type FriendResponse = Friend & { acceptor: User, requester: User, channel?: Channel  }