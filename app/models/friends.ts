import {Client, FriendSearchResult} from "@simplechat/shared/models";
import {DBManager, Err} from "../config";
import {Friend, Organization, Project} from "@simplechat/shared";

class FriendModel{
    database = DBManager.instance();

    async all(data: { project: Project, organization?: Organization, client: Client  }): Promise<Friend[]>{
        try{
            return await this.database.friend.findMany({
                where: {
                    project: data.project,
                    organizationID: data.organization?.id,
                    OR: [{requesterID: data.client.id}, {acceptorID: data.client.id}]
                },
                include: {
                    requester: {include: {details: true}},
                    acceptor: {include: {details: true}}
                }
            }).then(async (friends) => {
                return friends.map((friend) => {
                    return {...friend, requester: friend.requester.details, acceptor: friend.acceptor.details}
                });
            });
        }catch(error){
            throw new Err(503, error, "error encountered while getting friend lists");
        }
    }

    async request(data: { project: Project, organization?: Organization, client: Client, userID: string }): Promise<Friend>{
        try{
            const friend = await this.database.friend.create({ 
                data: { projectID: data.project.id, organizationID: data.organization?.id, requesterID: data.client.id, acceptorID: data.userID },
            });

            const requester = await this.database.client.findUniqueOrThrow({  where: { id: friend.requesterID }, include: { details: true } });

            const acceptor = await this.database.client.findUniqueOrThrow({ where: { id: friend.acceptorID }, include: { details: true } });

            await this.database.notification.create({
                data: { 
                    recieverID: acceptor.id,
                    alert: `${data.client.details.name} sent you a friend request`,
                    nType: "User"
                }
            });
        
            return { ...friend, acceptor: acceptor.details, requester: requester.details };
        }catch(error){
            throw new Err(503, error, "error encountered while sending friend request");
        }
    }

    async accept(data: { client: Client, id: string }): Promise<Friend>{
        try{
            const friend = await this.database.friend.update({ where: { id: data.id }, data: { accepted: true }});
            const requester = await this.database.client.findUniqueOrThrow({ 
                where: { id: friend.requesterID }, 
                include: { details: true } });

            const acceptor = await this.database.client.findUniqueOrThrow({ 
                where: { id: friend.requesterID }, 
                include: { details: true } });

            await this.database.notification.create({
                data: { recieverID: data.client.id, alert: `You are now friends with ${ requester.details.name}`, nType: "User" }
            });

            await this.database.notification.create({
                data: { recieverID: requester!.id, alert: `${data.client.details.name} accepted your friend request`, nType: "User" }
            });

            return { ...friend, requester: requester.details, acceptor: acceptor.details };
        }catch(error){
            throw new Err(503, error, "internal server error");
        }
    }

    async cancel(data: { client: Client, id: string }): Promise<Friend>{
        try{
            const init = await this.database.friend.findFirst({ where: { id: data.id, requesterID: data.client.id } });
            if (init) {
                const friend = await this.database.friend.delete({
                    where: {id: data.id},
                    include: {
                        requester: {include: {details: true}}, acceptor: {include: {details: true}}
                    }
                });

                return {...friend, requester: friend.requester.details, acceptor: friend.acceptor.details};
            }
            throw new Err(404, "", "friend request not found");
        }catch(error){
            throw new Err(503, error, "internal server error");
        }
    }

    async reject(data: { client: Client, id: string }): Promise<Friend>{
        try{
            const init = await this.database.friend.findFirst({ where: { id: data.id, acceptorID: data.client.id } });
            if(init){
                const friend = await this.database.friend.delete({ 
                    where: { id: data.id },
                    include: { requester: { include: { details: true } }, acceptor: { include: { details: true } } }
                });

                await this.database.notification.create({
                    data: { 
                        recieverID: friend.requester!.id, nType: "User",
                        alert: `${data.client.details.name} rejected your friend request`
                    }
                });

                return { ...friend, requester: friend.requester.details, acceptor: friend.acceptor.details };  
            }else{
                throw new Err(404, "", "friend request not found");   
            }
        }catch(error){
            throw new Err(503, error, "internal server error");
        }
    }

    async find(data: { project: Project, organization?: Organization, client: Client, query: string }): Promise<FriendSearchResult[]>{
        try{
        const credentials = await this.database.client.findMany({
                where: { projectID: data.project.id, organizationID: data.organization?.id, NOT: { id: data.client.id } },
                include: { details: true }
            }).then((clients)=>{
                return clients.filter((client)=>{
                    return client.details.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
                });
            });
            
            const results: FriendSearchResult[] = [];
            for(const client of credentials){
                const init = await this.database.friend.findFirst({ 
                    where: {
                        projectID: data.project.id, organization: data.organization,
                        OR:[ { acceptorID: data.client.id, requesterID: client.id }, { requesterID: data.client.id, acceptorID: client.id } ] 
                    }
                }).then(async (result)=>{
                    if(result){
                        const requester = await this.database.client.findUniqueOrThrow({ where: { id: result.requesterID }, include: { details: true } });
                        const acceptor = await this.database.client.findUniqueOrThrow({ where: { id: result.requesterID }, include: { details: true } });

                        return { ...result, requester: requester.details, acceptor: acceptor.details };
                    }
                    return undefined;
                });
                
                results.push({ user: client.details, friend: init });
            }
            return results;
        }catch(error){
            throw new Err(503, error, "error encountered when searching for user");
        }
    }
}

export default FriendModel;