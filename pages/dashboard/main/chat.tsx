import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChatView } from "../../conponents.tsx";
import { ChatContext, ChatContextType } from "../providers/chats-provider";
import { GroupResponse, FriendResponse } from "../../responses";
import { FriendsContext, FriendsContextType } from "../providers/friends-provider";
import { AppContext, AppContextType } from "../providers/app-provider";

const isFriend = (current: GroupResponse | FriendResponse) => "acceptorID" in current;
const isGroup = (current: GroupResponse | FriendResponse) => "name" in current;

const Chat = () =>{
    const { data } = React.useContext(AppContext) as AppContextType;
    const { current, send, chats } = React.useContext(ChatContext) as ChatContextType;
    const [message, setMessage] = useState("");
    const [containerScrollState, setContainerScrollState] = useState<boolean>();

    const initChats = current?.id ? chats[current.id] : [];

    const initial = useMemo(()=>{                                                                                                                                                                           
        if(current){
            if(isFriend(current)){
                const friend = (current as FriendResponse);
                if(friend?.acceptorID === data?.id){
                    return { name: friend?.requester.name, init: friend?.requester.name.charAt(0).toLocaleUpperCase()};
                }
                return { name: friend?.acceptor.name, init: friend?.acceptor.name.charAt(0).toLocaleUpperCase() };
            }else if(isGroup(current)){
                const group = (current as GroupResponse);

                return { name: group.name, init: "" };
            }
        }
        return { name: "No active Chat", init: "?" };
    }, [current]);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (container){
            if(!containerScrollState){
                container.scrollTop = container.scrollHeight;
                setContainerScrollState(true);
            }else{
                const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
                if(containerScrollState && !isAtBottom){
                    container.scrollTo({ top: container.scrollHeight,  behavior: "smooth" });
                }
            }
        }
    }, [initChats, containerRef.current]);

    const isScrolling = () =>{
        const container = containerRef.current!;
        setContainerScrollState(container.scrollHeight - container.scrollTop === container.clientHeight);
    }

    const textChange = (event:  React.ChangeEvent<HTMLInputElement>) =>{
        setMessage(event.target.value);
    }

    const sendMessage = () =>{
        if(message.length){
            send(message);
            setMessage("");
        }
    }

    return (
        <div className="chat-root-container">
            <div className="chat-header">
                <div className="chat-header-profile">
                    <div className="messages-item-profile-container">
                        { current && isGroup(current) && <div className="messages-item-profile">
                            <span className="heroicons--user-group"></span>
                        </div> }
                        { (!current || !isGroup(current)) && <div className="messages-item-profile">{initial.init}</div> }
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
                <div id="chats-container" ref={containerRef} onScroll={isScrolling} className="chat-container">
                    { initChats?.map((chat, index)=>{ return ( <ChatView chat={chat} key={index} /> ) })}
                </div>
            </div>
            <div className="chat-input-container">
                <input value={message} onChange={textChange} type="text"  placeholder="Enter  message ..." />
                <span className="ri--attachment-line"></span>
                <span className="mynaui--image"></span>
                <button onClick={sendMessage}>
                    <span className="mynaui--send"></span>
                </button>
            </div>
        </div>
    );
}

export default Chat;