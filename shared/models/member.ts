import Credential from "./credentials";
import Group from "./groups";

export type MemberRoles = "Member" | "Admin";

type Member = {
    credential: Credential,
    
    role: MemberRoles;
    joined: Date;
    accepted: boolean;
    group: Group;
}

export default Member;