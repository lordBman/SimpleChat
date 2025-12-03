import { Project } from "@simplechat/shared/models";
import React from "react";
import { useAppContext } from "../providers/app-provider";

const cardStyle: React.CSSProperties = {
    border: "1px solid #e6eef8",
    borderRadius: 10,
    padding: 14,
    background: "linear-gradient(180deg,#fff,#fbfdff)",
    boxShadow: "0 6px 18px rgba(6,24,62,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "transform 120ms ease, box-shadow 120ms ease",
};

const titleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#102a43" };
const subtitleStyle: React.CSSProperties = { fontSize: 12, color: "#657786" };
const badgeStyle: React.CSSProperties = { background: "#eef6ff", color: "var(--primary)", padding: "4px 10px", borderRadius: 999, fontSize: 12 };

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
    const { user, createProject, deleteProject, renameProject } = useAppContext();
    const [loading, setLoading] = React.useState(false);

    const handleDelete = async () => {
        const ok = window.confirm("Delete this project? This cannot be undone.");
        if (ok){
            try {
                setLoading(true);
                await deleteProject(project.id);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const edit = () => {
        const newName = window.prompt("Enter new project name", project.name);
        if (newName && newName.trim() && newName.trim() !== project.name) {
            renameProject(project.id!, newName.trim()).catch((err) => {
                console.error(err);
            });
        }
    };

    return (
        <div key={project.id} style={cardStyle} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg,#dbeafe,#e6f0ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0366d6", fontWeight: 700 }}>{(project.name || "?").charAt(0).toUpperCase()}</div>
                    <div>
                        <div style={titleStyle}>{project.name}</div>
                        <div style={subtitleStyle}>{project.created ? new Date(project.created).toLocaleString() : "—"}</div>
                    </div>
                </div>

                {project.default && <div style={badgeStyle}>Default</div>}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <div style={{ fontFamily: "monospace", color: "#0b3a5b" }}>{maskToken(project.token)}</div>
                <div style={{ display: "flex", gap: 8 }}>
                    {project.token ? <button onClick={() => copyToken(project.token)} style={{ border: "none", background: "transparent", color: "#0366d6", cursor: "pointer" }}>Copy</button> : <span style={{ color: "#9aa7b2", fontSize: 12 }}>No token</span>}
                    <button onClick={edit} style={{ border: "none", background: "transparent", color: "#0366d6", cursor: "pointer" }}>Edit</button>
                    <button onClick={handleDelete} style={{ border: "none", background: "transparent", color: "#d64545", cursor: "pointer" }}>Delete</button>
                </div>
            </div>
        </div>
    );
}

export default ProjectItem;