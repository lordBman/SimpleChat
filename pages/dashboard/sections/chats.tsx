import React from "react";
import { ChatContext, ChatContextType } from "../providers/chats-provider";
import Message from "../../conponents.tsx/message";

const Chats = () =>{
    const { order } = React.useContext(ChatContext) as ChatContextType;
    
    return (
        <div className="chats-main-container">
            <div>
                <h2 className="chats-title">Chats</h2>
            </div>
            <form className="search-form">
                <span className="formkit--search"></span>
                <input className="search-input" type="search" placeholder="search users ..." />
            </form>
            <div className="messages-root-container">
                <h4 className="messages-title">Messages</h4>
                <div className="messages-main">
                    <div className="messages-container">
                       { order.map((item)=> <Message id={item} />) }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chats;