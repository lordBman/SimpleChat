import React from "react";
import { useAppContext } from "../providers/app-provider";
import { usePageContext } from "../providers/page-provider";

interface ProjectActionsProps {
    orientation?: "vertical" | "horizontal",
    isDefault?: boolean,
    name: string,
    id: string
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ orientation, name, id, isDefault }) =>{
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
            { !isDefault && (
                <span onClick={handleDelete} style={{ color: "#d64545", cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"/>
                        <path fill="currentColor" fill-rule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707" clip-rule="evenodd"/>
                        <path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886" opacity="0.5"/>
                    </svg>
                </span>
            ) }
        </div>
    );
}

export default ProjectActions;