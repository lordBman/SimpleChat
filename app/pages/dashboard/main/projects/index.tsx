import { usePageContext } from "../../../providers/page-provider";
import AllProjects from "./all";
import ProjectDetails from "./details";
import React from "react";

const Projects = () =>{
    const { pageState } = usePageContext();
    const id = pageState.params;

    return (
        <>
            { !id && <AllProjects /> }
            { id && <ProjectDetails /> }
        </>
    );
}

export default Projects;