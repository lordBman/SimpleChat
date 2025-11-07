import AccessKey from "./acess-key";
import Chat from "./chat";
import Friend from "./friend";
import Group from "./groups";
import Member from "./member";
import Project from "./project";
import Notification from "./notifications";
import Client from "./client";
import User, { UserRoles } from "./user";
import Details from "./details";

export type Chats = { [key: string]: Chat[] };

export type FriendSearchResult = { user: Details, friend?: Friend }

export { Details, User, Chat, Group, Member, Friend, Project, AccessKey, Notification, Client, UserRoles };