import React from "react";
import CreateForm from "./create-form";

interface CreateProjectProps {
    create: (name: string) => void;
    close: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ close, create }) =>{
    return (
        <CreateForm placeholder="Project name" close={close} create={create} title="Create Project" />
    );
}

export default CreateProject;