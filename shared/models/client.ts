import Credential from "./credentials";
import Organization from "./organization";

interface Client {
    credential: Credential;
    organization?: Organization | null;
    projectID: string;
}

export default Client;