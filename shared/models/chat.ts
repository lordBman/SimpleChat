import Credential from "./credentials";

type Chat = {
    id: string;
    message: string;
    created: Date;
    delivered: boolean;
    senderID: string;
    ownerID: string;
    type: "Group" | "Friends";
    reference?: Chat | null;

    sender: Credential;
}

export default Chat;