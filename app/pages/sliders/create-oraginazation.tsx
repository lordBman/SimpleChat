import React, { useState } from "react";
import SlideInTab from "./slidein-tab";
import { useSlidersContext } from "../providers/slider-provider";
import { apiClientInstance } from "../utils";
import { OrganizationDetails } from "@simplechat/shared";
import { usePageContext } from "../providers/page-provider";

interface CreateOrganizationProps {
    isOpen?: boolean;
    done: (organization: OrganizationDetails) => void;
}

const CreateOrganization: React.FC<CreateOrganizationProps> = ({ isOpen, done }) => {
    const { closeSlide } = useSlidersContext();

    const { pageState } = usePageContext();
    const id = pageState.params || undefined;
    
    const [addingOrgName, setAddingOrgName] = useState("");

    // -- Organization actions --
    const handleCreateOrganization = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!id || !addingOrgName.trim()) return;

        apiClientInstance.post<{ name: string, projectId: string }, OrganizationDetails>(`/api/projects/organizations`, {
                data: { name: addingOrgName.trim(), projectId: id }
            }).then((created: OrganizationDetails) => {
                done(created);
                setAddingOrgName("");
            }).catch(() => {});
    };

    return (
        <SlideInTab title="Create Organization" isOpen={isOpen ?? false} onClose={closeSlide}>
            <form onSubmit={handleCreateOrganization} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Organization Name</label>
                <input type="text" value={addingOrgName} onChange={(e) => setAddingOrgName(e.target.value)} style={{ padding: "8px", fontSize: "14px", borderRadius: "4px", border: "1px solid #ccc" }} />
                <button type="submit" style={{ padding: "10px", fontSize: "16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Create</button>
            </form>
        </SlideInTab>
    );
}

export default CreateOrganization;