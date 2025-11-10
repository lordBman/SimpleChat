import {DBManager, Err} from "../config";
import FriendModel from "./friends";
import {Organization, Project, SimpleChatState} from "@simplechat/shared";
import {Chat, Client} from "@simplechat/shared/models";
import MemberModel from "./members";

class ClientModel{
    database = DBManager.instance();

    async create(data: { id: string, project: Project, organization?: Organization, name: string, surname: string, email?: string, username?: string, password: string }): Promise<Client>{
        try{
            const client = await this.database.client.create({
                data: { id: data.id, projectID: data.project.id, organizationID: data.organization?.id },
            });

            const details = await this.database.details.create({
                data: { id: client.id, name: data.name, surname: data.surname, email: data.email, username: data.username }
            });

            return { ...client, details };
        }catch(error){
            throw new Err(503, error, "error encountered when creating user");
        }
    }

    async connect(data: { project: Project, organization?: Organization, id: string, name: string, surname: string, email?: string, username?: string }): Promise<Client>{
        try{
            let details = await this.database.details.upsert({
                where: { id: data.id },
                create: { id: data.id, name: data.name, surname: data.surname, email: data.email, username: data.username },
                update: { name: data.name, surname: data.surname, email: data.email, username: data.username },
            });

            const client = await this.database.client.upsert(
                { where: { id: data.id },
                create: { id: data.id, projectID: data.project.id, organizationID: data.organization?.id },
                update: { projectID: data.project.id, organizationID: data.organization?.id },
            });

            return { ...client, details };
        }catch(error){
            throw new Err(503, error, "error encountered when connecting user");
        }
    }

    async count(data: { project: Project, organization?: Organization }): Promise<number | undefined>{
        try{
            const init = await this.database.client.count({
                where: { projectID: data.project.id, organizationID: data.organization?.id }
            });

            return init!;
        }catch(error){
            throw new Err(503, error, "error encountered when creating user");
        }
    }

    async get(data: { project: Project, organization?: Organization, client: Client}): Promise<Omit<SimpleChatState, "token">>{
        try{
            const friends = await new FriendModel().all({ ...data });
            const members = await new MemberModel().all({ ...data });

            const actives = [...friends?.filter((friend)=> friend.accepted)!, ...members.filter((member)=> member.accepted ).map((member)=> member.group )];

            let chats: { [key: string]: Chat[] } = {};
            for(let i = 0; i < actives.length; i++){
                chats[actives[i].id] = (await this.database.chat.findMany({
                    where: {ownerID: actives[i].id},
                    orderBy: {created: "asc"},
                    include: {sender: {include: {details: true}}}
                })).map((init) => {
                    return {...init, sender: init.sender.details};
                });
            }

            return { ...data.client, chats, friends: friends!, members };
        }catch(error){
            if(error instanceof Err){
                throw error;
            }
            throw new Err(503, error, "error encountered when creating user");
        }
    }
}

export default ClientModel;