import React from "react";
import { useAppContext } from "../../providers/app-provider";
import { ProjectListItem, ProjectsHeader } from "../../components";

const rootStyle: React.CSSProperties = {
    padding: "12px",
    width: "100%"
}

const projectListStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    gap: 8,
    marginTop: "20px"
}

const ProjectsSection = () =>{
    const { user } = useAppContext();

    return (
        <div style={rootStyle}>
            <ProjectsHeader />
            <div style={projectListStyle}>
                { user?.projects.map((project)=>{
                    return (<ProjectListItem project={project} key={project.id}/>)
                }) }
            </div>
        </div>
    );
}

export default ProjectsSection;