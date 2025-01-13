import { io, Socket } from "socket.io-client";
import { axiosInstance } from "./uitls";
import { Chats, Friend, Member } from "./models";
import { AxiosError } from "axios";

export type SimpleChatClientConfig = {
    name: string,
    surname: string,
    accessKey: string,
    token: string,
    organization?: string
};

export type UserState = Credential & { 
    token: string, 
    members: Member[],
    adminID?: number,
    friends: Friend[], chats: Chats }

class SimpleChatClient{
    accessKey: string;
    socket: Socket;
    state: UserState; 

    private constructor(accessKey: string, socket: Socket, state: UserState){
        this.accessKey = accessKey;
        this.socket = socket;
        this.state = state;
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

