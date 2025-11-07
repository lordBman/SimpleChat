import Details from "./details";
import Organization from "./organization";

type Group = {
    id: string;
    name: string;
    last: Date;
    attachment?: string | null;
    created: Date;

    organizationID?: string | null;
    organization?: Organization | null;

    projectID: string;
    creator: Details;
}

export default Group;