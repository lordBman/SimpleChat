import AccessKey from "./acess-key";
import Chat from "./chat";
import Credential, { Roles } from "./credentials";
import Friend from "./friend";
import Group from "./groups";
import Member from "./member";
import Project from "./project";
import Notification from "./notifications";
import Client from "./client";

export type Chats = { [key: string]: Chat[] };

export type FriendSearchResult = { user: Credential, friend?: Friend }

export { Credential, Chat, Group, Member, Friend, Project, AccessKey, Notification, Client, Roles };