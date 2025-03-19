import Credential from "./credentials";

type Friend = {
    id: string;
    organizationID: number | null;
    projectID: string;
    accepted: boolean;
    requester: Credential;
    acceptor: Credential;
}

export default Friend;