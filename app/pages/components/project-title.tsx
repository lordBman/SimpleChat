import React from "react";

const formatDate = (d?: Date) => {
    if (!d) return "—";

    const date = new Date(d);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const titleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#102a43" };
const subtitleStyle: React.CSSProperties = { fontSize: 12, fontWeight: "lighter", color: "#657786" };

interface ProjectTitleProps{
    name: string;
    created: Date;
}

const ProjectTitle: React.FC<ProjectTitleProps> = ({ name, created }) =>{
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, fontSize: "24px", borderRadius: 8, background: "linear-gradient(135deg,#dbeafe,#e6f0ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 700 }}>{(name || "?").charAt(0).toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={titleStyle}>{name}</div>
                <div style={subtitleStyle}>{formatDate(created)}</div>
            </div>
        </div>
    );
}

export default ProjectTitle;