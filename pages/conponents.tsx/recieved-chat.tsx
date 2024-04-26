import React from "react";
import { ChatResponse } from "../responses";
import { formatTime } from "../utils";

interface RecievedChatProps{
    chat: ChatResponse
}

const RecievedChat: React.FC<RecievedChatProps> = ({ chat }) =>{
    return (
        <div className="recieved-chat-container">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{chat.sender.name.charAt(0).toLocaleLowerCase()}</div>
            </div>
            <div className="chat-container-content">
                <div className="recieved-chat-name">{chat.sender.name}</div>
                <div className="recieved-chat">{chat.message}</div>
                <div className="recieved-chat-time">{formatTime(new Date(chat.created.toString()))}</div>
            </div>
        </div>
    );
}

export default RecievedChat;