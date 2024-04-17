import React from "react";
import { Socket, io } from "socket.io-client";
import ReactDOMClient from "react-dom/client";
import ReactDOMServer from "react-dom/server";

const getCookie = (cname: string) =>{
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const formatTime = (date: Date) =>{
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${ hours > 12 ? (hours % 12) : hours }:${minutes}${(hours / 12) === 0 ? "am" : "pm" }`;
}

const init = () =>alert("I was clicked");

const Mychat = (props: { name: string, message: string }) =>{
    return (
        <div onClick={init} className="my-chat-container">
            <div className="chat-container-content">
                <div className="my-chat-name">Me</div>
                <div className="my-chat">{props.message}</div>
                <div className="my-chat-time">{formatTime(new Date())}</div>
            </div>
            <div className="messages-item-profile-container">
                <div className="messages-item-profile">{props.name.charAt(0).toUpperCase()}</div>
            </div>
        </div>
    );
}

let chatContainer = document.getElementById("chats-container");
let message : HTMLInputElement | null = null;
let sendBtn: HTMLButtonElement | null;
let socket: Socket<any> | undefined = undefined;

const send = () =>{
    if(chatContainer && message){
        const value = message.value;
        if(value.length){
            chatContainer.innerHTML += ReactDOMServer.renderToString(<Mychat name= "Nobel" message= {value} />);
            let init = chatContainer.lastElementChild!;
            ReactDOMClient.hydrateRoot(init, <Mychat name= "Nobel" message= {value} />);
            
            message.value = "";
        }
    }
}

const initChats = () =>{
    message = document.getElementById("message") as HTMLInputElement;
    chatContainer = document.getElementById("chats-container");
    sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
    sendBtn.onclick = send;

    const token = getCookie("token");

    // Make connection
    if(socket === undefined){
        socket = io("http://localhost:5000", { auth: { token, access: "access-key" } });   
    }
}

export { send, initChats }

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