import React, { useState } from "react";
import CreateProject from "./create-project";
import { useAppContext } from "../providers/app-provider";

const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between" };
const addButton: React.CSSProperties = {
    color: "var(--primary)",
    cursor: "pointer",
};

const ProjectsHeader = () =>{
    const { createProject } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);


    const close = () =>setShowPopUp(false);
    const add = () => setShowPopUp(true);
    const create = (name: string) => {
        setLoading(true);
        createProject(name).finally(() => {
            setLoading(false);
            close();
        });
    }
    
    return (
        <>
            <div style={headerRow}>
                <h2 style={{ margin: 0 }}>Projects</h2>
                <div style={addButton} onClick={add}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24">
                        <path fill="currentColor" fill-rule="evenodd" d="M17.5 2.75a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25V9.5a.75.75 0 0 1-1.5 0V7.25H14.5a.75.75 0 0 1 0-1.5h2.25V3.5a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/>
                        <path fill="currentColor" d="M2 6.5c0-2.121 0-3.182.659-3.841S4.379 2 6.5 2s3.182 0 3.841.659S11 4.379 11 6.5s0 3.182-.659 3.841S8.621 11 6.5 11s-3.182 0-3.841-.659S2 8.621 2 6.5m11 11c0-2.121 0-3.182.659-3.841S15.379 13 17.5 13s3.182 0 3.841.659S22 15.379 22 17.5s0 3.182-.659 3.841S19.621 22 17.5 22s-3.182 0-3.841-.659S13 19.621 13 17.5"/>
                        <path fill="currentColor" d="M2 17.5c0-2.121 0-3.182.659-3.841S4.379 13 6.5 13s3.182 0 3.841.659S11 15.379 11 17.5s0 3.182-.659 3.841S8.621 22 6.5 22s-3.182 0-3.841-.659S2 19.621 2 17.5" opacity="0.5"/>
                    </svg>
                </div>
            </div>
            
            {showPopUp && (<CreateProject close={close} create={create} />)}
        </>
    );
}

export default ProjectsHeader;