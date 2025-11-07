import Details from "./details";
import Organization from "./organization";

interface Client {
    id: string,
    details: Details,
    organizationID?: string | null;
    organization?: Organization | null;
    projectID: string;

    created: Date
}

export default Client;