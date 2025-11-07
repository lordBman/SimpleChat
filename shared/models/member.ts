import Details from "./details";
import Group from "./groups";

export type MemberRoles = "Member" | "Admin";

type Member = {
    id: string;
    details: Details;

    group: Group;
    joined: Date;
    role: MemberRoles;
    accepted: boolean;
}

export default Member;