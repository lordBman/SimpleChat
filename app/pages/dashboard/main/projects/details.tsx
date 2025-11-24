import React from "react";
import { useAppContext } from "../../../providers/app-provider";

const ProjectDetails = () =>{
    const { sectionState } = useAppContext();
    const id = sectionState.params || "unknown";
    
    return (
        <div>project details - {id}</div>
    );
}

export default ProjectDetails;