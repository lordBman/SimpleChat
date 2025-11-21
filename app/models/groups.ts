import Organization from "@simplechat/shared/models/organization";
import { DBManager, Err } from "../config";
import { uuid } from "../utils";
import { ResourceType } from "@prisma/client";
import { Client, Group, Member, Project } from "@simplechat/shared/models";

class GroupModel{
    database = DBManager.instance();

    async create(data: { project: Project, organization?: Organization, client: Client, name: string }): Promise<Member>{
        try{
            const exists = await this.database.group.findMany({
                where: { projectID: data.project.id, organizationID: data.organization?.id, name: data.name },
            });

            if(exists.length > 0){
                throw new Err(403, ``, "group already exists");
            }else{
                const init = await this.database.group.create({
                    data: { id: uuid(), projectID: data.project.id, organizationID: data.organization?.id, name: data.name, creatorID: data.client.id }
                });
    
                const member = await this.database.member.create({
                    data: {  groupID: init.id, userID: init.creatorID, role: "Admin" }
                });

                return { ...member, details: data.client.details, group: { ... init, creator: data.client.details }};
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when creating group");
        }
    }
    
    async all(data: { project: Project, organization?: Organization, client: Client }): Promise<Group[]>{
        try{
            const groups: Group[] = (await this.database.member.findMany({ 
                where: { userID: data.client.id },
                include: {
                    client: { include: { details: true } },
                    group: { include: { creator: { include: { details: true } } } } 
                }
            })).filter((member)=> {
                return member.group.projectID == data.project.id && member.group.organizationID == data.organization?.id;
            }).map((member)=>{
                return { ...member.group, creator: member.group.creator.details };
            });

            return groups;
        }catch(error){
            throw new Err(503, error, "error encountered while getting all groups");
        }
    }

    async get(data: { groupID: string }): Promise<Group>{
        try{
            const init = await this.database.group.findUniqueOrThrow({
                where: { id: data.groupID },
                include: { 
                    creator: { include: { details: true } },
                }
            });

            return { ...init, creator: init.creator.details };
        }catch(error){
            throw new Err(503, error, "error encountered while getting all members");
        }
    }

    async rename(data: { client: Client, groupID: string, name: string }): Promise<Group>{
        try{
            const member = await this.database.member.findUniqueOrThrow({ where: { userID_groupID: { userID: data.client.id, groupID: data.groupID } } });
            if(member.role != "Admin"){
                throw new Err(401, '', "you do not have authorization to rename this group");
            }

            const group = await this.database.group.findUniqueOrThrow({ 
                where: { id: data.groupID },
                include: {
                    members: true,
                    creator: { include: { details: true } }
                }
            });

            const groupUpdate = await this.database.group.update({
                where: { id: data.groupID }, data: { name: data.name },
            });

            group.members.forEach(async  (member)=>{
                if(data.client.id !== member.userID){
                    await this.database.notification.create({
                        data: { 
                            recieverID: data.groupID, nType: "Group", 
                            alert: `${data.client.details.name} renamed the group from ${group.name} to ${data.name}`,
                        }
                    });
                }
            });
            
            return { ...groupUpdate, creator:  group.creator.details };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when renaming the group");
        }
    }

    async find(data: { project: Project, organization?: Organization, client: Client, query: string }): Promise<{ group: Group, member?: Member }[]>{
        try{
            const groups = (await this.database.group.findMany({ 
                where: { projectID: data.project.id, organizationID: data.organization?.id, isDeleted: false },
                include:{ creator: {
                    include: { details: true }
                } }
            })).filter((group)=>{
                return group.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
            }).map((group)=>{
                return { ...group, creator: group.creator.details };
            });

            let results: { group: Group, member?: Member }[] = [];
            for(let i = 0; i < groups.length; i++ ){
                const init = await this.database.member.findFirst({ 
                    where: { groupID: groups[i].id },
                    include: { 
                        group: { include:{ creator: {
                            include: { details: true }
                        } } },
                        client: { include: { details: true } }
                    }
                });
                results.push({ group: groups[i], member : init ? { ...init, group: groups[i], details: init.client.details } : undefined });
            }
            return results;
        }catch(error){
            throw new Err(503, error, "error encountered when searching for groups");
        }
    }

    async delete(data: { client: Client, groupID: string } ): Promise<{ group: Group, message: string}>{
        try{
            const group = await this.database.group.findUnique({ 
                where: { id: data.groupID },
                include: { creator: { include: { details: true } } } 
            });

            if (group?.creatorID === data.client.id) {
                const members = await this.database.member.findMany({where: {groupID: data.groupID}});

                await this.database.deleted.create({data: {resourceID: group.id, type: ResourceType.Group}});
                await this.database.group.update({
                    where: {id: data.groupID}, data: {isDeleted: true}
                });

                members.forEach(async (member) => {
                    if (data.client.id !== member.userID) {
                        await this.database.notification.create({
                            data: {
                                recieverID: member.id, nType: "User",
                                alert: `${data.client.details.name} deleted the ${group.name} group`,
                            }
                        });
                    }
                });
                return {
                    message: `${group.name} group deletion successful`,
                    group: {...group, creator: group.creator.details}
                };
            }
            throw new Err(401, ``, "you are not a owner of this group");
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when assigning user role");
        }   
    }
}

export default GroupModel;