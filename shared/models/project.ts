import Details from "./details";

type Project = {
    id: string;
    name: string;
    token: string;
    
    owner: Details;
    created: Date
}

export default Project;