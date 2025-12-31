import { useAppContext } from "../../../providers/app-provider";
import { usePageContext } from "../../../providers/page-provider";
import AllProjects from "./all";
import ProjectDetails from "./details";
import React from "react";

const Projects = () =>{
    const { user } = useAppContext();

    const { pageState } = usePageContext();
    const id = pageState.params;
    const project = user!.projects.find((p) => p.id === id) || null;

    if(id === "undefined" || !project){
        return <AllProjects />;
    }

    return (
        <ProjectDetails project={project}/>
    );
}

export default Projects;