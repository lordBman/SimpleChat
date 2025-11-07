import Details from "./details";

export type ChatType = "Group" | "Friends";

type Chat = {
    id: string;
    message: string;
    created: Date;
    delivered: boolean;
    edited: boolean;
    ownerID: string;
    type: ChatType;
    reference?: Chat | null;

    sender: Details;
}

export default Chat;