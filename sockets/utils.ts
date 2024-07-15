import { Namespace, Socket } from "socket.io";

export class ConnectedSockets{
    private connections: Map<string, Socket>;
    private namespace?: Namespace;
    private constructor(){
        this.connections = new Map<string, Socket>();
    }

    use = (namespace: Namespace) => this.namespace = namespace;

    isOnline = (id: string) => this.connections.has(id);
    get = (id: string) => this.connections.get(id);
    add = (id: string, socket: Socket) => this.connections.set(id, socket);
    remove = (id: string) => this.connections.delete(id);
    getConnection = () => this.namespace!;
    isConnected = () => this.namespace !== undefined;

    send = (path: string, ids: string[], message: any) =>{
        ids.forEach((id)=>{
            if(this.connections.has(id)){
                this.connections.get(id)?.emit(path, message);
            }
        });
    }

    private static instance?: ConnectedSockets;
    static getInstance = () =>{
        if(!ConnectedSockets.instance){
            ConnectedSockets.instance = new ConnectedSockets();
        }
        return ConnectedSockets.instance!;
    }
}