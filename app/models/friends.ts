import { DBManager, Err } from "../config";
import Database from "../config/database";
import { Friend, Organization, Project, Credential } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";
import { joinChatRoom } from "../sockets/chats";

type CredentialResponse = Omit<Credential, 'password' |'isDeleted' | 'role' | 'adminID'>
type FriendResponse = Omit<Friend, 'isDeleted'> & { acceptor: CredentialResponse,  requester: CredentialResponse };
type AllFriendsResponse = Array<FriendResponse>;
type FriendSearchResult = { user: CredentialResponse, friend?: FriendResponse }
type FriendSearchResponse = Array<FriendSearchResult>

class FriendModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }
    
    async all(data: { project: Project, organization?: Organization, credential: Credential  }): Promise<AllFriendsResponse>{
        try{
            return await this.database.client.friend.findMany({ 
                where: { project: data.project, organizationID: data.organization?.id,  OR: [ { requesterID: data.credential.id }, { acceptorID: data.credential.id } ] },
            }).then(async (results)=>{
                const friends: AllFriendsResponse = [];
                for(const result of results){
                    const acceptor = await this.database.client.credential.findUnique({ 
                        where: { id: result.acceptorID }, 
                        select: { id: true, created: true, name: true, surname: true, email: true, username: true, adminID: true } });
                    const requester = await this.database.client.credential.findUnique({ 
                        where: { id: result.requesterID },
                        select: { id: true, created: true, name: true, surname: true, email: true, username: true, adminID: true }
                    });

                    if(acceptor && requester){
                        friends.push({ ...result, acceptor, requester });
                    }
                }
                return friends;
            });
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while getting friend lists");
        }
    }

    async request(data: { project: Project, organization?: Organization, credential: Credential, userID: string }): Promise<FriendResponse>{
        try{
            const response = await this.database.client.friend.create({ 
                data: { projectID: data.project.id, organizationID: data.organization?.id, requesterID: data.credential.id, acceptorID: data.userID },
            }).then(async(friend)=>{
                const requester = await this.database.client.credential.findUniqueOrThrow({ 
                    where: { id: friend.requesterID }, 
                    select: { created: true, name: true, surname: true, email: true, username: true, id: true } });
    
                const acceptor = await this.database.client.credential.findUniqueOrThrow({ 
                    where: { id: friend.acceptorID }, 
                    select: { id: true, name: true, surname: true, email: true, username: true, created: true } });

                return { ...friend, acceptor, requester }
            });

            await this.database.client.notification.create({
                data: { 
                    recieverID: response.id,
                    alert: `${data.credential.name} sent you a friend request`
                }
            });

            return response;
        }catch(error){
            throw new Err(HttpStatusCode.InternalServerError, error, "error encountered while sending friend request");
        }
    }

    async accept(data: { credential: Credential, id: string }): Promise<FriendResponse>{
        try{
            const response = await this.database.client.friend.update({
                where: { id: data.id }, data: { accepted: true }
            }).then(async(friend)=>{
                const requester = await this.database.client.credential.findUniqueOrThrow({ 
                    where: { id: friend.requesterID }, 
                    select: { created: true, name: true, surname: true, email: true, username: true, id: true } });
    
                const acceptor = await this.database.client.credential.findUniqueOrThrow({ 
                    where: { id: friend.requesterID }, 
                    select: { created: true, name: true, surname: true, email: true, username: true, id: true } });

                return { ...friend, requester, acceptor };
            });

            await this.database.client.notification.create({
                data: { recieverID: data.credential.id, alert: `You are now friends with ${ response.requester.name}` }
            });

            await this.database.client.notification.create({
                data: { recieverID: response.requester!.id, alert: `${data.credential.name} accepted your friend request` }
            });

            return response;
        }catch(error){
            throw new Err(HttpStatusCode.Unauthorized, error, "session expired, try logging in");
        }
    }

    async reject(data: { credential: Credential, id: string }): Promise<{ message: string }>{
        try{
            const friend = await this.database.client.friend.delete({
                where: { id: data.id }
            });

            const requester = await this.database.client.credential.findUniqueOrThrow({ 
                where: { id: friend.requesterID }, 
                select: { name: true, surname: true, email: true, username: true, id: true } });

            await this.database.client.notification.create({
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

    async find(data: { project: Project, organization?: Organization, credential: Credential, query: string }): Promise<FriendSearchResponse>{
        try{
            const credentials = await this.database.client.client.findMany({
                where: { projectID: data.project.id, organizationID: data.organization?.id, NOT: { credentialID: data.credential.id } },
                include: { credential: { select: { id: true, created: true, name: true, surname: true, username: true, email: true } } }
            }).then((clients)=>{
                return clients.filter((client)=>{
                    return client.credential.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
                });
            });
            
            const results: FriendSearchResponse = [];
            for(const client of credentials){
                const init = await this.database.client.friend.findFirst({ 
                    where: {
                        projectID: data.project.id, organization: data.organization,
                        OR:[ { acceptorID: data.credential.id, requesterID: client.credentialID }, { requesterID: data.credential.id, acceptorID: client.credentialID } ] 
                    }
                }).then(async (result)=>{
                    if(result){
                        const requester = await this.database.client.credential.findUniqueOrThrow({ 
                            where: { id: result.requesterID }, 
                            select: { created: true, name: true, surname: true, email: true, username: true, id: true } });
            
                        const acceptor = await this.database.client.credential.findUniqueOrThrow({ 
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