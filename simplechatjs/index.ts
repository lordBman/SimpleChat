import { AccessHeaderKeys, SimpleChatConfig, SimpleChatState, SocketPaths, WSChatOperation, WSFriendOperation, WSGroupOperation } from "@simplechat/shared";
import APIClient from "@simplechat/shared/api_client"; 
import { Chat, Chats, Client, Details, Friend, Member } from "@simplechat/shared/models";

interface WSChatResponse { operation: WSChatOperation, message?: string, status: number, chat?: Chat, chatID?: string, details?: Details }
interface WSFriendResponse { operation: WSFriendOperation, message?: string, status: number, friend?: Friend }
interface WSGroupResponse { operation: WSGroupOperation, message?: string, status: number, member?: Member }

abstract class SocketResponseHandler{
    abstract handleChats(response: WSChatResponse): void;
    abstract handleFriends(response: WSFriendResponse): void;
    abstract handleGroups(response: WSGroupResponse): void
}

class ConnectionManager{
    private path: string;
    private handler: SocketResponseHandler;
    private socket: WebSocket;
    get socketInstance(){
        if(!this.connected){
            this.socket = this.connect();
        }
        return this.socket;
    }

    private connected: boolean = false;
    get isConnected(){
        return this.connected;
    }

    private connectionChange?: (connected: boolean)=> void;
    set onConnectionChange(connectionChange: (connected: boolean)=> void){
        this.connectionChange = connectionChange;
    }

    private onError?: (error: any)=> void;
    set onErrorHandler(onError: (error: any)=> void){
        this.onError = onError;
    }

    constructor(path: string, handler: SocketResponseHandler){
        this.handler = handler;
        this.path = path;
        this.socket = this.connect();
    }

    private connect(): WebSocket{
        let socket = new WebSocket(this.path);
        socket.onopen = () =>{
            console.info("connected to simple chat live server");
            this.connected = true;
            this.connectionChange && this.connectionChange(this.connected);
        }

        socket.onclose = () =>{
            console.info("disconnected to simple chat live server");
            this.connected = false;
            this.connectionChange && this.connectionChange(this.connected);
        }

        socket.onerror = (event) =>{
            console.error(event);
            this.onError && this.onError("simple chat live server encountered some errors");
        }

        socket.onmessage = (event) =>{
            console.log(`what is comming from server: ${event.data}`);
            const message = JSON.parse(event.data);

            switch(message.path as SocketPaths){
                case SocketPaths.Chats:
                    this.handler.handleChats(message);
                    break;
                case SocketPaths.Friends:
                    this.handler.handleFriends(message);
                    break;
                case SocketPaths.Groups:
                    this.handler.handleGroups(message);
                    break;
            }
        }
        return socket;
    }
}

export class SimpleChatClient{
    state: SimpleChatState;
    connectionManager: ConnectionManager;
    readonly client: Client;

    private apiClientInstance: APIClient;

    private chatsChange?: (chats: Chats) => void
    set onChatsChange(chatsChange: (chats: Chats) => void){
        this.chatsChange = chatsChange;
    }

    private friendChange?: (friend: Friend[]) => void
    set onFriendChange(friendChange: (friend: Friend[]) => void){
        this.friendChange = friendChange;
    }
    
    private memberChange?: (member: Member[]) => void;
    set onMemberChange(memberChange: (member: Member[]) => void){
        this.memberChange = memberChange;
    }

    private constructor(client: Client, apiClientInstance: APIClient, state: SimpleChatState){
        this.client = client;
        this.state = state;
        this.apiClientInstance = apiClientInstance;
        this.connectionManager = new ConnectionManager("ws:localhost:3000/ws", {
            handleChats: this.handleChats,
            handleFriends: this.handleFriends,
            handleGroups: this.handleGroups
        });
    }

    private handleChats = (response: WSChatResponse) =>{
        const chats = { ...this.state.chats };

        switch(response.operation){
            case WSChatOperation.SendMessage:
                if(response.chat){
                    if(chats[response.chat.ownerID] === undefined){
                        chats[response.chat.ownerID] = [];
                    }
                    chats[response.chat.ownerID].push(response.chat);
                    this.state = { ...this.state, chats };
                }
                break;
            case WSChatOperation.SentMessage:
            case WSChatOperation.EditMessage:
            case WSChatOperation.ReadReceipt:
                if(response.chat){
                    const index = chats[response.chat.ownerID].findIndex((value)=> response.chat!.id === value.id);
                    const init = [...chats[response.chat.ownerID]];
                    init.splice(index, 1, response.chat!);
                    chats[response.chat.ownerID]= init;
                    this.state = { ...this.state, chats };
                }
                break;
            case WSChatOperation.DeleteMessage:
                if(response.chat){
                    const index = chats[response.chat.ownerID].findIndex((value)=> response.chat!.id === value.id);
                    const init = [...chats[response.chat.ownerID]];
                    init.splice(index, 1);
                    chats[response.chat.ownerID]= init;
                    this.state = { ...this.state, chats };
                }
                break;
            case WSChatOperation.Subscribe:
                break;
            case WSChatOperation.Unsubscribe:
                break;
            case WSChatOperation.ReplyMessage:
                break;
        }

        this.chatsChange && this.chatsChange(this.state.chats);
    }

