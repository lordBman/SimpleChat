import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../providers/app-provider";
import { Project } from "@simplechat/shared/models";
import ProjectItem from "../../../components/project-item";

const containerStyle: React.CSSProperties = { padding: "1.5rem" };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
const addButton: React.CSSProperties = {
    background: "var(--primary)",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
};

const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    marginTop: 16,
};

const cardHover: React.CSSProperties = { transform: "translateY(-4px)", boxShadow: "0 10px 30px rgba(6,24,62,0.08)" };



const formStyle: React.CSSProperties = { marginTop: 12, display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 };



const AllProjects: React.FC = () => {
    const { user, createProject, deleteProject, renameProject } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [name, setName] = useState("");

    // local copy of projects for optimistic updates and UI edits
    const [localProjects, setLocalProjects] = useState<Project[]>((user && user.projects) || []);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        createProject(name.trim()).then(()=>{
            setName("");
            setShowAdd(false);
        }).catch((error)=>{
            console.error(error);
        }).finally(()=>{
            setLoading(false);
        });
    };

    useEffect(() => {
        if (user && user.projects) setLocalProjects(user.projects);
    }, [user]);

    const startEdit = (p: Project) => {
        setEditingId(p.id);
        setEditName(p.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const saveEdit = async (id: string) => {
        if (!editName.trim()) return;
        setLoading(true);
        // optimistic update
        setLocalProjects((prev) => prev.map((pr) => (pr.id === id ? { ...pr, name: editName } : pr)));
        try {
            await renameProject(id, editName.trim());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            cancelEdit();
        }
    };

    return (
        <div style={containerStyle}>
            <div style={headerRow}>
                <h2 style={{ margin: 0 }}>Projects</h2>
                <div>
                    <button style={addButton} onClick={() => setShowAdd((s) => !s)}>{showAdd ? "Cancel" : "Add Project"}</button>
                </div>
            </div>

            {showAdd && (
                <form style={formStyle} onSubmit={handleAdd}>
                    <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #dfe7ef" }} />
                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="submit" disabled={loading} style={{ ...addButton, opacity: loading ? 0.7 : 1 }}>{loading ? "Adding…" : "Create"}</button>
                        <button type="button" onClick={() => { setShowAdd(false); setName(""); }} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #dfe7ef", background: "#fff", cursor: "pointer" }}>Cancel</button>
                    </div>
                </form>
            )}

            {localProjects && localProjects.length > 0 ? (
                <div style={gridStyle}>
                    {localProjects.map((p) => (
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