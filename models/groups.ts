import { DBManager } from "../config";
import Database from "../config/database";
import { Group, Member, Project, User } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";
import { joinChatRoom } from "../sockets/chats";

interface Result{ group: Group, member?: Member }

class GroupModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }

    async create(data: { project: Project, organization?: string, user: User, name: string }): Promise<Member | undefined>{
        try{
            const exists = await this.database.client.group.findMany({
                where: { projectID: data.project.id, organization: data.organization, name: data.name },
            });

            if(exists.length > 0){
                this.database.errorHandler.add(HttpStatusCode.AlreadyReported, ``, "group already exists");
            }else{
                const init = await this.database.client.group.create({
                    data: { id: uuid(), projectID: data.project.id, organization: data.organization, name: data.name, creatorID: data.user.id },
                });
    
                const member = await this.database.client.member.create({
                    data: {  groupID: init.id, userID: init.creatorID, role: "admin" }
                });

                return member;
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when creating group");
        }
    }
    
    async all(data: { user: User }): Promise<Member[] | undefined>{
        try{
            const members = await this.database.client.member.findMany({ 
                where: { userID: data.user.id },
                include: {
                    group: { include: { creator: { select: { id: true, email:  true, name: true, password: false } } } } 
                }
            });

            members.forEach((member)=> joinChatRoom(member));

            return members;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while sending friend request");
        }
    }

    async request(data: { user: User, groupID: string }): Promise<Member | undefined>{
        try{
            const member = await this.database.client.member.create({ 
                data: { userID: data.user.id, groupID: data.groupID },
                include: {
                    group: { include: { creator: { select: { id: true, email:  true, name: true, password: false } } } } 
                }
            });
            joinChatRoom(member);

            return member;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while sending friend request");
        }
    }

    async rename(data: { user: User, groupID: string, name: string }): Promise<string | undefined>{
        try{
            const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID, userID: data.user.id }, include: { group: true } });

            await this.database.client.group.update({
                where: { id: data.groupID }, data: { name: data.name },
            });

            members.forEach(async  (member)=>{
                if(data.user.id !== member.userID){
                    await this.database.client.notification.create({
                        data: { 
                            groupID: data.groupID, recieverID: member.userID,
                            alert: `${data.user.name} renamed the group from ${member.group.name} to ${data.name}`,
                        }
                    });
                }
            });

            return "group rename successful";
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when renaming the group");
        }
    }

    async accept(data: { user: User, userID: string, groupID: string } ): Promise<Member | undefined>{
        try{
            const admin = await this.database.client.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: data.user.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "admin"){
                    const init = await this.database.client.member.update({
                        where: { userID_groupID: {groupID: data.groupID, userID: data.userID} },
                        data: { accepted: true },
                        include: { user: { select: { id: true, email:  true, name: true, password: false } } }
                    });

                    await this.database.client.notification.create({
                        data: {
                            groupID: data.groupID, recieverID: init.userID,
                            alert: `${data.user.name} accepted request your to join the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(data.user.id !== member.userID && member.userID !== data.userID){
                            await this.database.client.notification.create({
                                data: {
                                    groupID: data.groupID, recieverID: member.userID,
                                    alert: `${data.user.name} accepted request ${init.user.name} to join the ${admin.group.name} group`,
                                }
                            });
                        }
                    });
                    return init;

                }else{
                    this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "only admins are allowed to accept users to a group");    
                }
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when accpeting user request");
        }   
    }

    async reject(data: { user: User, userID: string, groupID: string } ): Promise<Member | undefined>{
        try{
            const admin = await this.database.client.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: data.user.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "admin"){
                    const init = await this.database.client.member.delete({
                        where: { userID_groupID: {groupID: data.groupID, userID: data.userID} },
                        include: { user: { select: { id: true, email:  true, name: true, password: false } } }
                    });

                    await this.database.client.notification.create({
                        data: {
                            groupID: data.groupID, recieverID: init.userID,
                            alert: `${data.user.name} rejected request your to join ${admin.group.name} group`,
                        }
                    });
                    return init;

                }else{
                    this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "only admins are allowed to reject users requests to a group");    
                }
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when rejecting user's request");
        }   
    }

    async assign(data: { user: User, userID: string, groupID: string, role: string} ): Promise<Member | undefined>{
        try{
            const admin = await this.database.client.member.findUnique({
                where: { userID_groupID: { groupID: data.groupID, userID: data.user.id }  },
                include: { group: true }
            });

            if(admin){
                if(admin.role === "admin"){
                    const init = await this.database.client.member.update({
                        where: { userID_groupID: {groupID: data.groupID, userID: data.userID} },
                        data: { role: data.role },
                        include: { user: true }
                    });

                    await this.database.client.notification.create({
                        data: {
                            groupID: data.groupID, recieverID: init.userID,
                            alert: `${data.user.name} changed your role to ${data.role} in the ${admin.group.name} group`,
                        }
                    });

                    const members = await this.database.client.member.findMany({ where:{ groupID: data.groupID } });
                    members.forEach(async  (member)=>{
                        if(data.user.id !== member.userID && member.userID !== data.userID){
                            await this.database.client.notification.create({
                                data: {
                                    groupID: data.groupID, recieverID: member.userID,
                                    alert: `${data.user.name} changed ${init.user.name} role to ${data.role} in the ${admin.group.name} group`,
                                }
                            });
                        }
                    });
                    return init;
                }else{
                    this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "only admins are allowed to assign roles users in a group");    
                }
            }else{
                this.database.errorHandler.add(HttpStatusCode.Unauthorized, ``, "you are not a member of this group");
            }
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when assigning user role");
        }   
    }

    async find(data: { user: User, query: string }): Promise<Result[] | undefined>{
        try{
            const groups = (await this.database.client.group.findMany()).filter((group)=>{
                return group.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
            });

            let results: Result[] = [];
            for(let i = 0; i < groups.length; i++ ){
                const init = await this.database.client.member.findFirst({ 
                    where: { groupID: groups[i].id },
                    include: { group:{ include: { creator: { select: { id: true, email:  true, name: true, password: false } } } } }
                });
                results.push({ group: groups[i], member : init ? init : undefined });
            }
            return results;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when searching for groups");
        }
    }
}

export default GroupModel;