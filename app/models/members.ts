import { Client, Member, Project } from "@simplechat/shared/models";
import { DBManager, Err } from "../config";
import { MemberRoles, Organization } from "@simplechat/shared";

class MemberModel{
    database = DBManager.instance();

    async create(data: { project: Project, client: Client, groupID: string }): Promise<Member>{
        try{
            const exists = await this.database.member.findUnique({ where: { id_groupID: { id: data.client.id, groupID: data.groupID } } });
            if(exists){
                throw new Err(403, ``, "you are already a menber of this group");
            }else{
                const member = await this.database.member.create({
                    data: {  groupID: data.groupID, id: data.client.id, role: "Member", },
                    include: { group: { include: { creator: { include: { details: true } } } } }
                });

                return { ...member, details: data.client.details, group: { ... member.group, creator: member.group.creator.details }};
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when creating group");
        }
    }

    async all(data: { project: Project, organization?: Organization, client: Client }): Promise<Member[]>{
        try{
            const members: Member[] = (await this.database.member.findMany({ 
                where: { id: data.client.id },
                include: {
                    client: { include: { details: true } },
                    group: { include: { creator: { include: { details: true } } } } 
                }
            })).filter((member)=> {
                return member.group.projectID == data.project.id && member.group.organizationID == data.organization?.id;
            }).map((member)=>{
                return { ...member, details: member.client.details,  group: { ...member.group, creator: member.group.creator.details } }
            });

            return members;
        }catch(error){
            throw new Err(503, error, "error encountered while getting all groups");
        }
    }

    async get(data: { client: Client, groupID: string }): Promise<Member>{
        try{
            const member = (await this.database.member.findUnique({ 
                where: { id_groupID: { id: data.client.id, groupID: data.groupID }},
                include: {
                    client: { include: { details: true } },
                    group: { include: { creator: { include: { details: true } } } } 
                }
            }));

            if(member){
                return { ...member, details: member.client.details,  group: { ...member.group, creator: member.group.creator.details } }
            }else{
                throw new Err(404, "", "you are not a member of this group");    
            }
        }catch(error){
            throw new Err(503, error, "error encountered while getting all members");
        }
    }

    async cancel(data: { client: Client, groupID: string }): Promise<Member>{
        try{
            const member = await this.database.member.delete({ 
                where: { id_groupID: { id: data.client.id, groupID: data.groupID } },
                include: {
                    group: { include: { creator: { include: { details: true } } } } 
                }
            });
            const init = { ...member, details: data.client.details, group: { ...member.group, creator: member.group.creator.details } }

            return init;
        }catch(error){
            throw new Err(503, error, "error encountered while canceling membership request");
        }
    }

    async accept(data: { client: Client, userID: string, groupID: string } ): Promise<Member>{
        try{
            const admin = await this.database.member.findUnique({
                where: { id_groupID: { groupID: data.groupID, id: data.client.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "Admin"){
                    const init = await this.database.member.update({
                        where: { id_groupID: {groupID: data.groupID, id: data.userID} },
                        data: { accepted: true },
                        include: {
                            group: { include:{ creator: {
                                include: { details: true }
                            } } }, 
                            client: { include: { details: true } } }
                    });

                    await this.database.notification.create({
                        data: {
                            recieverID: data.userID, nType: "User",
                            alert: `${data.client.details.name} accepted request your to join the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(data.client.id !== member.id && member.id !== data.userID){
                            await this.database.notification.create({
                                data: {
                                    recieverID: data.groupID, nType: "Group",
                                    alert: `${data.client.details.name} accepted request ${init.client.details.name} to join the ${admin.group.name} group`,
                                }
                            });
                        }
                    });
                    return { ...init, details: data.client, group: { ...init.group, creator: init.group.creator.details } };

                }else{
                    throw new Err(401, ``, "only admins are allowed to accept users to a group");    
                }
            }else{
               throw new Err(401, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when accpeting user request");
        }   
    }

    async reject(data: { client: Client, userID: string, groupID: string } ): Promise<Member>{
        try{
            const admin = await this.database.member.findUnique({
                where: { id_groupID: { groupID: data.groupID, id: data.client.id }  },
                include: { group: { include:{ creator: {
                    include: { details: true }
                } } } }
            });

            if(admin){
                if(admin.role === "Admin"){
                    const init = await this.database.member.delete({
                        where: { id_groupID: {groupID: data.groupID, id: data.userID} },
                        include: { client: { include: { details: true } } }
                    });

                    await this.database.notification.create({
                        data: {
                            recieverID: data.userID, nType: "User",
                            alert: `${data.client.details.name} rejected your request to join ${admin.group.name} group`,
                        }
                    });
                    return { ...init, group: { ...admin.group, creator: admin.group.creator.details }, details: data.client.details };
                }else{
                    throw new Err(401, ``, "only admins are allowed to reject users requests to a group");    
                }
            }else{
                throw new Err(401, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when rejecting user's request");
        }   
    }

    async assign(data: { client: Client, userID: string, groupID: string, role: MemberRoles} ): Promise<Member>{
        try{
            const admin = await this.database.member.findUnique({
                where: { id_groupID: { groupID: data.groupID, id: data.client.id }  },
                include: { group: { include:{ creator: { include: { details: true } } } } }
            });

            if(admin){
                if(admin.role === "Admin"){
                    const init = await this.database.member.update({
                        where: { id_groupID: {groupID: data.groupID, id: data.userID} },
                        data: { role: data.role },
                        include: { client: { include: { details: true } } }
                    });

                    await this.database.notification.create({
                        data: {
                            recieverID: data.userID, nType: "User",
                            alert: `${data.client.details.name} changed your role to ${data.role} in the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(data.client.id !== member.id && member.id !== data.userID){
                            await this.database.notification.create({
                                data: {
                                    recieverID: member.id, nType: "User",
                                    alert: `${data.client.details.name} changed ${init.client.details.name} role to ${data.role} in the ${admin.group.name} group`,
                                }
                            });
                        }
                    });
                    return { ...init, group: { ...admin.group, creator: admin.group.creator.details }, details: data.client.details };
                }else{
                    throw new Err(401, ``, "only admins are allowed to assign roles users in a group");    
                }
            }else{
                throw new Err(401, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when assigning user role");
        }   
    }
}

export default MemberModel;