import Details from "./details";
import Group from "./groups";

interface Notification{
    id: number;
    message?: string | null;
    alert: string;
    created: Date;
    received: boolean;

    recieverID: string;
    reciever?: Details | null;
    group?: Group | null;
    ntype: "Group" | "User"
}

export default Notification;