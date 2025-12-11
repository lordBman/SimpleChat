import React from "react";
import { useAppContext } from "../../providers/app-provider";
import { usePageContext } from "../../providers/page-provider";

const rootStyle: React.CSSProperties = {
    padding: "20px"
}

const projectListStyle: React.CSSProperties = {

}

const ProjectsSection = () =>{
    const { user } = useAppContext();
    const { pageState } = usePageContext();

    return (
        <div style={rootStyle}>
            <h2>Projects</h2>
            <div style={projectListStyle}>
                
            </div>
        </div>
    );
}

export default ProjectsSection;