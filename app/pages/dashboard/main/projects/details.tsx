import React, { useEffect, useState } from "react";

import { usePageContext } from "../../../providers/page-provider";
import { OrganizationDetails, ProjectDetails } from "@simplechat/shared";
import { useCallbackRequest } from "simplechat_provider/src/request";
import {apiClientInstance} from "../../../utils";
import { AccessKey, Project } from "@simplechat/shared/models";
import Organization from "@simplechat/shared/models/organization";
import { AccessKeyView, Badge, Key, OrganizationView, ProjectActions, ProjectSection, ProjectTitle } from "../../../components";
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

    const accessKeyDelete = (key: AccessKey) => {
        setDetails((d) => {
            if (!d) return d;
            return { ...d, keys: d.keys.filter((k) => k.id !== key.id) };
        });
    };

    const toggleAccessKey = (updated: AccessKey) => {
        setDetails((d) => {
            if (!d) return d;
            return { ...d, keys: d.keys.map((k) => (k.id === updated.id ? updated : k)) };
        });
    };

    // -- Organization actions --
    const openCreateOrganization = () => openSlide("createOrganization");
    const addOrganization = (created: OrganizationDetails) => {
        setDetails((d) => {
            if (!d) return d;
            return { ...d, organizations: [...d.organizations, created] };
        });
    };

    const deleteOrganization = (organization: Organization) => {
        setDetails((d) => {
            if (!d) return d;
            return { ...d, organizations: d.organizations.filter((o) => o.id !== organization.id) };
        });
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
                        {project.default && <Badge label="Default" />}
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
                    <AccessKeyView accessKey={key} onDelete={accessKeyDelete} onChange={toggleAccessKey} />
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
                    <OrganizationView organization={organization} projectID={project.id} onDelete={deleteOrganization}/>
                )) }
            </ProjectSection>
            <CreateKey isOpen={currentSlide === "createKey"} done={addAccessKey} />
            <CreateOrganization isOpen={currentSlide === "createOrganization"} done={addOrganization} />
        </div>
    );
};

export default ProjectDetails;