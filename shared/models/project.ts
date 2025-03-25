import Credential from "./credentials";

type Project = {
    id: string;
    name: string;
    token: string;
    
    owner: Credential;
}

export default Project;