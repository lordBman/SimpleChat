import { DBManager, Err } from "../config";
import Database from "../config/database";
import { Group, Member, Organization, Project, Credential } from "@simplechat/shared";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";
import { joinChatRoom } from "../sockets/chats";

class GroupModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { project: Project, organization?: Organization, credential: Credential, name: string }): Promise<Member>{
        try{
            const exists = await this.database.client.group.findMany({
                where: { projectID: data.project.id, organizationID: data.organization?.id, name: data.name },
            });

            if(exists.length > 0){
                throw new Err(HttpStatusCode.AlreadyReported, ``, "group already exists");
            }else{
                const init = await this.database.client.group.create({
                    data: { id: uuid(), projectID: data.project.id, organizationID: data.organization?.id, name: data.name, creatorID: data.credential.id },
                });
    
                const member = await this.database.client.member.create({
                    data: {  groupID: init.id, credentialID: init.creatorID, role: "Admin" }
                });

                return { ...member, group: { ... init, creator: data.credential }};
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when creating group");
        }
    }
    
    async all(data: { project: Project, organization?: Organization, credential: Credential }): Promise<Member[]>{
        try{
            const members: Member[] = (await this.database.client.member.findMany({ 
                where: { credentialID: data.credential.id },
                include: {
                    client: { include: { credential: true } },
                    group: { include: { creator: { include: { credential: { select: { id: true, email:  true, name: true, surname: true } } } } } } 
                }
            })).filter((member)=> {
                return member.group.projectID == data.project.id && member.group.organizationID == data.organization?.id;
            }).map((member)=>{
                return { ...member, credential: member.client.credential,  group: { ...member.group, creator: member.group.creator.credential } }
            });

            members.forEach((member)=> joinChatRoom(member));

            return members;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while getting all groups");
        }
    }

    async request(data: { credential: Credential, groupID: string }): Promise<Member>{
        try{
            const member = await this.database.client.member.create({ 
                data: { credentialID: data.credential.id, groupID: data.groupID },
                include: {
                    group: { include: { creator: { include: { credential: { select: { id: true, email:  true, name: true, surname: true } } } } } } 
                }
            });
            const init = { ...member, group: { ...member.group, creator: member.group.creator.credential } }

            joinChatRoom(init);

            return init;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while sending membership request");
        }
    }

    async cancel(data: { credential: Credential, groupID: string }): Promise<Member>{
        try{
            const member = await this.database.client.member.delete({ 
                where: { credentialID: data.credential.id, groupID: data.groupID },
                include: {
                    group: { include: { creator: { include: { credential: { select: { id: true, email:  true, name: true, surname: true } } } } } } 
                }
            });
            const init = { ...member, group: { ...member.group, creator: member.group.creator.credential } }

            return init;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while canceling membership request");
        }
    }

    async rename(data: { project: Project, organization?: Organization, credential: Credential, groupID: string, name: string }): Promise<Member>{
        try{
            const member = await this.database.client.member.findUniqueOrThrow({ where: { groupID: data.groupID, credentialID: data.credential.id } });
            if(member.role != "Admin"){
                throw new Err(HttpStatusCode.Unauthorized, '', "you do not have authorization to rename this group");
            }

            const group = await this.database.client.group.findUniqueOrThrow({ 
                where: { id: data.groupID },
                include: {
                    members: true,
                    creator: { include: { credential: { select: { id: true, email:  true, name: true, surname: true } } } }
                }
            });

            const groupUpdate = await this.database.client.group.update({
                where: { id: data.groupID }, data: { name: data.name },
            });

            group.members.forEach(async  (member)=>{
                if(data.credential.id !== member.credentialID){
                    await this.database.client.notification.create({
                        data: { 
                            groupID: data.groupID, recieverID: member.credentialID,
                            alert: `${data.credential.name} renamed the group from ${group.name} to ${data.name}`,
                        }
                    });
                }
            });
            
            return { ...member, group: { ...groupUpdate, creator:  group.creator.credential } };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when renaming the group");
        }
    }

