import React, { useEffect, useState } from "react";

import { usePageContext } from "../../../providers/page-provider";
import { OrganizationDetails, ProjectDetails } from "@simplechat/shared";
import { useCallbackRequest, useRequest } from "simplechat_provider/src/request";
import {apiClientInstance, copyToClipboard} from "../../../utils";
import { AccessKey, Project } from "@simplechat/shared/models";
import Organization from "@simplechat/shared/models/organization";
import { Key, ProjectActions, ProjectSection, ProjectTitle } from "../../../components";
import { KeyIcon, OrganizationIcon } from "../../../icons";
import CreateKey from "../../../sliders/create-key";
import { useSlidersContext } from "../../../providers/slider-provider";
import { CreateOrganization } from "../../../sliders";

const pageStyle: React.CSSProperties = { 
    paddingTop: "20px", 
    paddingLeft: "20px",
    paddingRight: "20px", 
    fontFamily: "system-ui, sans-serif",

    display: "flex",
    flexDirection: "column",
    gap: "10px",
};

const badgeStyle: React.CSSProperties = {
    background: "#eef6ff", color: "var(--primary)", padding: "4px 10px", borderRadius: 999, fontSize: 12,
};

const enableButtonStyle: React.CSSProperties = {
    padding: "4px 6px",
    backgroundColor: "var(--primary)",
    borderRadius: 4,
    borderWidth: "2px",
    fontWeight: "lighter",
    borderStyle: "none",
    color: "white",
    fontSize: "12px"
}

const smallMuted: React.CSSProperties = { fontSize: 12, color: "#666" };

interface StatsProps {
    title: string;
    count: number;
    clicked?: () => void;
}

const Stats: React.FC<React.PropsWithChildren<StatsProps>> = ({ title, count, clicked, children }) =>{
    return (
        <div onClick={clicked} style={{ display: "flex", flexDirection: "row", alignItems: "center", cursor: clicked ? "pointer" : "default", color: "grey" }}>
            {children}
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 12, color: "#555" }}>{title}</div>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "gray" }}>{count}</div>
            </div>
        </div>
    );
}

interface ProjectDetailsProps {
    project: Project
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
    const { currentSlide, openSlide } = useSlidersContext();
    const { navigate } = usePageContext();

    const [details, setDetails] = useState<ProjectDetails | null>(null);

    const { loading, start, error  } = useCallbackRequest<ProjectDetails, void>({
        request: async () =>{
            const res = await apiClientInstance.get<ProjectDetails>(`/projects/${project?.id}`);
            if(res){
                setDetails(res);
            }
            return res;
        }
    });

    useEffect(start, [project]);

    const orgGroupCount = (org: OrganizationDetails) => {
        if (typeof (org as any).groupCount === "number") return (org as any).groupCount;
        if (Array.isArray((org as any).groups)) return ((org as any).groups as any[]).length;
        return 0;
    };

    const openCreateKey = () => openSlide("createKey");

    const addAccessKey = (key: AccessKey) => {
        setDetails((init) => {
            return { ...init!, keys: [ ...init?.keys ?? [], key ] };
        });
    };

    const handleDeleteAccessKey = (keyId: string) => {
        if (!confirm("Delete this access key? This cannot be undone.")) return;

        apiClientInstance.delete(`/api/access-keys/${keyId}`)
            .then(() => {
                setDetails((d) => {
                    if (!d) return d;
                    return { ...d, keys: d.keys.filter((k) => k.id !== keyId) };
                });
            })
            .catch(() => {});
    };

    const handleToggleAccessKey = (keyId: string) => {
        apiClientInstance
            .patch<{}, AccessKey>(`/api/access-keys/${keyId}`)
            .then((updated: AccessKey) => {
                setDetails((d) => {
                    if (!d) return d;
                    return { ...d, keys: d.keys.map((k) => (k.id === keyId ? updated : k)) };
                });
            })
            .catch(() => {});
    };

    // -- Organization actions --
    const openCreateOrganization = () => openSlide("createOrganization");
    const addOrganization = (created: OrganizationDetails) => {
        setDetails((d) => {
            if (!d) return d;
            return { ...d, organizations: [...d.organizations, created] };
        });
    };

    const handleDeleteOrg = (orgId: string) => {
        if (!confirm("Remove this organization from the project?")) return;

        apiClientInstance
            .delete<{ projectID: string; organizationID: string }, Organization>(`/api/projects/organizations/${orgId}`, {
                data: { projectID: project!.id, organizationID: orgId }
            })
            .then(() => {
                setDetails((d) => {
                    if (!d) return d;
                    return { ...d, organizations: d.organizations.filter((o) => o.id !== orgId) };
                });
            })
            .catch(() => {});
    };

