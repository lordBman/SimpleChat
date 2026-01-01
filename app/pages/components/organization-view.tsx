import React from "react";
import { apiClientInstance, copyToClipboard } from "../utils";
import { OrganizationDetails } from "@simplechat/shared";
import Organization from "@simplechat/shared/models/organization";

interface OrganizationViewProps{
    organization: OrganizationDetails,
    projectID: string

    onDelete: (key: Organization) => void
}

const OrganizationView: React.FC<OrganizationViewProps>  = ({ organization, projectID, onDelete }) =>{
    const handleDeleteOrg = () => {
        if (!confirm("Remove this organization from the project?")) return;

        apiClientInstance.delete<{ projectID: string; organizationID: string }, Organization>(`/api/projects/organizations/${organization.id}`, {
                data: { projectID, organizationID: organization.id }
            }).then(onDelete).catch(() => {});
    };

    return (
        <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 256 256">
                    <path fill="currentColor" d="M237 147.44a4 4 0 0 1-5.48-1.4c-8.33-14-20.93-22-34.56-22a4 4 0 0 1-1.2-.2a37 37 0 0 1-3.8.2a4 4 0 0 1 0-8a28 28 0 1 0-27.12-35a4 4 0 0 1-7.75-2a36 36 0 1 1 54 39.48c10.81 3.85 20.51 12 27.31 23.48a4 4 0 0 1-1.4 5.44M187.46 214a4 4 0 0 1-1.46 5.46a3.93 3.93 0 0 1-2 .54a4 4 0 0 1-3.46-2a61 61 0 0 0-105.08 0a4 4 0 0 1-6.92-4a68.35 68.35 0 0 1 39.19-31a44 44 0 1 1 40.54 0a68.35 68.35 0 0 1 39.19 31M128 180a36 36 0 1 0-36-36a36 36 0 0 0 36 36m-64-64a28 28 0 1 1 27.12-35a4 4 0 0 0 7.75-2a36 36 0 1 0-53.57 39.75a63.55 63.55 0 0 0-32.5 22.85a4 4 0 0 0 6.4 4.8A55.55 55.55 0 0 1 64 124a4 4 0 0 0 0-8"/>
                </svg>
                <h4 style={{ color: "grey" }}>{organization.name}</h4>
                <span onClick={()=> copyToClipboard(organization.name)} style={{ cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"/>
                            <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" opacity="0.5"/>
                        </g>
                    </svg>
                </span>
            </div>
            <div style={{ marginTop: 10, display: "flex", flexDirection:"row", alignItems: "end", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: 20, fontSize: "14px", fontWeight: "lighter", letterSpacing: 1.4 }}>
                    <span>Groups: {organization.groups.length ?? 0}</span>
                    <span>Users: {organization.clients.length ?? 0}</span>
                </div>
                <span onClick={handleDeleteOrg} style={{ color: "#d64545", cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"/>
                        <path fill="currentColor" fill-rule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707" clip-rule="evenodd"/>
                        <path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886" opacity="0.5"/>
                    </svg>
                </span>
            </div>
        </div>
    );
}

export default OrganizationView;