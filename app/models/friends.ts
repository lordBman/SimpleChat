import { FriendSearchResult } from "@simplechat/shared/models";
import { DBManager, Err } from "../config";
import { Friend, Organization, Project, Credential } from "@simplechat/shared";
import { HttpStatusCode } from "axios";

class FriendModel{
    async all(data: { project: Project, organization?: Organization, credential: Credential  }): Promise<Friend[]>{
        try{
            const database = await DBManager.instance();

            const results = await database.friend.findMany({ 
                where: { project: data.project, organizationID: data.organization?.id,  OR: [ { requesterID: data.credential.id }, { acceptorID: data.credential.id } ] },
            });
            const friends: Friend[] = [];
            for(const result of results){
                const acceptor = await database.credential.findUnique({ 
                    where: { id: result.acceptorID }, 
                    select: { id: true, created: true, name: true, surname: true, email: true, username: true, adminID: true } });
                const requester = await database.credential.findUnique({ 
                    where: { id: result.requesterID },
                    select: { id: true, created: true, name: true, surname: true, email: true, username: true, adminID: true }
                });

                if(acceptor && requester){
                    friends.push({ ...result, acceptor, requester });
                }
            }
            return friends;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while getting friend lists");
        }
    }

    async request(data: { project: Project, organization?: Organization, credential: Credential, userID: string }): Promise<Friend>{
        try{
            const database = await DBManager.instance();

            const friend = await database.friend.create({ 
                data: { projectID: data.project.id, organizationID: data.organization?.id, requesterID: data.credential.id, acceptorID: data.userID },
            });

            const requester = await database.credential.findUniqueOrThrow({ 
                where: { id: friend.requesterID }, 
                select: { created: true, name: true, surname: true, email: true, username: true, id: true } });

            const acceptor = await database.credential.findUniqueOrThrow({ 
                where: { id: friend.acceptorID }, 
                select: { id: true, name: true, surname: true, email: true, username: true, created: true } });

            await database.notification.create({
                data: { 
                    recieverID: acceptor.id,
                    alert: `${data.credential.name} sent you a friend request`
                }
            });
        
            return { ...friend, acceptor, requester };
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while sending friend request");
        }
    }

    async accept(data: { credential: Credential, id: string }): Promise<Friend>{
        try{
            const database = await DBManager.instance();

            const friend = await database.friend.update({ where: { id: data.id }, data: { accepted: true }});
            const requester = await database.credential.findUniqueOrThrow({ 
                where: { id: friend.requesterID }, 
                select: { created: true, name: true, surname: true, email: true, username: true, id: true } });

            const acceptor = await database.credential.findUniqueOrThrow({ 
                where: { id: friend.requesterID }, 
                select: { created: true, name: true, surname: true, email: true, username: true, id: true } });

            await database.notification.create({
                data: { recieverID: data.credential.id, alert: `You are now friends with ${ requester.name}` }
            });

            await database.notification.create({
                data: { recieverID: requester!.id, alert: `${data.credential.name} accepted your friend request` }
            });

            return { ...friend, requester, acceptor };
        }catch(error){
            throw new Err(HttpStatusCode.Unauthorized, error, "session expired, try logging in");
        }
    }

    async reject(data: { credential: Credential, id: string }): Promise<{ message: string }>{
        try{
            const database = await DBManager.instance();

            const friend = await database.friend.delete({
                where: { id: data.id }
            });

            const requester = await database.credential.findUniqueOrThrow({ 
                where: { id: friend.requesterID }, 
                select: { name: true, surname: true, email: true, username: true, id: true } });

            await database.notification.create({
                data: { 
                    recieverID: requester!.id,
                    alert: `${data.credential.name} rejected your friend request`
                }
            });

            return { message: "friend request rejected successfully" };
        }catch(error){
            throw new Err(HttpStatusCode.Unauthorized, error, "session expired, try logging in");
        }
    }

    async find(data: { project: Project, organization?: Organization, credential: Credential, query: string }): Promise<FriendSearchResult[]>{
        try{
            const database = await DBManager.instance();
            
            const credentials = await database.client.findMany({
                where: { projectID: data.project.id, organizationID: data.organization?.id, NOT: { credentialID: data.credential.id } },
                include: { credential: { select: { id: true, created: true, name: true, surname: true, username: true, email: true } } }
            }).then((clients)=>{
                return clients.filter((client)=>{
                    return client.credential.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
                });
            });
            
            const results: FriendSearchResult[] = [];
            for(const client of credentials){
                const init = await database.friend.findFirst({ 
                    where: {
                        projectID: data.project.id, organization: data.organization,
                        OR:[ { acceptorID: data.credential.id, requesterID: client.credentialID }, { requesterID: data.credential.id, acceptorID: client.credentialID } ] 
                    }
                }).then(async (result)=>{
                    if(result){
                        const requester = await database.credential.findUniqueOrThrow({ 
                            where: { id: result.requesterID }, 
                            select: { created: true, name: true, surname: true, email: true, username: true, id: true } });
            
                        const acceptor = await database.credential.findUniqueOrThrow({ 
                            where: { id: result.requesterID }, 
                            select: { created: true, name: true, surname: true, email: true, username: true, id: true } });

                        return { ...result, requester, acceptor };
                    }
                    return undefined;
                });
                
                results.push({ user: client.credential, friend: init });
            }

            return results;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered when searching for user");
        }
    }
}

export default FriendModel;