import React, { useContext } from "react";
import { ChatResponse } from "../responses";
import { formatTime } from "../utils";
import { AppContext, AppContextType } from "../dashboard/providers/app-provider";

interface ChatProps{
    chat: ChatResponse
}

const RecievedChat: React.FC<ChatProps> = ({ chat }) =>{
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

const MyChat: React.FC<ChatProps> = ({ chat }) =>{
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


const ChatView: React.FC<ChatProps> = ({ chat }) =>{
    const { data } = useContext(AppContext) as AppContextType;

    if(chat.senderID === data?.id){
        return <MyChat chat={chat} />
    }
    return <RecievedChat chat={chat} />
}

export default ChatView;