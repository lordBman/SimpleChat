import React, { useState } from "react";

const formStyle: React.CSSProperties = {
    position: "absolute", 
    display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 ,
    border: "1px solid #e6eef8",
    borderRadius: 10,
    padding: 14,
    background: "linear-gradient(180deg,#fff,#fbfdff)",
    boxShadow: "0 6px 18px rgba(6,24,62,0.04)",
    alignSelf: "flex-end"
};

const addButton: React.CSSProperties = {
    color: "var(--primary)",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
};

interface CreateProjectProps {
    create: (name: string) => void;
    close: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ close, create }) =>{
    const [name, setName] = useState("");
    
    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!name.trim()) return;
        create(name.trim());
    };

    return (
        <form style={formStyle} onSubmit={handleAdd}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontWeight: 600, fontSize: 16, color: "#657786" }}>New Project</label>
                <span onClick={close} style={{ float: "right", cursor: "pointer" }} title="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd" d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22M8.97 8.97a.75.75 0 0 1 1.06 0L12 10.94l1.97-1.97a.75.75 0 0 1 1.06 1.06L13.06 12l1.97 1.97a.75.75 0 1 1-1.06 1.06L12 13.06l-1.97 1.97a.75.75 0 1 1-1.06-1.06L10.94 12l-1.97-1.97a.75.75 0 0 1 0-1.06" clip-rule="evenodd"/>
                    </svg>
                </span>
            </div>
            <div style={{ display: "flex", gap: 4, flexDirection: "row" }}>
                <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #dfe7ef" }} />
                <button type="submit" style={addButton}>Create</button>
            </div>
        </form>
    );
}

export default CreateProject;