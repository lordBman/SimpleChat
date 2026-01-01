import React from "react";

const badgeStyle: React.CSSProperties = {
    background: "#eef6ff", color: "var(--primary)", padding: "4px 10px", borderRadius: 999, fontSize: 12,
};

interface BadgeProps{
    label: string
}

const Badge: React.FC<BadgeProps> = ({ label }) =>{
    return (
        <div style={badgeStyle}>{label}</div>
    );
}

export default Badge;