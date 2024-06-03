import React from "react";
import { ChatContext, ChatContextType } from "../providers/chats-provider";
import Message from "../../conponents/message";
import "../../css/chats/chats.scss";

const Chats = () =>{
    const { order, chats } = React.useContext(ChatContext) as ChatContextType;
    
    return (
        <div className="chats-main-container">
            <div className="section-title">
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
                       { order.map((item)=> chats[item].length > 0 && <Message id={item} key={item} />) }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chats;