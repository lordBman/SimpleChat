import { Member, Friend, Chats, Project, AccessKey } from "simplechat/src/models";
import { Socket } from "socket.io-client";

export type UserState = Credential & { 
    token: string, 
    members: Member[],
    adminID?: number,
    friends: Friend[], 
    chats: Chats,
    projects?: Array<Project & { keys: AccessKey[], userCount: number }>,
    developers?: Credential[]
};

export type UserContextType = {
    user?: UserState
    loading: boolean;
    isError: boolean;
    accessKey?: string;
    message?: any;
    socket?: Socket;
};

export type FriendsState = {
    loading: boolean,
    isError: boolean,
    message?: any, 
    friends: Friend[],
}

export type FriendsContextType = {
    loading: boolean,
    isError: boolean,
    message?: any, 
    friends: Friend[],
    refreshFriends: CallableFunction,
    request: (userID: string) =>void,
    accept: (friendID: string) =>void,
    cancel: (friendID: string) =>void
}

export type ChatState = {
    chats: Chats;
    loading: boolean;
    isError: boolean;
    message?: any
}

export type ChatContextType = {
    chats: Chats;
    order: string[],
    loading: boolean,
    isError: boolean,
    message?: any, 
    refreshChats: CallableFunction;
    send: (message: string, targetID: Member | Friend) => void;
    status: { message?: string, room?: string },
    typing: (targetID: Member | Friend) => void;
}

export type MembersState = {
    loading: boolean,
    isError: boolean,
    message?: any, 
    members: Member[],
}

export type MembersContextType = {
    loading: boolean,
    isError: boolean,
    message?: any, 
    members: Member[],
    refreshMembers: CallableFunction,
    create: (name: string) => void,
    accept: (userID: string, groupID: string) => void,
    decline: (userID: string, groupID: string) => void,
    assign: (userID: string, groupID: string, role: "Member" | "Admin") => void,
    remove: (groupID: string) => void,
    leave: (groupID: string)  => void
}
