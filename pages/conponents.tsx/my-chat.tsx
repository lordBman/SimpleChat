import React, { useContext } from "react";
import { formatTime } from "../utils";
import { AppContext, AppContextType } from "../dashboard/providers/app-provider";
import { ChatResponse } from "../responses";

interface RecievedChatProps{
    chat: ChatResponse
}


const MyChat: React.FC<RecievedChatProps> = ({ chat }) =>{
    const { data } = useContext(AppContext) as AppContextType;
    
    return (
        <div className="my-chat-container">
            <div className="chat-container-content">
                <div className="my-chat-name">Me</div>
                <div className="my-chat">{chat.message}</div>
                <div className="my-chat-time">{formatTime(new Date(chat.created.toString()))}</div>
            </div>
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{ data?.name.charAt(0).toUpperCase()}</div>
            </div>
        </div>
    );
}

export default MyChat;