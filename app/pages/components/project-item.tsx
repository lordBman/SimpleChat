import { Project } from "@simplechat/shared/models";
import React from "react";
import { useAppContext } from "../providers/app-provider";
import { usePageContext } from "../providers/page-provider";
import ProjectTitle from "./project-title";
import ProjectActions from "./project-actions";

const cardStyle: React.CSSProperties = {
    border: "1px solid #e6eef8",
    borderRadius: 10,
    padding: 14,
    background: "linear-gradient(180deg,#fff,#fbfdff)",
    boxShadow: "0 6px 18px rgba(6,24,62,0.04)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 120ms ease, box-shadow 120ms ease",
    cursor: "pointer",
};

const badgeStyle: React.CSSProperties = {
    background: "#eef6ff", color: "var(--primary)", padding: "4px 10px", borderRadius: 999, fontSize: 12,
    alignSelf: "flex-end",
    position: "absolute",
};

const maskToken = (t: string) => {
    if (!t) return "—";
    if (t.length <= 12) return t;
    return `${t.slice(0, 6)}…${t.slice(-4)}`;
};

const copyToken = async (t: string) => {
    if (!t) return;
    try {
        await navigator.clipboard.writeText(t);
        // optional: show a small feedback; omitted to keep file small
    } catch (err) {
        console.error("copy failed", err);
    }
};

const ProjectItem: React.FC<{ project: Project }> = ({ project }) => {
    const { setPage } = usePageContext();

    

    const choose = () => {
        setPage({ main: "projects", params: project.id });
    }

    return (
        <div key={project.id} onClick={choose} style={cardStyle} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <span style={{ alignSelf: "center", color: "#657786", cursor: "default" }} title="Project ID">
                    <svg xmlns="http://www.w3.org/2000/svg" height="120px" viewBox="0 0 48 48">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M28.846 32.93a2.399 2.399 0 0 0 1.046 4.558a2.4 2.4 0 1 0-1.046-4.56l-2.174-4.959a5.7 5.7 0 0 1-2.76.71a5.7 5.7 0 0 1-2.034-.372m2.849-10.962a5.68 5.68 0 0 0-4.112.99m-2.543 18.956a3.2 3.2 0 1 0-2.176 6.02a3.2 3.2 0 0 0 2.176-6.021l3.806-8.983a5.7 5.7 0 0 1-3.513-6.639l-4.931-.827a3.7 3.7 0 0 1-7.35-.614a3.7 3.7 0 1 1 7.35.614m5.345-4.917a2.3 2.3 0 0 1-2.944-3.535h0a2.3 2.3 0 0 1 2.944 3.535l1.836 2.412a5.7 5.7 0 0 0-2.25 3.332m11.624-2.747a3.3 3.3 0 1 0 5.279-3.96a3.3 3.3 0 0 0-5.28 3.96l-1.367.85c.648.946.994 2.066.992 3.212c0 .515-.07 1.014-.197 1.49m4.53 1.503a4 4 0 0 0 3.844 5.105a4 4 0 1 0 0-7.995a4 4 0 0 0-3.845 2.89l-4.53-1.504a5.7 5.7 0 0 1-2.742 3.496M25.56 10.674q.195.025.396.025a3.1 3.1 0 1 0-3.1-3.1v.002a3.1 3.1 0 0 0 2.703 3.073l-.83 6.67a5.7 5.7 0 0 1 3.893 2.427" stroke-width="1"/>
                    </svg>
                </span>
                {project.default && <div style={badgeStyle}>Default</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
                <ProjectTitle name={project.name} created={project.created} />
                <ProjectActions name={project.name} id={project.id} orientation="vertical" />
            </div>
        </div>
    );
}

export default ProjectItem;