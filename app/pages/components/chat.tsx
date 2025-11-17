import React, { useContext } from "react";
import { AppContext, AppContextType, useAppContext } from "../providers/app-provider";
import { Chat } from "@simplechat/shared/models";

interface ChatProps{
    chat: Chat
}

const RecievedChat: React.FC<ChatProps> = ({ chat }) =>{
    return (
        <div className="recieved-chat-container">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{chat.sender.name.charAt(0).toLocaleUpperCase()}</div>
            </div>
            <div className="chat-container-content">
                <div className="recieved-chat-name">{chat.sender.name}</div>
                <div className="recieved-chat">{chat.message}</div>
                <div className="recieved-chat-time">{new Date(chat.created.toString()).toLocaleTimeString()}</div>
            </div>
        </div>
    );
}

const MyChat: React.FC<ChatProps> = ({ chat }) =>{
    const { user } = useAppContext();
    
    return (
        <div className="my-chat-container">
            <div className="chat-container-content">
                <div className="my-chat-name">Me</div>
                <div className="my-chat">{chat.message}</div>
                <div className="my-chat-time">{new Date(chat.created.toString()).toLocaleTimeString()}</div>
            </div>
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{ user?.name.charAt(0).toUpperCase()}</div>
            </div>
        </div>
    );
}


const ChatView: React.FC<ChatProps> = ({ chat }) =>{
    const { user } = useAppContext();

    if(chat.senderID === user?.id){
        return <MyChat chat={chat} />
    }
    return <RecievedChat chat={chat} />
}

export default ChatView;