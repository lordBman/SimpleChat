import { Friend, Project } from "./models";
import AccessKey from "./models/acess-key";
import Credential from "./models/credentials";
import Group from "./models/groups";
import Member from "./models/member";

export interface Bobby{
    name: String
}

export{ AccessKey, Credential, Group, Member, Project, Friend }