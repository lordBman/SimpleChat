import React, { useContext, useMemo } from "react";
import { useAppContext } from "../providers/app-provider";
import { formatTime } from "../utils";
import { Friend, Member } from "@simplechat/shared";
import { useChatContext, useFriendsContext, useMembersContext } from "simplechat_provider/src/contexts";

interface FrinedMessageProps{
    message: Friend
}

const FrinedMessage: React.FC<FrinedMessageProps> = ({message}) =>{
    const { user, makeCurrent } = useAppContext();
    const { chats } = useChatContext();

    const friend = useMemo(()=>{
        if(message?.acceptor.id === user?.id){
            return message.requester;
        }
        return message.acceptor;
    }, [message]);

    const init = chats[message.id]
    const last = init[init.length - 1];

    const clicked = () => makeCurrent(message);

    return (
        <div className="messages-item" onClick={clicked}>
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
                <span className="messages-item-message">{ user?.id === last.senderID ? `You: ${last.message}` : last.message }</span>
            </div>
        </div>
    );
}

interface GroupMessageProps{
    message: Member
}

const GroupMessage: React.FC<GroupMessageProps> = ({ message }) =>{
    const { user, makeCurrent } = useAppContext();
    const { chats } = useChatContext();

    const init = chats[message.group.id];
    const last = init[init.length - 1];

    const clicked = () => makeCurrent(message);

    return (
        <div className="messages-item" onClick={clicked}>
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
                    <span className="messages-item-name">{message.group.name}</span>
                    <span className="messages-item-time">{ formatTime(new Date(last.created.toString())) }</span>
                </div>
                <span className="messages-item-message">{ user?.id === last.senderID ? `You: ${last.message}` : `${last.sender.name.split(" ")[0]}: ${last.message}` }</span>
            </div>
        </div>
    );
}

interface MessageProps{
    id: string
}

const Message: React.FC<MessageProps> = ({ id }) =>{
    const { friends } = useFriendsContext();
    const { members } = useMembersContext();

    const init: Member | Friend = useMemo(()=>{
        const frined = friends.find((friend)=> friend.id === id);
        if(frined){
            return frined;
        }
        return members.find((members)=> members.group.id === id)!;
    }, [id]);

    if("group" in init){
        return <GroupMessage message={init} />
    }
    return <FrinedMessage message={init} />
}


export default Message;