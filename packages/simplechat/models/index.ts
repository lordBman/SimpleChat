import AccessKey from "./acess-key";
import Chat from "./chat";
import Credential from "./credentials";
import Friend from "./friend";
import Group from "./groups";
import Member from "./member";
import Project from "./project";

export type Chats = { [key: string]: Chat[] };

export { Credential, Chat, Group, Member, Friend, Project, AccessKey };