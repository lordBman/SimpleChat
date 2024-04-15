import React, { useState } from "react";
import "../../../assets/css/chat.css";
import RecievedChat from "../../conponents.tsx/recieved-chat";
import MyChat from "../../conponents.tsx/my-chat";

const Chat = () =>{
    const [message, setMessage] = useState("");

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
                        <div className="messages-item-profile">N</div>
                    </div>
                    <div>Nobel Okelekele</div>
                    <div style={{ border: "solid 3px #06D6A3", borderRadius:"50%" }}>
                        <div style={{ width:"2px", height:"2px",backgroundColor: "white", borderRadius:"50%"}}></div>
                    </div>
                </div>
                <div>
                    <span className="circum--menu-kebab"></span>
                </div>
            </div>
            <div className="chat-main">
                <div id="chats-container" className="chat-container">
                    <MyChat name="Nobel" message="How are you doing today, I hope you had a good night's rest ?" />
                    <RecievedChat />
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