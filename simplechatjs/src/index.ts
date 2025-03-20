import { io, Socket } from "socket.io-client";
import axios, { AxiosError } from "axios";
import { Friend, Member, SimpleChatClientConfig, UserState } from "@simplechat/shared";
import { Chat, Chats } from "@simplechat/shared/models";

const axiosInstance =  axios.create({
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true,
	baseURL: "/api" });


class SimpleChatClient{
    private accessKey: string;
    private socket: Socket;

    state: UserState;
    messages: string[];

    onMessage?: (target: string, chat: Chat) => void;
    onFriendEvent?: (friend: Friend) => void;

    private constructor(accessKey: string, socket: Socket, state: UserState){
        this.accessKey = accessKey;
        this.socket = socket;
        this.state = state;
        this.messages = this.sort();

        this.socket.on("chat", (data: Chat, room: string)=>{
            const chats = { ...this.state.chats };
            chats[room] = [...this.state.chats[room], data];
    
            this.state =  {...this.state, chats}
            this.messages = [room].concat([...this.messages].filter((value) => value !== room));
    
            console.log(`Recieved chat - ${JSON.stringify(room)}: ${JSON.stringify(data)}`);

            if(this.onMessage){
                this.onMessage(room, data);
            }
        });
    
        this.socket.on("typing", (message: string, room: string)=>{
            /*if(room === status.room){
                if(status.message !== message){
                    setStatus({ message, room });
                }                
            }else if(room === current?.id){
                setStatus({ message, room });
            }*/
        });

        this.socket.on("request", (response: Friend) =>{
            this.state = { ...this.state, friends: [response, ...this.state.friends] }

            if(this.onFriendEvent){
                this.onFriendEvent(response);
            }
        });
    
        this.socket.on("accept", (response: Friend) =>{
            console.log(JSON.stringify(`just recieved: ${response}`));
            
            const index = this.state.friends.findIndex((value)=> response.id === value.id);
            const init = [...this.state.friends];
            init.splice(index, 1, response);
    
            this.state = {...state, friends: init };

            if(this.onFriendEvent){
                this.onFriendEvent(response);
            }
        });
    
        this.socket.on("cancel", (response: Friend) =>{
            const index = this.state.friends.findIndex((value)=> response.id === value.id);
            const init = [...this.state.friends];
            init.splice(index, 1);
    
            this.state = {...state, friends: init };

            if(this.onFriendEvent){
                this.onFriendEvent(response);
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
        }catch(error){
            if(error instanceof AxiosError){
                throw Error((error as AxiosError).message);
            }else{
                throw error;
            }
        }
    }

    static async connect(config: SimpleChatClientConfig): Promise<SimpleChatClient>{
        try{
            const user = await axiosInstance.post(`/connect?key=${config.accessKey}`, config);
            const response = await axiosInstance.get(`/?key=${config.accessKey}`);
            const socket = io("/", { auth: { token: user.data?.token, access: "access-key",  key: config.accessKey } });
            socket.on("connected", ()=>{
                console.log(socket.connected);
            });

            return new SimpleChatClient(config.accessKey, socket, response.data);
        }catch(error){
            if(error instanceof AxiosError){
                throw Error((error as AxiosError).message);
            }else{
                throw error;
            }
        }
    }
}

export default SimpleChatClient;

