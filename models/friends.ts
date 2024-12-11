import { DBManager } from "../config";
import Database from "../config/database";
import { Friend, Organization, Project, Credential } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { uuid } from "../utils";
import { joinChatRoom } from "../sockets/chats";

type FrientSearchResponse = Credential | Friend;
type RequestFriendResponse = Friend & { acceptor: Credential,  requester: Credential };
type AllFriendsResponse = Array<RequestFriendResponse>;

class FriendModel{
    database: Database;
    constructor(){
        this.database = DBManager.instance();
    }
    
    async all(data: { project: Project, organization?: Organization, credential: Credential  }): Promise<AllFriendsResponse | undefined>{
        try{
            const results = await this.database.client.friend.findMany({ 
                where: { project: data.project, organizationID: data.organization?.id,  OR: [ { requesterID: data.credential.id }, { acceptorID: data.credential.id } ] },
            });

            const friends: AllFriendsResponse = [];
            for(let i = 0; i < results.length; i++){
                const acceptor = await this.database.client.credential.findUnique({ 
                    where: { id: results[i].acceptorID }, 
                    select: { id: true, name: true, surname: true, email: true, username: true } });
                const requester = await this.database.client.credential.findUnique({ 
                    where: { id: results[i].requesterID },
                    select: { id: true, name: true, surname: true, email: true, username: true }
                });

                if(acceptor && requester){
                    friends.push({ ...results[i], acceptor: { ...acceptor, password: "", role: "" }, requester: { ...requester, password: "", role: "" } });
                }
            }

            friends.forEach((friend)=> joinChatRoom(friend));

            return friends;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while sending friend request");
        }
    }

    async request(data: { project: Project, organization?: Organization, credential: Credential, userID: string }): Promise<RequestFriendResponse | undefined>{
        try{
            const id = uuid();
            console.log(JSON.stringify({ id, projectID: data.project.id, organization: data.organization, requesterID: data.credential.id, acceptorID: data.userID }));
            const result = await this.database.client.friend.create({ 
                data: { id, projectID: data.project.id, organizationID: data.organization?.id, requesterID: data.credential.id, acceptorID: data.userID },
            });

            const acceptor = await this.database.client.credential.findUnique({ 
                where: { id: result.acceptorID }, 
                select: { id: true, name: true, surname: true, email: true, username: true } });
            if(acceptor){
                const friend: RequestFriendResponse = { ...result, acceptor: { ...acceptor, password: "", role: "" }, requester: data.credential };
                joinChatRoom(friend);

                return friend;
            }
        }catch(error){
            console.log(error);
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered while sending friend request");
        }
    }

    async accept(data: { id: string }): Promise<Friend | undefined>{
        try{
            const result = await this.database.client.friend.update({
                where: { id: data.id }, data: { accepted: true },
            });

            const requester = await this.database.client.credential.findUnique({ 
                where: { id: result.requesterID }, 
                select: { name: true, surname: true, email: true, username: true, id: true } });

            const friend: Friend & { requester: any } = { ...result, requester };

            joinChatRoom(friend);

            return friend;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
        }
    }

    async reject(data: { id: string }): Promise<Friend | undefined>{
        try{
            const friend = await this.database.client.friend.delete({
                where: { id: data.id }
            });
            joinChatRoom(friend);

            return friend;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.Unauthorized, `${error}`, "session expired, try logging in");
        }
    }

    async find(data: { project: Project, organization?: Organization, credential: Credential, query: string }): Promise<FrientSearchResponse[] | undefined>{
        try{
            const credentials = (await this.database.client.client.findMany({
                where: { projectID: data.project.id, organizationID: data.organization?.id, NOT: { credentialID: data.credential.id } },
                include: { credential: { select: { id: true, name: true, surname: true, username: true, email: true } } }
            })).filter((client)=>{
                return client.credential.name.toLowerCase().search(data.query.toLowerCase()) >= 0;
            }).map((client) => client.credential);

            let results: FrientSearchResponse[] = [];
            for(let i = 0; i < credentials.length; i++ ){
                const init = await this.database.client.friend.findFirst({ 
                    where: {
                        projectID: data.project.id, organization: data.organization,
                        OR:[ { acceptorID: data.credential.id, requesterID: credentials[i].id }, { requesterID: data.credential.id, acceptorID: credentials[i].id } ] 
                    },
                    include: { 
                        requester: { include: { credential: { select: { id: true, name: true, surname: true, username: true, email: true } } }}, 
                        acceptor: { include: { credential: { select: { id: true, name: true, surname: true, username: true, email: true } } }} 
                    }
                });
                if(init){
                    results.push(init);
                }else{
                    results.push({ ...credentials[i], password: "", role: "" });
                }
            }
            return results;
        }catch(error){
            this.database.errorHandler.add(HttpStatusCode.InternalServerError, `${error}`, "error encountered when searching for user");
        }
    }
}

export default FriendModel;