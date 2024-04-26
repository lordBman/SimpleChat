import React, { useMemo } from "react";
import { GroupResponse, ChannelResponse } from "../responses";

interface FrinedMessageProps{
    message: ChannelResponse
}

const FrinedMessage: React.FC<FrinedMessageProps> = ({message}) =>{
    
    return (
        <div className="messages-item">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">N</div>
                <div className="messages-item-status-container">
                    <div className="messages-item-status"></div>
                </div>
            </div>
            <div className="messages-item-content">
                <div className="messages-item-name-container">
                    <span className="messages-item-name">Blessing James</span>
                    <span className="messages-item-time">12:14pm</span>
                </div>
                <span className="messages-item-message">Hoew are you doing ? </span>
            </div>
        </div>
    );
}

interface GroupMessageProps{
    message: GroupResponse
}

const GroupMessage: React.FC<GroupMessageProps> = ({}) =>{
    return (
        <div>

        </div>
    );
}

interface MessageProps{
    message: GroupResponse | ChannelResponse
}

const Message: React.FC<MessageProps> = ({message}) =>{
    if("name" in message){
        return <GroupMessage message={message as GroupResponse} />
    }
    return <FrinedMessage message={message as ChannelResponse} />
}


export default Message;