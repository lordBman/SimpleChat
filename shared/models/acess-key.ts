import Project from "./project";

type AccessKey = {
    name: string;
    id: string;
    key: string;
    enabled: boolean;
    project?: Project;
}

export default AccessKey;