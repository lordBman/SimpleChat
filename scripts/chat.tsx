import React from "react";
import { io } from "socket.io-client";
import { ReactUtils, getCookie } from "./utils";
import { Chat, Group, GroupChat, User } from "@prisma/client";
import { MyChat } from "./components";

interface ChatState{
    chats: Array<Chat | GroupChat>,
    user?: User,
    group?: Group
}

class ChatManager{
    states: ChatState[]
    chatContainer: Element | null;
    message;
    socket;

    private static chatManager?: ChatManager;

    private constructor(states: ChatState[]){
        this.states = states;
        const token = getCookie("token");
        this.chatContainer = document.getElementById("chats-container");
        this.message = document.getElementById("message") as HTMLInputElement;
        this.socket = io("http://localhost:5000", { auth: { token, access: "access-key" } });

        (document.getElementById("sendBtn") as HTMLButtonElement).onclick = () =>{
            if(this.chatContainer && this.message){
                const value = this.message.value;
                if(value.length){
                    ReactUtils.append(this.chatContainer, <MyChat name= "Nobel" message= {value} />);
        
                    this.message.value = "";
                }
            }
        }
    }

    public static instance = (states?: ChatState[]): ChatManager =>{
        if(ChatManager.chatManager){
            return ChatManager.chatManager;
        }
        ChatManager.chatManager = new ChatManager(states ? states : []);

        return ChatManager.chatManager; 
    }
}

export { ChatManager }

    // Query Dom
    /*
    const name = document.getElementById("name");
    const handle = document.getElementById("handle");
    const btn = document.getElementById("send");
    const ouptut = document.getElementById("output");
    const feedback = document.getElementById("feedback");

    name.innerHTML = `Hi ${response.name}`;

    // Emit events
    btn.addEventListener("click", () =>{
        socket.emit("chat", {
            message:  message.value,
            handle: handle.value
        });

        message.value = "";
    });

    message.addEventListener("keypress", ()=>{
        socket.emit("typing", handle.value);
    });

    socket.on("chat", (data)=>{
        feedback.innerHTML = "";
        ouptut.innerHTML +=`<p><strong>${data.handle}</strong> ${data.message} </p>`
    });

    socket.on("typing", (data)=>{
        feedback.innerHTML = `<p><em>${data} is typing a message</em></p>`;
    });

    socket.on("connected", ()=>{
        console.log(socket.connected);
    });*/