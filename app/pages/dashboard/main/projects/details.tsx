import React, { useEffect, useState } from "react";

import { usePageContext } from "../../../providers/page-provider";
import { OrganizationDetails, ProjectDetails } from "@simplechat/shared";
import { useAppContext } from "../../../providers/app-provider";
import { useRequest } from "simplechat_provider/src/request";
import {apiClientInstance, copyToClipboard} from "../../../utils";
import { AccessKey } from "@simplechat/shared/models";
import Organization from "@simplechat/shared/models/organization";
import { ProjectActions, ProjectSection, ProjectTitle } from "../../../components";
import { KeyIcon, OrganizationIcon } from "../../../icons";

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

const gridHeaderStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 80px 160px",
    gap: 8,
    padding: "8px 12px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 13,
    fontWeight: 600,
    color: "#333"
};

const gridRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 80px 160px",
    gap: 8,
    padding: "10px 12px",
    alignItems: "center",
    borderBottom: "1px solid #fafafa",
    fontSize: 13
};

const smallMuted: React.CSSProperties = { fontSize: 12, color: "#666" };

interface StatsProps {
    title: string;
    count: number;
    clicked?: () => void;
}

const Stats: React.FC<React.PropsWithChildren<StatsProps>> = ({ title, count, clicked, children }) =>{
    return (
        <div onClick={clicked} style={{ display: "flex", flexDirection: "row", alignItems: "center", cursor: clicked ? "pointer" : "default", color: "var(--primary)" }}>
            {children}
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 12, color: "#555" }}>{title}</div>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "gray" }}>{count}</div>
            </div>
        </div>
    );
}

