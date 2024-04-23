import React, { useContext } from "react";
import { formatTime } from "../utils";
import { AppContext, AppContextType } from "../dashboard/providers";

const MyChat = (props: { message: string}) =>{
    const { user } = useContext(AppContext) as AppContextType;
    
    return (
        <div className="my-chat-container">
            <div className="chat-container-content">
                <div className="my-chat-name">Me</div>
                <div className="my-chat">{props.message}</div>
                <div className="my-chat-time">{formatTime(new Date())}</div>
            </div>
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{ user?.name.charAt(0).toUpperCase()}</div>
            </div>
        </div>
    );
}

export default MyChat;