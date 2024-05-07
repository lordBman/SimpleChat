import { Socket } from "socket.io";

export class SocketUtils{
    private connections: Map<string, Socket>;
    private constructor(){
        this.connections = new Map<string, Socket>();
    }

    isAlive = (id: string) => this.connections.has(id);
    get = (id: string) => this.connections.get(id);
    add = (id: string, socket: Socket) => this.connections.set(id, socket);
    remove = (id: string) => this.connections.delete(id);

    private static instance?: SocketUtils;
    static getInstance = () =>{
        if(!SocketUtils.instance){
            SocketUtils.instance = new SocketUtils();
        }
        return SocketUtils.instance!;
    }
}