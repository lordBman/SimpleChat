import React from "react";
import { formatTime } from "../utils";

const MyChat = (props: { name: string, message: string }) =>{
    return (
        <div className="my-chat-container">
            <div className="chat-container-content">
                <div className="my-chat-name">Me</div>
                <div className="my-chat">{props.message}</div>
                <div className="my-chat-time">{formatTime(new Date())}</div>
            </div>
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{props.name.charAt(0).toUpperCase()}</div>
            </div>
        </div>
    );
}

export default MyChat;