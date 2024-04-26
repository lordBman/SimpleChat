import React from "react";
import { ChatResponse } from "../responses";
interface RecievedChatProps {
    chat: ChatResponse;
}
declare const MyChat: React.FC<RecievedChatProps>;
export default MyChat;
