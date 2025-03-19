import Credential from "./credentials";

type Group = {
    name: string;
    id: string;
    last: Date;
    attachment: string | null;
    organizationID: number | null;
    projectID: string;
    creator: Credential;
}

export default Group;