import React, { useContext, useMemo } from "react";
import { GroupResponse, ChannelResponse } from "../responses";
import { AppContext, AppContextType } from "../dashboard/providers/app-provider";
import { FriendsContext, FriendsContextType } from "../dashboard/providers/friends-provider";
import { formatTime } from "../utils";

interface FrinedMessageProps{
    message: ChannelResponse
}

const FrinedMessage: React.FC<FrinedMessageProps> = ({message}) =>{
    const { data } = useContext(AppContext) as AppContextType;
    const { friends } = useContext(FriendsContext) as FriendsContextType;

    const friend = useMemo(()=>{
        const friend = friends.find((friend)=> friend.id === message.friendsID);
        if(friend?.acceptorID === data?.id){
            return friend?.requester;
        }
        return friend?.acceptor;
    }, [message]);

    const last = message.chats[message.chats.length - 1];

    return (
        <div className="messages-item">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{friend?.name.charAt(0).toLocaleUpperCase()}</div>
                <div className="messages-item-status-container">
                    <div className="messages-item-status"></div>
                </div>
            </div>
            <div className="messages-item-content">
                <div className="messages-item-name-container">
                    <span className="messages-item-name">{friend?.name}</span>
                    <span className="messages-item-time">{ formatTime(new Date(last.created.toString())) }</span>
                </div>
                <span className="messages-item-message">{ data?.id === last.senderID ? `You: ${last.message}` : last.message }</span>
            </div>
        </div>
    );
}

interface GroupMessageProps{
    message: GroupResponse
}

const GroupMessage: React.FC<GroupMessageProps> = ({ message }) =>{
    const { data } = useContext(AppContext) as AppContextType;

    const last = message.chats[message.chats.length - 1];

    return (
        <div className="messages-item">
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">
                    <span className="heroicons--user-group"></span>
                </div>
                <div className="messages-item-status-container">
                    <div className="messages-item-status"></div>
                </div>
            </div>
            <div className="messages-item-content">
                <div className="messages-item-name-container">
                    <span className="messages-item-name">{message.name}</span>
                    <span className="messages-item-time">{ formatTime(new Date(last.createdAt.toString())) }</span>
                </div>
                <span className="messages-item-message">{ data?.id === last.senderID ? `You: ${last.message}` : `${last.sender.name.split(" ")[0]}: ${last.message}` }</span>
            </div>
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