    const back = () => {
        navigate("Projects", "/projects");
    };

    if (loading && !project) return <div>Loading project...</div>;

    return (
        <div style={pageStyle}>
            <h3 style={{ fontWeight: "lighter", marginBottom: 20 }}>
                <span onClick={back} style={{ color: "var(--primary)", cursor: "pointer" }}>Projects</span> | {project?.name}
            </h3>
            
            {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}

            {project ? (
                <section style={{ border: "1px solid #eee", padding: 20, borderRadius: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: "row", width: "100%" }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <span style={{ alignSelf: "center", color: "#657786", cursor: "default" }} title="Project ID">
                                <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 0 48 48">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M28.846 32.93a2.399 2.399 0 0 0 1.046 4.558a2.4 2.4 0 1 0-1.046-4.56l-2.174-4.959a5.7 5.7 0 0 1-2.76.71a5.7 5.7 0 0 1-2.034-.372m2.849-10.962a5.68 5.68 0 0 0-4.112.99m-2.543 18.956a3.2 3.2 0 1 0-2.176 6.02a3.2 3.2 0 0 0 2.176-6.021l3.806-8.983a5.7 5.7 0 0 1-3.513-6.639l-4.931-.827a3.7 3.7 0 0 1-7.35-.614a3.7 3.7 0 1 1 7.35.614m5.345-4.917a2.3 2.3 0 0 1-2.944-3.535h0a2.3 2.3 0 0 1 2.944 3.535l1.836 2.412a5.7 5.7 0 0 0-2.25 3.332m11.624-2.747a3.3 3.3 0 1 0 5.279-3.96a3.3 3.3 0 0 0-5.28 3.96l-1.367.85c.648.946.994 2.066.992 3.212c0 .515-.07 1.014-.197 1.49m4.53 1.503a4 4 0 0 0 3.844 5.105a4 4 0 1 0 0-7.995a4 4 0 0 0-3.845 2.89l-4.53-1.504a5.7 5.7 0 0 1-2.742 3.496M25.56 10.674q.195.025.396.025a3.1 3.1 0 1 0-3.1-3.1v.002a3.1 3.1 0 0 0 2.703 3.073l-.83 6.67a5.7 5.7 0 0 1 3.893 2.427" stroke-width="1"/>
                                </svg>
                            </span>
                            <ProjectTitle name={project.name} created={project.created} />
                        </div>
                        {project.default && <div style={badgeStyle}>Default</div>}
                    </div>
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "row", alignItems: "center", gap: 20, fontSize: "14px", fontWeight: "lighter", letterSpacing: 1.4 }}>
                        <span>Groups: {details?.groups.length ?? 0}</span>
                        <span>Users: {details?.clients.length ?? 0}</span>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "end" }}>
                        <Key title="Token" secret={project.token} />
                        <ProjectActions name={project.name} id={project.id} isDefault={project.default} />
                    </div>
                </section>
            ) : (
                <div>Project not found</div>
            )}

            <ProjectSection title="Access Keys" icon={<KeyIcon />} add={openCreateKey}>
                { details && details.keys.length > 0 && details.keys.map((key)=>(
                    <div style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
                        <div style={{ display: "flex", flexDirection:"row", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <g fill="none">
                                        <path fill="currentColor" stroke-width="1" d="m20.314 3.686l.53-.53zm0 8.14l.53.53zm-9.86-1.769l-.53-.53zM7.362 13.15l.53.53zm3.489 3.489l-.53-.53zm3.093-3.094l-.53-.53zm-6.935.614l-.746.082zm.193 1.74l-.745.083zm.9.9l-.083.745zm1.74.193l.083-.745zm-2.404-.602l.53-.53zm.173.173l-.53.53zm3.06-7.37l-.726.186zm4.137 4.137l-.186.726zm-3.854.3a.75.75 0 0 0-1.055 1.067zm4.566-5.148a.917.917 0 0 1 0-1.297l-1.061-1.06a2.417 2.417 0 0 0 0 3.417zm1.296 0a.917.917 0 0 1-1.297 0l-1.06 1.06a2.417 2.417 0 0 0 3.417 0zm0-1.297a.917.917 0 0 1 0 1.297l1.06 1.06a2.417 2.417 0 0 0 0-3.418zm1.06-1.06a2.417 2.417 0 0 0-3.417 0l1.06 1.06a.917.917 0 0 1 1.297 0zm1.909-1.909a5.006 5.006 0 0 1 0 7.079l1.06 1.06a6.506 6.506 0 0 0 0-9.2zm1.06-1.06a6.506 6.506 0 0 0-9.2 0l1.061 1.06a5.006 5.006 0 0 1 7.079 0zm-10.92 6.37L6.831 12.62l1.06 1.06l3.094-3.093zm1.456 7.643l1.034-1.034l-1.061-1.06l-1.034 1.033zm1.034-1.034l2.06-2.06l-1.061-1.06l-2.06 2.06zm-6.152-1.894l.194 1.741l1.49-.166l-.193-1.74zm1.756 3.303l1.74.194l.166-1.491l-1.74-.193zm-1.112-.624l.174.174l1.06-1.061l-.173-.174zm1.278-.866a.07.07 0 0 1-.043-.021l-1.061 1.06c.252.253.583.412.938.451zm-1.728-.072c.039.355.198.686.45.938l1.061-1.06a.07.07 0 0 1-.02-.044zm3.863.126a.48.48 0 0 1-.395.139l-.165 1.49a1.98 1.98 0 0 0 1.621-.568zM6.831 12.62a1.98 1.98 0 0 0-.569 1.622l1.491-.166a.48.48 0 0 1 .139-.395zm4.566-3.614a5 5 0 0 1 1.308-4.79l-1.06-1.06a6.5 6.5 0 0 0-1.701 6.223zm8.387 2.289a5 5 0 0 1-4.79 1.308l-.373 1.453a6.5 6.5 0 0 0 6.224-1.7zm-5.31 2.78a.1.1 0 0 1 .044-.022a.2.2 0 0 1 .103.003l.373-1.453c-.527-.135-1.143-.026-1.581.412zm-3.489-3.488c.438-.437.547-1.054.412-1.58l-1.453.372q.014.061.003.103a.1.1 0 0 1-.023.045zm1.426 4.485l-1.458-1.442l-1.055 1.067l1.458 1.441z"/>
                                        <path stroke="currentColor" stroke-linecap="round" stroke-width="1" d="M2 11.99c0 4.719 0 7.078 1.466 8.544S7.29 22 12.01 22s7.078 0 8.544-1.466c1.115-1.115 1.382-2.747 1.446-5.541M9.007 2c-2.794.064-4.426.33-5.541 1.446c-.977.977-1.303 2.35-1.412 4.554"/>
                                    </g>
                                </svg>
                                <h4 style={{ color: "grey" }}>{key.name}</h4>
                            </div>
                            <div style={{ display: "flex", flexDirection:"row", gap: "6px", alignItems: "center" }}>
                                {key.default && <div style={badgeStyle}>Default</div>}
                                <div style={badgeStyle}>{ key.enabled ? "Enabled" : "Disabled" }</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 20, display: "flex", flexDirection:"row", alignItems: "end", justifyContent: "space-between" }}>
                            <Key title="Key" secret={key.key} />
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <button style={enableButtonStyle} onClick={() => handleToggleAccessKey(key.id)}>{key.enabled ? "Disable" : "Enable"}</button>
                                { !key.default && (
                                    <span onClick={() => handleDeleteAccessKey(key.id)} style={{ color: "#d64545", cursor: "pointer" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"/>
                                            <path fill="currentColor" fill-rule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707" clip-rule="evenodd"/>
                                            <path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886" opacity="0.5"/>
                                        </svg>
                                    </span>
                                ) }
                            </div>
                        </div>
                        { key.default && (
                            <div style={{ marginTop: "10px", fontSize: "12px", color: "GrayText" }}>
                                Note: It is recommended not to use an Acess key that is tagged as default.
                            </div>
                        ) }
                    </div>
                )) }

                { details && details.keys.length === 0 && (
                    <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
                        <span>No Access keys created</span>
                    </div>
                ) }
            </ProjectSection>

            <ProjectSection title="Organizations" icon={<OrganizationIcon />} add={openCreateOrganization}>
                { details && details.organizations.length === 0 && (
                    <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
                        <span>No Oganizations created</span>
                    </div>
                ) }

                { details && details.organizations.length > 0 && details.organizations.map((organization)=>(
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
                            <span onClick={() => handleDeleteOrg(organization.id)} style={{ color: "#d64545", cursor: "pointer" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"/>
                                    <path fill="currentColor" fill-rule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707" clip-rule="evenodd"/>
                                    <path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886" opacity="0.5"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                )) }
            </ProjectSection>
            <CreateKey isOpen={currentSlide === "createKey"} done={addAccessKey} />
            <CreateOrganization isOpen={currentSlide === "createOrganization"} done={addOrganization} />
        </div>
    );
};

export default ProjectDetails;