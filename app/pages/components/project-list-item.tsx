import { Project } from "@simplechat/shared/models";
import React from "react";
import { formatDate } from "../utils";
import { usePageContext } from "../providers/page-provider";

interface ProjectListItemProps{
    project: Project
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project }) =>{
    const { pageState, setPage } = usePageContext();

    const clicked = () =>{
        setPage({ main: "projects", section: "projects", params: project.id });
    }

    const backgroundColor = pageState.params === project.id ? "white" : undefined;

    return (
        <div style={{ display: "flex", width: "100%", flexDirection: "row", gap: "8px", backgroundColor, borderRadius: 8, padding: "4px", cursor: "pointer" }} onClick={clicked}>
            <div style={{ width: "60px", height: "60px", borderRadius: 8, background: "linear-gradient(135deg,#dbeafe,#e6f0ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 700 }}>
                <span style={{ alignSelf: "center", color: "var(--primary)", cursor: "default" }} title="Project ID">
                    <svg xmlns="http://www.w3.org/2000/svg" height="46px" viewBox="0 0 48 48">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M28.846 32.93a2.399 2.399 0 0 0 1.046 4.558a2.4 2.4 0 1 0-1.046-4.56l-2.174-4.959a5.7 5.7 0 0 1-2.76.71a5.7 5.7 0 0 1-2.034-.372m2.849-10.962a5.68 5.68 0 0 0-4.112.99m-2.543 18.956a3.2 3.2 0 1 0-2.176 6.02a3.2 3.2 0 0 0 2.176-6.021l3.806-8.983a5.7 5.7 0 0 1-3.513-6.639l-4.931-.827a3.7 3.7 0 0 1-7.35-.614a3.7 3.7 0 1 1 7.35.614m5.345-4.917a2.3 2.3 0 0 1-2.944-3.535h0a2.3 2.3 0 0 1 2.944 3.535l1.836 2.412a5.7 5.7 0 0 0-2.25 3.332m11.624-2.747a3.3 3.3 0 1 0 5.279-3.96a3.3 3.3 0 0 0-5.28 3.96l-1.367.85c.648.946.994 2.066.992 3.212c0 .515-.07 1.014-.197 1.49m4.53 1.503a4 4 0 0 0 3.844 5.105a4 4 0 1 0 0-7.995a4 4 0 0 0-3.845 2.89l-4.53-1.504a5.7 5.7 0 0 1-2.742 3.496M25.56 10.674q.195.025.396.025a3.1 3.1 0 1 0-3.1-3.1v.002a3.1 3.1 0 0 0 2.703 3.073l-.83 6.67a5.7 5.7 0 0 1 3.893 2.427" stroke-width="1"/>
                    </svg>
                </span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "18px", fontWeight: "lighter", letterSpacing: 1.3 }}>{project.name}</div>
                <div style={{ fontSize: "12px" }}>{formatDate(project.created)}</div>
            </div>
        </div>
    );
}

export default ProjectListItem;