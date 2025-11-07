import { Chats, Client, Details, Friend, Project, User } from "./models";
import AccessKey from "./models/acess-key";
import Group from "./models/groups";
import Member, { MemberRoles } from "./models/member";
import Organization from "./models/organization";
import Notification from "./models/notifications";

export type SimpleChatConfig = {
    name: string,
    surname: string,
    accessKey: string,
    projectToken: string,
    organization?: string | null
};

export type SimpleChatState = Client & { 
    token: string, 
    members: Member[],
    friends: Friend[], chats: Chats }

export interface UserState extends User{ 
    token: string, 
    projects : Array<Project & { keys?: AccessKey[], userCount: number }>,
    developers?: Details[] 
}

export interface OrganizationDetails extends Organization{
    groups: Group[],
    clients: Details[],
}

export interface ProjectDetails extends Project{
    keys: AccessKey[],
    groups: Group[],
    clients: Details[],
    organizations: OrganizationDetails[]
}

export enum WSChatOperation{
    SendMessage = "send_message",
    ReplyMessage = "reply_message",
    EditMessage = "edit_message",
    DeleteMessage = "delete_message",
    Subscribe = "subscribe",
    Unsubscribe = "unsubscribe",
    Typing = "typing",
    ReadReceipt = "read_receipt",
    SentMessage = "sent_message",
    MessageEdited = "message_edited",
}

export enum WSFriendOperation{
    Request = "Request",
    Approve = "Aprove Request",
    Cancel = "Cancel Request",
    Reject = "Reject Request"
}

export interface Developer extends User{
    projects: Project[]
}

export enum AccessHeaderKeys{
    AccessKey = "X-SimpleChat-Access-Key",
    Organization = "X-SimpleChat-Organization",
    ProjectToken = "X-SimpleChat-Project-Token"
}

export{ AccessKey, Details, User, Group, Member, MemberRoles, Project, Friend, Chats, Organization, Notification }