const ProjectDetails = () => {
    const { user } = useAppContext();
    const { pageState, setPage } = usePageContext();
    const id = pageState.params || "unknown";
    const project = user!.projects.find((p) => p.id === id) || null;

    const [addingKeyName, setAddingKeyName] = useState("");
    const [addingOrgName, setAddingOrgName] = useState("");
    const [details, setDetails] = useState<ProjectDetails | null>(null);

    const { loading, error } = useRequest<ProjectDetails>({
        fn: async () => {
            const d = await apiClientInstance.get<ProjectDetails>(`/projects/${project?.id}`);
            setDetails(d);
            return d;
        }
    });

    useEffect(() => {
        // ensure details is seeded from shallow project data while loading completes
        if (!details && project) {
            setDetails((prev) => prev ?? ({
                id: project.id,
                name: project.name,
                keys: [],
                organizations: [],
                groups: [],
                created: project.created,
                owner: project.owner,
                default: project.default,
                userCount: project.userCount
            } as any));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project]);

    const orgGroupCount = (org: OrganizationDetails) => {
        if (typeof (org as any).groupCount === "number") return (org as any).groupCount;
        if (Array.isArray((org as any).groups)) return ((org as any).groups as any[]).length;
        return 0;
    };

    // -- Access key actions --
    const handleAddAccessKey = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!addingKeyName.trim()) return;

        apiClientInstance.post<{ name: string }, AccessKey>(`/api/projects/${project?.id}/access-keys`, { data: { name: addingKeyName.trim() } })
            .then((accessKey: AccessKey) => {
                setDetails((d) => {
                    if (!d) return d;
                    return { ...d, keys: [...d.keys, accessKey] };
                });
                setAddingKeyName("");
            })
            .catch(() => {});
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
    const handleAddOrg = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!addingOrgName.trim()) return;

        apiClientInstance
            .post<{}, OrganizationDetails>(`/api/projects/organizations`, {
                data: { name: addingOrgName.trim(), projectId: project?.id }
            })
            .then((created: OrganizationDetails) => {
                setDetails((d) => {
                    if (!d) return d;
                    return { ...d, organizations: [...d.organizations, created] };
                });
                setAddingOrgName("");
            })
            .catch(() => {});
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
        setPage({ main: "projects", params: undefined });
    };

    if (loading && !project) return <div>Loading project...</div>;

    return (
        <div style={pageStyle}>
            <h2 style={{ fontWeight: "lighter" }}>
                <span onClick={back} style={{ color: "var(--primary)", cursor: "pointer" }}>Project Details</span> | {project?.name}
            </h2>
            
            {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}

            {project ? (
                <>
                    <section style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
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

                        <div style={{ marginTop: 12, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "end" }}>
                            <div>
                                <label style={{ display: "block", fontSize: 12, color: "#555" }}>Token</label>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <code style={{ padding: "6px 8px", background: "#fafafa", borderRadius: 4 }}>{project.token}</code>
                                    <span onClick={() => copyToClipboard(project!.token)} style={{ cursor: "pointer" }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24">
                                            <g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"/>
                                                <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" opacity="0.5"/>
                                            </g>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                           <ProjectActions name={project.name} id={project.id} />
                        </div>
                    </section>

                    <div style={{ display: "flex", flexDirection: "row", gap: 20, }}>
                        <Stats title="Users" count={project.userCount}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><path fill="currentColor" d="M5.338 17.32C5.999 14.528 8.772 13 11.643 13h.714c2.871 0 5.644 1.527 6.305 4.32c.128.541.23 1.107.287 1.682c.055.55-.397.998-.949.998H6c-.552 0-1.004-.449-.949-.998c.057-.575.159-1.14.287-1.681"/></svg>
                        </Stats>
                        <Stats title="Groups" count={details?.groups.length ?? 0}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="40px" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="currentColor"/><circle cx="17" cy="9" r="3" fill="currentColor"/><circle cx="7" cy="9" r="3" fill="currentColor"/><path fill="currentColor" fill-rule="evenodd" d="M17.569 18h2.326c.592 0 1.045-.51.902-1.084C20.428 15.446 19.448 13 17 13c-.886 0-1.58.32-2.122.8c1.508.977 2.287 2.69 2.69 4.2m-8.446-4.2A3.1 3.1 0 0 0 7 13c-2.448 0-3.428 2.446-3.797 3.916c-.143.574.31 1.084.902 1.084h2.327c.403-1.51 1.182-3.223 2.69-4.2" clip-rule="evenodd"/><path fill="currentColor" d="M12 14c3.709 0 4.666 3.301 4.914 5.006c.08.547-.362.994-.914.994H8c-.552 0-.993-.447-.914-.994C7.334 17.301 8.291 14 12 14"/></svg>
                        </Stats>
                    </div>
                </>
            ) : (
                <div>Project not found</div>
            )}

            <ProjectSection title="Access Keys" icon={<KeyIcon />}>
                { details && details.keys.map((key)=>(
                    <div style={{ display: "flex" }}>

                    </div>
                )) }
            </ProjectSection>

            <ProjectSection title="Organizations" icon={<OrganizationIcon />}>
                vffbfff
            </ProjectSection>

            <section>
                <h3 style={{ marginBottom: 6 }}>Access Keys</h3>
                <form onSubmit={handleAddAccessKey} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input placeholder="New key name" value={addingKeyName} onChange={(e) => setAddingKeyName(e.target.value)} style={{ flex: 1 }} />
                    <button type="submit">Add Key</button>
                </form>

                <div style={{ border: "1px solid #eee", borderRadius: 6, padding: 0 }}>
                    <div style={gridHeaderStyle}>
                        <div>Name</div>
                        <div>Key</div>
                        <div>Enabled</div>
                        <div>Actions</div>
                    </div>

                    {!details || details.keys.length === 0 ? (
                        <div style={{ color: "#666", padding: 12 }}>No access keys</div>
                    ) : (
                        <div>
                            {details.keys.map((k) => (
                                <div key={k.id} style={gridRowStyle}>
                                    <div style={{ paddingRight: 6 }}>{k.name}</div>
                                    <div>
                                        <code>{k.key ?? "••••••••"}</code>
                                    </div>
                                    <div>{k.enabled ? "Yes" : "No"}</div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => handleToggleAccessKey(k.id)}>{k.enabled ? "Disable" : "Enable"}</button>
                                        <button onClick={() => copyToClipboard(k.key)}>Copy</button>
                                        <button onClick={() => handleDeleteAccessKey(k.id)} style={{ color: "crimson" }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: 6 }}>Organizations</h3>
                <form onSubmit={handleAddOrg} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input placeholder="Organization name" value={addingOrgName} onChange={(e) => setAddingOrgName(e.target.value)} style={{ flex: 1 }} />
                    <button type="submit">Add Org</button>
                </form>

                <div style={{ border: "1px solid #eee", borderRadius: 6, padding: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px", gap: 8, padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontWeight: 600 }}>
                        <div>Organization</div>
                        <div>ID</div>
                        <div>Groups</div>
                    </div>

                    {!details || details.organizations.length === 0 ? (
                        <div style={{ color: "#666", padding: 12 }}>No organizations</div>
                    ) : (
                        <div>
                            {details.organizations.map((o) => (
                                <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px", gap: 8, padding: 12, alignItems: "center", borderBottom: "1px solid #fafafa" }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{o.name}</div>
                                        <div style={smallMuted}>{o.id}</div>
                                    </div>
                                    <div style={smallMuted}>{o.id}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ fontWeight: 600 }}>{orgGroupCount(o)}</div>
                                        <button onClick={() => handleDeleteOrg(o.id)} style={{ color: "crimson" }}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProjectDetails;