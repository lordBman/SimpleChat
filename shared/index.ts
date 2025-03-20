import { Chats, Friend, Project } from "./models";
import AccessKey from "./models/acess-key";
import Credential from "./models/credentials";
import Group from "./models/groups";
import Member from "./models/member";

export type SimpleChatClientConfig = {
    name: string,
    surname: string,
    accessKey: string,
    token: string,
    organization?: string
};

export type SimpleChatDeveloperConfig = {
    accessKey: string,
    accessToken: string
};

export type UserState = Credential & { 
    token: string, 
    members: Member[],
    adminID?: number,
    friends: Friend[], chats: Chats }

export{ AccessKey, Credential, Group, Member, Project, Friend, Chats }