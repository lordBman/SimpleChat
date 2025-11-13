import {Client, Member, Project} from "@simplechat/shared/models";
import {DBManager, Err} from "../config";
import {MemberRoles, Organization} from "@simplechat/shared";

class MemberModel{
    database = DBManager.instance();

    async create(data: { project: Project, client: Client, groupID: string }): Promise<Member>{
        try{
            const exists = await this.database.member.count({ where: {  userID: data.client.id, groupID: data.groupID } });
            if (exists <= 0) {
                const member = await this.database.member.create({
                    data: {groupID: data.groupID, userID: data.client.id, role: "Member",},
                    include: {group: {include: {creator: {include: {details: true}}}}}
                });
                return {
                    ...member,
                    details: data.client.details,
                    group: {...member.group, creator: member.group.creator.details}
                };
            }
            throw new Err(403, ``, "you are already a member of this group");
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when creating group");
        }
    }

    async all(data: { project: Project, organization?: Organization, client: Client }): Promise<Member[]>{
        try{
            return (await this.database.member.findMany({
                where: {userID: data.client.id},
                include: {
                    client: {include: {details: true}},
                    group: {include: {creator: {include: {details: true}}}}
                }
            })).filter((member) => {
                return member.group.projectID == data.project.id && member.group.organizationID == data.organization?.id;
            }).map((member) => {
                return {
                    ...member,
                    details: member.client.details,
                    group: {...member.group, creator: member.group.creator.details}
                }
            });
        }catch(error){
            throw new Err(503, error, "error encountered while getting all groups");
        }
    }

    async get(data: { client: Client, groupID: string }): Promise<Member>{
        try{
            const member = (await this.database.member.findUnique({
                where: { userID_groupID: { userID: data.client.id, groupID: data.groupID } },
                include: {
                    client: { include: { details: true } },
                    group: { include: { creator: { include: { details: true } } } } 
                }
            }));

            if (member) {
                return {
                    ...member,
                    details: member.client.details,
                    group: {...member.group, creator: member.group.creator.details}
                }
            }
            throw new Err(404, "", "you are not a member of this group");
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered while getting all members");
        }
    }

    async cancel(data: { client: Client, groupID: string }): Promise<Member>{
        try{
            const member = await this.database.member.delete({ 
                where: { userID_groupID: { userID: data.client.id, groupID: data.groupID } },
                include: {
                    group: { include: { creator: { include: { details: true } } } },
                    client: { include: { details: true } }
                }
            });

            return { ...member, details: member.client.details, group: { ...member.group, creator: member.group.creator.details } }
        }catch(error){
            throw new Err(503, error, "error encountered while canceling membership request");
        }
    }

    async accept(data: { client: Client, memberID: string} ): Promise<Member>{
        const member = await this.database.member.findUnique({ where: { id: data.memberID } });
        if(member){
            const admin = await this.database.member.findFirst({
                where: { groupID: member.groupID, userID: data.client.id },
            });

            if(admin && admin.role === "Admin"){
                const init = await this.database.member.update({
                    where: { id: data.memberID },
                    data: {accepted: true},
                    include: {
                        group: { include: { creator: { include: {details: true} }}},
                        client: {include: {details: true}}
                    }
                });

                await this.database.notification.create({
                    data: {
                        recieverID: init.userID, nType: "User",
                        alert: `${data.client.details.name} accepted request your to join the ${init.group.name} group`,
                    }
                });

                const members = await this.database.member.findMany({where: {groupID: init.groupID}});
                members.forEach((member) => {
                    if (data.client.id !== member.userID && member.userID !== init.userID) {
                        this.database.notification.create({
                            data: {
                                recieverID: init.groupID, nType: "Group",
                                alert: `${data.client.details.name} accepted request ${init.client.details.name} to join the ${init.group.name} group`,
                            }
                        });
                    }
                });
                return {
                    ...init,
                    details: data.client.details,
                    group: {...init.group, creator: init.group.creator.details}
                };
            }
            throw new Err(401, ``, "only admins are allowed to accept users requests to a group");
        }
        throw new Err(404, "", "unable to find member provided");
    }

    async reject(data: { client: Client, memberID: string} ): Promise<Member>{
        const member = await this.database.member.findUnique({ where: { id: data.memberID } });
        if(member){
            const admin = await this.database.member.findFirst({
                where: { groupID: member.groupID, userID: data.client.id },
            });

            if(admin && admin.role === "Admin"){
                const init = await this.database.member.delete({
                    where: {groupID: member.groupID, id: data.memberID},
                    include: {
                        client: {include: {details: true} },
                        group: { include:{ creator: { include: { details: true } } } } }
                });

                await this.database.notification.create({
                    data: {
                        recieverID: init.client.id, nType: "User",
                        alert: `${data.client.details.name} rejected your request to join ${init.group.name} group`,
                    }
                });

                return {
                    ...init,
                    group: {...init.group, creator: init.group.creator.details},
                    details: data.client.details
                };
            }
            throw new Err(401, ``, "only admins are allowed to reject users requests to a group");
        }
        throw new Err(404, "", "unable to find member provided");
    }

    async assign(data: { client: Client, memberID: string, role: MemberRoles} ): Promise<Member>{
        const member = await this.database.member.findUnique({ where: { id: data.memberID } });
        if(member){
            const admin = await this.database.member.findFirst({
                where: { groupID: member.groupID, userID: data.client.id },
            });

            if(admin && admin.role === "Admin"){
                const init = await this.database.member.update({
                    where: {groupID: member.groupID, id: data.memberID},
                    data: {role: data.role},
                    include: {
                        client: {include: {details: true} },
                        group: { include:{ creator: { include: { details: true } } } } }
                });

                await this.database.notification.create({
                    data: {
                        recieverID: init.userID, nType: "User",
                        alert: `${data.client.details.name} changed your role to ${data.role} in the ${init.group.name} group`,
                    }
                });

                const members = await this.database.member.findMany({where: {groupID: init.groupID}});
                members.forEach((member) => {
                    if (data.client.id !== member.id && member.id !== init.userID) {
                        this.database.notification.create({
                            data: {
                                recieverID: member.id, nType: "User",
                                alert: `${data.client.details.name} changed ${init.client.details.name} role to ${data.role} in the ${init.group.name} group`,
                            }
                        });
                    }
                });

                return {
                    ...init,
                    group: {...init.group, creator: init.group.creator.details},
                    details: data.client.details
                };
            }
            throw new Err(401, "", "you are not an admin for this group");
        }
        throw new Err(404, "", "unable to find member provided");
    }
}

export default MemberModel;