import Details from "./details";
import Organization from "./organization";

type Friend = {
    id: string;
    accepted: boolean;
    created: Date

    organizationID?: string | null;
    organization?: Organization | null;

    requesterID: string;
    requester: Details;

    acceptorID: string;
    acceptor: Details;

    projectID: string;
}

export default Friend;