    private handleFriends = (response: WSFriendResponse) =>{
        switch(response.operation){
            case WSFriendOperation.Request:
                if(response.friend){
                    this.state = { ...this.state, friends: [response.friend!, ...this.state.friends] }
                }
                break;
            case WSFriendOperation.Approve:
                if(response.friend){
                    const index = this.state.friends.findIndex((value)=> response.friend!.id === value.id);
                    const init = [...this.state.friends];
                    init.splice(index, 1, response.friend!);
            
                    this.state = {...this.state, friends: init };
                }
                break;
            case WSFriendOperation.Reject:
            case WSFriendOperation.Cancel:
                if(response.friend){
                    const index = this.state.friends.findIndex((value)=> response.friend!.id === value.id);
                    const init = [...this.state.friends];
                    init.splice(index, 1);
            
                    this.state = {...this.state, friends: init };
                }
                break;
        }
        this.friendChange && this.friendChange(this.state.friends);
    }

    private handleGroups = (response: WSGroupResponse) =>{
        switch(response.operation){
            case WSGroupOperation.Create:
                break;
            case WSGroupOperation.Request:
                if(response.member){
                    this.state = {...this.state, members: [response.member!, ...this.state.members] };
                }
                break;
            case WSGroupOperation.Accept:
                if(response.member){
                    const index = this.state.members.findIndex((value)=> response.member!.id === value.id);
                    const init = [...this.state.members];
                    init.splice(index, 1, response.member);
            
                    this.state = {...this.state, members: init };
                }
                break;
            case WSGroupOperation.Reject:
            case WSGroupOperation.Cancel:
                if(response.member){
                    const index = this.state.members.findIndex((value)=> response.member!.id === value.id);
                    const init = [...this.state.members];
                    init.splice(index, 1);

                    this.state = {...this.state, members: init };
                }
                break;
            case WSGroupOperation.Assign:
                break;
            case WSGroupOperation.Delete:
                break;
        }
        this.memberChange && this.memberChange(this.state.members);
    }

    private sort = ()=>{
        const map = new Map(Object.entries(this.state.chats));
        return Array.from(map.entries()).sort((entryA, entryB)=>{
            if(entryA[1].length > 0 && entryB[1].length > 0){
                return entryB[1][ entryB[1].length - 1].created.toString().localeCompare(entryA[1][  entryA[1].length - 1].created.toString());
            }else if(entryB[1].length > 0){
                return 1;
            }
            return -1;
        }).map((init)=> init[0]);
    }

    send = (message: string, targert: Friend | Member) =>{
        if("acceptorID" in targert){
            const friend = targert as Friend;
            if(friend.accepted){
                this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Chats, operation: WSChatOperation.SendMessage, message, friendID: friend.id }));
            }
        }else{
            const member = targert as Member;
            if(member.accepted){
                this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Chats, operation: WSChatOperation.SendMessage, message, groupID: member.group.id }));
            }
        }
    }

    typing = (targert: Friend | Member) => {
        if("acceptorID" in targert){
            const friend = targert as Friend;
            if(friend.accepted){
                this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Chats,  operation: WSChatOperation.Typing, friendID: friend.id }));
            }
        }else{
            const member = targert as Member;
            if(member.accepted){
                this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Chats, operation: WSChatOperation.Typing, groupID: member.group.id }) );
            }
        }
    }

    refreshChats = async () => {
        const response = await this.apiClientInstance.get<any>("/api/chats");
        this.state = { ...this.state, chats: response.data };
        if(this.onChatsChange){
            this.onChatsChange(this.state.chats);
        }
    }

    sendFriendRequest = (userID: string) =>{
        this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Friends, operation: WSFriendOperation.Request, userID }));
    }

    acceptFriendRequest = (friendID: string) =>{
        this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Friends, operation: WSFriendOperation.Approve, friendID }));
    }

    cancelFriendRequest = (friendID: string) =>{
        this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Friends, operation: WSFriendOperation.Cancel, friendID }));
    }

    refreshFriends = async () =>{
        const response = await this.apiClientInstance.get(`/api/friend`);
        this.state = { ...this.state, friends: response.data };
        if(this.friendChange){
            this.friendChange(this.state.friends);
        }
    }

    refreshMembers = async () =>{
        const response = await this.apiClientInstance.get(`/api/groups`);
        this.state = { ...this.state, members: response.data };
        if(this.memberChange){
            this.memberChange(this.state.members);
        }
    }

    createGroup = (name: string) =>{
        this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Groups, operation: WSGroupOperation.Create, name }));
    }

    acceptGroupRequest = (memberID: string) =>{
        this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Groups, operation: WSGroupOperation.Accept, memberID }));
    }

    declineGroupRequest = (memberID: string) =>{
        this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Groups, operation: WSGroupOperation.Reject, memberID }));
    }

    assignMemberRole = (memberID: string, role: "Member" | "Admin") =>{
        this.connectionManager.socketInstance.send(JSON.stringify({ path: SocketPaths.Groups, operation: WSGroupOperation.Assign, memberID, role }));
    }

    static async connect(config: SimpleChatConfig): Promise<SimpleChatClient>{
        const headers: HeadersInit = {};
        headers[AccessHeaderKeys.AccessKey] = config.accessKey;
        headers[AccessHeaderKeys.ProjectToken] = config.projectToken;
        if(config.organization){
            headers[AccessHeaderKeys.Organization] = config.organization;
        }

        const apiClientInstance =  new APIClient("/api", { headers });
        
        const client: Client = await apiClientInstance.post("/auth/connect", { data: {...config} });
        const response: SimpleChatState = await apiClientInstance.get("/client");
        console.log("simple chat client connected:", response);
        
        return new SimpleChatClient(client, apiClientInstance, response);
    }
}

export default SimpleChatClient;