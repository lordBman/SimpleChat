import { Chats, Friend, Project } from "./models";
import AccessKey from "./models/acess-key";
import Credential from "./models/credentials";
import Group from "./models/groups";
import Member, { MemberRoles } from "./models/member";
import Organization from "./models/organization";
import Notification from "./models/notifications";

export type SimpleChatClientConfig = {
    name: string,
    surname: string,
    accessKey: string,
    token: string,
    organization?: string | null
};

export type SimpleChatDeveloperConfig = {
    accessKey: string,
    accessToken: string
};

export type SimpleChatState = Credential & { 
    token: string, 
    members: Member[],
    friends: Friend[], chats: Chats }

export interface UserState extends Credential { 
    token: string, 
    projects : Array<Project & { keys: AccessKey[], userCount: number }>,
    developers?: Credential[] 
}

export interface OrganizationDetails extends Organization{
    groups: Group[],
    clients: Credential[],
}

export interface ProjectDetails extends Project{
    keys: AccessKey[],
    groups: Group[],
    clients: Credential[],
    organizations: OrganizationDetails[]
}

export{ AccessKey, Credential, Group, Member, MemberRoles, Project, Friend, Chats, Organization, Notification }