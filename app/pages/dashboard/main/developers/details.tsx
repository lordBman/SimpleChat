import React from "react";
import { useAppContext } from "../../../providers/app-provider";

const DeveloperDetails = () =>{
    const { sectionState } = useAppContext();
    const id = sectionState.params || "unknown";

    return (
        <div>Developers details - {id}</div>
    );
}

export default DeveloperDetails;