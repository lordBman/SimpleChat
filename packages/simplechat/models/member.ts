import Group from "./groups";

type Member = {
    role: "Member" | "Admin";
    credentialID: string;
    joined: Date;
    accepted: boolean;
    group: Group;
}

export default Member;