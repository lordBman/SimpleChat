import React, { useMemo, useState } from "react";
import RecievedChat from "../../conponents.tsx/recieved-chat";
import MyChat from "../../conponents.tsx/my-chat";
import { ChatContext, ChatContextType } from "../providers/chats-provider";
import { ChannelResponse, GroupResponse, FriendResponse } from "../../responses";
import { FriendsContext, FriendsContextType } from "../providers/friends-provider";
import { AppContext, AppContextType } from "../providers/app-provider";

const isFriend = (current: ChannelResponse | GroupResponse | FriendResponse) => "acceptorID" in current;
const isGroup = (current: ChannelResponse | GroupResponse | FriendResponse) => "name" in current;
const isChannel = (current: ChannelResponse | GroupResponse | FriendResponse) => "friendsID" in current;

const Chat = () =>{
    const { data } = React.useContext(AppContext) as AppContextType;
    const { current } = React.useContext(ChatContext) as ChatContextType;
    const { friends } = React.useContext(FriendsContext) as FriendsContextType;
    const [message, setMessage] = useState("");

    const initial = useMemo(()=>{
        if(current){
            if(isChannel(current)){
                const friendsID = (current as ChannelResponse).friendsID;
                const friend = friends.find((value)=>friendsID === value.id);
                if(friend?.acceptorID === data?.id){
                    return { name: friend?.requester.name, init: friend?.requester.name.charAt(0).toLocaleUpperCase() };
                }
                return { name: friend?.acceptor.name, init: friend?.acceptor.name.charAt(0).toLocaleUpperCase() };
            }else if(isFriend(current)){
                const friend = (current as FriendResponse);
                if(friend?.acceptorID === data?.id){
                    return { name: friend?.requester.name, init: friend?.requester.name.charAt(0).toLocaleUpperCase() };
                }
                return { name: friend?.acceptor.name, init: friend?.acceptor.name.charAt(0).toLocaleUpperCase() };
            }
        }
        return { name: "No active Chat", init: "?" };
    }, [current]);

    const initChats = () =>{
        if(current && isChannel(current)){
            return (current as ChannelResponse).chats;
        }  
        return []; 
    }
    const chats = initChats();

    const textChange = (event:  React.ChangeEvent<HTMLInputElement>) =>{
        setMessage(event.target.value);
    }

    const send = () =>{
        if(message.length){
            
            setMessage("");
        }
    }
    return (
        <div className="chat-root-container">
            <div className="chat-header">
                <div className="chat-header-profile">
                    <div className="messages-item-profile-container">
                        <div className="messages-item-profile">{initial.init}</div>
                    </div>
                    <div>{initial.name}</div>
                    { current && <div style={{ border: "solid 3px #06D6A3", borderRadius:"50%" }}>
                        <div style={{ width:"2px", height:"2px",backgroundColor: "white", borderRadius:"50%"}}></div>
                    </div> }
                </div>
                <div>
                    <span className="circum--menu-kebab"></span>
                </div>
            </div>
            <div className="chat-main">
                <div id="chats-container" className="chat-container">
                    { chats.map((chat)=>{
                        if(chat.senderID === data?.id){
                            return <MyChat chat={chat}/>
                        }
                        return  <RecievedChat chat={chat} />
                    })}
                </div>
            </div>
            <div className="chat-input-container">
                <input value={message} onChange={textChange} type="text"  placeholder="Enter  message ..." />
                <span className="ri--attachment-line"></span>
                <span className="mynaui--image"></span>
                <button onClick={send}>
                    <span className="mynaui--send"></span>
                </button>
            </div>
        </div>
    );
}

export default Chat;