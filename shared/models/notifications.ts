import Group from "./groups";

interface Notification{
    group?: Group | null;
    id: number;
    message?: string | null;
    alert: string;
    created: Date;
    received: boolean;
    recieverID: string;
}

export default Notification;