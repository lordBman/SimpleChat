import React from "react";
import { useAppContext } from "../providers/app-provider";
import { usePageContext } from "../providers/page-provider";

interface ProjectActionsProps {
    orientation?: "vertical" | "horizontal",
    name: string,
    id: string
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ orientation, name, id }) =>{
    const { deleteProject, renameProject } = useAppContext();
    const { setPage } = usePageContext();

    const finalOrientation = orientation || "horizontal";

    const handleDelete = async () => {
        const ok = window.confirm("Delete this project? This cannot be undone.");
        if (ok){
            try {
                await deleteProject(id).then(()=>{
                    setPage({ main: "projects", params: undefined });
                });    
            } catch (err) {
                console.error(err);
            }
        }
    };

    const edit = () => {
        const newName = window.prompt("Enter new project name", name);
        if (newName && newName.trim() && newName.trim() !== name) {
            renameProject(id!, newName.trim()).catch((err) => {
                console.error(err);
            });
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: finalOrientation === "horizontal" ? "row" : "column", alignItems: "center", gap: 8 }}>
            <span onClick={edit} style={{ color: "#0366d6", cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" d="M22 10.5V12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536C4.93 2 7.286 2 12 2h1.5" opacity="0.5"/>
                        <path d="m17.3 2.806l-.648.65l-5.965 5.964c-.404.404-.606.606-.78.829q-.308.395-.524.848c-.121.255-.211.526-.392 1.068L8.412 13.9l-.374 1.123a.742.742 0 0 0 .94.939l1.122-.374l1.735-.579c.542-.18.813-.27 1.068-.392q.453-.217.848-.524c.223-.174.425-.376.83-.78l5.964-5.965l.649-.649A2.753 2.753 0 0 0 17.3 2.806Z"/>
                        <path d="M16.652 3.455s.081 1.379 1.298 2.595c1.216 1.217 2.595 1.298 2.595 1.298M10.1 15.588L8.413 13.9" opacity="0.5"/>
                    </g>
                </svg>
            </span>
            <span onClick={handleDelete} style={{ color: "#d64545", cursor: "pointer" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3.21 3.042c-.463.539-.623 1.227-.603 2.208h18.787c.02-.981-.14-1.67-.604-2.208C19.892 2 18.272 2 15.033 2H8.967C5.727 2 4.108 2 3.21 3.042M3.034 8.89a85 85 0 0 1-.304-2.14h.96L4.94 8L3.165 9.773zm.566 3.77l.349 2.33l.99-.99zm.625 4.175l.009.055q.111.753.21 1.36H6.69L7.94 17L6 15.06zm7.085 1.415h1.38L13.94 17L12 15.06L10.06 17zm6 0h2.246q.099-.607.21-1.36l.009-.055L18 15.061L16.06 17zm2.742-3.26l.35-2.33L19.06 14zm.782-5.217l.133-.883c.121-.81.227-1.518.304-2.14h-.96L19.06 8zM15.69 6.75h-1.38L13.06 8L15 9.94L16.94 8zm-6 0H8.31L7.06 8L9 9.94L10.94 8zm-4.932 13c.196.686.451 1.165.868 1.523C6.47 22 7.702 22 10.167 22h3.666c2.465 0 3.697 0 4.541-.727c.417-.358.672-.837.868-1.523zM4.06 11L6 9.06L7.94 11L6 12.94zm3 3L9 12.06L10.94 14L9 15.94zM15 15.94L13.06 14L15 12.06L16.94 14zm-3-3L13.94 11L12 9.06L10.06 11zm6 0L16.06 11L18 9.06L19.94 11z"/>
                </svg>
            </span>
        </div>
    );
}

export default ProjectActions;