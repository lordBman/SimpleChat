import React from "react";
import { useAppContext } from "../../../providers/app-provider";
import ProjectItem from "../../../components/project-item";
import { ProjectsHeader} from "../../../components";

const containerStyle: React.CSSProperties = { padding: "1.2rem", display: "flex", flexDirection: "column", position: "relative", width: "100%", height: "100%" };
const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    marginTop: 16,
};

const AllProjects: React.FC = () => {
    const { user } = useAppContext();
    
    return (
        <div style={containerStyle}>
            <ProjectsHeader />
            {user?.projects && user.projects.length > 0 ? (
                <div style={gridStyle}>
                    {user.projects.map((p) => (
                        <ProjectItem key={p.id} project={p} />
                    ))}
                </div>
            ) : (
                <div style={{ marginTop: 12 }}>No projects found.</div>
            )}
        </div>
    );
};

export default AllProjects;