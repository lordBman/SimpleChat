import React from "react";
import CreateForm from "./create-form";

interface CreateAcesskeyProps {
    create: (name: string) => void;
    close: () => void;
}

const CreateAcesskey: React.FC<CreateAcesskeyProps> = ({ close, create }) =>{
    return (
        <CreateForm placeholder="Name of Access key" close={close} create={create} title="Create new Acess Key" />
    );
}

export default CreateAcesskey;