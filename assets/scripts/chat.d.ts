import { Socket } from "socket.io-client";
import { Chat, Group, GroupChat, User } from "@prisma/client";
interface ChatState {
    chats: Array<Chat | GroupChat>;
    user?: User;
    group?: Group;
}
declare class ChatManager {
    states: ChatState[];
    chatContainer: Element | null;
    message: HTMLInputElement;
    socket: Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>;
    private static chatManager?;
    private constructor();
    static instance: (states?: ChatState[]) => ChatManager;
}
export { ChatManager };
