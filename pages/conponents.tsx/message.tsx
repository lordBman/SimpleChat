import React, { useContext, useMemo } from "react";
import { GroupResponse, FriendResponse, ChatResponse, MemberResponse } from "../responses";
import { AppContext, AppContextType } from "../dashboard/providers/app-provider";
import { FriendsContext, FriendsContextType } from "../dashboard/providers/friends-provider";
import { formatTime } from "../utils";
import { MembersContext, MembersContextType } from "../dashboard/providers/members-provider";
import { ChatContext, ChatContextType } from "../dashboard/providers/chats-provider";

interface FrinedMessageProps{
    message: FriendResponse
}

const FrinedMessage: React.FC<FrinedMessageProps> = ({message}) =>{
    const { data } = useContext(AppContext) as AppContextType;
    const { chats, makeCurrent } = useContext(ChatContext) as ChatContextType;

    const friend = useMemo(()=>{
        if(message?.acceptorID === data?.id){
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
                <span className="messages-item-message">{ data?.id === last.senderID ? `You: ${last.message}` : last.message }</span>
            </div>
        </div>
    );
}

interface GroupMessageProps{
    message: MemberResponse
}

const GroupMessage: React.FC<GroupMessageProps> = ({ message }) =>{
    const { data } = useContext(AppContext) as AppContextType;
    const { chats, makeCurrent } = useContext(ChatContext) as ChatContextType;

    const init = chats[message.groupID];
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
                <span className="messages-item-message">{ data?.id === last.senderID ? `You: ${last.message}` : `${last.sender.name.split(" ")[0]}: ${last.message}` }</span>
            </div>
        </div>
    );
}

interface MessageProps{
    id: string
}

const Message: React.FC<MessageProps> = ({ id }) =>{
    const { friends } = useContext(FriendsContext) as FriendsContextType;
    const { members } = useContext(MembersContext) as MembersContextType;

    const init: MemberResponse | FriendResponse = useMemo(()=>{
        const frined = friends.find((friend)=> friend.id === id);
        if(frined){
            return frined;
        }
        return members.find((members)=> members.groupID === id)!;
    }, [id]);

    if("groupID" in init){
        return <GroupMessage message={init} />
    }
    return <FrinedMessage message={init} />
}


export default Message;