    async accept(data: { credential: Credential, userID: string, groupID: string } ): Promise<Member>{
        try{
            const admin = await this.database.client.member.findUnique({
                where: { credentialID_groupID: { groupID: data.groupID, credentialID: data.credential.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "Admin"){
                    const init = await this.database.client.member.update({
                        where: { credentialID_groupID: {groupID: data.groupID, credentialID: data.userID} },
                        data: { accepted: true },
                        include: { client: { include: { credential: { select: { id: true, name: true, surname: true, email: true, username: true } } } } }
                    });

                    await this.database.client.notification.create({
                        data: {
                            groupID: data.groupID, recieverID: init.credentialID,
                            alert: `${data.credential.name} accepted request your to join the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(data.credential.id !== member.credentialID && member.credentialID !== data.userID){
                            await this.database.client.notification.create({
                                data: {
                                    groupID: data.groupID, recieverID: member.credentialID,
                                    alert: `${data.credential.name} accepted request ${init.client.credential.name} to join the ${admin.group.name} group`,
                                }
                            });
                        }
                    });
                    return { ...init, group: { ...init.group, creator: init.group.creator.credential } };

                }else{
                    throw new Err(HttpStatusCode.Unauthorized, ``, "only admins are allowed to accept users to a group");    
                }
            }else{
               throw new Err(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when accpeting user request");
        }   
    }

    async reject(data: { credential: Credential, userID: string, groupID: string } ): Promise<Member>{
        try{
            const admin = await this.database.client.member.findUnique({
                where: { credentialID_groupID: { groupID: data.groupID, credentialID: data.credential.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "Admin"){
                    const init = await this.database.client.member.delete({
                        where: { credentialID_groupID: {groupID: data.groupID, credentialID: data.userID} },
                        include: { client: { include: { credential: { select: { id: true, email:  true, name: true, surname: true  } } } } }
                    });

                    await this.database.client.notification.create({
                        data: {
                            groupID: data.groupID, recieverID: init.credentialID,
                            alert: `${data.credential.name} rejected your request to join ${admin.group.name} group`,
                        }
                    });
                    return init;

                }else{
                    throw new Err(HttpStatusCode.Unauthorized, ``, "only admins are allowed to reject users requests to a group");    
                }
            }else{
                throw new Err(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when rejecting user's request");
        }   
    }

    async assign(data: { credential: Credential, userID: string, groupID: string, role: MemberRole} ): Promise<Member>{
        try{
            const admin = await this.database.client.member.findUnique({
                where: { credentialID_groupID: { groupID: data.groupID, credentialID: data.credential.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "Admin"){
                    const init = await this.database.client.member.update({
                        where: { credentialID_groupID: {groupID: data.groupID, credentialID: data.userID} },
                        data: { role: data.role },
                        include: { client: { include: { credential: true } } }
                    });

                    await this.database.client.notification.create({
                        data: {
                            groupID: data.groupID, recieverID: init.credentialID,
                            alert: `${data.credential.name} changed your role to ${data.role} in the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(data.credential.id !== member.credentialID && member.credentialID !== data.userID){
                            await this.database.client.notification.create({
                                data: {
                                    groupID: data.groupID, recieverID: member.credentialID,
                                    alert: `${data.credential.name} changed ${init.client.credential.name} role to ${data.role} in the ${admin.group.name} group`,
                                }
                            });
                        }
                    });
                    return init;
                }else{
                    throw new Err(HttpStatusCode.Unauthorized, ``, "only admins are allowed to assign roles users in a group");    
                }
            }else{
                throw new Err(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when assigning user role");
        }   
    }

    async find(data: { project: Project, organization?: Organization, credential: Credential, query: string }): Promise<{ group: Group, member?: Member }[]>{
        try{
            const groups = (await this.database.client.group.findMany({ where: { projectID: data.project.id, organizationID: data.organization?.id, isDeleted: false } })).filter((group)=>{
                return group.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
            });

            let results: { group: Group, member?: Member }[] = [];
            for(let i = 0; i < groups.length; i++ ){
                const init = await this.database.client.member.findFirst({ 
                    where: { groupID: groups[i].id },
                    include: { group:{ include: { creator: { include: { credential: { select: { id: true, email:  true, name: true, surname: true, username: true } } } } } } }
                });
                results.push({ group: groups[i], member : init ? init : undefined });
            }
            return results;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when searching for groups");
        }
    }

    async delete(data: { credential: Credential, userID: string, groupID: string } ): Promise<Group>{
        try{
            const group = await this.database.client.group.findUnique({
                where: { id: data.groupID }
            });

            if(group?.creatorID === data.credential.id){
                const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID } });

                await this.database.client.deleted.create({ data: { resourceID: group.id, type: ResourceType.Group } });

                const init = await this.database.client.group.update({
                    where: { id: data.groupID }, data: { isDeleted: true }
                });
                
                members.forEach(async  (member)=>{
                    if(data.credential.id !== member.credentialID && member.credentialID !== data.userID){
                        await this.database.client.notification.create({
                            data: {
                                groupID: data.groupID, recieverID: member.credentialID,
                                alert: `${data.credential.name} deleted the ${group.name} group`,
                            }
                        });
                    }
                });
                return init;
            }else{
                throw new Err(HttpStatusCode.Unauthorized, ``, "you are not a owner of this group");
            }
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when assigning user role");
        }   
    }
}

export default GroupModel;