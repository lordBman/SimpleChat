import { useAppContext } from "../../../providers/app-provider";
import AllProjects from "./all";
import ProjectDetails from "./details";
import React from "react";

const Projects = () =>{
    const { pageState } = useAppContext();
    const id = pageState.params;

    return (
        <>
            { !id && <AllProjects /> }
            { id && <ProjectDetails /> }
        </>
    );
}

export default Projects;