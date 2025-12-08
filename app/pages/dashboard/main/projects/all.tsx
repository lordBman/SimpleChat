import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../../providers/app-provider";
import ProjectItem from "../../../components/project-item";
import CreateProject from "../../../components/create-project";

const containerStyle: React.CSSProperties = { padding: "1.2rem", display: "flex", flexDirection: "column", position: "relative", width: "100%", height: "100%" };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12 };
const addButton: React.CSSProperties = {
    color: "var(--primary)",
    cursor: "pointer",
};

const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    marginTop: 16,
};

const cardHover: React.CSSProperties = { transform: "translateY(-4px)", boxShadow: "0 10px 30px rgba(6,24,62,0.08)" };

const AllProjects: React.FC = () => {
    const { user, createProject, renameProject } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [shopAddPopUp, setShopAddPopUp] = useState(false);


    const closeAddPopUp = () =>setShopAddPopUp(false);
    const addClicked = () => setShopAddPopUp(true);
    const create = (name: string) => {
        setLoading(true);
        createProject(name).finally(() => {
            setLoading(false);
            closeAddPopUp();
        }).finally(closeAddPopUp);
    }

    return (
        <div style={containerStyle}>
            <div style={headerRow}>
                <h2 style={{ margin: 0 }}>Projects</h2>
                <div style={addButton} onClick={addClicked}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd" d="M17.5 2.75a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25V9.5a.75.75 0 0 1-1.5 0V7.25H14.5a.75.75 0 0 1 0-1.5h2.25V3.5a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/>
                        <path fill="currentColor" d="M2 6.5c0-2.121 0-3.182.659-3.841S4.379 2 6.5 2s3.182 0 3.841.659S11 4.379 11 6.5s0 3.182-.659 3.841S8.621 11 6.5 11s-3.182 0-3.841-.659S2 8.621 2 6.5m11 11c0-2.121 0-3.182.659-3.841S15.379 13 17.5 13s3.182 0 3.841.659S22 15.379 22 17.5s0 3.182-.659 3.841S19.621 22 17.5 22s-3.182 0-3.841-.659S13 19.621 13 17.5"/>
                        <path fill="currentColor" d="M2 17.5c0-2.121 0-3.182.659-3.841S4.379 13 6.5 13s3.182 0 3.841.659S11 15.379 11 17.5s0 3.182-.659 3.841S8.621 22 6.5 22s-3.182 0-3.841-.659S2 19.621 2 17.5" opacity="0.5"/>
                    </svg>
                </div>
            </div>
            
            {shopAddPopUp && (<CreateProject close={closeAddPopUp} create={create} />)}

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