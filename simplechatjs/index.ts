import { AccessHeaderKeys, SimpleChatConfig, SimpleChatState } from "@simplechat/shared";
import APIClient from "@simplechat/shared/api_client"; 

export class SimpleChatClient{
    state: SimpleChatState;

    private config: SimpleChatConfig;
    private socket: WebSocket;
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

    private constructor(config: SimpleChatConfig, state: SimpleChatState){
        this.config = config;
        this.state = state;

        this.socket = new WebSocket("ws:localhost:3000/ws");
        this.socket.onopen = () =>{
            console.info("connected to simple chat live server");
            this.connected = true;
            this.connectionChange && this.connectionChange(this.connected);
        }

        this.socket.onclose = () =>{
            console.info("disconnected to simple chat live server");
            this.connected = false;
            this.connectionChange && this.connectionChange(this.connected);
        }

        this.socket.onerror = (event) =>{
            console.error(event);
            this.onError && this.onError("simple chat live server encountered some errors");
        }

        this.socket.onmessage = (event) =>{
            console.log(`what is comming from server: ${event.data}`);
            const message = JSON.parse(event.data);

            
        }
    }

    static async connect(config: SimpleChatConfig): Promise<SimpleChatClient>{
        const headers: HeadersInit = {};
        headers[AccessHeaderKeys.AccessKey] = config.accessKey;
        headers[AccessHeaderKeys.ProjectToken] = config.projectToken;
        if(config.organization){
            headers[AccessHeaderKeys.Organization] = config.organization;
        }

        const apiClientInstance =  new APIClient("/api", { headers });
        
        await apiClientInstance.post("/connect", { data: {...config} });
        const response = await apiClientInstance.get("/client");
        
        return new SimpleChatClient(config, response);
    }
}

/*class SimpleChatClient{
    private config: SimpleChatConfig;
    private socket: WebSocket;

    state: SimpleChatState;
    messages: string[];

    onChatsChange?: (chats: Chats) => void;
    onMessageChange?: (message: string[]) => void;
    onFriendChange?: (friend: Friend[]) => void;
    onMemberChange?: (member: Member[]) => void;

    private constructor(config: SimpleChatConfig, state: SimpleChatState){
        this.config = config;
        this.state = state;
        this.messages = this.sort();

        this.chatSocket = new WebSocket("/ws")

        this.socket.on("chat", (data: Chat, room: string)=>{
            const chats = { ...this.state.chats };
            chats[room] = [...this.state.chats[room], data];
    
            this.state =  {...this.state, chats}
            this.messages = [room].concat([...this.messages].filter((value) => value !== room));
    
            console.log(`Recieved chat - ${JSON.stringify(room)}: ${JSON.stringify(data)}`);

            this.onMessageChange && this.onMessageChange(this.messages);
            this.onChatsChange && this.onChatsChange(this.state.chats);
        });
    
        this.socket.on("typing", (message: string, room: string)=>{
            if(room === status.room){
                if(status.message !== message){
                    setStatus({ message, room });
                }                
            }else if(room === current?.id){
                setStatus({ message, room });
            }
        });

        this.socket.on("friends/request", (response: Friend) =>{
            this.state = { ...this.state, friends: [response, ...this.state.friends] }

            if(this.onFriendChange){
                this.onFriendChange(this.state.friends);
            }
        });
    
        this.socket.on("friends/accept", (response: Friend) =>{
            console.log(JSON.stringify(`just recieved: ${response}`));
            
            const index = this.state.friends.findIndex((value)=> response.id === value.id);
            const init = [...this.state.friends];
            init.splice(index, 1, response);
    
            this.state = {...state, friends: init };

            if(this.onFriendChange){
                this.onFriendChange(this.state.friends);
            }
        });
    
        this.socket.on("friends/cancel", (response: Friend) =>{
            const index = this.state.friends.findIndex((value)=> response.id === value.id);
            const init = [...this.state.friends];
            init.splice(index, 1);
    
            this.state = {...state, friends: init };

            if(this.onFriendChange){
                this.onFriendChange(this.state.friends);
            }
        });

        socket.on("friends/error", (error: any) =>{});

        socket.on("groups/request", (response: Member) =>{
            const init = [response, ...state.members]
            this.state = {...state, members: init };

            if(this.onMemberChange){
                this.onMemberChange(this.state.members);
            }
        });
    
        socket.on("groups/accept", (response: Member) =>{
            console.log(JSON.stringify(`just recieved: ${response}`));
            
            const index = state.members.findIndex((value)=> response.credential.id === value.credential.id);
            const init = [...state.members];
            init.splice(index, 1, response);
    
            this.state = {...state, members: init };
            if(this.onMemberChange){
                this.onMemberChange(this.state.members);
            }
        });
    
        socket.on("groups/cancel", (response: Friend) =>{
            const index = state.members.findIndex((value)=> response.id === value.credential.id);
            const init = [...state.members];
            init.splice(index, 1);
    
            this.state = {...state, members: init };
            if(this.onMemberChange){
                this.onMemberChange(this.state.members);
            }
        });
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
            if(this.socket && friend.accepted){
                this.socket.emit("chat", { message, friendID: friend.id }, friend.id);
            }
        }else{
            const member = targert as Member;
            if(this.socket && member.accepted){
                this.socket.emit("chat", { message, groupID: member.group.id }, member.group.id);
            }
        }
    }

    typing = (targert: Friend | Member) => {
        if("acceptorID" in targert){
            const friend = targert as Friend;
            if(this.socket && friend.accepted){
                this.socket.emit("typing", { status: true }, friend.id);
            }
        }else{
            const member = targert as Member;
            if(this.socket && member.accepted){
                this.socket.emit("typing", { status: true }, member.group.id);
            }
        }
    }

    refreshChats = async () => {
        try{
            const response = await axiosInstance.get(`/chats?key=${this.accessKey}`);
            this.state = { ...this.state, chats: response.data };
            if(this.onChatsChange){
                this.onChatsChange(this.state.chats);
            }
        }catch(error){
            if(error instanceof AxiosError){
                throw Error((error as AxiosError).message);
            }else{
                throw error;
            }
        }
    }

    sendFriendRequest = (userID: string) =>{
        this.socket.emit("request", { userID });
    }

    acceptFriendRequest = (friendID: string) =>{
        this.socket.emit("accept", { friendID }, friendID);
    }

    cancelFriendRequest = (friendID: string) =>{
        this.socket.emit("cancel", { friendID }, friendID);
    }

    refreshFriends = async () =>{
        try{
            const response = await axiosInstance.get(`/friends?key=${this.accessKey}`);

            this.state = { ...this.state, friends: response.data };

            if(this.onFriendChange){
                this.onFriendChange(this.state.friends);
            }
        }catch(error){
            if(error instanceof AxiosError){
                throw Error((error as AxiosError).message);
            }else{
                throw error;
            }
        }
    }

    refreshMembers = async () =>{
        try{
            const response = await axiosInstance.get(`/groups?key=${this.accessKey}`);

            this.state = { ...this.state, members: response.data };
            if(this.onMemberChange){
                this.onMemberChange(this.state.members);
            }
        }catch(error){
            if(error instanceof AxiosError){
                throw Error((error as AxiosError).message);
            }else{
                throw error;
            }
        }
    }

    
}*/

export default SimpleChatClient;

