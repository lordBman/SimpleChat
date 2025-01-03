import Credential from "./credentials";

type Chat = {
    id: number;
    message: string;
    created: Date;
    delivered: boolean;
    senderID: string;
    ownerID: string;
    type: "Group" | "Friends";
    referenceID: number | null;
    sender: Credential;
}

export default Chat;