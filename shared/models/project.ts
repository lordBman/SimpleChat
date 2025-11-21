import Details from "./details";

type Project = {
    id: string;
    name: string;
    token: string;
    default: boolean;
    
    owner: Details;
    created: Date
}

export default Project;