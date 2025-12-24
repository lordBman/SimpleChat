import React from "react";
import CreateForm from "./create-form";

interface CreateOrganizationProps {
    create: (name: string) => void;
    close: () => void;
}

const CreateOrganization: React.FC<CreateOrganizationProps> = ({ close, create }) =>{
    return (
        <CreateForm placeholder="Name of Organization" close={close} create={create} title="Create new Organization" />
    );
}

export default CreateOrganization;