import { AccessKey } from "@simplechat/shared/models";
import { apiClientInstance } from "../utils";
import SlideInTab from "./slidein-tab";
import React, { useState } from "react";
import { usePageContext } from "../providers/page-provider";
import { useSlidersContext } from "../providers/slider-provider";

interface CreateKeyProps {
    done: (key: AccessKey) => void;
    isOpen?: boolean;
}

const CreateKey = ({ done, isOpen }: CreateKeyProps) =>{
    const { closeSlide } = useSlidersContext();

    const { pageState } = usePageContext();
    const id = pageState.params || undefined;

    const [addingKeyName, setAddingKeyName] = useState("");
    
    // -- Access key actions --
    const handleAddAccessKey = (e?: React.FormEvent) => {
        e?.preventDefault();

        if(!id || !addingKeyName.trim()) return;

        apiClientInstance.post<{ name: string }, AccessKey>(`/api/projects/${id}/access-keys`, { data: { name: addingKeyName.trim() } })
            .then((accessKey: AccessKey) => {
                done(accessKey);
                setAddingKeyName("");
            }).catch((error) => {
                console.error("Error adding access key:", error);
            });
    };
    
    return (
        <SlideInTab title="Add Key" isOpen={isOpen ?? false} onClose={closeSlide}>
            <form onSubmit={handleAddAccessKey} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Key Name</label>
                <input  type="text" value={addingKeyName} onChange={(e) => setAddingKeyName(e.target.value)} style={{ padding: "8px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc" }} />
                <button type="submit" style={{ padding: "10px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}>Add Access Key</button>
            </form>
        </SlideInTab>
    );
}

export default CreateKey;