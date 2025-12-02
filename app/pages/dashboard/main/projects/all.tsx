import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../providers/app-provider";
import { Project } from "@simplechat/shared/models";

const containerStyle: React.CSSProperties = { padding: "1.5rem" };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 };
const addButton: React.CSSProperties = {
    background: "#0366d6",
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

const cardHover: React.CSSProperties = { transform: "translateY(-4px)", boxShadow: "0 10px 30px rgba(6,24,62,0.08)" };

const titleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#102a43" };
const subtitleStyle: React.CSSProperties = { fontSize: 12, color: "#657786" };
const badgeStyle: React.CSSProperties = { background: "#eef6ff", color: "#0366d6", padding: "4px 10px", borderRadius: 999, fontSize: 12 };

const formStyle: React.CSSProperties = { marginTop: 12, display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 };

const maskToken = (t?: string) => {
    if (!t) return "—";
    if (t.length <= 12) return t;
    return `${t.slice(0, 6)}…${t.slice(-4)}`;
};

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

    const handleDelete = async (id: string) => {
        const ok = window.confirm("Delete this project? This cannot be undone.");
        if (!ok) return;
        setLoading(true);
        // optimistic remove
        setLocalProjects((prev) => prev.filter((pr) => pr.id !== id));
        try {
            await deleteProject(id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const copyToken = async (t?: string) => {
        if (!t) return;
        try {
            await navigator.clipboard.writeText(t);
            // optional: show a small feedback; omitted to keep file small
        } catch (err) {
            console.error("copy failed", err);
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
                        <div
                            key={p.id}
                            style={cardStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg,#dbeafe,#e6f0ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0366d6", fontWeight: 700 }}>{(p.name || "?").charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div style={titleStyle}>{p.name}</div>
                                        <div style={subtitleStyle}>{p.created ? new Date(p.created).toLocaleString() : "—"}</div>
                                    </div>
                                </div>

                                {p.default && <div style={badgeStyle}>Default</div>}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                                <div style={{ fontFamily: "monospace", color: "#0b3a5b" }}>{maskToken(p.token)}</div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {p.token ? <button onClick={() => copyToken(p.token)} style={{ border: "none", background: "transparent", color: "#0366d6", cursor: "pointer" }}>Copy</button> : <span style={{ color: "#9aa7b2", fontSize: 12 }}>No token</span>}
                                    <button onClick={() => startEdit(p)} style={{ border: "none", background: "transparent", color: "#0366d6", cursor: "pointer" }}>Edit</button>
                                    <button onClick={() => handleDelete(p.id)} style={{ border: "none", background: "transparent", color: "#d64545", cursor: "pointer" }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ marginTop: 12 }}>No projects found.</div>
            )}
        </div>
    );
};

export default AllProjects;