import React from "react";

interface ProjectSectionProps{
    title: string,
    icon: React.ReactElement,
    add?: ()=> void
}

const ProjectSection: React.FC<React.PropsWithChildren<ProjectSectionProps>> = ({ title, icon, add, children }) =>{
    return (
        <section style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "46px", height: "46px", color: "var(--primary)", border: "solid 1px", borderRadius: "50%", borderColor: "grey", background: "linear-gradient(135deg,#dbeafe,#e6f0ff)" }}>
                    { icon }
                </div>
                <div style={{ marginBottom: "23px", display: "flex", flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "end" }}>
                    <h4 style={{ fontWeight: "lighter" }}>{title}</h4>
                    <span style={{ color: "var(--primary)" }} onClick={add}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 22c-4.714 0-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22" opacity="0.5"/>
                            <path fill="currentColor" d="M12 8.25a.75.75 0 0 1 .75.75v2.25H15a.75.75 0 0 1 0 1.5h-2.25V15a.75.75 0 0 1-1.5 0v-2.25H9a.75.75 0 0 1 0-1.5h2.25V9a.75.75 0 0 1 .75-.75"/>
                        </svg>
                    </span>
                </div>
            </div>
            <div style={{ border: "1px solid #eee", padding: 12, paddingTop: "30px", borderRadius: 6, marginTop: "-23px", marginLeft: "23px" }}>
                { children }
            </div>
        </section>
    );
}

export default ProjectSection;