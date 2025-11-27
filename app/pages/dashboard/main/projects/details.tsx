import React from "react";
import { useAppContext } from "../../../providers/app-provider";

const ProjectDetails = () =>{
    const { pageState } = useAppContext();
    const id = pageState.params || "unknown";
    
    return (
        <div>project details - {id}</div>
    );
}

export default ProjectDetails;